
import React from 'react';

interface MediaPreviewProps {
  url: string;
  type: 'image' | 'video';
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ url, type }) => {
  return (
    <div className="w-full mt-4">
      <h3 className="text-lg font-medium text-slate-300 mb-2">Preview</h3>
      <div className="w-full overflow-hidden rounded-lg border border-slate-700">
        {type === 'image' ? (
          <img src={url} alt="Uploaded preview" className="w-full h-auto object-contain max-h-80" />
        ) : (
          <video src={url} controls className="w-full h-auto object-contain max-h-80">
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
};

export default MediaPreview;
