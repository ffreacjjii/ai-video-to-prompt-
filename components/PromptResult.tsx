
import React, { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon } from './Icons';
import LoadingSpinner from './LoadingSpinner';

interface PromptResultProps {
  prompt: string;
  isLoading: boolean;
  error: string | null;
  progress: number;
}

const PromptResult: React.FC<PromptResultProps> = ({ prompt, isLoading, error, progress }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prompt) {
      setCopied(false);
    }
  }, [prompt]);

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <LoadingSpinner />
          <p className="mt-4 text-sm">Analyzing media and generating prompt...</p>
          <div className="w-full bg-slate-700 rounded-full h-2.5 mt-2">
            <div
              className="bg-cyan-400 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-1 text-xs text-slate-500">{Math.round(progress)}%</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-red-400 p-4 text-center">
          <p className="whitespace-pre-wrap">{error}</p>
        </div>
      );
    }

    if (prompt) {
      return (
        <div className="relative h-full">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 bg-slate-700/50 hover:bg-slate-600 rounded-md text-slate-400 hover:text-white transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
          </button>
          <p className="text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed p-4 bg-slate-900 rounded-lg h-full overflow-y-auto">
            {prompt}
          </p>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <p>Your generated prompt will appear here.</p>
      </div>
    );
  };

  return <div className="w-full h-full min-h-[16rem]">{renderContent()}</div>;
};

export default PromptResult;
