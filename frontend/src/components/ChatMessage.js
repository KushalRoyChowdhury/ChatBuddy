
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CollapsibleThought from './CollapsibleThought';
import ChatBubbleMessage from './ChatBubbleMessage';

const ChatMessage = React.memo(({ msg, thought, messageImageMap, getTextToRender, getUserBubbleClass }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(true);
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-3xl rounded-2xl p-4 overflow-hidden ${msg.role === 'user' ? getUserBubbleClass(msg.model) : 'bg-white border shadow-sm text-black'}`}>
        {msg.role === 'assistant' && <CollapsibleThought thoughtContent={thought?.content} />}

        {msg.role === 'user' && (() => {
          const fileData = messageImageMap.find(item => item.id === msg.id);

          // Early return if no file data found
          if (!fileData) return null;

          // Destructure only after confirming fileData exists
          const { base64Data, mimeType, fileName } = fileData;

          return (
            <div className="mb-2">
              {isImageLoaded && (
                <img
                  src={`data:${mimeType || 'application/octet-stream'};base64,${base64Data}`}
                  alt="Uploaded by user"
                  className="max-w-xs max-h-64 rounded-lg object-cover"
                  onError={() => setIsImageLoaded(false)}
                  onLoad={() => setIsImageLoaded(true)}
                />
              )}
              {!isImageLoaded && (
                <div className={`p-3 rounded-md flex items-center gap-2 ${msg.model === 'gemma-3-27b-it' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <line x1="10" y1="9" x2="8" y2="9"></line>
                  </svg>
                  <span className={`text-sm cursor-default font-medium ${msg.model === 'gemma-3-27b-it' ? 'text-green-800' : 'text-blue-800'}`}>
                    {fileName || 'Document'}
                  </span>
                </div>
              )}
            </div>
          );
        })()}

        {(() => {
          const content = getTextToRender(msg);
          // Check if content is a data URL (image)
          if (content.startsWith('image/')) {
            // Function to download the image
            const handleDownload = () => {
              const link = document.createElement('a');
              link.href = `data:${content}`;
              link.download = 'ai-generated-image.png';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

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
                <img
                  src={`data:${content}`}
                  alt="AI Generated"
                  className="max-w-xs max-h-64 rounded-lg object-cover border border-gray-200 shadow-sm"
                />
              </div>
            );
          }
          // Otherwise, render as Markdown
          return (
            <ChatBubbleMessage content={content} />
          );
        })()}

        {msg.role === 'assistant' && (
          <div className="mt-2 text-xs text-gray-500 italic border-t pt-2 flex justify-between items-center gap-2">
            <span>Using: {msg.model === 'gemini-2.5-flash-lite' ? 'Advanced' : msg.model === 'image' ? 'ImageGen' : 'Basic'}</span>
            <div className="flex gap-2">
              {msg.memoryStatus === 'permanent' || msg.memoryStatus === 'both' ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Memory Updated</span> : null}
              {msg.memoryStatus === 'temporary' || msg.memoryStatus === 'both' ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Temp Memory</span> : null}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default ChatMessage;
