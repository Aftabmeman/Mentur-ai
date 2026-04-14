
'use server';

import pdf from 'pdf-parse';

/**
 * Extracts text from a PDF file using pdf-parse.
 * @param formData FormData containing the file.
 * @returns {Promise<{text?: string, error?: string}>}
 */
export async function extractTextFromPDF(formData: FormData): Promise<{ text?: string, error?: string }> {
  const file = formData.get('file') as File;
  if (!file) {
    return { error: "No file uploaded." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const data = await pdf(buffer);
    
    if (!data.text || data.text.trim().length === 0) {
      return { error: "Could not extract any text from the PDF. It might be scanned or protected." };
    }

    return { text: data.text.trim() };
  } catch (error: any) {
    console.error("PDF Parsing Error:", error);
    return { error: "Internal error parsing PDF. Please try a different file." };
  }
}
