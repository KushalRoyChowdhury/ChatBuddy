
import React, { useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import ChatMessage from './ChatMessage';

const ChatLog = React.memo(({
  messages,
  thinkingProcesses,
  messageImageMap,
  getTextToRender,
  getUserBubbleClass,
  loading,
  modelUsed,
  chatEndRef,
  noChatGreet,
  setModel,
  systemPrompt,
  setTapBottom,
  activeChatId,
  setShowMemories,
  fileImg,
  loadingFinished,
  lastBubble
}) => {

  const chatEndRefTrigger = React.useRef(null);

  const isBottomAtView = useInView(chatEndRefTrigger);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      chatEndRefTrigger.current.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => {
      clearTimeout(timer);
    };
  }, [activeChatId]);

  useEffect(() => {
    if (loading || loadingFinished) {
      const timer = setTimeout(() => {
        chatEndRefTrigger.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [loading, loadingFinished]);


  return (
    <main className="flex-grow overflow-y-auto p-4 max-w-4xl mx-auto w-full">
      {!isBottomAtView &&
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          type='button'
          onClick={() => { setTapBottom(true) }}
          className={`fixed z-10 bg-white/90 dark:bg-black/70 backdrop-blur-md dark:hover:bg-gray-900 hover:bg-slate-100 shadow flex justify-center items-center rounded-full p-2 active:scale-95 transition-all ${fileImg ? 'bottom-[14.5rem] md:bottom-[15.2rem]' : 'bottom-32 md:bottom-[8.5rem]'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </motion.button>
      }
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-transparent dark:text-gray-100 dark:border-gray-500 rounded-xl border max-w-2xl mx-auto">
            <p className="text-lg mb-3">{noChatGreet}</p>
            <div className="flex justify-center gap-4 mt-4">
              <div onClick={() => setModel('gemma-3-27b-it')} className="p-3 bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-950 active:scale-95 transition-all rounded-lg cursor-pointer">
                <div className="font-medium w-24 text-green-600 dark:text-green-400">Basic</div>
              </div>
              <div onClick={() => setModel('gemini-2.5-flash-lite')} className="p-3 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-950 transition-all active:scale-95 rounded-lg cursor-pointer">
                <div className="font-medium w-24 text-blue-600 dark:text-blue-400">Advanced</div>
              </div>
            </div>
            {systemPrompt.trim() && (
              <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950 rounded-lg md:max-w-md max-w-[80%] mx-auto">
                <p className="text-sm text-indigo-700 dark:text-indigo-200">Custom Instruction is active.</p>
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => {
              const thought = thinkingProcesses.find((t) => t.id === msg.id);
              return (
                <ChatMessage
                  key={msg.id}
                  msg={msg}
                  thought={thought}
                  messageImageMap={messageImageMap}
                  getTextToRender={getTextToRender}
                  getUserBubbleClass={getUserBubbleClass}
                  setShowMemories={setShowMemories}
                  loading={loading}
                  loadingFinished={loadingFinished}
                  modelUsed={modelUsed}
                  lastBubble={lastBubble}
                />
              );
            })}
          </AnimatePresence>
        )}
        
        <div className='w-full m-0 p-0 bg-transparent h-[1px]' ref={chatEndRef} />
        <div className='w-full m-0 p-0 bg-transparent h-[1px]' ref={chatEndRefTrigger} />
      </div>
    </main>
  );
});

export default ChatLog;
