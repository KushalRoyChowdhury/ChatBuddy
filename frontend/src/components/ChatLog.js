
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
  fileImg
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


  return (
    <main className="flex-grow overflow-y-auto p-4 max-w-4xl mx-auto w-full">
      {!isBottomAtView &&
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          type='button'
          onClick={() => { setTapBottom(true) }}
          className={`fixed z-10 bg-white hover:bg-slate-100 shadow flex justify-center items-center rounded-full p-1 active:scale-95 transition-all ${fileImg ? 'bottom-[14.5rem] md:bottom-[15.2rem]' : 'bottom-32 md:bottom-[8.5rem]'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </motion.button>
      }
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border max-w-2xl mx-auto">
            <p className="text-lg mb-3">{noChatGreet}</p>
            <div className="flex justify-center gap-4 mt-4">
              <div onClick={() => setModel('gemma-3-27b-it')} className="p-3 bg-green-50 hover:bg-green-100 active:scale-95 transition-all rounded-lg cursor-pointer">
                <div className="font-medium w-24 text-green-600">Basic</div>
              </div>
              <div onClick={() => setModel('gemini-2.5-flash-lite')} className="p-3 bg-blue-50 hover:bg-blue-100 transition-all active:scale-95 rounded-lg cursor-pointer">
                <div className="font-medium w-24 text-blue-600">Advanced</div>
              </div>
            </div>
            {systemPrompt.trim() && (
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg md:max-w-md max-w-[80%] mx-auto">
                <p className="text-sm text-indigo-700">Custom Instruction is active.</p>
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
                />
              );
            })}
          </AnimatePresence>
        )}
        {loading && (<>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full flex justify-start">
            <div className="max-w-3xl rounded-2xl p-4 bg-white border shadow-sm text-black flex items-center gap-3">
              <span className="text-sm">{modelUsed === 'basic' ? 'Responding...' : modelUsed === 'advance+' ? 'Thinking Deeply...' : modelUsed === 'image' ? 'Generating...' : 'Thinking...'}</span>
              <div className="flex space-x-1">
                <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
                <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
              </div>
            </div>
          </motion.div>
          <div className='h-48 w-full bg-transparent'></div>
        </>
        )}
        <div className='w-full bottom-0 bg-transparent h-1' ref={chatEndRefTrigger} />
        <div className='w-full bottom-0 bg-transparent h-1' ref={chatEndRef} />
      </div>
    </main>
  );
});

export default ChatLog;
