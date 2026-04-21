'use server';

import mammoth from 'mammoth';
import pdf from 'pdf-parse';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Server Action to parse various file types and extract text content.
 * Uses pdf-parse for robust, worker-less PDF text extraction in Node.js environments.
 */
export async function parseFileToText(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error("No file uploaded");

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File is too large. Max size is 5MB.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileType = file.name.split('.').pop()?.toLowerCase();

    let extractedText = "";

    if (fileType === 'pdf') {
      try {
        // pdf-parse is purely server-side and doesn't require workers, 
        // making it 100% compatible with Render and Cloudflare bundled environments.
        const data = await pdf(buffer);
        extractedText = data.text;
      } catch (pdfError: any) {
        console.error("PDF Parsing Error:", pdfError);
        throw new Error(`PDF Engine Error: Native parsing failed. Ensure file is not password protected.`);
      }
    } else if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (fileType === 'txt') {
      extractedText = new TextDecoder().decode(arrayBuffer);
    } else {
      throw new Error("Unsupported format. Use PDF, DOCX, or TXT.");
    }

    const trimmedText = extractedText.trim();
    if (!trimmedText || trimmedText.length < 10) {
      throw new Error("The document seems to be empty or contains no readable text.");
    }

    return { text: trimmedText };
  } catch (error: any) {
    console.error("Discate Parser Error:", error.message);
    return { error: error.message || "Failed to parse document." };
  }
}