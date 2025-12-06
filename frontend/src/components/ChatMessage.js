import React from 'react';
import { motion } from 'framer-motion';
import CollapsibleThought from './CollapsibleThought';
import ChatBubbleMessage from './ChatBubbleMessage';
import AiImage from './AiImage';

const ChatMessage = React.memo(({ msg, thought, messageImageMap, getTextToRender, setShowMemories, loading, modelUsed, loadingFinished, lastBubble }) => {

  const getUserBubbleClass = (msgModel) => {
    return msgModel === 'gemini-2.5-flash-lite'
      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded-full rounded-br-none shadow-sm'
      : msgModel === 'image' ? 'bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 rounded-full rounded-br-none shadow-sm' : 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 rounded-full rounded-br-none shadow-sm';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full flex font-normal ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-3xl rounded-3xl p-3 py-4 overflow-hidden ${msg.role === 'user' ? getUserBubbleClass(msg.model) : `${loadingFinished && msg.content.length === 0 ? 'min-h-[54dvh] ' : ''} ${msg.id === lastBubble() ? 'min-h-[54dvh] ' : ''} h-max px-0 w-full text-black dark:text-white`}`}>
        {loading && msg.role !== 'user' && msg.content.length === 0 && (<>
          <motion.div initial={{ y: 0, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full flex justify-start">
            <div className="bg-transparent text-gray-500 dark:text-gray-400">
              <span className="text-base font-bold animate-pulse">{modelUsed === 'basic' ? 'Responding...' : modelUsed === 'advance+' ? 'Thinking Deeply...' : modelUsed === 'image' ? 'Generating...' : 'Thinking...'}</span>
            </div>
          </motion.div>
        </>
        )}
        {msg.role === 'assistant' && <CollapsibleThought thoughtContent={thought?.content} isThinkingComplete={msg.content && msg.content.length > 0} />}

        {msg.role === 'user' && (() => {
          const fileDataList = messageImageMap.filter(item => item.id === msg.id);

          if (fileDataList.length === 0) return null;

          return (
            <div className="mb-2 flex flex-wrap gap-2 justify-end">
              {fileDataList.map((fileData, index) => {
                const { base64Data, mimeType, fileName } = fileData;
                return (
                  <div key={index} className="relative">
                    {base64Data ? (
                      <img
                        src={`data:${mimeType || 'application/octet-stream'};base64,${base64Data}`}
                        alt="Uploaded by user"
                        className="max-w-xs max-h-64 rounded-lg object-cover"
                      />
                    ) : (
                      <div className={`p-3 rounded-xl flex items-center gap-2 border ${msg.model === 'gemma-3-27b-it' ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'}`}>
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
              })}
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

        {msg.role === 'assistant' && (() => {

          let isHelperArrived = false;
          try {
            const parsed = JSON.parse(msg.content);
            if (parsed && typeof parsed.response === 'string') {
              isHelperArrived = true;
            }
          } catch (e) { }

          return isHelperArrived && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic border-t border-gray-200 dark:border-gray-700 p-2 font-normal flex justify-between items-center gap-2">
              <span>Model: {msg.model === 'gemini-2.5-flash-lite' ? ' Advanced' : msg.model === 'image' ? ' ImageGen' : ' Basic'}</span>
              <div className="flex gap-2">
                {msg.memoryStatus === 'permanent' || msg.memoryStatus === 'both' ? <span onClick={() => setShowMemories(true)} className="inline-flex cursor-pointer rounded-2xl items-center px-2 py-0.5 text-xs font-normal transition-all bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 text-yellow-800 dark:text-yellow-200">Memory Updated</span> : null}
              </div>
            </div>
          );
        })()}
      </div>
    </motion.div>
  );
});

export default ChatMessage;
