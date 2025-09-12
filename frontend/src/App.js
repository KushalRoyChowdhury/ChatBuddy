import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; // Component for syntax highlighting
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Theme for syntax highlighting
import TextareaAutosize from 'react-textarea-autosize'; // Text Area

// --- Application Constants ---

// Maximum character limits for different types of memory, approximating token counts.
const MEMORY_LIMIT_CHARS = 2000 * 4; // Approx. 2k tokens for permanent memory
const TEMP_MEMORY_LIMIT_CHARS = 1000 * 4; // Approx. 1k tokens for temporary memory

// Backend API endpoint for the language model.
const BACKEND_URL = `${process.env.REACT_APP_BACKEND_URL}/model`;

export default function App() {
  // --- State Management ---

  // Core application state, initialized from localStorage to persist across sessions.
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('chatHistory')) || []);
  const [input, setInput] = useState('');
  const [model, setModel] = useState(() => localStorage.getItem('selectedModel') || 'gemma-3-27b-it');
  const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem('systemPrompt') || '');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('geminiApiKey') || '');
  const [memories, setMemories] = useState(() => JSON.parse(localStorage.getItem('chatMemories')) || []);
  const [tempMemories, setTempMemories] = useState(() => JSON.parse(localStorage.getItem('chatTempMemories')) || []);
  const [loading, setLoading] = useState(false);

  // UI-related state for controlling modals and menus.
  const [showOptions, setShowOptions] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [advanceReasoning, setAdvanceReasoning] = useState(false);
  
  // State for import/export modals
  const [showImportExportOptions, setShowImportExportOptions] = useState(false); // NEW: Primary modal
  const [showExportOptions, setShowExportOptions] = useState(false); // For TXT/JSON choice
  const [showImportConfirm, setShowImportConfirm] = useState(false); // For import warning
  const [fileToImport, setFileToImport] = useState(null);


  // Ref to the end of the chat for auto-scrolling.
  const chatEndRef = useRef(null);
  // Ref for the hidden file input
  const fileInputRef = useRef(null);


  // --- State Persistence Effects ---
  // These useEffect hooks save the application state to localStorage whenever they change.
  useEffect(() => { localStorage.setItem('chatHistory', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('selectedModel', model); }, [model]);
  useEffect(() => { localStorage.setItem('systemPrompt', systemPrompt); }, [systemPrompt]);
  useEffect(() => { localStorage.setItem('geminiApiKey', apiKey); }, [apiKey]);
  useEffect(() => { localStorage.setItem('chatMemories', JSON.stringify(memories)); }, [memories]);
  useEffect(() => { localStorage.setItem('chatTempMemories', JSON.stringify(tempMemories)); }, [tempMemories]);

  // --- Event Handlers & Logic ---

  /**
   * Resets the entire application state to its default values and clears localStorage.
   */
  const handleResetApp = () => {
    setMessages([]);
    setMemories([]);
    setTempMemories([]);
    setSystemPrompt('');
    setApiKey('');
    setModel('gemma-3-27b-it');
    localStorage.clear();
    setShowResetConfirm(false);
    setShowOptions(false);
  };

  const ReasoningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2.1C9.8 1.8 10.3 1.5 10.8 1.5c.5.1.9.3 1.2.6.4.3.7.7.9 1.2.2.5.2 1.1.1 1.6 M14.5 21.9c-.3.3-.8.5-1.3.5s-1-.2-1.3-.5c-.3-.3-.5-.8-.5-1.3s.2-1 .5-1.3 M17 11.5c.3-.3.5-.8.5-1.3s-.2-1-.5-1.3c-.3-.3-.8-.5-1.3-.5s-1 .2-1.3.5M20 5.5c.3-.3.5-.8.5-1.3s-.2-1-.5-1.3c-.3-.3-.8-.5-1.3-.5s-1 .2-1.3.5M4 18.5c.3-.3.5-.8.5-1.3s-.2-1-.5-1.3c-.3-.3-.8-.5-1.3-.5s-1 .2-1.3.5" />
      <path d="M12 15a3 3 0 1 0-3-3" />
      <path d="M16 11.5A3.5 3.5 0 1 0 12.5 8" />
      <path d="M15 12a3 3 0 1 0-3 3" />
      <path d="M11.5 16a3.5 3.5 0 1 0 3.5 3.5" />
    </svg>
  );

  /**
   * Clears only the temporary memories.
   */
  const handleClearTempMemory = () => {
    setTempMemories([]);
    localStorage.removeItem('chatTempMemories');
  };

  /**
   * Deletes a specific permanent memory item by its index.
   * @param {number} indexToDelete The index of the memory to delete.
   */
  const deleteMemory = (memToDelete) => {
    setMemories(prevMemories => prevMemories.filter(mem => mem !== memToDelete));
  };

  /**
   * Confirms and clears the chat history.
   */
  const handleConfirmClearChat = () => {
    setMessages([]);
    setShowClearConfirm(false);
  };

  /**
   * Toggles between the 'Advanced' and 'Basic' models.
   */
  const handleModelToggle = () => {
    setModel(prev => prev === 'gemini-2.5-flash-lite' ? 'gemma-3-27b-it' : 'gemini-2.5-flash-lite');
  };

  /**
   * Opens the confirmation modal for clearing the chat.
   */
  const handleClearChatClick = () => {
    setShowClearConfirm(true);
    setIsMenuOpen(false);
  };

  /**
   * Opens the options modal.
   */
  const handleOptionsClick = () => {
    setShowOptions(true);
    setIsMenuOpen(false);
  };

  /**
   * Opens the saved memories modal.
   */
  const handleMemoriesClick = () => {
    setShowMemories(true);
    setIsMenuOpen(false);
  };

  const exportChatAsTxt = () => {
    const header = `Chat Exported on ${new Date().toLocaleString()}\nSystem Prompt: ${systemPrompt || 'None'}\n------------------------------------------\n\n`;
    const chatContent = messages.map(msg => {
      const prefix = msg.role === 'user'
        ? `[User - ${msg.model === 'gemini-2.5-flash-lite' ? 'Advanced' : 'Basic'}]`
        : `[AI - ${msg.model === 'gemini-2.5-flash-lite' ? 'Advanced' : 'Basic'}]`;
      let content = msg.content;
      if (msg.role === 'assistant') {
        try {
          const parsedData = JSON.parse(msg.content);
          if (parsedData && typeof parsedData.response === 'string') {
            content = parsedData.response;
          }
        } catch (e) {
          content = msg.content;
        }
      }
      return `${prefix}:\n${content}`;
    }).join('\n\n');
    const blob = new Blob([header + chatContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-export-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportOptions(false);
    setIsMenuOpen(false);
  };

  const exportChatAsJson = () => {
    const exportData = {
      systemPrompt: systemPrompt,
      chatHistory: messages,
    };
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-session-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportOptions(false);
    setIsMenuOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
    setIsMenuOpen(false);
  };

  const handleFileSelected = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setFileToImport(content);
        setShowImportConfirm(true);
      };
      reader.readAsText(file);
    } else {
      alert("Import failed: Please select a valid .json file.");
    }
    event.target.value = null;
  };

  const confirmImport = () => {
    if (!fileToImport) return;

    const backupPrompt = systemPrompt;
    const backupMessages = messages;

    try {
      const importedData = JSON.parse(fileToImport);
      if (!importedData.chatHistory || !Array.isArray(importedData.chatHistory)) {
        throw new Error("Invalid file format: 'chatHistory' is missing or not an array.");
      }

      setSystemPrompt(importedData.systemPrompt || '');
      setMessages(importedData.chatHistory);

      setShowImportConfirm(false);
      setFileToImport(null);
    } catch (error) {
      console.error("Import Error:", error);
      alert(`File integrity invalid. Import failed.\n\nDetails: ${error.message}`);

      setSystemPrompt(backupPrompt);
      setMessages(backupMessages);

      setShowImportConfirm(false);
      setFileToImport(null);
    }
  };


  /**
   * Sends a message to the backend, handles the response, and updates the UI.
   */
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input, model: model, id: Date.now() };
    const currentMessagesWithUser = [...messages, userMessage];
    setMessages(currentMessagesWithUser);
    setInput('');
    setLoading(true);

    try {
      const modelIndex = model === 'gemini-2.5-flash-lite' ? 1 : 0;
      const payload = {
        history: currentMessagesWithUser.map(({ id, ...rest }) => rest),
        memory: memories,
        temp: tempMemories,
        sys: systemPrompt,
        apiKey: apiKey || "",
        modelIndex: modelIndex,
        advanceReasoning: advanceReasoning
      };
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
      }
      if (!data.candidates || !data.candidates[0].content || !data.candidates[0].content.parts[0].text) {
        throw new Error("Invalid or empty response from Backend.");
      }

      const rawJsonString = data.candidates[0].content.parts[0].text;

      let permanentMemoryChanged = false;
      let tempMemoryChanged = false;
      try {
        const parsedResponse = JSON.parse(rawJsonString);
        const { action, target } = parsedResponse;

        if (action === 'remember' && target && !memories.includes(target)) {
          permanentMemoryChanged = true;
          setMemories(prev => [...prev, target]);
        } else if (action === 'forget' && target) {
          permanentMemoryChanged = memories.includes(target);
          setMemories(prev => prev.filter(m => m !== target));
        } else if (action === 'update' && Array.isArray(target) && target.length === 2) {
          const [oldMem, newMem] = target;
          if (memories.includes(oldMem)) {
            permanentMemoryChanged = true;
            setMemories(prev => prev.map(m => m === oldMem ? newMem : m));
          }
        } else if (action === 'temp' && target && !tempMemories.includes(target)) {
          tempMemoryChanged = true;
          setTempMemories(prev => {
            const updatedTempMemories = [...prev, target];
            let totalChars = updatedTempMemories.join('\n').length;
            while (totalChars > TEMP_MEMORY_LIMIT_CHARS && updatedTempMemories.length > 0) {
              const removedItem = updatedTempMemories.shift();
              totalChars -= (removedItem.length + 1);
            }
            return updatedTempMemories;
          });
        }
      } catch (e) {
        // Not a valid JSON command, do nothing.
      }

      const assistantMessage = {
        role: 'assistant',
        content: rawJsonString,
        model: model,
        id: Date.now(),
        memoryStatus: permanentMemoryChanged && tempMemoryChanged ? 'both' : permanentMemoryChanged ? 'permanent' : tempMemoryChanged ? 'temporary' : null
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("API Error:", error);
      const errorJsonString = `{"action":"none", "target":"", "response":"❌ ${error.message}"}`;
      setMessages(prev => [...prev, { role: 'assistant', content: errorJsonString, model: model, id: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const getUserBubbleClass = (msgModel) => msgModel === 'gemini-2.5-flash-lite' ? 'bg-blue-100 text-blue-900 rounded-br-none' : 'bg-green-100 text-green-900 rounded-br-none';
  const getSendButtonClass = () => {
    if (loading || !input.trim()) return 'bg-gray-400 cursor-not-allowed';
    return model === 'gemini-2.5-flash-lite' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700';
  };
  const memoryUsagePercent = (memories.join('\n').length / MEMORY_LIMIT_CHARS) * 100;

  const getTextToRender = (msg) => {
    let textToRender = msg.content;
    if (msg.role === 'assistant') {
      try {
        const parsedData = JSON.parse(msg.content);
        if (typeof parsedData.response === 'string') {
          textToRender = parsedData.response;
        }
      } catch (e) {
        textToRender = msg.content;
      }
    }
    return textToRender;
  };

  const CodeBlock = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeText = String(children).replace(/\n$/, '');
      return !inline && match ? (
        <div className="relative my-2 rounded-lg overflow-hidden font-mono text-sm max-w-full">
          <div className="px-4 py-2 bg-gray-700 flex justify-between items-center">
            <span className="text-xs text-gray-300">{match[1]}</span>
            <button onClick={() => copyToClipboard(codeText)} className="text-xs text-gray-300 hover:text-white">Copy</button>
          </div>
          <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ margin: 0, overflowX: 'auto' }} {...props}>
            {codeText}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-gray-200 text-red-600 px-1 rounded" {...props}>
          {children}
        </code>
      );
    },
  };

  // --- JSX Rendering ---

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">ChatBuddy</h1>
          <div className="hidden md:flex items-center space-x-3">
            {/* MODIFIED: Conditionally render Import or Import/Export button */}
            {messages.length > 0 ? (
              <button onClick={() => setShowImportExportOptions(true)} className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200">Import/Export Chat</button>
            ) : (
              <button onClick={handleImportClick} className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200">Import Chat</button>
            )}
            {messages.length > 0 && <button onClick={handleClearChatClick} className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-100">Clear Chat</button>}
            <button onClick={handleMemoriesClick} className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 bg-yellow-50 text-yellow-800 hover:bg-yellow-100">Saved Memories</button>
            <button onClick={handleOptionsClick} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${systemPrompt.trim() || apiKey.trim() ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'}`}>Options</button>
            <button onClick={handleModelToggle} className={`w-28 text-center px-4 py-1.5 rounded-lg text-sm font-medium ${model === 'gemini-2.5-flash-lite' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{model === 'gemini-2.5-flash-lite' ? 'Advanced' : 'Basic'}</button>
          </div>
          <div className="md:hidden"><button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button></div>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg p-4 z-20">
              <div className="flex flex-col space-y-3">
                <button onClick={() => { handleModelToggle(); }} className={`w-full text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${model === 'gemini-2.5-flash-lite' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{model === 'gemini-2.5-flash-lite' ? 'Advanced' : 'Basic'}</button>
                <button onClick={() => { handleOptionsClick(); setIsMenuOpen(false); }} className={`w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 ${systemPrompt.trim() || apiKey.trim() ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'}`}>Options</button>
                <button onClick={() => { handleMemoriesClick(); setIsMenuOpen(false); }} className="w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 bg-yellow-50 text-yellow-800">Saved Memories</button>
                {/* MODIFIED: Mobile menu button logic */}
                {messages.length > 0 ? (
                  <button onClick={() => { setShowImportExportOptions(true); setIsMenuOpen(false); }} className="w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 bg-gray-100 text-gray-600">Import/Export Chat</button>
                ) : (
                  <button onClick={() => { handleImportClick(); setIsMenuOpen(false); }} className="w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 bg-gray-100 text-gray-600">Import Chat</button>
                )}
                {messages.length > 0 && <button onClick={handleClearChatClick} className="w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 bg-red-50 text-red-700">Clear Chat</button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept="application/json"
        className="hidden"
      />

      {/* --- Modals Section --- */}
      <AnimatePresence>
        {/* Primary Import/Export Modal */}
        {showImportExportOptions && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowImportExportOptions(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800">Manage Chat</h3>
                <p className="text-sm text-gray-600 mt-2 mb-4">
                  Import a previous chat session or export the current one.
                </p>
              </div>
              <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                <button onClick={() => setShowImportExportOptions(false)} className="px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
                <button onClick={() => { setShowImportExportOptions(false); handleImportClick(); }} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700">Import Chat</button>
                <button onClick={() => { setShowImportExportOptions(false); setShowExportOptions(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Export Chat</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Export Options Modal (TXT/JSON) */}
        {showExportOptions && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowExportOptions(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800">Choose Export Format</h3>
                <p className="text-sm text-gray-600 mt-2 mb-4">
                  <b>Export as JSON</b> for a complete, lossless backup that can be imported later.
                  <br />
                  <b>Export as TXT</b> for a simple, human-readable version.
                </p>
              </div>
              <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                <button onClick={() => setShowExportOptions(false)} className="px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
                <button onClick={exportChatAsTxt} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700">Export as TXT</button>
                <button onClick={exportChatAsJson} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Export as JSON</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Import Confirmation Modal */}
        {showImportConfirm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowImportConfirm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6 text-center">
                <svg className="mx-auto mb-4 text-orange-400 w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                <h3 className="text-lg font-bold">Import Chat?</h3>
                <p className="text-sm text-gray-500 mt-2">
                  This will <b>replace</b> your current chat and system prompt. This action cannot be undone.
                  <br /><br />
                  Please export your current chat first if you wish to save it.
                </p>
              </div>
              <div className="p-4 bg-gray-50 flex justify-center gap-4 rounded-b-xl">
                <button onClick={() => { setShowImportConfirm(false); setFileToImport(null); }} className="px-6 py-2 border rounded-lg">Cancel</button>
                <button onClick={confirmImport} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Yes, Import</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* --- Saved Memories Modal --- */}
        {showMemories && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMemories(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="p-5 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Saved Memories</h2><button onClick={() => setShowMemories(false)} className="text-gray-500 hover:text-gray-700">&times;</button></div>
              <div className="p-5 overflow-y-auto flex-grow">
                <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-1"><span>Memory Usage</span><span>{memoryUsagePercent.toFixed(1)}%</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${memoryUsagePercent}%` }}></div></div>
                  <div className="text-right text-xs text-gray-500 mt-1">{memories.join('\n').length} / {MEMORY_LIMIT_CHARS} characters</div>
                </div>
                {memories.length > 0 ? (
                  <ul className="space-y-3 text-sm text-gray-700">
                    {[...memories].reverse().map((mem) => (
                      <li
                        key={mem}
                        className="flex items-center justify-between gap-4 p-3 rounded-md hover:bg-gray-50"
                      >
                        <span className="flex-1 prose prose-sm max-w-none m-0 text-gray-700">
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
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-gray-500 text-center py-8">The AI has no saved memories yet.</p>}
              </div>
              <div className="p-5 border-t flex justify-end gap-3"><button onClick={() => setShowMemories(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Close</button></div>
            </motion.div>
          </motion.div>
        )}
        {/* --- Options Modal --- */}
        {showOptions && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowOptions(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="p-5 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Options & Settings</h2><button onClick={() => setShowOptions(false)} className="text-gray-500 hover:text-gray-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
              <div className="p-5 overflow-y-auto flex-grow space-y-6">
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100"><p className="text-sm text-blue-800">The system prompt sets the behavior and rules for the AI.</p></div>
                <div className="relative">
                  <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} maxLength="400" className="w-full h-40 p-4 pr-16 border rounded-lg font-mono text-sm" placeholder="Enter system instructions..." />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">{systemPrompt.length} / 400</div>
                  {systemPrompt && (<button onClick={() => setSystemPrompt('')} className="absolute top-3 right-3 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Clear</button>)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gemini API Key</label>
                  <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Optional: Use your own key" />
                  <p className="text-xs text-gray-500 mt-1">Get your Gemini key for free: Google AI Studio {'>'} API Keys {'>'} Generate</p>
                  <p className="text-xs text-gray-500 mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400">NOTE: Use your own API key to use the app with Higher Limits and greater Context Window. Default Key has stricter Rate Limits and Context Window. Changing API KEY does not change model behavior.</p>
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <button onClick={handleClearTempMemory} className="w-full justify-center flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm">Clear Temporary Memory</button>
                  <button onClick={() => { setShowResetConfirm(true); setShowOptions(false); }} className="w-full justify-center flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Reset App</button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg mt-4">
                  <h3 className="font-medium text-gray-800 mb-2">About ChatBuddy</h3>
                  <p className="text-sm text-gray-600">
                    ChatBuddy is a Free for All AI Chatapp. Available with 2 AI models (Basic and Advanced).
                    <br />
                    Basic model: <span className='font-medium'>Gemma3 27b.</span> Best for Conversation & Role-Plays.
                    <br />
                    <br />
                    Advanced model: <span className='font-medium'>Gemini 2.5 Flash.</span> Best for Coding & Reasoning Tasks.
                    <br />
                    <br />
                    You can add your Gemini API key for Higher Rate Limits and Context Window (offering upto 128k).
                    <br />
                    <br />
                    Basic Model Supports 6k Context Window (API Limitation). Advance Model Supports 64k Context Window (Default Key).
                    <br />
                    <br />
                    With the Default Server Key the RateLimits are: Basic Model (7 RPM / 500 RPD), Advance Model (3 RPM / 100 RPD).
                    <br />
                    <br />
                    With your own API Key the RateLimits are: Basic (30 RPM / 14,350 RPD), Advance (15 RPM / 1000 RPD) for FREE.
                    <br />
                    <br />
                    Aditionally the app Source Code is available on GitHub 👉<span className='font-medium'>[<a href="https://github.com/KushalRoyChowdhury/ChatBuddy" target="_blank" rel="noopener noreferrer">HERE</a>]</span>👈 . Fork It, Modify it.. I don't care. Just Star it before touching.
                    <br />
                    <br />
                    Thank You for using ChatBuddy.
                  </p>
                </div>
                <div className='text-center text-gray-600'>AI can make mistakes.<br />v1.1<br />By: KushalRoyChowdhury</div>
              </div>
              <div className="p-5 border-t flex justify-end">
                <button onClick={() => setShowOptions(false)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* --- Clear Chat Confirmation Modal --- */}
        {showClearConfirm && (<motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowClearConfirm(false)} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-md"><div className="p-6 text-center"><h3 className="text-lg font-bold">Clear Chat?</h3><p className="text-sm text-gray-500">This cannot be undone.</p></div><div className="p-4 bg-gray-50 flex justify-center gap-4 rounded-b-xl"><button onClick={() => setShowClearConfirm(false)} className="px-6 py-2 border rounded-lg">Cancel</button><button onClick={handleConfirmClearChat} className="px-6 py-2 bg-red-600 text-white rounded-lg">Yes, Clear</button></div></motion.div></motion.div>)}
        {/* --- Reset App Confirmation Modal --- */}
        {showResetConfirm && (<motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowResetConfirm(false)} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-md"><div className="p-6 text-center"><svg className="mx-auto mb-4 text-red-400 w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg><h3 className="mb-2 text-lg font-bold text-gray-800">Reset App?</h3><p className="text-sm text-gray-500">This will delete all chats, memories, and settings. This action is irreversible.</p></div><div className="p-4 bg-gray-50 flex justify-center gap-4 rounded-b-xl"><button onClick={() => setShowResetConfirm(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium">Cancel</button><button onClick={handleResetApp} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Yes, Reset</button></div></motion.div></motion.div>)}
      </AnimatePresence>

      {/* --- Main Chat Area --- */}
      <main className="flex-grow overflow-y-auto p-4 max-w-4xl mx-auto w-full" onClick={() => setIsMenuOpen(false)}>
        <div className="space-y-4">
          {messages.length === 0 ? (<div className="text-center py-12 text-gray-500 bg-white rounded-xl border max-w-2xl mx-auto"><p className="text-lg mb-3">Start a conversation</p><div className="flex justify-center gap-4 mt-4"><div onClick={() => setModel('gemma-3-27b-it')} className="p-3 bg-green-50 rounded-lg cursor-pointer"><div className="font-medium text-green-600">Basic</div></div><div onClick={() => setModel('gemini-2.5-flash-lite')} className="p-3 bg-blue-50 rounded-lg cursor-pointer"><div className="font-medium text-blue-600">Advanced</div></div></div>{systemPrompt.trim() && <div className="mt-4 p-3 bg-indigo-50 rounded-lg max-w-md mx-auto"><p className="text-sm text-indigo-700">System prompt is active.</p></div>}</div>) : (
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3xl rounded-2xl p-4 overflow-hidden ${msg.role === 'user' ? getUserBubbleClass(msg.model) : 'bg-white border shadow-sm text-black'}`}>
                    <div className="prose prose-sm max-w-none prose-p:text-inherit">
                      <ReactMarkdown components={CodeBlock}>
                        {getTextToRender(msg)}
                      </ReactMarkdown>
                    </div>
                    {msg.role === 'assistant' && (
                      <div className="mt-2 text-xs text-gray-500 italic border-t pt-2 flex justify-between items-center gap-2">
                        <span>Using: {msg.model === 'gemini-2.5-flash-lite' ? 'Advanced' : 'Basic'}</span>
                        <div className="flex gap-2">
                          {msg.memoryStatus === 'permanent' || msg.memoryStatus === 'both' ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Memory Updated</span> : null}
                          {msg.memoryStatus === 'temporary' || msg.memoryStatus === 'both' ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Temp Memory</span> : null}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {loading && (<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full flex justify-start"><div className="max-w-3xl rounded-2xl p-4 bg-white border shadow-sm text-black flex items-center gap-3"><span className="text-sm">{model === 'gemini-2.5-flash-lite' ? advanceReasoning ? 'Thinking Deeply...' : "Thinking..." : 'Responding...'}</span><div className="flex space-x-1"><motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} /><motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} /><motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} /></div></div></motion.div>)}
          <div ref={chatEndRef} />
        </div>
      </main>

      <footer className="bg-white border-t p-4 sticky bottom-0">

        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(advanceReasoning); }}
          className="max-w-4xl w-full mx-auto"
        >
          <div className="relative">
            <TextareaAutosize
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(advanceReasoning);
                }
              }}
              placeholder={`Ask anything... (${model === 'gemini-2.5-flash-lite' ? 'Advanced' : 'Basic'})`}
              className={`w-full flex items-center px-4 py-3 pr-40 border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all`}
              minRows={1}
              maxRows={5}
            />

            <div className="absolute right-[6px] bottom-[6px] flex items-center gap-2">
              {model === 'gemini-2.5-flash-lite' && (
                <motion.button
                  type="button"
                  title="Thinking"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAdvanceReasoning(!advanceReasoning)}
                  className={`p-2 rounded-lg transition-colors ${advanceReasoning
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  <ReasoningIcon />
                </motion.button>
              )}

              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                disabled={loading || !input.trim()}
                className={`px-6 py-2 rounded-xl text-white font-medium flex items-center ${getSendButtonClass()} transition-colors`}
              >
                Send
              </motion.button>
            </div>
          </div>
        </form>

        <div className="max-w-4xl mx-auto mt-2 text-xs text-gray-500 px-1 flex justify-between items-center">
          <p>Models: Basic (Gemma 3) / Advanced (Gemini 2.5)</p>
          {systemPrompt.trim() && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">System prompt active</span>}
        </div>
      </footer>
    </div>
  );
}

