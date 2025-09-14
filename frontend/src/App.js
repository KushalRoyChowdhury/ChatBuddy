import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import TextareaAutosize from 'react-textarea-autosize';

// --- Application Constants ---
const MEMORY_LIMIT_CHARS = 2000 * 4;
const TEMP_MEMORY_LIMIT_CHARS = 1000 * 4;
const BACKEND_URL = `${process.env.REACT_APP_BACKEND_URL}`;

// --- Helper Component for Collapsible "Thinking Process" ---
const CollapsibleThought = ({ thoughtContent }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!thoughtContent) return null;

  const formattedContent = thoughtContent.replace(/\\n/g, '\n');

  return (
    <div className="mb-2 border-b border-dashed border-gray-300 pb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}><polyline points="9 18 15 12 9 6"></polyline></svg>
        Thinking Process
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: '8px' }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="prose prose-sm max-w-none p-2 bg-gray-100 rounded-md">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {formattedContent}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default function App() {
  useEffect(() => { fetch(`${BACKEND_URL}/health`, { method: 'GET' }) }, []);

  // --- State Management ---
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('chatHistory')) || []);
  const [input, setInput] = useState('');
  const [model, setModel] = useState(() => localStorage.getItem('selectedModel') || 'gemma-3-27b-it');
  const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem('systemPrompt') || '');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('geminiApiKey') || '');
  const [memories, setMemories] = useState(() => JSON.parse(localStorage.getItem('chatMemories')) || []);
  const [loading, setLoading] = useState(false);

  // --- New/Modified State ---
  const [chatId, setChatId] = useState(() => localStorage.getItem('chatId') || crypto.randomUUID());
  const [tempMemories, setTempMemories] = useState(() => JSON.parse(localStorage.getItem('chatTempMemories')) || []); // Now an array of objects
  const [thinkingProcesses, setThinkingProcesses] = useState(() => JSON.parse(localStorage.getItem('thinkingProcesses')) || []); // For <think> content

  // UI-related state
  const [showOptions, setShowOptions] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [advanceReasoning, setAdvanceReasoning] = useState(false);
  const [creativeRP, setCreativeRP] = useState(false);
  const [webSearch, setWebSearch] = useState(true);
  const [showImportExportOptions, setShowImportExportOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [fileToImport, setFileToImport] = useState(null);
  const [showMemoriesImportExport, setShowMemoriesImportExport] = useState(false);
  const [modelUsed, setModelUsed] = useState("");

  // Refs
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const memoryFileInputRef = useRef(null);

  // --- State Persistence Effects ---
  useEffect(() => { localStorage.setItem('chatHistory', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('selectedModel', model); }, [model]);
  useEffect(() => { localStorage.setItem('systemPrompt', systemPrompt); }, [systemPrompt]);
  useEffect(() => { localStorage.setItem('geminiApiKey', apiKey); }, [apiKey]);
  useEffect(() => { localStorage.setItem('chatMemories', JSON.stringify(memories)); }, [memories]);
  // --- Modified Persistence ---
  useEffect(() => { localStorage.setItem('chatTempMemories', JSON.stringify(tempMemories)); }, [tempMemories]);
  useEffect(() => { localStorage.setItem('thinkingProcesses', JSON.stringify(thinkingProcesses)); }, [thinkingProcesses]);
  useEffect(() => { localStorage.setItem('chatId', chatId); }, [chatId]);

  // Effect to generate a new chatId when the chat is cleared or reset
  useEffect(() => {
    if (messages.length === 0 && !loading) { // Check loading to prevent reset during initial message send
      const newChatId = crypto.randomUUID();
      setChatId(newChatId);
    }
  }, [messages.length, loading]);


  // --- Event Handlers & Logic ---
  const handleResetApp = () => {
    setMessages([]);
    setMemories([]);
    setTempMemories([]);
    setThinkingProcesses([]); // Clear thinking processes
    setSystemPrompt('');
    setApiKey('');
    setModel('gemma-3-27b-it');
    localStorage.clear();
    // A new chat ID will be generated by the useEffect for messages.length
    setShowResetConfirm(false);
    setShowOptions(false);
    window.location.reload();
  };

  const handleClearTempMemory = () => {
    setTempMemories([]);
    localStorage.removeItem('chatTempMemories');
  };

  const deleteMemory = (memToDelete) => {
    setMemories(prevMemories => prevMemories.filter(mem => mem !== memToDelete));
  };

  const handleConfirmClearChat = () => {
    setMessages([]);
    setThinkingProcesses([]); // Also clear thinking processes associated with the chat
    setShowClearConfirm(false);
    // A new chat ID will be generated by the useEffect for messages.length
  };

  const handleModelToggle = () => {
    setModel(prev => prev === 'gemini-2.5-flash-lite' ? 'gemma-3-27b-it' : 'gemini-2.5-flash-lite');
  };

  const handleClearChatClick = () => {
    setShowClearConfirm(true);
    setIsMenuOpen(false);
  };

  const handleOptionsClick = () => {
    setShowOptions(true);
    setIsMenuOpen(false);
  };

  const handleMemoriesClick = () => {
    setShowMemories(true);
    setIsMenuOpen(false);
  };

  // --- Chat Import/Export Functions ---
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
      setThinkingProcesses([]); // Clear old thinking processes on import
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

  // --- Memory Import/Export Functions ---
  const exportMemoriesAsJson = () => {
    if (memories.length === 0) {
      alert("There are no memories to export.");
      return;
    }
    const jsonString = JSON.stringify(memories, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chatbuddy-memories-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowMemoriesImportExport(false);
  };

  const handleImportMemoriesClick = () => {
    memoryFileInputRef.current.click();
  };

  const handleMemoryFileSelected = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const jsonString = e.target.result;
        try {
          const importedMemories = JSON.parse(jsonString);
          if (!Array.isArray(importedMemories)) {
            throw new Error("Invalid format: The JSON file must contain an array of strings.");
          }
          const existingMemoriesSet = new Set(memories);
          const newUniqueMemories = importedMemories.filter(mem =>
            typeof mem === 'string' && mem.trim() !== '' && !existingMemoriesSet.has(mem)
          );
          if (newUniqueMemories.length > 0) {
            setMemories(prevMemories => [...prevMemories, ...newUniqueMemories]);
          } else {
            alert("Import complete. No new memories were found to add.");
          }
          setShowMemoriesImportExport(false);
        } catch (error) {
          console.error("Memory Import Error:", error);
          alert(`Memory import failed: ${error.message}`);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Import failed: Please select a valid .json file.");
    }
    event.target.value = null;
  };


  // --- Core Message Sending Function (MODIFIED) ---
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input, model: model, id: Date.now() };
    const currentMessagesWithUser = [...messages, userMessage];
    setMessages(currentMessagesWithUser);
    setInput('');
    setLoading(true);

    try {
      // Filter tempMemories: send only memories from OTHER chats
      const memoriesForModel = tempMemories
        .filter(mem => mem.id !== chatId)
        .map(mem => mem.memory); // Send only the string content

      const modelIndex = model === 'gemini-2.5-flash-lite' ? 1 : 0;
      if (modelIndex === 0) {
        setModelUsed("basic");
      }
      else if (modelIndex === 1 && advanceReasoning) {
        setModelUsed("advance+");
      }
      else {
        setModelUsed("advance");
      }
      const payload = {
        history: currentMessagesWithUser.map(({ id, ...rest }) => rest),
        memory: memories,
        temp: memoriesForModel,
        sys: systemPrompt,
        apiKey: apiKey || "",
        modelIndex: modelIndex,
        creativeRP: creativeRP,
        advanceReasoning: advanceReasoning,
        webSearch: webSearch
      };

      const response = await fetch(`${BACKEND_URL}/model`, {
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

      let rawResponseString = data.candidates[0].content.parts[0].text;

      // Extract and remove <think> content
      const thinkRegex = /<think>(.*?)<\/think>/gs;
      const thinkMatches = [...rawResponseString.matchAll(thinkRegex)].map(m => m[1].trim());
      const thoughtContent = thinkMatches.length > 0 ? thinkMatches.join('\n\n') : null;
      const cleanJsonString = rawResponseString.replace(thinkRegex, '').trim();
      
      const assistantMessageId = Date.now(); // Unique ID for this message

      if (thoughtContent) {
        setThinkingProcesses(prev => [...prev, { id: assistantMessageId, content: thoughtContent }]);
      }

      let permanentMemoryChanged = false;
      let tempMemoryChanged = false;
      try {
        const parsedResponse = JSON.parse(cleanJsonString);
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
        } else if (action === 'temp' && target) {
          // Add temp memory as an object with the current chatId
          const newTempMemory = { memory: target, id: chatId };
          const alreadyExists = tempMemories.some(m => m.memory === target && m.id === chatId);

          if (!alreadyExists) {
            tempMemoryChanged = true;
            setTempMemories(prev => {
              const updatedTempMemories = [...prev, newTempMemory];
              // Recalculate size based on memory string length
              let totalChars = updatedTempMemories.reduce((acc, curr) => acc + curr.memory.length + 1, 0);
              while (totalChars > TEMP_MEMORY_LIMIT_CHARS && updatedTempMemories.length > 0) {
                const removedItem = updatedTempMemories.shift();
                totalChars -= (removedItem.memory.length + 1);
              }
              return updatedTempMemories;
            });
          }
        }
      } catch (e) {
        console.log("JSON Parse Error: ", e);
      }

      const assistantMessage = {
        role: 'assistant',
        content: cleanJsonString,
        model: model,
        id: assistantMessageId, // Use the generated ID
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

  // --- Helper & Utility Functions ---
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
    // console.log('Raw markdown:', JSON.stringify(textToRender));
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

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!isMobileDevice() && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    }
  };

  // --- JSX Rendering ---
  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
        {/* Header content remains the same */}
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">ChatBuddy</h1>
          <div className="hidden md:flex items-center space-x-3">
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
      <input type="file" ref={fileInputRef} onChange={handleFileSelected} accept="application/json" className="hidden" />
      <input type="file" ref={memoryFileInputRef} onChange={handleMemoryFileSelected} accept="application/json" className="hidden" />

      {/* --- Modals Section --- */}
      <AnimatePresence>
        {showImportExportOptions && (<motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowImportExportOptions(false)} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-md"><div className="p-6"><h3 className="text-lg font-bold text-gray-800">Manage Chat</h3><p className="text-sm text-gray-600 mt-2 mb-4">Import a previous chat session or export the current one.</p></div><div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl"><button onClick={() => setShowImportExportOptions(false)} className="px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button><button onClick={() => { setShowImportExportOptions(false); handleImportClick(); }} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700">Import Chat</button><button onClick={() => { setShowImportExportOptions(false); setShowExportOptions(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Export Chat</button></div></motion.div></motion.div>)}
        {showExportOptions && (<motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowExportOptions(false)} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-md"><div className="p-6"><h3 className="text-lg font-bold text-gray-800">Choose Export Format</h3><p className="text-sm text-gray-600 mt-2 mb-4"><b>Export as JSON</b> for a complete, lossless backup that can be imported later.<br /><b>Export as TXT</b> for a simple, human-readable version.</p></div><div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl"><button onClick={() => setShowExportOptions(false)} className="px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button><button onClick={exportChatAsTxt} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700">Export as TXT</button><button onClick={exportChatAsJson} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Export as JSON</button></div></motion.div></motion.div>)}
        {showImportConfirm && (<motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowImportConfirm(false)} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-md"><div className="p-6 text-center"><svg className="mx-auto mb-4 text-orange-400 w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg><h3 className="text-lg font-bold">Import Chat?</h3><p className="text-sm text-gray-500 mt-2">This will <b>replace</b> your current chat and system prompt. This action cannot be undone.<br /><br />Please export your current chat first if you wish to save it.</p></div><div className="p-4 bg-gray-50 flex justify-center gap-4 rounded-b-xl"><button onClick={() => { setShowImportConfirm(false); setFileToImport(null); }} className="px-6 py-2 border rounded-lg">Cancel</button><button onClick={confirmImport} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Yes, Import</button></div></motion.div></motion.div>)}
        {showMemoriesImportExport && (<motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMemoriesImportExport(false)} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-md"><div className="p-6"><h3 className="text-lg font-bold text-gray-800">Manage Memories</h3><p className="text-sm text-gray-600 mt-2 mb-4">Import a list of memories to append them to your current list, or export your current list to a JSON file.</p></div><div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl"><button onClick={() => setShowMemoriesImportExport(false)} className="px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button><button onClick={handleImportMemoriesClick} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700">Import Memories</button><button onClick={exportMemoriesAsJson} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Export Memories</button></div></motion.div></motion.div>)}
        {showMemories && (<motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMemories(false)} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"><div className="p-5 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Saved Memories</h2><button onClick={() => setShowMemories(false)} className="text-gray-500 hover:text-gray-700">&times;</button></div><div className="p-5 overflow-y-auto flex-grow"><div className="mb-4 p-3 border rounded-lg bg-gray-50"><div className="flex justify-between items-center text-sm text-gray-600 mb-1"><span>Memory Usage</span><span>{memoryUsagePercent.toFixed(1)}%</span></div><div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${memoryUsagePercent}%` }}></div></div><div className="text-right text-xs text-gray-500 mt-1">{memories.join('\n').length} / {MEMORY_LIMIT_CHARS} characters</div></div>{memories.length > 0 ? (<ul className="space-y-3 text-sm text-gray-700">{[...memories].reverse().map((mem) => (<li key={mem} className="flex items-center justify-between gap-4 p-3 rounded-md hover:bg-gray-50"><span className="flex-1 prose prose-sm max-w-none m-0 text-gray-700">{mem}</span><button onClick={() => deleteMemory(mem)} className="text-gray-400 hover:text-red-500 p-2 rounded-full flex-shrink-0 focus:outline-none transition-colors" aria-label="Delete memory"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="align-middle"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></li>))}</ul>) : <p className="text-gray-500 text-center py-8">The AI has no saved memories yet.</p>}</div><div className="p-5 border-t flex justify-end gap-3"><button onClick={() => { setShowMemoriesImportExport(true); setShowMemories(false); }} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700">Import/Export Memories</button><button onClick={() => setShowMemories(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Close</button></div></motion.div></motion.div>)}
        {showOptions && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setShowOptions(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Options & Settings</h2>
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
                    greater Context Window. Default Key has stricter Rate Limits and
                    Context Window. Changing API KEY does not change model behavior.
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t">
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

                <div className="p-4 bg-gray-50 rounded-lg mt-4">
                  <h3 className="font-medium text-gray-800 mb-2">About ChatBuddy</h3>
                  <p className="text-sm text-gray-600">
                    ChatBuddy is a Free for All AI Chatapp. Available with 2 AI models (Basic and Advanced).
                    <br />
                    Basic model: <span className="font-medium">Gemma3 27b.</span> Best for Conversation & Role-Plays.
                    <br />
                    <br />
                    Advanced model: <span className="font-medium">Gemini 2.5 Flash.</span> Best for Coding & Reasoning Tasks.
                    <br />
                    <br />
                    <span className='font-semibold'>NOTE</span>: Advance Reasoning Mode can take significatly longer time to respond on complex tasks.
                    <br />
                    <br />
                    You can add your Gemini API key for Higher Rate Limits and Context Window (offering upto 128k).
                    <br />
                    <br />
                    Basic Model Supports 6k Context Window. Advance Model Supports 64k Context Window (Default Key).
                    <br />
                    <br />
                    With the Default Server Key the RateLimits are: Basic Model (7 RPM / 500 RPD), Advance Model (3 RPM / 100 RPD).
                    <br />
                    <br />
                    With your own API Key the RateLimits are: Basic (30 RPM / 14,350 RPD), Advance (15 RPM / 1000 RPD) for FREE.
                    <br />
                    <br />
                    Aditionally the app Source Code is available on GitHub 👉
                    <span className="font-medium">
                      [<a href="https://github.com/KushalRoyChowdhury/ChatBuddy" target="_blank" rel="noopener noreferrer">HERE</a>]
                    </span>
                    👈 . Fork It, Modify it.. I don't care. Just Star it before touching.
                    <br />
                    <br />
                    Thank You for using ChatBuddy.
                  </p>
                </div>

                <div className="text-center text-gray-600">
                  AI can make mistakes.
                  <br />
                  v1.2.2
                  <br />
                  By: KushalRoyChowdhury
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
        {showClearConfirm && (<motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowClearConfirm(false)} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-md"><div className="p-6 text-center"><h3 className="text-lg font-bold">Clear Chat?</h3><p className="text-sm text-gray-500">This cannot be undone.</p></div><div className="p-4 bg-gray-50 flex justify-center gap-4 rounded-b-xl"><button onClick={() => setShowClearConfirm(false)} className="px-6 py-2 border rounded-lg">Cancel</button><button onClick={handleConfirmClearChat} className="px-6 py-2 bg-red-600 text-white rounded-lg">Yes, Clear</button></div></motion.div></motion.div>)}
        {showResetConfirm && (<motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowResetConfirm(false)} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-md"><div className="p-6 text-center"><svg className="mx-auto mb-4 text-red-400 w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg><h3 className="mb-2 text-lg font-bold text-gray-800">Reset App?</h3><p className="text-sm text-gray-500">This will delete all chats, memories, and settings. This action is irreversible.</p></div><div className="p-4 bg-gray-50 flex justify-center gap-4 rounded-b-xl"><button onClick={() => setShowResetConfirm(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium">Cancel</button><button onClick={handleResetApp} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Yes, Reset</button></div></motion.div></motion.div>)}
      </AnimatePresence>


      {/* --- Main Chat Area --- */}
      <main className="flex-grow overflow-y-auto p-4 max-w-4xl mx-auto w-full" onClick={() => setIsMenuOpen(false)}>
        <div className="space-y-4">
          {messages.length === 0 ? (<div className="text-center py-12 text-gray-500 bg-white rounded-xl border max-w-2xl mx-auto"><p className="text-lg mb-3">Start a conversation</p><div className="flex justify-center gap-4 mt-4"><div onClick={() => setModel('gemma-3-27b-it')} className="p-3 bg-green-50 rounded-lg cursor-pointer"><div className="font-medium w-24 text-green-600">Basic</div></div><div onClick={() => setModel('gemini-2.5-flash-lite')} className="p-3 bg-blue-50 rounded-lg cursor-pointer"><div className="font-medium w-24 text-blue-600">Advanced</div></div></div>{systemPrompt.trim() && <div className="mt-4 p-3 bg-indigo-50 rounded-lg md:max-w-md max-w-[80%] mx-auto"><p className="text-sm text-indigo-700">System prompt is active.</p></div>}</div>) : (
            <AnimatePresence>
              {messages.map((msg) => {
                const thought = thinkingProcesses.find(t => t.id === msg.id);
                return (
                  <motion.div key={msg.id} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-3xl rounded-2xl p-4 overflow-hidden ${msg.role === 'user' ? getUserBubbleClass(msg.model) : 'bg-white border shadow-sm text-black'}`}>
                      {msg.role === 'assistant' && <CollapsibleThought thoughtContent={thought?.content} />}
                      <div className="prose prose-sm max-w-none prose-p:text-inherit markdown-content">
                        <ReactMarkdown components={CodeBlock} remarkPlugins={[remarkGfm]}>{getTextToRender(msg)}</ReactMarkdown>
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
                );
              })}
            </AnimatePresence>
          )}
          {loading && (<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full flex justify-start"><div className="max-w-3xl rounded-2xl p-4 bg-white border shadow-sm text-black flex items-center gap-3"><span className="text-sm">{modelUsed === 'basic' ? 'Responding...' : modelUsed === 'advance+' ? 'Thinking Deeply...' : 'Thinking...'}</span><div className="flex space-x-1"><motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} /><motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} /><motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} /></div></div></motion.div>)}
          <div ref={chatEndRef} />
        </div>
      </main>

      <footer className="bg-white border border-b-0 border-x-0 md:border-none md:bg-slate-50 p-1 md:pb-5 sticky bottom-0 rounded-t-3xl md:rounded-none">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="max-w-4xl bg-white w-full mx-auto md:border rounded-2xl md:shadow-lg"
        >
          <TextareaAutosize
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask anything... (Model: ${model === 'gemini-2.5-flash-lite' ? 'Advanced' : 'Basic'})`}
            className={`w-full flex bg-white items-center px-4 py-3 resize-none outline-none transition-all rounded-2xl`}
            minRows={1}
            maxRows={5}
          />
          <div className='p-2 flex relative justify-start gap-2 h-[56px]'>
            <AnimatePresence>
              {model === 'gemma-3-27b-it' && (
                <motion.button
                  type="button"
                  title="More Creative Responses (can make mistake on factual answers)"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCreativeRP(!creativeRP)}
                  className={`p-2 rounded-xl w-40 md:w-48 text-center text-nowrap transition-colors ${creativeRP
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  <div className='flex gap-2 items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 hidden md:block">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                    </svg>
                    <div>Creative Responses</div>
                  </div>
                </motion.button>
              )}

              {model === 'gemini-2.5-flash-lite' && (
                <>
                  <motion.button
                    type="button"
                    title="Advance Multi-Step Reasoning"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAdvanceReasoning(!advanceReasoning)}
                    className={`p-2 rounded-xl w-max md:w-48 text-center text-nowrap transition-colors ${advanceReasoning
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                  >
                    <div className='flex gap-2 justify-center'>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 hidden md:block">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                      </svg>
                      <div className='hidden md:block'>Advance Reasoning</div>
                      <div className='block md:hidden'>Deep Think</div>

                    </div>
                  </motion.button>

                  <motion.button
                    type="button"
                    title="Search Web for latest info"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setWebSearch(!webSearch)}
                    className={`p-2 rounded-xl w-max md:w-48 text-center text-nowrap transition-colors ${webSearch
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                  >
                    <div className='flex gap-2 justify-center'>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 hidden md:block">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>

                      <div className='hidden md:block'>Web Search</div>
                      <div className='block md:hidden'>Internet</div>

                    </div>
                  </motion.button>
                </>
              )}
            </AnimatePresence>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.99 }}
              disabled={loading || !input.trim()}
              className={`px-6 absolute right-2 py-2 self-end rounded-xl text-white font-medium flex items-center ${getSendButtonClass()} transition-colors duration-500`}
            >
              Send
            </motion.button>
          </div>
        </form>
      </footer>
    </div>
  );
}


