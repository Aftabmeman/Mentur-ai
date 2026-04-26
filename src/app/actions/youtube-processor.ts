
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
  if (!apiKey) throw new Error("AI credentials missing.");

  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) throw new Error("Invalid YouTube link format.");

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

    if (!transcriptText || transcriptText.length < 50) {
      throw new Error("Could not extract enough content from this video.");
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
          { role: 'user', content: `Transcript:\n"""\n${transcriptText.substring(0, 15000)}\n"""` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) throw new Error("Llama API failed.");

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      tokenUsage: {
        input: data.usage.prompt_tokens,
        output: data.usage.completion_tokens,
        total: data.usage.total_tokens
      },
      method: methodUsed
    };

  } catch (error: any) {
    console.error("YouTube Processor Error:", error.message);
    return { error: error.message || "Failed to process video." };
  }
}

function extractVideoId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : null;
}

async function transcribeWithWhisper(videoUrl: string, apiKey: string): Promise<string> {
  // We use ytdl-core to get a small audio stream
  // Note: Downloading full audio in server actions has memory/time limits.
  // We attempt to get the lowest bitrate audio to stay within limits.
  const info = await ytdl.getInfo(videoUrl);
  const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'lowestaudio' });
  
  if (!audioFormat.url) throw new Error("Could not find audio stream.");

  // Fetch the audio stream as a buffer
  const audioResponse = await fetch(audioFormat.url);
  const audioBlob = await audioResponse.blob();
  
  // Construct Form Data for Groq Whisper
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.mp3');
  formData.append('model', 'whisper-large-v3');
  formData.append('response_format', 'json');

  const whisperResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!whisperResponse.ok) {
    const errData = await whisperResponse.text();
    console.error("Whisper Error:", errData);
    throw new Error("Audio transcription failed.");
  }

  const result = await whisperResponse.json();
  return result.text;
}
