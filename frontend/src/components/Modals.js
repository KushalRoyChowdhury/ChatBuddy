import React from 'react';
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
  handleOverwriteLocal,
  handleOverwriteRemote,
  usage,
  imageGenAvailable,
  glassMode,
  setGlassMode
}) => {

  const backdropOverlayClass = `absolute inset-0 bg-black/40 ${glassMode ? 'backdrop-blur-sm' : ''}`;

  const getModalClass = (maxWidth = 'max-w-md') => `relative w-full ${maxWidth} rounded-2xl shadow-2xl overflow-hidden transition-all transform ${glassMode
      ? 'bg-white/90 backdrop-blur-xl border border-white/40 dark:bg-[rgb(50,50,50)]/90 dark:border-white/10'
      : 'bg-white dark:bg-[rgb(50,50,50)] border border-gray-200 dark:border-gray-700'
    }`;

  const buttonBaseClass = "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95";
  const buttonPrimaryClass = `${buttonBaseClass} bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30`;
  const buttonSecondaryClass = `${buttonBaseClass} bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20`;
  const buttonDangerClass = `${buttonBaseClass} bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30`;
  const inputClass = "w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400";

  return (
    <AnimatePresence>
      {showMergeConflict && (
        <motion.div className="fixed inset-0 max-h-dvh z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={backdropOverlayClass}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            className={getModalClass()}
          >
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Merge Conflict</h3>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                You have local changes that are not on Google Drive. How would you like to resolve this?
              </p>
            </div>
            <div className="p-4 bg-gray-50/50 dark:bg-black/20 flex justify-center gap-3">
              <button
                onClick={handleOverwriteLocal}
                className={buttonSecondaryClass}
              >
                Use Google Drive
              </button>
              <button
                onClick={handleOverwriteRemote}
                className={buttonPrimaryClass}
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
            className={backdropOverlayClass}
            onClick={() => setShowImportExportOptions(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            className={getModalClass()}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Manage Chat</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Import a previous chat session or export the current one.
              </p>
            </div>
            <div className="p-4 bg-gray-50/50 dark:bg-black/20 flex justify-end gap-3">
              <button
                onClick={() => setShowImportExportOptions(false)}
                className={buttonSecondaryClass}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowImportExportOptions(false);
                  handleImportClick();
                }}
                className={buttonSecondaryClass}
              >
                Import Chat
              </button>
              <button
                onClick={() => {
                  setShowImportExportOptions(false);
                  setShowExportOptions(true);
                }}
                className={buttonPrimaryClass}
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
            className={backdropOverlayClass}
            onClick={() => setShowExportOptions(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            className={getModalClass()}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Choose Export Format
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                <b>Export as JSON</b> for a complete, lossless backup. <br />
                <span className="text-xs opacity-70">(Images/files are not included in JSON export)</span>
                <br />
                <br />
                <b>Export as TXT</b> for a human-readable version.
              </p>
            </div>
            <div className="p-4 bg-gray-50/50 dark:bg-black/20 flex justify-end gap-3">
              <button
                onClick={() => setShowExportOptions(false)}
                className={buttonSecondaryClass}
              >
                Cancel
              </button>
              <button
                onClick={exportChatAsTxt}
                className={buttonSecondaryClass}
              >
                Export as TXT
              </button>
              <button
                onClick={exportChatAsJson}
                className={buttonPrimaryClass}
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
            className={backdropOverlayClass}
            onClick={() => setShowImportConfirm(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            className={getModalClass()}
          >
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Import Chat?</h3>
            </div>
            <div className="p-4 bg-gray-50/50 dark:bg-black/20 flex justify-center gap-3">
              <button
                onClick={() => {
                  setShowImportConfirm(false);
                  setFileToImport(null);
                }}
                className={buttonSecondaryClass}
              >
                Cancel
              </button>
              <button
                onClick={confirmImport}
                className={buttonPrimaryClass}
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
            className={backdropOverlayClass}
            onClick={() => setShowMemoriesImportExport(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            className={getModalClass()}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Manage Memories
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Import a list of memories to append them to your current list,
                or export your current list to a JSON file.
              </p>
            </div>
            <div className="p-4 bg-gray-50/50 dark:bg-black/20 flex justify-end gap-3">
              <button
                onClick={() => setShowMemoriesImportExport(false)}
                className={buttonSecondaryClass}
              >
                Cancel
              </button>
              <button
                onClick={handleImportMemoriesClick}
                className={buttonSecondaryClass}
              >
                Import Memories
              </button>
              <button
                onClick={exportMemoriesAsJson}
                className={buttonPrimaryClass}
              >
                Export Memories
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showMemories && (
        <motion.div className="fixed inset-0 max-h-dvh z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={backdropOverlayClass}
            onClick={() => setShowMemories(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            className={getModalClass('max-w-2xl max-h-[90dvh] flex flex-col')}
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Saved Memories
              </h2>
              <button
                onClick={() => setShowMemories(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-grow custom-scrollbar">
              <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-black/20">
                <div className="flex justify-between items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span>Memory Usage</span>
                  <span>{memoryUsagePercent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${memoryUsagePercent > 90 ? 'bg-red-500' : memoryUsagePercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${memoryUsagePercent}%` }}
                  ></div>
                </div>
              </div>

              {memories.length > 0 ? (
                <ul className="space-y-3 select-text selection:bg-purple-500/30 text-sm text-gray-700 dark:text-gray-200">
                  {[...memories].reverse().map((mem) => (
                    <li
                      key={mem}
                      className="flex items-center justify-between gap-4 p-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                    >
                      <span className="flex-1 prose prose-sm max-w-none m-0 font-normal text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {mem}
                      </span>
                      <button
                        onClick={() => deleteMemory(mem)}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        aria-label="Delete memory"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
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
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No saved memories yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Important details from your chats will appear here</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50/50 dark:bg-black/20 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => { setShowMemoriesImportExport(true); setShowMemories(false); }}
                className={buttonSecondaryClass}
              >
                Manage Memories
              </button>
              <button
                onClick={() => setShowMemories(false)}
                className={buttonPrimaryClass}
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
            className={backdropOverlayClass}
            onClick={() => setShowOptions(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            className={getModalClass('max-w-2xl max-h-[90vh] flex flex-col')}
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Options</h2>
              <button
                onClick={() => setShowOptions(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow space-y-6 custom-scrollbar">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className={inputClass}
                  placeholder="Optional: Use your own key"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Get your Gemini key for free: Google AI Studio {'>'} API Keys {'>'} Generate
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-200 mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                  NOTE: Use your PERSONAL API key to use the app with Higher Limits and
                  greater Context Window. PUBLIC ACCESS has stricter Rate Limits and
                  Context Window. Changing API KEY does not change model behavior/personality.
                </p>
              </div>

              <div className='border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-gray-50/50 dark:bg-black/20'>
                <button onClick={() => setGlassMode(!glassMode)} className="w-full active:scale-[0.98] transition-all flex items-center justify-between group">
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Advanced Rendering</div>
                    <div className='text-gray-500 dark:text-gray-400 text-xs mt-1'>
                      Enables glassmorphism effects. Disable if experiencing lag.
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out relative ${glassMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${glassMode ? 'translate-x-4 md:translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </button>
              </div>

              <div className='border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-gray-50/50 dark:bg-black/20'>
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Today's Usage <span className='text-xs text-gray-500 font-normal dark:text-gray-400 italic'>(EXPERIMENTAL)</span>
                </div>

                <div className="space-y-3">
                  <div className='flex items-center gap-3'>
                    <div className='w-24 text-sm text-gray-600 dark:text-gray-300'>Basic Model</div>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${(usage.basic / (apiKey.trim().length === 39 ? 14400 : 1000) * 100) < 40 ? 'bg-green-500' :
                            (usage.basic / (apiKey.trim().length === 39 ? 14400 : 1000) * 100) < 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${(usage.basic / (apiKey.trim().length === 39 ? 14400 : 1000)) * 100}%` }}
                      />
                    </div>
                    <div className='w-16 text-xs text-right text-gray-500'>
                      {apiKey.trim().length === 39 ? '14,400' : '1,000'}
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='w-24 text-sm text-gray-600 dark:text-gray-300'>Adv. Model</div>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${(usage.advance / (apiKey.trim().length === 39 ? 1000 : 100) * 100) < 40 ? 'bg-green-500' :
                            (usage.advance / (apiKey.trim().length === 39 ? 1000 : 100) * 100) < 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${(usage.advance / (apiKey.trim().length === 39 ? 1000 : 100) * 100)}%` }}
                      />
                    </div>
                    <div className='w-16 text-xs text-right text-gray-500'>
                      {apiKey.trim().length === 39 ? '1,000' : '100'}
                    </div>
                  </div>

                  {imageGenAvailable && (
                    <div className='flex items-center gap-3'>
                      <div className='w-24 text-sm text-gray-600 dark:text-gray-300'>Image Gen</div>
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${(usage.image / (apiKey.trim().length === 39 ? 100 : 25) * 100) < 40 ? 'bg-green-500' :
                              (usage.image / (apiKey.trim().length === 39 ? 100 : 25) * 100) < 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          style={{ width: `${(usage.image / (apiKey.trim().length === 39 ? 100 : 25)) * 100}%` }}
                        />
                      </div>
                      <div className='w-16 text-xs text-right text-gray-500'>
                        {usage.image}/{apiKey.trim().length === 39 ? '100' : '25'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex flex-col md:flex-row gap-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={exportAppData}
                  className={`${buttonSecondaryClass} flex-1 flex items-center justify-center gap-2`}
                >
                  Export App Data
                </button>
                <button
                  onClick={handleImportAppDataClick}
                  className={`${buttonSecondaryClass} flex-1 flex items-center justify-center gap-2`}
                >
                  Import App Data
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(true);
                    setShowOptions(false);
                  }}
                  className={`${buttonDangerClass} flex-1 flex items-center justify-center gap-2`}
                >
                  Reset App
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50/50 dark:bg-black/20 flex justify-end border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowOptions(false)}
                className={buttonPrimaryClass}
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
            className={backdropOverlayClass}
            onClick={() => setShowResetConfirm(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            className={getModalClass()}
          >
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reset App?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                This will delete all chats, memories, and settings. This action is irreversible.
              </p>
            </div>
            <div className="p-4 bg-gray-50/50 dark:bg-black/20 flex justify-center gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className={buttonSecondaryClass}
              >
                Cancel
              </button>
              <button
                onClick={handleResetApp}
                className={buttonDangerClass}
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
            className={backdropOverlayClass}
            onClick={() => setShowSettings(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            className={`${getModalClass('max-w-sm')} transition-none`}
          >
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Settings
              </h3>
              {isAuthenticated && userProfile && (
                <div className="flex items-center p-3 mb-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-black/20">
                  <img src={userProfile.picture} alt="Profile" className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-gray-700" />
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userProfile.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userProfile.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
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
                  className="w-full p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left flex items-center gap-3"
                >
                  <span className="text-lg">🎨</span> Personalization
                </button>
                <button
                  onClick={() => {
                    handleMemoriesClick();
                    setShowSettings(false);
                  }}
                  className="w-full p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors text-left flex items-center gap-3"
                >
                  <span className="text-lg">🧠</span> Saved Memories
                </button>
                <button
                  onClick={() => {
                    handleOptionsClick();
                    setShowSettings(false);
                  }}
                  className="w-full p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-left flex items-center gap-3"
                >
                  <span className="text-lg">⚙️</span> Options
                </button>
                <button
                  onClick={() => {
                    setShowAbout(true);
                    setShowSettings(false);
                  }}
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left flex items-center gap-3"
                >
                  <span className="text-lg">ℹ️</span> About
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
            className={backdropOverlayClass}
            onClick={() => setShowPersonalization(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            className={getModalClass('max-w-2xl max-h-[90vh] flex flex-col')}
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personalization</h2>
              <button
                onClick={() => setShowPersonalization(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow space-y-6 custom-scrollbar">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  User Nickname
                </label>
                <div className='relative'>
                  <input
                    type="text"
                    maxLength="20"
                    value={userNickname}
                    onChange={(e) => setUserNickname(e.target.value)}
                    className={inputClass}
                    placeholder="Enter your nickname"
                  />
                  <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                    {userNickname.length} / 20
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Custom Instructions
                </label>
                <div className='relative'>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    maxLength="400"
                    className={`${inputClass} h-40 font-mono text-sm resize-none py-3`}
                    placeholder="Enter custom instructions for the AI..."
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {systemPrompt.length} / 400
                  </div>
                  {systemPrompt && (
                    <button
                      onClick={() => setSystemPrompt('')}
                      className="absolute top-3 right-3 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  These instructions will be added to the system prompt to customize the AI's behavior.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50/50 dark:bg-black/20 flex justify-end border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowPersonalization(false)}
                className={buttonPrimaryClass}
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
            className={backdropOverlayClass}
            onClick={() => setShowAbout(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            className={getModalClass('max-w-2xl max-h-[90%] flex flex-col')}
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                About ChatBuddy
              </h2>
              <button
                onClick={() => setShowAbout(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto font-normal flex-grow space-y-6 custom-scrollbar">
              <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  ChatBuddy is a Free for All AI Chatapp. Available with 2 AI models (Basic and Advanced).
                  <br /><br />
                  Basic model: <span className="font-semibold text-gray-900 dark:text-white">Gemma3 27b.</span> Best for Conversation & Role-Plays.
                  <br /><br />
                  Advanced model: <span className="font-semibold text-gray-900 dark:text-white">Gemini 2.5 Flash.</span> Best for Coding, Math, Reasoning & Web Tasks.
                  <br /><br />
                  <span className="font-semibold text-amber-600 dark:text-amber-400">NOTE:</span> Advance Reasoning Mode can take significantly longer time to respond on complex tasks.
                  <br /><br />
                  You can add your Gemini API key for Higher Rate Limits and Context Window (offering upto ~128k).
                  <br /><br />
                  Basic Model Supports ~4k Context Window. Advance Model Supports ~64k Context Window (DEMO ACCESS).
                  <br /><br />
                  Rate Limits in DEMO ACCESS are: Basic Model (5RPM / 1000 RPD), Advance Model (3 RPM / 100 RPD){imageGenAvailable && ', Image Generation (1RPM, 25RPD)'}.
                  <br /><br />
                  Rate Limits in PERSONAL KEY ACCESS are: Basic (30 RPM / 14,350 RPD), Advance (15 RPM / 1000 RPD){imageGenAvailable && ', Image Generation (10RPM, 100RPD)'}.
                  <br /><br />
                  Additionally the app Source Code is available on 👉{' '}
                  <a
                    href="https://github.com/KushalRoyChowdhury/ChatBuddy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    GitHub
                  </a>
                  {' '}👈.
                  <br /><br />
                  Thank You for using ChatBuddy.
                </p>
              </div>

              <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                AI can make mistakes.
                <br />
                v2.5.0 (release 251205)
                <br />
                By: Kushal Roy Chowdhury
              </div>
            </div>
            <div className="p-4 bg-gray-50/50 dark:bg-black/20 flex justify-end border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAbout(false)}
                className={buttonPrimaryClass}
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
            className={backdropOverlayClass}
            onClick={() => setShowImportAppDataConfirm(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            className={getModalClass()}
          >
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Import App Data?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                This will replace all current application data, including chats, memories, and settings. This action is not revertable.
              </p>
            </div>
            <div className="p-4 bg-gray-50/50 dark:bg-black/20 flex justify-center gap-3">
              <button
                onClick={() => setShowImportAppDataConfirm(false)}
                className={buttonSecondaryClass}
              >
                Cancel
              </button>
              <button
                onClick={confirmImportAppData}
                className={buttonDangerClass}
              >
                Yes, Import
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showNotAvailablePopup && (
        <motion.div className="fixed inset-0 max-h-dvh z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={backdropOverlayClass}
            onClick={() => setShowNotAvailablePopup(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 0 }}
            className={getModalClass()}
          >
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Action Not Available</h3>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                This action is not available while the model is responding.
              </p>
            </div>
            <div className="p-4 bg-gray-50/50 dark:bg-black/20 flex justify-center">
              <button
                onClick={() => setShowNotAvailablePopup(false)}
                className={buttonPrimaryClass}
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