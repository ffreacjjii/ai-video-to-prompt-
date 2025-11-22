
import type { Part } from "@google/genai";

// Converts a File object to a GoogleGenerativeAI.Part object.
export async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
        if (typeof reader.result !== 'string') {
            reject(new Error("Failed to read file as a data URL."));
            return;
        }
        
        const parts = reader.result.split(',');
        if (parts.length < 2 || !parts[1]) {
            reject(new Error("Could not extract base64 data from file. The file may be empty or corrupt."));
            return;
        }

        resolve(parts[1]);
    };

    reader.onerror = () => {
        // Include specific error message if available
        const errorMsg = reader.error ? reader.error.message : 'Unknown reader error';
        reject(new Error(`FileReader failed to read the file: ${errorMsg}`));
    };
    
    reader.readAsDataURL(file);
  });

  const base64EncodedData = await base64EncodedDataPromise;
  
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}
