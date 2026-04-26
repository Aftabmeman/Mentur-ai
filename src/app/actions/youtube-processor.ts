
'use server';

import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from '@distube/ytdl-core';

/**
 * YouTube Link to Notes Processor (Refactored for High TPM & Robust Fallback)
 * Model: meta-llama/llama-4-scout-17b-16e-instruct (30k TPM)
 * Fallback: whisper-large-v3-turbo
 */

export async function processYoutubeToNotes(videoUrl: string, academicLevel: string = "Class 10th") {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: "AI credentials (GROQ_API_KEY) missing in environment." };

  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) throw new Error("Invalid YouTube link format. Please provide a standard URL.");

    let transcriptText = "";
    let methodUsed = "native";

    // --- ATTEMPT 1: Native Subtitles (Fast & Free) ---
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptText = transcript.map(t => t.text).join(' ');
    } catch (e) {
      console.log("No native subtitles found, falling back to Whisper AI...");
      
      // --- ATTEMPT 2: AI Audio Fallback (Whisper) ---
      try {
        methodUsed = "whisper";
        transcriptText = await transcribeWithWhisper(videoUrl, apiKey);
      } catch (whisperError: any) {
        console.error("Whisper Error:", whisperError.message);
        return { error: "Error: Video audio exceeds limits or Whisper failed." };
      }
    }

    if (!transcriptText || transcriptText.trim().length < 50) {
      throw new Error("Could not extract enough content from this video.");
    }

    // --- FINAL STEP: Generate Notes with Llama 4 Scout (30k TPM) ---
    const systemPrompt = `You are an Expert Academic Evaluator. Transform the following transcript into high-quality Detailed Study Notes and 5 Deep Analytical Questions.
    LEVEL: ${academicLevel}
    
    FORMAT: 
    # STUDY NOTES
    [Provide structured, detailed notes with clear headings and logical bullet points]
    
    # 5 DEEP ANALYTICAL QUESTIONS
    1. [Provide a high-level question that tests deep understanding]
    ...etc.
    
    TONE: Brilliant, encouraging, and highly professional. Ensure technical accuracy.`;

    // Safe truncation to stay within reasonable context window
    const safeTranscript = transcriptText.substring(0, 15000);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Transcript:\n"""\n${safeTranscript}\n"""` }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      return { error: "Error: Groq Llama generation failed." };
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
    return { error: error.message || "Failed to process video." };
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
    
    // CRITICAL: Choose absolute lowest bitrate to stay under 25MB for Groq Whisper
    const audioFormat = ytdl.chooseFormat(info.formats, { 
      quality: 'lowestaudio',
      filter: 'audioonly'
    });
    
    if (!audioFormat.url) throw new Error("Could not find audio stream.");

    // Check if estimated file size might exceed 25MB (approx 25,000,000 bytes)
    // Most 'lowestaudio' streams are ~48kbps, which is ~21MB for an hour.
    const audioResponse = await fetch(audioFormat.url);
    if (!audioResponse.ok) throw new Error("Failed to fetch audio stream.");
    
    const audioBlob = await audioResponse.blob();
    if (audioBlob.size > 25 * 1024 * 1024) {
      throw new Error("Audio file too large for AI transcription (Max 25MB).");
    }
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');
    formData.append('model', 'whisper-large-v3-turbo');
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
      throw new Error(errData.error?.message || whisperResponse.statusText);
    }

    const result = await whisperResponse.json();
    return result.text;
  } catch (err: any) {
    throw new Error(`Audio Analysis Failed: ${err.message}`);
  }
}
