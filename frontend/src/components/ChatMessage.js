
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CollapsibleThought from './CollapsibleThought';
import ChatBubbleMessage from './ChatBubbleMessage';
import AiImage from './AiImage';

const ChatMessage = React.memo(({ msg, thought, messageImageMap, getTextToRender, setShowMemories }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(true);

  const getUserBubbleClass = (msgModel) => {
    return msgModel === 'gemini-2.5-flash-lite'
      ? 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 rounded-br-none'
      : msgModel === 'image' ? 'bg-orange-100 dark:bg-orange-950 text-orange-900 dark:text-orange-200 rounded-br-none' : 'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-200 rounded-br-none';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full flex font-normal ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-3xl rounded-2xl p-4 overflow-hidden ${msg.role === 'user' ? getUserBubbleClass(msg.model) : 'bg-transparent px-0 w-full text-black dark:text-white'}`}>
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
                <div className={`p-3 rounded-md flex items-center gap-2 ${msg.model === 'gemma-3-27b-it' ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700' : 'bg-blue-50 border dark:bg-blue-900 border-blue-200 dark:border-blue-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <line x1="10" y1="9" x2="8" y2="9"></line>
                  </svg>
                  <span className={`text-sm cursor-default font-medium ${msg.model === 'gemma-3-27b-it' ? 'text-green-800 dark:text-green-200' : 'text-blue-800 dark:text-blue-200'}`}>
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
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic border-t-2 border-b-2 p-2 font-normal flex justify-between items-center gap-2">
            <span>Model: {msg.model === 'gemini-2.5-flash-lite' ? ' Advanced' : msg.model === 'image' ? ' ImageGen' : ' Basic'}</span>
            <div className="flex gap-2">
              {msg.memoryStatus === 'permanent' || msg.memoryStatus === 'both' ? <span onClick={() => setShowMemories(true)} className="inline-flex cursor-pointer items-center px-2 py-0.5 rounded text-xs font-normal transition-all bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 text-yellow-800 dark:text-yellow-200">Memory Updated</span> : null}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default ChatMessage;
