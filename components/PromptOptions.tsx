
import React from 'react';

interface PromptOptionsProps {
  style: string;
  onStyleChange: (value: string) => void;
  additionalContext: string;
  onContextChange: (value: string) => void;
  disabled: boolean;
}

const PromptOptions: React.FC<PromptOptionsProps> = ({
  style,
  onStyleChange,
  additionalContext,
  onContextChange,
  disabled,
}) => {
  return (
    <div className="w-full mt-6 pt-6 border-t border-slate-700 space-y-4">
      <h3 className="text-lg font-medium text-slate-300">Refine Your Prompt</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="style-input" className="block text-sm font-medium text-slate-400 mb-1">
            Desired Visual Style <span className="text-slate-600 text-xs ml-1">(Optional)</span>
          </label>
          <input
            id="style-input"
            type="text"
            value={style}
            onChange={(e) => onStyleChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g., Cinematic, Anime, 3D Render, Vintage 8mm"
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          />
        </div>

        <div>
          <label htmlFor="context-input" className="block text-sm font-medium text-slate-400 mb-1">
            Additional Keywords / Context <span className="text-slate-600 text-xs ml-1">(Optional)</span>
          </label>
          <textarea
            id="context-input"
            value={additionalContext}
            onChange={(e) => onContextChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g., 'Focus on the red car', 'Make it look scary', 'Slow motion'"
            rows={3}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none transition-colors text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default PromptOptions;
