
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CollapsibleThought from './CollapsibleThought';
import ChatBubbleMessage from './ChatBubbleMessage';
import AiImage from './AiImage';

const ChatMessage = React.memo(({ msg, thought, messageImageMap, getTextToRender, getUserBubbleClass }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(true);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full flex font-normal ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-3xl rounded-2xl p-4 overflow-hidden ${msg.role === 'user' ? getUserBubbleClass(msg.model) : 'bg-white w-full text-black'}`}>
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
          if (content.startsWith('image/')) {
            return <AiImage content={content} />;
          }
          return (
            <ChatBubbleMessage content={content} />
          );
        })()}

        {msg.role === 'assistant' && (
          <div className="mt-2 text-xs text-gray-500 italic border-t-2 border-b-2 p-2 font-medium flex justify-between items-center gap-2">
            <span>Using: {msg.model === 'gemini-2.5-flash-lite' ? 'Advanced' : msg.model === 'image' ? 'ImageGen' : 'Basic'}</span>
            <div className="flex gap-2">
              {msg.memoryStatus === 'permanent' || msg.memoryStatus === 'both' ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-all bg-yellow-100 hover:bg-yellow-200 text-yellow-800">Memory Updated</span> : null}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default ChatMessage;
