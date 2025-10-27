
import React, { useState, useEffect } from 'react';

const AiImage = ({ content }) => {
  const [resizedImage, setResizedImage] = useState(null);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:${content}`;
    link.download = 'ai-generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (content) {
      const img = new Image();
      img.src = `data:${content}`;
      img.onload = () => {
        const maxWidth = 256; // Max width for the resized image
        const quality = 0.6; // JPEG quality
        const ratio = Math.min(maxWidth / img.width, 1);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const resized = canvas.toDataURL('image/jpeg', quality);
        setResizedImage(resized);
      };
    }
  }, [content]);

  return (
    <div className="mb-2 relative inline-block">
      <button
        onClick={handleDownload}
        className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors flex items-center justify-center"
        aria-label="Download image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      </button>

      {/* Image */}
      {resizedImage ? (
        <img
          src={resizedImage}
          alt="AI Generated"
          className="max-w-xs max-h-64 rounded-lg object-cover border border-gray-200 shadow-sm"
        />
      ) : (
        // Optional: show a placeholder while the image is processing
        <div className="max-w-xs max-h-64 rounded-lg bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};

export default AiImage;
