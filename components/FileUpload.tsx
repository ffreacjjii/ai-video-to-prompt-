
import React from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onChange, disabled }) => {
  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg group ${
          disabled
            ? 'border-slate-600 bg-slate-800 cursor-not-allowed'
            : 'border-slate-500 hover:border-cyan-400 hover:bg-slate-700/50 cursor-pointer'
        } transition-colors`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon className={`w-10 h-10 mb-3 ${disabled ? 'text-slate-500' : 'text-slate-400 group-hover:text-cyan-400'}`} />
          <p className={`mb-2 text-sm ${disabled ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className={`text-xs ${disabled ? 'text-slate-600' : 'text-slate-500'}`}>
            Image or Video (PNG, JPG, MP4, etc.)
          </p>
        </div>
        <input
          id="file-upload"
          type="file"
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          onChange={onChange}
          accept="image/*,video/*"
          disabled={disabled}
        />
      </label>
    </div>
  );
};

export default FileUpload;
