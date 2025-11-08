import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Modals = React.memo(({
  userProfile,
  showImportExportOptions,
  setShowImportExportOptions,
  handleImportClick,
  setShowExportOptions,
  showExportOptions,
  exportChatAsTxt,
  exportChatAsJson,
  showImportConfirm,
  setShowImportConfirm,
  confirmImport,
  setFileToImport,
  showMemoriesImportExport,
  setShowMemoriesImportExport,
  handleImportMemoriesClick,
  exportMemoriesAsJson,
  showMemories,
  setShowMemories,
  memories,
  memoryUsagePercent,
  MEMORY_LIMIT_CHARS,
  deleteMemory,
  showOptions,
  setShowOptions,
  systemPrompt,
  setSystemPrompt,
  apiKey,
  setApiKey,
  setShowResetConfirm,
  showResetConfirm,
  handleResetApp,
  showSettings,
  setShowSettings,
  showAbout,
  setShowAbout,
  handleOptionsClick,
  handleMemoriesClick,
  exportAppData,
  showNotAvailablePopup,
  setShowNotAvailablePopup,
  showPersonalization,
  setShowPersonalization,
  userNickname,
  setUserNickname,
  handleImportAppDataClick,
  showImportAppDataConfirm,
  setShowImportAppDataConfirm,
  confirmImportAppData,
  isAuthenticated,
  handleLogout,
  showMergeConflict,
  setShowMergeConflict,
  handleOverwriteLocal,
  handleOverwriteRemote,
  usage,
  imageGenAvailable,
  glassMode,
  setGlassMode
}) => {
  return (
    <AnimatePresence>
      {showMergeConflict && (
        <motion.div className="fixed inset-0 max-h-dvh z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute ${glassMode ? 'backdrop-blur-[1px]' : 'backdrop-blur-none'} inset-0 bg-black bg-opacity-50`}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="p-6 text-center">
              <h3 className="text-lg font-bold">Merge Conflict</h3>
              <p className="text-sm text-gray-500 mt-2">
                You have local changes that are not on Google Drive. How would you like to resolve this?
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-center gap-4 rounded-b-xl">
              <button
                onClick={handleOverwriteLocal}
                className="px-6 py-2 border rounded-lg"
              >
                Use Google Drive Data
              </button>
              <button
                onClick={handleOverwriteRemote}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Use Local Data
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showImportExportOptions && (
        <motion.div className="fixed inset-0 max-h-dvh z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute ${glassMode ? 'backdrop-blur-[2px]' : 'backdrop-blur-none'} inset-0 bg-black bg-opacity-50`}
            onClick={() => setShowImportExportOptions(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-[rgb(50,50,50)]/95 rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800">Manage Chat</h3>
              <p className="text-sm text-gray-600 mt-2 mb-4">
                Import a previous chat session or export the current one.
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setShowImportExportOptions(false)}
                className="px-4 py-2 border rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowImportExportOptions(false);
                  handleImportClick();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
              >
                Import Chat
              </button>
              <button
                onClick={() => {
                  setShowImportExportOptions(false);
                  setShowExportOptions(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Export Chat
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showExportOptions && (
        <motion.div className="fixed inset-0 max-h-dvh z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute ${glassMode ? 'backdrop-blur-[2px]' : 'backdrop-blur-none'} inset-0 bg-black bg-opacity-50`}
            onClick={() => setShowExportOptions(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white/95 dark:bg-[rgb(50,50,50)]/95  rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Choose Export Format
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">
                <b>Export as JSON</b> for a complete, lossless backup that can be
                imported later. (
                <span className="italic">
                  If the chat has images / files that will not be exported
                </span>
                ).
                <br />
                <br />
                <b>Export as TXT</b> for a simple, human-readable version.
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[rgb(50,50,50)] flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setShowExportOptions(false)}
                className="px-4 py-2 border dark:border-gray-400 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={exportChatAsTxt}
                className="px-4 py-2 bg-gray-600 transition-colors text-white rounded-lg text-sm font-medium hover:bg-gray-700"
              >
                Export as TXT
              </button>
              <button
                onClick={exportChatAsJson}
                className="px-4 py-2 transition-colors bg-blue-600 dark:bg-blue-800 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-900"
              >
                Export as JSON
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {showImportConfirm && (
        <motion.div className="fixed inset-0 max-h-dvh z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute ${glassMode ? 'backdrop-blur-[2px]' : 'backdrop-blur-none'} inset-0 bg-black bg-opacity-50`}
            onClick={() => setShowImportConfirm(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-[rgb(50,50,50)]/95 rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="p-6 text-center">
              <svg
                className="mx-auto mb-4 text-orange-400 w-12 h-12"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <h3 className="text-lg font-bold">Import Chat?</h3>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[rgb(50,50,50)] flex justify-center gap-4 rounded-b-xl">
              <button
                onClick={() => {
                  setShowImportConfirm(false);
                  setFileToImport(null);
                }}
                className="px-6 py-2 border dark:border-gray-400 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmImport}
                className="px-6 py-2 bg-blue-600 dark:bg-blue-800 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-900"
              >
                Yes, Import
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showMemoriesImportExport && (
        <motion.div className="fixed inset-0 max-h-dvh z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute ${glassMode ? 'backdrop-blur-[2px]' : 'backdrop-blur-none'} inset-0 bg-black bg-opacity-50`}
            onClick={() => setShowMemoriesImportExport(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-[rgb(50,50,50)]/95 rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Manage Memories
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">
                Import a list of memories to append them to your current list,
                or export your current list to a JSON file.
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[rgb(50,50,50)] flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setShowMemoriesImportExport(false)}
                className="px-4 py-2 border dark:border-gray-400 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleImportMemoriesClick}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
              >
                Import Memories
              </button>
              <button
                onClick={exportMemoriesAsJson}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-800 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-900"
              >
                Export Memories
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {showMemories && (
        <motion.div className="fixed inset-0 max-h-dvh z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute ${glassMode ? 'backdrop-blur-[2px]' : 'backdrop-blur-none'} inset-0 bg-black bg-opacity-50`}
            onClick={() => setShowMemories(false)}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-[rgb(30,30,30)]/95 rounded-xl shadow-xl w-full max-w-2xl max-h-[90dvh] flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Saved Memories
              </h2>
              <button
                onClick={() => setShowMemories(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-grow">
              {/* Memory Usage Indicator */}
              <div className="mb-4 p-3 border rounded-lg bg-gray-50 dark:bg-transparent dark:text-gray-200 dark:border-gray-400">
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-200 mb-1">
                  <span>Memory Usage</span>
                  <span>{memoryUsagePercent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-yellow-500 h-2.5 rounded-full"
                    style={{ width: `${memoryUsagePercent}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {memories.join('\n').length} / {MEMORY_LIMIT_CHARS} characters
                </div>
              </div>

              {/* Memories List or Empty State */}
              {memories.length > 0 ? (
                <ul className="space-y-3 select-text text-sm text-gray-700 dark:text-gray-200">
                  {[...memories].reverse().map((mem) => (
                    <li
                      key={mem}
                      className="flex items-center justify-between gap-4 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-[rgb(30,30,30)]"
                    >
                      <span className="flex-1 prose prose-sm max-w-none m-0 font-normal text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                        {mem}
                      </span>
                      <button
                        onClick={() => deleteMemory(mem)}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-full flex-shrink-0 focus:outline-none transition-colors"
                        aria-label="Delete memory"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="align-middle"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-200">
                  No saved memories yet.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-[rgb(30,30,30)] flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => { setShowMemoriesImportExport(true); setShowMemories(false); }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
              >
                Manage Memories
              </button>
              <button
                onClick={() => setShowMemories(false)}
                className="px-4 py-2 border dark:border-gray-400 rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {showOptions && (
        <motion.div className="fixed inset-0 max-h-dvh z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute ${glassMode ? 'backdrop-blur-[2px]' : 'backdrop-blur-none'} inset-0 bg-black bg-opacity-50`}
            onClick={() => setShowOptions(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-[rgb(30,30,30)]/95 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Options</h2>
              <button
                onClick={() => setShowOptions(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-grow space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 select-text py-2 border border-gray-300 rounded-lg"
                  placeholder="Optional: Use your own key"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Get your Gemini key for free: Google AI Studio {'>'} API Keys {'>'} Generate
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-2 p-2 bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-400">
                  NOTE: Use your own API key to use the app with Higher Limits and
                  greater Context Window. Default Access has stricter Rate Limits and
                  Context Window. Changing API KEY does not change model behavior.
                </p>
              </div>

              <div className='border dark:border-gray-400 p-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 select-none'>
                <button onClick={() => setGlassMode(!glassMode)} className="w-full p-2 active:scale-[0.99] transition-all duration-75 rounded-md text-start text-gray-600 dark:text-gray-200">
                  <div className='flex items-center justify-between'>
                    <div>Advance Rendering</div>
                    <div className='w-10 h-5 bg-gray-200 rounded-full flex items-center'>
                      <div className={`rounded-full border shadow-md transition-all duration-150 ${glassMode ? 'translate-x-full bg-blue-500 w-5 h-5' : 'translate-x-1 bg-green-400 w-4 h-4'}`}></div>
                    </div>
                  </div>
                  <div className='text-gray-500 dark:text-gray-400 text-xs italic mt-1 mr-12'>
                    Enabling Advanced Rendering enhances visual fidelity with effects like glassmorphism, but it may increase GPU load, potentially impacting performance on less powerful hardware. If you experience noticeable lag or increased power consumption, it is recommended to disable this setting for a smoother experience.
                  </div>
                </button>
              </div>

              <div className='border dark:border-gray-400 p-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 select-none'>
                Used Today
                <div className='text-sm font-normal text-gray-500 dark:text-gray-400 ml-2'>
                  <div className='flex items-center w-full'>
                    <div className='w-[118px] text-nowrap'>Basic Model: </div>
                    <div className={`ml-1 h-2 flex-grow flex items-center ${(usage.basic / (apiKey.trim().length > 32 ? 14350 : 500) * 100) === 0 ? 'gap-0' : 'gap-[2px]'}`}>
                      <div className={`h-full transition-all overflow-hidden rounded-md ${(usage.basic / (apiKey.trim().length > 32 ? 14350 : 500) * 100) < 40 ? 'bg-green-400' : (usage.basic / (apiKey.trim().length > 32 ? 14350 : 500) * 100) < 80 ? 'bg-yellow-400' : 'bg-red-600'}`} style={{ width: `${(usage.basic / (apiKey.trim().length > 32 ? 14350 : 500)) * 100}%` }} ></div>
                      <div className={`h-full overflow-hidden transition-transform rounded-md border dark:border-gray-400 p-0 m-0 flex-grow min-h-2 min-w-2 relative flex items-center`} ><div className={`h-1 w-1 absolute rounded-full right-[2px] ${(usage.basic / (apiKey.trim().length > 32 ? 14350 : 500) * 100) < 40 ? 'bg-green-400' : (usage.basic / (apiKey.trim().length > 32 ? 14350 : 500) * 100) < 80 ? 'bg-yellow-400' : 'bg-red-600'}`}></div></div>
                    </div>
                    <div className='px-2 w-20 text-end overflow-hidden text-nowrap'>
                      ( {usage.basic}{apiKey.trim().length > 32 ? ' / 14350' : ' / 500'} )
                    </div>
                  </div>

                  <div className='flex w-full items-center'>
                    <div className='w-[118px] text-nowrap'>Advance Model: </div>
                    <div className={`ml-1 h-2 flex-grow flex items-center ${(usage.advance / (apiKey.trim().length > 32 ? 1000 : 100) * 100) === 0 ? 'gap-0' : 'gap-[2px]'}`}>
                      <div className={`h-full transition-all overflow-hidden rounded-md ${(usage.advance / (apiKey.trim().length > 32 ? 1000 : 100) * 100) < 40 ? 'bg-green-400' : (usage.advance / (apiKey.trim().length > 32 ? 1000 : 100) * 100) < 80 ? 'bg-yellow-400' : 'bg-red-600'}`} style={{ width: `${(usage.advance / (apiKey.trim().length > 32 ? 1000 : 100) * 100)}%` }} ></div>
                      <div className={`h-full overflow-hidden transition-transform rounded-md border dark:border-gray-400 p-0 m-0 flex-grow min-h-2 min-w-2 relative flex items-center`} ><div className={`h-1 w-1 absolute rounded-full right-[2px] ${(usage.advance / (apiKey.trim().length > 32 ? 1000 : 100) * 100) < 40 ? 'bg-green-400' : (usage.advance / (apiKey.trim().length > 32 ? 1000 : 100) * 100) < 80 ? 'bg-yellow-400' : 'bg-red-600'}`}></div></div>
                    </div>
                    <div className='px-2 w-20 text-end overflow-hidden text-nowrap'>
                      ( {usage.advance}{apiKey.trim().length > 32 ? ' / 1000' : ' / 100'} )
                    </div>
                  </div>

                  {imageGenAvailable && <div className='flex w-full items-center'>
                    <div className='w-[118px] text-nowrap'>Image Generation: </div>
                    <div className={`ml-1 h-2 flex-grow flex items-center ${(usage.image / (apiKey.trim().length > 32 ? 100 : 25) * 100) === 0 ? 'gap-0' : 'gap-[2px]'}`}>
                      <div className={`h-full transition-all overflow-hidden rounded-md ${(usage.image / (apiKey.trim().length > 32 ? 100 : 25) * 100) < 40 ? 'bg-green-400' : (usage.image / (apiKey.trim().length > 32 ? 100 : 25) * 100) < 80 ? 'bg-yellow-400' : 'bg-red-600'}`} style={{ width: `${(usage.image / (apiKey.trim().length > 32 ? 100 : 25)) * 100}%` }} ></div>
                      <div className={`h-full overflow-hidden transition-transform rounded-md border dark:border-gray-400 p-0 m-0 flex-grow min-h-2 min-w-2 relative flex items-center`} ><div className={`h-1 w-1 absolute rounded-full right-[2px] ${(usage.image / (apiKey.trim().length > 32 ? 100 : 25) * 100) < 40 ? 'bg-green-400' : (usage.image / (apiKey.trim().length > 32 ? 100 : 25) * 100) < 80 ? 'bg-yellow-400' : 'bg-red-600'}`}></div></div>
                    </div>
                    <div className='px-2 w-20 text-end overflow-hidden text-nowrap'>
                      ( {usage.image}{apiKey.trim().length > 32 ? ' / 100' : ' / 25'} )
                    </div>
                  </div>}
                </div>
              </div>

              <div className="pt-4 flex gap-2 items-center justify-center flex-col-reverse md:flex-row-reverse border-t">
                <button
                  onClick={exportAppData}
                  className="w-full justify-center flex items-center gap-2 px-3 py-2 border border-gray-300 text-blue-500 rounded-lg hover:bg-blue-100 transition-all dark:hover:bg-blue-900 duration-300 ease-in-out hover:border-blue-100 dark:hover:border-blue-900 dark:hover:text-blue-200 text-sm font-medium"
                >
                  Export App Data
                </button>
                <button
                  onClick={handleImportAppDataClick}
                  className="w-full justify-center flex items-center gap-2 px-3 py-2 border border-gray-300 text-blue-500 rounded-lg hover:bg-blue-100 transition-all dark:hover:bg-blue-900 duration-300 ease-in-out hover:border-blue-100 dark:hover:border-blue-900 dark:hover:text-blue-200 text-sm font-medium"
                >
                  Import App Data
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(true);
                    setShowOptions(false);
                  }}
                  className="w-full justify-center items-center gap-2 hidden px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Reset App
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t flex justify-end">
              <button
                onClick={() => setShowOptions(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {showResetConfirm && (
        <motion.div className="fixed inset-0 max-h-dvh z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute ${glassMode ? 'backdrop-blur-[1px]' : 'backdrop-blur-none'} inset-0 bg-black bg-opacity-50`}
            onClick={() => setShowResetConfirm(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="p-6 text-center">
              <svg
                className="mx-auto mb-4 text-red-400 w-12 h-12"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <h3 className="mb-2 text-lg font-bold text-gray-800">
                Reset App?
              </h3>
              <p className="text-sm text-gray-500">
                This will delete all chats, memories, and settings. This action
                is irreversible.
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-center gap-4 rounded-b-xl">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleResetApp}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Yes, Reset
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}


      {showSettings && (
        <motion.div className="fixed inset-0 max-h-dvh z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute ${glassMode ? 'backdrop-blur-[2px]' : 'backdrop-blur-none'} inset-0 bg-black bg-opacity-50`}
            onClick={() => setShowSettings(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-[rgb(30,30,30)]/95 rounded-xl shadow-xl w-full max-w-xs"
          >
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                Settings
              </h3>
              {isAuthenticated && userProfile && (
                <div className="flex items-center p-2 mb-3 border rounded-lg">
                  <img src={userProfile.picture} alt="Profile" className="w-10 h-10 rounded-full" />
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">{userProfile.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userProfile.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="ml-2 flex-shrink-0 text-gray-500 dark:text-gray-200 hover:text-red-600 p-1 rounded-full"
                  >
                    <svg
                      width="25"
                      height="25"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13 2C10.2386 2 8 4.23858 8 7C8 7.55228 8.44772 8 9 8C9.55228 8 10 7.55228 10 7C10 5.34315 11.3431 4 13 4H17C18.6569 4 20 5.34315 20 7V17C20 18.6569 18.6569 20 17 20H13C11.3431 20 10 18.6569 10 17C10 16.4477 9.55228 16 9 16C8.44772 16 8 16.4477 8 17C8 19.7614 10.2386 22 13 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2H13Z"
                        fill="currentColor"
                      />
                      <path
                        d="M14 11C14.5523 11 15 11.4477 15 12C15 12.5523 14.5523 13 14 13V11Z"
                        fill="currentColor"
                      />
                      <path
                        d="M5.71783 11C5.80685 10.8902 5.89214 10.7837 5.97282 10.682C6.21831 10.3723 6.42615 10.1004 6.57291 9.90549C6.64636 9.80795 6.70468 9.72946 6.74495 9.67492L6.79152 9.61162L6.804 9.59454L6.80842 9.58848C6.80846 9.58842 6.80892 9.58778 6 9L6.80842 9.58848C7.13304 9.14167 7.0345 8.51561 6.58769 8.19098C6.14091 7.86637 5.51558 7.9654 5.19094 8.41215L5.18812 8.41602L5.17788 8.43002L5.13612 8.48679C5.09918 8.53682 5.04456 8.61033 4.97516 8.7025C4.83623 8.88702 4.63874 9.14542 4.40567 9.43937C3.93443 10.0337 3.33759 10.7481 2.7928 11.2929L2.08569 12L2.7928 12.7071C3.33759 13.2519 3.93443 13.9663 4.40567 14.5606C4.63874 14.8546 4.83623 15.113 4.97516 15.2975C5.04456 15.3897 5.09918 15.4632 5.13612 15.5132L5.17788 15.57L5.18812 15.584L5.19045 15.5872C5.51509 16.0339 6.14091 16.1336 6.58769 15.809C7.0345 15.4844 7.13355 14.859 6.80892 14.4122L6 15C6.80892 14.4122 6.80897 14.4123 6.80892 14.4122L6.804 14.4055L6.79152 14.3884L6.74495 14.3251C6.70468 14.2705 6.64636 14.1921 6.57291 14.0945C6.42615 13.8996 6.21831 13.6277 5.97282 13.318C5.89214 13.2163 5.80685 13.1098 5.71783 13H14V11H5.71783Z"
                        fill="currentColor"
                      />
                    </svg>

                  </button>
                </div>
              )}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowPersonalization(true);
                    setShowSettings(false);
                  }}
                  className="w-full p-2 rounded-md bg-green-100 dark:bg-green-600/60 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-950"
                >
                  Personalization
                </button>
                <button
                  onClick={() => {
                    handleMemoriesClick();
                    setShowSettings(false);
                  }}
                  className="w-full p-2 rounded-md bg-yellow-50 dark:bg-yellow-600/60 text-yellow-800 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-950"
                >
                  Saved Memories
                </button>
                <button
                  onClick={() => {
                    handleOptionsClick();
                    setShowSettings(false);
                  }}
                  className="w-full p-2 rounded-md bg-indigo-100 dark:bg-indigo-600/60 text-indigo-800 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-950"
                >
                  Options
                </button>
                <button
                  onClick={() => {
                    setShowAbout(true);
                    setShowSettings(false);
                  }}
                  className="w-full p-2 rounded-md bg-gray-100 dark:bg-gray-600/60 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-950"
                >
                  About
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}


      {showPersonalization && (
        <motion.div className="fixed inset-0 max-h-dvh z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute ${glassMode ? 'backdrop-blur-[2px]' : 'backdrop-blur-none'} inset-0 bg-black bg-opacity-50`}
            onClick={() => setShowPersonalization(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-[rgb(30,30,30)]/95 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Personalization</h2>
              <button
                onClick={() => setShowPersonalization(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-grow space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  User Nickname
                </label>
                <div className='relative'>
                  <input
                    type="text"
                    maxLength="20"
                    value={userNickname}
                    onChange={(e) => setUserNickname(e.target.value)}
                    className="w-full select-text px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter your nickname"
                  />
                  <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                    {userNickname.length} / 20
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Custom Instructions
                </label>

                <div className='relative'>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    maxLength="400"
                    className="w-full h-40 select-text p-4 pr-16 border rounded-lg font-mono text-sm"
                    placeholder="Enter custom instructions..."
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {systemPrompt.length} / 400
                  </div>
                  {systemPrompt && (
                    <button
                      onClick={() => setSystemPrompt('')}
                      className="absolute top-2 right-2 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t flex justify-end">
              <button
                onClick={() => setShowPersonalization(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {showAbout && (
        <motion.div className="fixed inset-0 max-h-dvh z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute ${glassMode ? 'backdrop-blur-[2px]' : 'backdrop-blur-none'} inset-0 bg-black bg-opacity-50`}
            onClick={() => setShowAbout(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative bg-white dark:bg-[rgb(30,30,30)]/95 rounded-xl shadow-xl w-full max-w-2xl max-h-[90%] flex flex-col"
          >
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                About ChatBuddy
              </h2>
              <button
                onClick={() => setShowAbout(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-5 overflow-y-auto font-normal flex-grow space-y-6">
              <div className="p-4 bg-gray-50 dark:bg-[rgb(40,40,40)]/95 rounded-lg mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  ChatBuddy is a Free for All AI Chatapp. Available with 2 AI models (Basic and Advanced).
                  <br />
                  <br />
                  Basic model:{' '}
                  <span className="font-semibold">Gemma3 27b.</span> Best for Conversation & Role-Plays.
                  <br />
                  <br />
                  Advanced model:{' '}
                  <span className="font-semibold">Gemini 2.5 Flash.</span> Best for Coding Math & Reasoning Tasks.
                  <br />
                  <br />
                  <span className="font-semibold">NOTE</span>: Advance Reasoning Mode can take significatly longer time to respond on complex tasks.
                  <br />
                  <br />
                  You can add your Gemini API key for Higher Rate Limits and Context Window (offering upto 128k).
                  <br />
                  <br />
                  Basic Model Supports 6k Context Window. Advance Model Supports 64k Context Window (Default Key).
                  <br />
                  <br />
                  With the Without Personal Key the RateLimits are: Basic Model (7RPM / 500 RPD), Advance Model (3 RPM / 100 RPD){imageGenAvailable && ', Image Generation (1RPM, 25RPD)'}.
                  <br />
                  <br />
                  With your own API Key the RateLimits are: Basic (30 RPM / 14,350 RPD), Advance (15 RPM / 1000 RPD){imageGenAvailable && ', Image Generation (10RPM, 100RPD)'}.
                  {imageGenAvailable &&
                    <>
                      <br />
                      <br />
                      <span className="font-semibold">NOTE</span>: Image Generation is only available till 2025-NOV-12.
                    </>
                  }
                  <br />
                  <br />
                  Aditionally the app Source Code is available on 👉
                  <span className="font-bold">
                    <a
                      href="https://github.com/KushalRoyChowdhury/ChatBuddy"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  </span>
                  👈.
                  <br />
                  <br />
                  Thank You for using ChatBuddy.
                </p>
              </div>

              <div className="text-center text-gray-600 dark:text-gray-300">
                AI can make mistakes.
                <br />
                v2.3.1-LTS (release 251107)
                <br />
                By: Kushal Roy Chowdhury
              </div>
            </div>
            <div className="p-5 border-t flex justify-end">
              <button
                onClick={() => setShowAbout(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showImportAppDataConfirm && (
        <motion.div className="fixed inset-0 max-h-dvh z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute ${glassMode ? 'backdrop-blur-[2px]' : 'backdrop-blur-none'} inset-0 bg-black bg-opacity-50`}
            onClick={() => setShowImportAppDataConfirm(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white dark:bg-[rgb(30,30,30)]/95 rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="p-6 text-center">
              <svg
                className="mx-auto mb-4 text-red-400 w-12 h-12"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-gray-200">
                Import App Data?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This will replace all current application data, including chats, memories, and settings. This action is not revertable.
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[rgb(40,40,40)] flex justify-center gap-4 rounded-b-xl">
              <button
                onClick={() => setShowImportAppDataConfirm(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-400 rounded-lg text-gray-700 dark:text-gray-100 hover:bg-gray-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmImportAppData}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Yes, Import
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showNotAvailablePopup && (
        <motion.div
          className="fixed inset-0 z-50 max-h-dvh flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute ${glassMode ? 'backdrop-blur-[1px]' : 'backdrop-blur-none'} inset-0 bg-black bg-opacity-50`}
            onClick={() => setShowNotAvailablePopup(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="p-6 text-center">
              <h3 className="text-lg font-bold">Action Not Available</h3>
              <p className="text-sm text-gray-500 mt-2">
                This action is not available while the model is responding.
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-center gap-4 rounded-b-xl">
              <button
                onClick={() => setShowNotAvailablePopup(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default Modals;