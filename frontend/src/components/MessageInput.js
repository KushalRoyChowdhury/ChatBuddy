
import React, { useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { motion, AnimatePresence } from 'framer-motion';

const MessageInput = React.memo(({
  input,
  setInput,
  handleKeyPress,
  handlePaste,
  sendMessage,
  loading,
  uploading,
  model,
  imageGen,
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  fileImgs,
  setFileImgs,
  setUploadedImages,
  fileImgInputRef,
  fileDocs,
  setFileDocs,
  setFileName,
  fileDocInputRef,
  showAddFiles,
  setShowAddFiles,
  handleDocFileChange,
  handleImgUpload,
  handleImgFileChange,
  setImageGen,
  creativeRP,
  setCreativeRP,
  advanceReasoning,
  setAdvanceReasoning,
  webSearch,
  setWebSearch,
  handleStop,
  imageGenAvailable,
  glassMode
}) => {
  const addFilesMenuRef = useRef(null);
  const addFilesButtonRef = useRef(null);

  const getSendButtonClass = () => {
    if (loading || uploading || !input.trim()) return 'bg-gray-200 dark:bg-[rgb(60,60,60)] cursor-not-allowed text-gray-400 dark:text-gray-500';
    return imageGen ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30' : model === 'gemini-2.5-flash-lite' ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/30';
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        addFilesMenuRef.current &&
        !addFilesMenuRef.current.contains(event.target) &&
        addFilesButtonRef.current &&
        !addFilesButtonRef.current.contains(event.target)
      ) {
        setShowAddFiles(false);
      }
    }

    if (showAddFiles) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAddFiles, setShowAddFiles]);
  return (
    <footer className={`dark:md:bg-transparent ${glassMode ? 'backdrop-blur-xl bg-white/70 dark:bg-[rgb(50,50,50)]/70' : 'backdrop-blur-none bg-white dark:bg-[rgb(50,50,50)]'} md:backdrop-blur-none md:bg-gradient-to-b from-transparent to-white dark:to-[rgb(20,20,20)] border-0 md:border-none p-1 md:pt-0 md:pb-5 sticky z-40 bottom-0 rounded-t-3xl md:rounded-none transition-colors duration-300`}>
      <motion.form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`max-w-4xl relative transition-all ${glassMode ? 'md:backdrop-blur-xl md:bg-white/60 md:dark:bg-[rgb(50,50,50)]/60 border-white/20 dark:border-white/10' : 'backdrop-blur-none md:bg-white md:dark:bg-[rgb(50,50,50)] border-gray-200 dark:border-gray-700'} w-full mx-auto md:border rounded-3xl md:shadow-xl ${isDragging ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
      >

        {fileImgs.length > 0 && (
          <div className="p-2 border-b-0 border-gray-200/95 dark:border-gray-700/95 flex gap-2 overflow-x-auto">
            {fileImgs.map((imgItem) => (
              <div key={imgItem.id} className="relative inline-block bg-gray-50 dark:bg-[rgb(60,60,60)] border border-gray-200 dark:border-gray-600 p-1 rounded-2xl shrink-0 shadow-sm">
                {imgItem.isUploading ? (
                  <div className="h-20 w-20 flex items-center justify-center">
                    <svg
                      className="animate-spin h-10 w-10 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  <img
                    src={URL.createObjectURL(imgItem.file)}
                    alt="Selected"
                    className="h-20 w-20 object-cover rounded-md"
                  />
                )}
                {!imgItem.isUploading &&
                  <button
                    type="button"
                    onClick={() => {
                      setFileImgs(prev => prev.filter(item => item.id !== imgItem.id));
                      setUploadedImages(prev => prev.filter(item => item.tempId !== imgItem.id));
                      if (fileImgs.length === 1 && fileImgInputRef.current) {
                        fileImgInputRef.current.value = null;
                      }
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold"
                    aria-label="Remove image"
                  >
                    &times;
                  </button>
                }
              </div>
            ))}
          </div>
        )}

        {fileDocs.length > 0 && (
          <div className="p-2 border-b-0 border-gray-200/95 flex gap-2 overflow-x-auto">
            {fileDocs.map((docItem) => (
              <div key={docItem.id} className="relative inline-block bg-gray-50 dark:bg-[rgb(60,60,60)] border border-gray-200 dark:border-gray-600 p-1 rounded-2xl shrink-0 shadow-sm">
                {docItem.isUploading ? (
                  <div className="h-20 w-20 flex items-center justify-center">
                    <svg
                      className="animate-spin h-10 w-10 text-gray-500 dark:text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  <div className="h-20 w-20 flex flex-col items-center justify-center p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 dark:text-gray-200">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <line x1="10" y1="9" x2="8" y2="9"></line>
                    </svg>
                    <span className="text-xs mt-1 text-center max-w-full truncate">{docItem.file.name}</span>
                  </div>
                )}
                {!docItem.isUploading && (
                  <button
                    type="button"
                    onClick={() => {
                      setFileDocs(prev => prev.filter(item => item.id !== docItem.id));
                      setUploadedImages(prev => prev.filter(item => item.tempId !== docItem.id));
                      // setFileName(false) // This is tricky with multiple files. Maybe remove if no docs left?
                      if (fileDocs.length === 1) setFileName(false);

                      if (fileDocs.length === 1 && fileDocInputRef.current) {
                        fileDocInputRef.current.value = null;
                      }
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold"
                    aria-label="Remove document"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <TextareaAutosize
          value={input}
          onChange={(e) => setInput(String(e.target.value))}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          placeholder={`${imageGen ? 'Enter Image Generation/Edit prompt...' : `Ask anything... (Model: ${model === 'gemini-2.5-flash-lite' ? 'Advanced' : 'Basic'})`}`}

          className={`w-full bg-transparent flex font-normal select-text selection:bg-blue-500/30 items-center px-4 py-3 resize-none outline-none transition-all rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
          minRows={1}
          maxRows={5}
        />
        <div className='p-2 flex relative justify-start gap-2 h-max transition-all'>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileImgInputRef}
            onChange={handleImgFileChange}
            multiple
          />
          <input
            type="file"
            accept={model === 'gemini-2.5-flash-lite' ? '.pdf,.mp4,.mp3,.wav,.txt,.md,.doc,.docx,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/mp4,video/mpeg,audio/mpeg,audio/wav' : '.txt,.md'}
            className="hidden"
            ref={fileDocInputRef}
            onChange={handleDocFileChange}
            multiple
          />

          <AnimatePresence>
            {showAddFiles &&
              <motion.div
                initial={{ height: 0, width: 0, opacity: 1 }}
                animate={{ height: "auto", width: "auto", opacity: 1 }}
                exit={{ height: 0, width: 0, opacity: 0 }}
                className={`absolute z-40 w-max h-max left-4 flex flex-col bottom-8 overflow-hidden bg-white/95 dark:bg-[rgb(60,60,60)]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600`}
                ref={addFilesMenuRef}
              >
                {!imageGen && <button onClick={() => { fileDocInputRef.current?.click() }} className='p-4 pb-1 text-nowrap hover:scale-105 active:scale-100 transition-all'>Upload Files</button>}
                <button onClick={handleImgUpload} className={`p-4 ${!imageGen && 'pt-2'}  text-nowrap hover:scale-105 active:scale-100 transition-all`}>Upload Image</button>
              </motion.div>
            }
          </AnimatePresence>

          <motion.button
            ref={addFilesButtonRef}
            type="button"
            title="Upload Images/Files"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => { setShowAddFiles(!showAddFiles) }}
            className={`flex w-11 items-center justify-center`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-7 dark:text-gray-300 ${showAddFiles ? 'hidden' : 'block'}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>

            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`size-7 dark:text-gray-300 ${!showAddFiles ? 'hidden' : 'block'}`}>
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
            </svg>


          </motion.button>

          <div className='overflow-y-auto flex flex-nowrap gap-1 flex-grow rounded-2xl'>
            <AnimatePresence>
              {imageGenAvailable &&
                <motion.button
                  type="button"
                  title="Generate Images"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setImageGen(!imageGen); setShowAddFiles(false) }}
                  className={`p-2 rounded-2xl w-48 transition-all text-center text-nowrap border ${imageGen
                    ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-300'
                    : 'bg-gray-50 dark:bg-[rgb(60,60,60)] border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-100 dark:hover:bg-[rgb(70,70,70)] dark:text-gray-400'
                    }`}
                >
                  <div className='flex gap-2 items-center justify-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>

                    <div className='flex gap-1'>Image <span className='hidden md:block'> Generation</span></div>
                  </div>
                </motion.button>}
            </AnimatePresence>

            <AnimatePresence>
              {model === 'gemma-3-27b-it' && !imageGen && (
                <motion.button
                  type="button"
                  title="More Creative Responses (can make mistake on factual answers)"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCreativeRP(!creativeRP)}
                  className={`p-2 rounded-2xl w-48 text-center text-nowrap transition-colors border ${creativeRP
                    ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-600 dark:text-green-300'
                    : 'bg-gray-50 dark:bg-[rgb(60,60,60)] border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-100 dark:hover:bg-[rgb(70,70,70)] dark:text-gray-400'
                    }`}
                >
                  <div className='flex gap-2 items-center justify-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                    </svg>
                    <div>Creative Mode</div>
                  </div>
                </motion.button>
              )}

              {model === 'gemini-2.5-flash-lite' && !imageGen && (
                <>
                  <motion.button
                    type="button"
                    title="Advance Multi-Step Reasoning"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAdvanceReasoning(!advanceReasoning)}
                    className={`p-2 rounded-2xl w-48 text-center text-nowrap transition-colors border ${advanceReasoning
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300'
                      : 'bg-gray-50 dark:bg-[rgb(60,60,60)] border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-100 dark:hover:bg-[rgb(70,70,70)] dark:text-gray-400'
                      }`}
                  >
                    <div className='flex gap-2 justify-center'>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                      </svg>
                      <div className='flex gap-1'><span className='hidden md:block'>Advance</span> Reasoning</div>

                    </div>
                  </motion.button>

                  <motion.button
                    type="button"
                    title="Search Web for latest info"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setWebSearch(!webSearch)}
                    className={`p-2 rounded-2xl w-48 text-center text-nowrap transition-colors border ${webSearch
                      ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-300'
                      : 'bg-gray-50 dark:bg-[rgb(60,60,60)] border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-100 dark:hover:bg-[rgb(70,70,70)] dark:text-gray-400'
                      }`}
                  >
                    <div className='flex gap-2 justify-center'>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>

                      <div className='block'>Web Search</div>

                    </div>
                  </motion.button>
                </>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={loading ? handleStop : sendMessage}
            disabled={uploading || (!input.trim() && !loading)}
            className={`px-2 sm:px-6 right-2 py-2 self-end rounded-2xl text-white font-medium flex gap-2 items-center ${loading ? 'bg-red-600 hover:bg-red-700' : getSendButtonClass()} transition-colors duration-500`}
          >
            {loading ? (
              <>
                <div className='hidden md:block'>
                  STOP
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 md:hidden lg:block">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z" />
                </svg>
              </>
            ) : (
              <>
                <div className='hidden md:block'>
                  SEND
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 md:hidden lg:block">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </footer>
  );
});

export default MessageInput;
