
import React, { useState, useCallback, useRef } from 'react';
import type { Part } from "@google/genai";
import { generateVideoPromptFromMedia } from './services/geminiService';
import { fileToGenerativePart } from './utils/fileUtils';
import FileUpload from './components/FileUpload';
import MediaPreview from './components/MediaPreview';
import PromptResult from './components/PromptResult';
import PromptOptions from './components/PromptOptions';
import { FilmIcon, SparklesIcon } from './components/Icons';

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [mediaPart, setMediaPart] = useState<Part | null>(null);
  
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  const [style, setStyle] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState<string>('');

  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  
  const progressIntervalRef = useRef<number | null>(null);

  const resetState = () => {
    setGeneratedPrompt('');
    setError(null);
    setProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      resetState();
      setMediaPart(null); // Clear previous media part

      // 1. Validate File Size
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setError(`File is too large (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB). Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
        event.target.value = ''; 
        setFile(null);
        setFilePreviewUrl(null);
        setFileType(null);
        return;
      }

      // 2. Validate File Type
      const isImage = selectedFile.type.startsWith('image/');
      const isVideo = selectedFile.type.startsWith('video/');

      if (!isImage && !isVideo) {
        setError(`Unsupported file type: ${selectedFile.type || 'Unknown'}. Please upload a valid Image or Video file.`);
        event.target.value = '';
        setFile(null);
        setFilePreviewUrl(null);
        setFileType(null);
        return;
      }

      // Set file state for preview
      setFile(selectedFile);
      setFileType(isImage ? 'image' : 'video');
      const previewUrl = URL.createObjectURL(selectedFile);
      setFilePreviewUrl(previewUrl);

      // 3. Process File Immediately
      setIsProcessingFile(true);
      try {
        const part = await fileToGenerativePart(selectedFile);
        setMediaPart(part);
      } catch (err: any) {
        console.error("File processing error:", err);
        setError("Unable to read the file. It may be corrupt or restricted. Please try a different file.");
        setFile(null);
        setFilePreviewUrl(null);
        setFileType(null);
        setMediaPart(null);
      } finally {
        setIsProcessingFile(false);
      }
    }
  };

  const handleGeneratePrompt = useCallback(async () => {
    if (!file || !mediaPart) {
      setError('Please upload a file first.');
      return;
    }

    setIsLoading(true);
    resetState();

    progressIntervalRef.current = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          return 95;
        }
        const increment = Math.random() * 10;
        return Math.min(prev + increment, 95);
      });
    }, 400);

    try {
      // Pass the pre-processed mediaPart
      const prompt = await generateVideoPromptFromMedia(mediaPart, style, additionalContext);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgress(100);
      setGeneratedPrompt(prompt);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      setProgress(0);
      console.error(err);
    } finally {
      setIsLoading(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  }, [file, mediaPart, style, additionalContext]);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-4xl text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <FilmIcon className="w-10 h-10 text-cyan-400" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
            AI Video Prompt Generator
          </h1>
        </div>
        <p className="text-slate-400 text-lg">
          Turn your images and videos into descriptive AI video prompts.
        </p>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6 p-6 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-200">1. Upload & Configure</h2>
          
          <div>
            <FileUpload onChange={handleFileChange} disabled={isLoading || isProcessingFile} />
            {isProcessingFile && (
               <div className="mt-2 flex items-center justify-center gap-2 text-sm text-cyan-400 animate-pulse">
                 <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                 <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                 <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 <span>Processing media file...</span>
               </div>
            )}
          </div>

          {error && !generatedPrompt && (
             <div className="p-3 text-sm text-red-200 bg-red-900/30 border border-red-800 rounded-lg whitespace-pre-wrap">
               {error}
             </div>
          )}
          {filePreviewUrl && fileType && <MediaPreview url={filePreviewUrl} type={fileType} />}
          
          <PromptOptions 
            style={style}
            onStyleChange={setStyle}
            additionalContext={additionalContext}
            onContextChange={setAdditionalContext}
            disabled={isLoading || isProcessingFile}
          />
        </div>

        <div className="flex flex-col gap-6 p-6 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-lg h-fit">
           <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-200">2. Get Your Prompt</h2>
            <button
              onClick={handleGeneratePrompt}
              disabled={!file || !mediaPart || isLoading || isProcessingFile}
              className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-cyan-600 rounded-lg shadow-md hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>
                {isLoading ? 'Generating...' : isProcessingFile ? 'Processing File...' : 'Generate'}
              </span>
            </button>
          </div>
          <PromptResult prompt={generatedPrompt} isLoading={isLoading} error={generatedPrompt ? null : error} progress={progress} />
        </div>
      </main>

      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>Powered by Gemini AI. Generated prompts may require adjustments for optimal results.</p>
      </footer>
    </div>
  );
};

export default App;
