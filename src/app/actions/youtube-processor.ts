
'use server';

import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from '@distube/ytdl-core';

/**
 * YouTube Link to Notes Processor
 * Handles transcript extraction (native or Whisper fallback) 
 * and generation of notes using Llama 3.1 8b.
 */

export async function processYoutubeToNotes(videoUrl: string, academicLevel: string = "Class 10th") {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: "AI credentials (GROQ_API_KEY) missing in environment." };

  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) throw new Error("Invalid YouTube link format. Please provide a standard URL.");

    let transcriptText = "";
    let methodUsed = "native";

    // Step 1: Attempt to fetch existing transcript (Fast & Free)
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptText = transcript.map(t => t.text).join(' ');
    } catch (e) {
      console.log("No native subtitles found, falling back to Whisper...");
      // Step 2: Fallback - Extract Audio and Transcribe with Groq Whisper
      methodUsed = "whisper";
      transcriptText = await transcribeWithWhisper(videoUrl, apiKey);
    }

    if (!transcriptText || transcriptText.trim().length < 50) {
      throw new Error("Could not extract enough content from this video. It might be too short or restricted.");
    }

    // Step 3: Send to Llama 3.1 8b for Notes & Questions
    const systemPrompt = `You are an elite academic mentor. Transform the following transcript into Detailed Study Notes and 5 Important Questions.
    LEVEL: ${academicLevel}
    FORMAT: 
    # STUDY NOTES
    [Detailed structured notes with headings and bullet points]
    
    # 5 IMPORTANT QUESTIONS
    1. [Question]
    ...etc.
    
    Maintain an encouraging and brilliant tone. Use logical arguments. Keep structure clean.`;

    // Limit transcript to ~12000 chars to avoid context window / rate limit issues
    const safeTranscript = transcriptText.substring(0, 12000);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Transcript:\n"""\n${safeTranscript}\n"""` }
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || response.statusText || "Unknown API Error";
      throw new Error(`Groq Llama Error: ${errorMsg}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error("Invalid response structure from AI model.");
    }

    return {
      content: data.choices[0].message.content,
      tokenUsage: {
        input: data.usage?.prompt_tokens || 0,
        output: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0
      },
      method: methodUsed
    };

  } catch (error: any) {
    console.error("YouTube Processor Error:", error.message);
    return { error: error.message || "Failed to process video. Please try a different link." };
  }
}

function extractVideoId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : null;
}

async function transcribeWithWhisper(videoUrl: string, apiKey: string): Promise<string> {
  try {
    const info = await ytdl.getInfo(videoUrl);
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'lowestaudio' });
    
    if (!audioFormat.url) throw new Error("Could not find audio stream.");

    const audioResponse = await fetch(audioFormat.url);
    if (!audioResponse.ok) throw new Error("Failed to fetch audio stream.");
    const audioBlob = await audioResponse.blob();
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');
    formData.append('model', 'whisper-large-v3');
    formData.append('response_format', 'json');

    const whisperResponse = await fetch('https://api.groq.com/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errData = await whisperResponse.json().catch(() => ({}));
      throw new Error(`Whisper Transcription Failed: ${errData.error?.message || whisperResponse.statusText}`);
    }

    const result = await whisperResponse.json();
    return result.text;
  } catch (err: any) {
    throw new Error(`Audio Analysis Failed: ${err.message}`);
  }
}
