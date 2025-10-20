import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Modals = React.memo(({
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
  handleClearTempMemory,
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
  setShowNotAvailablePopup
}) => {
  return (
    <AnimatePresence>
      {showImportExportOptions && (
        <motion.div className="fixed inset-0 max-h-dvh z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowImportExportOptions(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md"
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
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowExportOptions(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800">
                Choose Export Format
              </h3>
              <p className="text-sm text-gray-600 mt-2 mb-4">
                <b>Export as JSON</b> for a complete, lossless backup that can be
                imported later. (
                <span className="italic">
                  If the chat has images that will not be backed up
                </span>
                ).
                <br />
                <br />
                <b>Export as TXT</b> for a simple, human-readable version.
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setShowExportOptions(false)}
                className="px-4 py-2 border rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={exportChatAsTxt}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
              >
                Export as TXT
              </button>
              <button
                onClick={exportChatAsJson}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
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
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowImportConfirm(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md"
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
              <p className="text-sm text-gray-500 mt-2">
                This will <b>replace</b> your current chat and system prompt.
                This action cannot be undone.
                <br />
                <br />
                Please export your current chat first if you wish to save it.
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-center gap-4 rounded-b-xl">
              <button
                onClick={() => {
                  setShowImportConfirm(false);
                  setFileToImport(null);
                }}
                className="px-6 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmImport}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMemoriesImportExport(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800">
                Manage Memories
              </h3>
              <p className="text-sm text-gray-600 mt-2 mb-4">
                Import a list of memories to append them to your current list,
                or export your current list to a JSON file.
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setShowMemoriesImportExport(false)}
                className="px-4 py-2 border rounded-lg text-sm font-medium"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
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
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMemories(false)}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
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
              <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                  <span>Memory Usage</span>
                  <span>{memoryUsagePercent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-yellow-500 h-2.5 rounded-full"
                    style={{ width: `${memoryUsagePercent}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-500 mt-1">
                  {memories.join('\n').length} / {MEMORY_LIMIT_CHARS} characters
                </div>
              </div>

              {/* Memories List or Empty State */}
              {memories.length > 0 ? (
                <ul className="space-y-3 text-sm text-gray-700">
                  {[...memories].reverse().map((mem) => (
                    <li
                      key={mem}
                      className="flex items-center justify-between gap-4 p-3 rounded-md hover:bg-gray-50"
                    >
                      <span className="flex-1 prose prose-sm max-w-none m-0 text-gray-700 whitespace-pre-wrap">
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
                <p className="text-center text-gray-500">
                  No saved memories yet.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => { setShowMemoriesImportExport(true); setShowMemories(false); }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
              >
                Manage Memories
              </button>
              <button
                onClick={() => setShowMemories(false)}
                className="px-4 py-2 border rounded-lg text-sm font-medium"
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
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowOptions(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Options</h2>
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
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                  The system prompt sets the behavior and rules for the AI.
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  maxLength="400"
                  className="w-full h-40 p-4 pr-16 border rounded-lg font-mono text-sm"
                  placeholder="Enter system instructions..."
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {systemPrompt.length} / 400
                </div>
                {systemPrompt && (
                  <button
                    onClick={() => setSystemPrompt('')}
                    className="absolute top-3 right-3 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Optional: Use your own key"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your Gemini key for free: Google AI Studio {'>'} API Keys {'>'} Generate
                </p>
                <p className="text-xs text-gray-500 mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400">
                  NOTE: Use your own API key to use the app with Higher Limits and
                  greater Context Window. Default Access has stricter Rate Limits and
                  Context Window. Changing API KEY does not change model behavior.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <button
                  onClick={exportAppData}
                  className="w-full justify-center flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  Export App Data
                </button>
                <button
                  onClick={handleClearTempMemory}
                  className="w-full justify-center flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
                >
                  Clear Temporary Memory
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(true);
                    setShowOptions(false);
                  }}
                  className="w-full justify-center flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
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
            className="absolute inset-0 bg-black bg-opacity-50"
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
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowSettings(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-xs"
          >
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Settings
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleMemoriesClick();
                    setShowSettings(false);
                  }}
                  className="w-full p-2 rounded-md bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
                >
                  Saved Memories
                </button>
                <button
                  onClick={() => {
                    handleOptionsClick();
                    setShowSettings(false);
                  }}
                  className="w-full p-2 rounded-md bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                >
                  Options
                </button>
                <button
                  onClick={() => {
                    setShowAbout(true);
                    setShowSettings(false);
                  }}
                  className="w-full p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  About
                </button>
              </div>
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
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowAbout(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
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
            <div className="p-5 overflow-y-auto flex-grow space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg mt-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  About ChatBuddy
                </h3>
                <p className="text-sm text-gray-600">
                  ChatBuddy is a Free for All AI Chatapp. Available with 2 AI
                  models (Basic and Advanced).
                  <br />
                  Basic model:{' '}
                  <span className="font-medium">Gemma3 27b.</span> Best for
                  Conversation & Role-Plays.
                  <br />
                  <br />
                  Advanced model:{' '}
                  <span className="font-medium">Gemini 2.5 Flash.</span> Best for
                  Coding & Reasoning Tasks.
                  <br />
                  <br />
                  <span className="font-semibold">NOTE</span>: Advance
                  Reasoning Mode can take significatly longer time to respond
                  on complex tasks.
                  <br />
                  <br />
                  You can add your Gemini API key for Higher Rate Limits and
                  Context Window (offering upto 128k).
                  <br />
                  <br />
                  Basic Model Supports 6k Context Window. Advance Model
                  Supports 64k Context Window (Default Key).
                  <br />
                  <br />
                  With the Default Server Key the RateLimits are: Basic Model (7
                  RPM / 500 RPD), Advance Model (3 RPM / 100 RPD), Image
                  Generation (1RPM, 10RPD)
                  <br />
                  <br />
                  With your own API Key the RateLimits are: Basic (30 RPM /
                  14,350 RPD), Advance (15 RPM / 1000 RPD), Image Generation
                  (10RPM, 100RPD) for FREE.
                  <br />
                  <br />
                  Aditionally the app Source Code is available on GitHub 👉
                  <span className="font-medium">
                    [
                    <a
                      href="https://github.com/KushalRoyChowdhury/ChatBuddy"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      HERE
                    </a>
                    ]
                  </span>
                  👈 . Fork It, Modify it.. I don't care. Just Star it before
                  touching.
                  <br />
                  <br />
                  Thank You for using ChatBuddy.
                </p>
              </div>

              <div className="text-center text-gray-600">
                AI can make mistakes.
                <br />
                v2.0.0 (release 251020)
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

      {showNotAvailablePopup && (
        <motion.div
          className="fixed inset-0 z-50 max-h-dvh flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
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
