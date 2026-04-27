
'use server';

import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from '@distube/ytdl-core';

/**
 * YouTube Link to Notes Processor (Optimized Logic)
 * Priority: 1. Native Subtitles -> 2. AI Audio Fallback (Whisper)
 * Model: meta-llama/llama-4-scout-17b-16e-instruct (30k TPM)
 */

export async function processYoutubeToNotes(videoUrl: string, academicLevel: string = "Class 10th") {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: "AI credentials (GROQ_API_KEY) missing in environment." };

  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) throw new Error("Invalid YouTube link format. Please provide a standard URL.");

    let transcriptText = "";
    let methodUsed = "none";

    // --- ATTEMPT 1: Native Subtitles (Fast & Free) ---
    try {
      console.log(`Discate Engine: Attempting native subtitle fetch for ${videoId}...`);
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      
      if (transcript && transcript.length > 0) {
        transcriptText = transcript.map(t => t.text).join(' ');
        methodUsed = "Native Subtitles";
        console.log("Discate Engine: Native subtitles successfully extracted.");
      } else {
        throw new Error("Empty transcript returned");
      }
    } catch (e) {
      console.log("Discate Engine: Native subtitles failed or not found. Switching to AI Audio Fallback...");
      
      // --- ATTEMPT 2: AI Audio Fallback (Whisper) ---
      try {
        methodUsed = "AI Audio Fallback (Whisper)";
        transcriptText = await transcribeWithWhisper(videoUrl, apiKey);
        console.log("Discate Engine: Whisper transcription complete.");
      } catch (whisperError: any) {
        console.error("Whisper Error:", whisperError.message);
        return { error: `Transcription Failed: ${whisperError.message || "Video audio exceeds limits or Whisper service busy."}` };
      }
    }

    if (!transcriptText || transcriptText.trim().length < 50) {
      throw new Error("Could not extract enough content from this video to generate quality notes.");
    }

    // --- FINAL STEP: Generate Notes with Llama 4 Scout (30k TPM) ---
    const systemPrompt = `You are an Expert Academic Evaluator. Transform the following transcript into high-quality Detailed Study Notes and 5 Deep Analytical Questions.
    LEVEL: ${academicLevel}
    
    FORMAT: 
    # STUDY NOTES
    [Provide structured, detailed notes with clear headings and logical bullet points. Ensure NO CORE LOGIC is missed.]
    
    # 5 DEEP ANALYTICAL QUESTIONS
    1. [Provide a high-level question that tests deep understanding]
    ...etc.
    
    TONE: Brilliant, encouraging, and highly professional. Ensure technical accuracy.`;

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
          { role: 'user', content: `Transcript (${methodUsed}):\n"""\n${transcriptText.substring(0, 80000)}\n"""` }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: `Error: Groq Llama generation failed. ${errorData.error?.message || 'Server Busy.'}` };
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      tokenUsage: data.usage,
      method: methodUsed
    };

  } catch (error: any) {
    console.error("YouTube Processor Error:", error.message);
    return { error: error.message || "An unexpected error occurred during processing." };
  }
}

function extractVideoId(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : null;
}

async function transcribeWithWhisper(videoUrl: string, apiKey: string): Promise<string> {
  const info = await ytdl.getInfo(videoUrl);
  
  // Explicitly choosing lowest bitrate audio to stay under 25MB Groq limit
  const audioFormat = ytdl.chooseFormat(info.formats, { 
    quality: 'lowestaudio',
    filter: 'audioonly'
  });
  
  if (!audioFormat.url) throw new Error("Could not find a valid audio stream for this video.");

  const audioResponse = await fetch(audioFormat.url);
  const audioBlob = await audioResponse.blob();
  
  // 25MB Safety Check
  if (audioBlob.size > 25 * 1024 * 1024) {
    throw new Error("The audio file is too large for AI processing (Max 25MB). Try a shorter video or one with native subtitles.");
  }
  
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.mp3');
  formData.append('model', 'whisper-large-v3-turbo');

  const whisperResponse = await fetch('https://api.groq.com/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData,
  });

  if (!whisperResponse.ok) {
    const err = await whisperResponse.json().catch(() => ({}));
    throw new Error(`Whisper API Error: ${err.error?.message || 'Transcription failed'}`);
  }

  const result = await whisperResponse.json();
  return result.text;
}
