import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import TextareaAutosize from 'react-textarea-autosize';

// --- Application Constants ---
const MEMORY_LIMIT_CHARS = 2000 * 4;
const TEMP_MEMORY_LIMIT_CHARS = 6000 * 4;
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
        <svg xmlns="http://www.w.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}><polyline points="9 18 15 12 9 6"></polyline></svg>
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

const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const codeText = String(children).replace(/\n$/, '');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return !inline && match ? (
    <div className="relative my-2 rounded-lg overflow-hidden font-mono text-sm max-w-full">
      <div className="px-4 py-2 bg-gray-200 flex justify-between items-center">
        <span className="text-xs text-gray-700">{match[1]}</span>
        <button onClick={() => copyToClipboard(codeText)} className="text-xs text-gray-700 hover:text-black hover:font-bold transition-all">Copy</button>
      </div>
      <SyntaxHighlighter style={oneLight} language={match[1]} PreTag="div" customStyle={{ margin: 0, overflowX: 'auto' }} {...props}>
        {codeText}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className="bg-gray-200 text-red-600 px-1 rounded" {...props}>
      {children}
    </code>
  );
};

const getTextToRender = (msg) => {
  let textToRender = msg.content;
  if (msg.role === 'assistant') {
    try {
      const parsedData = JSON.parse(msg.content);
      if (typeof parsedData.response === 'string') {
        textToRender = parsedData.response;
      }
    } catch (e) {
      // It's already msg.content, so no action needed
    }
  }
  return textToRender;
};

const getUserBubbleClass = (msgModel) => {
  return msgModel === 'gemini-2.5-flash-lite'
    ? 'bg-blue-100 text-blue-900 rounded-br-none'
    : msgModel === 'image' ? 'bg-orange-100 text-orange-900 rounded-br-none' : 'bg-green-100 text-green-900 rounded-br-none';
};

const ChatMessage = React.memo(({ msg, thought, messageImageMap, getTextToRender, getUserBubbleClass }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(true);
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-3xl rounded-2xl p-4 overflow-hidden ${msg.role === 'user' ? getUserBubbleClass(msg.model) : 'bg-white border shadow-sm text-black'}`}>
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
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <line x1="10" y1="9" x2="8" y2="9"></line>
                  </svg>
                  <span className="text-sm cursor-default font-medium text-blue-800">
                    {fileName || 'Document'}
                  </span>
                </div>
              )}
            </div>
          );
        })()}

        {(() => {
          const content = getTextToRender(msg);
          // Check if content is a data URL (image)
          if (content.startsWith('image/')) {
            // Function to download the image
            const handleDownload = () => {
              const link = document.createElement('a');
              link.href = `data:${content}`;
              link.download = 'ai-generated-image.png';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            return (
              <div className="mb-2 relative inline-block">
                <button
                  onClick={handleDownload}
                  className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors flex items-center justify-center"
                  aria-label="Download image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>

                </button>

                {/* Image */}
                <img
                  src={`data:${content}`}
                  alt="AI Generated"
                  className="max-w-xs max-h-64 rounded-lg object-cover border border-gray-200 shadow-sm"
                />
              </div>
            );
          }
          // Otherwise, render as Markdown
          return (
            <div className="prose prose-sm max-w-none prose-p:text-inherit markdown-content">
              <ReactMarkdown components={{ code: CodeBlock }} remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          );
        })()}

        {msg.role === 'assistant' && (
          <div className="mt-2 text-xs text-gray-500 italic border-t pt-2 flex justify-between items-center gap-2">
            <span>Using: {msg.model === 'gemini-2.5-flash-lite' ? 'Advanced' : msg.model === 'image' ? 'ImageGen' : 'Basic'}</span>
            <div className="flex gap-2">
              {msg.memoryStatus === 'permanent' || msg.memoryStatus === 'both' ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Memory Updated</span> : null}
              {msg.memoryStatus === 'temporary' || msg.memoryStatus === 'both' ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Temp Memory</span> : null}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});


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
  const [uploading, setUploading] = useState(false);
  const [isViewingBottom, setIsViewingBottom] = useState(false);


  // --- New/Modified State ---
  const [chatId, setChatId] = useState(() => localStorage.getItem('chatId') || crypto.randomUUID());
  const [tempMemories, setTempMemories] = useState(() => JSON.parse(localStorage.getItem('chatTempMemories')) || []); // Now an array of objects
  const [thinkingProcesses, setThinkingProcesses] = useState(() => JSON.parse(localStorage.getItem('thinkingProcesses')) || []); // For <think> content
  const [uploadedImages, setUploadedImages] = useState(() => {
    const saved = localStorage.getItem('uploadedImages');
    return saved ? JSON.parse(saved) : [];
  });
  const [messageImageMap, setMessageImageMap] = useState(() => {
    const saved = localStorage.getItem('messageImageMap');
    return saved ? JSON.parse(saved) : [];
  });

  // UI-related state
  const [showOptions, setShowOptions] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [advanceReasoning, setAdvanceReasoning] = useState(false);
  const [creativeRP, setCreativeRP] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [showImportExportOptions, setShowImportExportOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [fileToImport, setFileToImport] = useState(null);
  const [showMemoriesImportExport, setShowMemoriesImportExport] = useState(false);
  const [modelUsed, setModelUsed] = useState("");
  const [showAddFiles, setShowAddFiles] = useState(false);
  const [fileImg, setFileImg] = useState(null);
  const [currentBase64Image, setCurrentBase64Image] = useState();
  const [isDragging, setIsDragging] = useState(false);
  const [fileDoc, setFileDoc] = useState(null);
  const fileDocInputRef = useRef(null);
  const [imageGen, setImageGen] = useState(false);
  const [tapBottom, setTapBottom] = useState();
  const [fileName, setFileName] = useState(false);

  // Greetings
  const userName = memories
    .map(memory => {
      if (memory.includes("User's name is")) {
        return memory.split("User's name is")[1].trim();
      }
      if (memory.includes("User prefers to call them")) {
        return memory.split("user prefers to call them")[1].trim();
      }
      return null;
    })
    .filter(Boolean)[0] || "legend";

  const greetings = [
    `Yo! Welcome back, ${userName}.`,
    "Oh look, you decided to come today 🎉",
    "Start a Conversation"
  ];
  const [noChatGreet] = useState(
    greetings[Math.floor(Math.random() * greetings.length)]
  );

  // Refs
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const memoryFileInputRef = useRef(null);
  const fileImgInputRef = useRef(null);

  // --- State Persistence Effects ---
  useEffect(() => { localStorage.setItem('chatHistory', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('selectedModel', model); }, [model]);
  useEffect(() => { localStorage.setItem('systemPrompt', systemPrompt); }, [systemPrompt]);
  useEffect(() => { localStorage.setItem('geminiApiKey', apiKey); }, [apiKey]);
  useEffect(() => { localStorage.setItem('chatMemories', JSON.stringify(memories)); }, [memories]);
  // uploadedFileInfo

  // --- Modified Persistence ---
  useEffect(() => { localStorage.setItem('chatTempMemories', JSON.stringify(tempMemories)); }, [tempMemories]);
  useEffect(() => { localStorage.setItem('thinkingProcesses', JSON.stringify(thinkingProcesses)); }, [thinkingProcesses]);
  useEffect(() => { localStorage.setItem('chatId', chatId); }, [chatId]);
  useEffect(() => {
    localStorage.setItem('uploadedImages', JSON.stringify(uploadedImages));
  }, [uploadedImages]); // Stores the image URI
  useEffect(() => {
    localStorage.setItem('messageImageMap', JSON.stringify(messageImageMap));
  }, [messageImageMap]); // Stores the image data to show in chat.

  // Effect to generate a new chatId when the chat is cleared or reset
  useEffect(() => {
    if (messages.length === 0 && !loading) { // Check loading to prevent reset during initial message send
      const newChatId = crypto.randomUUID();
      setChatId(newChatId);
    }
  }, [messages.length, loading]);

  const isBottomAtView = useInView(chatEndRef);

  useEffect(() => {
    if (isBottomAtView) {
      setIsViewingBottom(true);
    } else {
      setIsViewingBottom(false);
    }
  }, [isBottomAtView]);


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
    setUploadedImages([]);
    setShowClearConfirm(false);
    setMessageImageMap([]);
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


  const sendMessage = async () => {
    if ((!input.trim()) || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      model: imageGen ? 'image' : model,
      id: Date.now()
    };

    if (currentBase64Image) {
      if (fileName) {
        setMessageImageMap(prev => [
          ...prev,
          {
            id: userMessage.id,
            base64Data: null,
            mimeType: null,
            fileName: fileName
          }
        ]);
      }
      const img = new Image();
      img.src = `data:image/jpeg;base64,${currentBase64Image}`;
      img.onload = () => {
        const maxWidth = 864;
        const quality = 0.6;
        const ratio = Math.min(maxWidth / img.width, 1);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const resized = canvas.toDataURL('image/jpeg', quality).split(',')[1];
        setMessageImageMap(prev => [
          ...prev,
          {
            id: userMessage.id,
            base64Data: resized,
            mimeType: 'image/jpeg'
          }
        ]);
        setCurrentBase64Image(null);
      };
    }


    const currentMessagesWithUser = [...messages, userMessage];
    setMessages(currentMessagesWithUser);

    setInput('');
    setFileImg(null);
    setFileDoc(null);
    setLoading(true);
    setFileName(false);

    try {
      const memoriesForModel = tempMemories
        .filter(mem => mem.id !== chatId)
        .map(mem => mem.memory);

      const currentChatImageUris = uploadedImages
        .filter(img => img.chatId === chatId)
        .map(img => {
          return {
            uri: img.uri,
            mimeType: img.mimeType
          }
        });

      let modelIndex = model === 'gemini-2.5-flash-lite' ? 1 : 0;
      if (imageGen) {
        modelIndex = 2;
      }
      if (modelIndex === 0) {
        setModelUsed("basic");
      } else if (modelIndex === 1 && advanceReasoning) {
        setModelUsed("advance+");
      } else if (modelIndex === 2) {
        setModelUsed("image");
      }
      else {
        setModelUsed("advance");
      }


      const payload = {
        history: currentMessagesWithUser.map(msg => {
          // Only check for image in assistant messages
          if (
            msg.role === 'assistant' &&
            typeof msg.content === 'string' &&
            msg.content.startsWith('image/')
          ) {
            return {
              ...msg,
              content: '[image omitted]'
            };
          }
          // Otherwise, return message unchanged
          return msg;
        }),
        memory: memories,
        temp: memoriesForModel,
        sys: systemPrompt,
        apiKey: apiKey || "",
        modelIndex: modelIndex,
        creativeRP: creativeRP,
        advanceReasoning: advanceReasoning,
        webSearch: webSearch,
        images: currentChatImageUris
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
      const thinkRegex = /<think>(.*?)<\/think>/gs;
      const thinkMatches = [...rawResponseString.matchAll(thinkRegex)].map(m => m[1].trim());
      const thoughtContent = thinkMatches.length > 0 ? thinkMatches.join('\n\n \n\n') : null;
      const cleanJsonString = rawResponseString.replace(thinkRegex, '').trim();
      const assistantMessageId = Date.now();

      if (thoughtContent) {
        setThinkingProcesses(prev => [...prev, { id: assistantMessageId, content: thoughtContent }]);
      }

      let permanentMemoryChanged = false;
      let tempMemoryChanged = false;
      try {
        const parsedResponse = JSON.parse(cleanJsonString);
        const { action, target } = parsedResponse;

        if (action === 'remember' && target[0] && !memories.includes(target[0])) {
          permanentMemoryChanged = true;
          setMemories(prev => [...prev, target[0]]);
        } else if (action === 'forget' && target[0]) {
          permanentMemoryChanged = memories.includes(target[0]);
          setMemories(prev => prev.filter(m => m !== target[0]));
        } else if (action === 'update' && Array.isArray(target) && target.length === 2) {
          const [oldMem, newMem] = target;
          if (memories.includes(oldMem)) {
            permanentMemoryChanged = true;
            setMemories(prev => prev.map(m => m === oldMem ? newMem : m));
          }
        } else if (action === 'temp' && target[0]) {
          const newTempMemory = { memory: target[0], id: chatId };
          const alreadyExists = tempMemories.some(m => m.memory === target[0] && m.id === chatId);
          if (!alreadyExists) {
            tempMemoryChanged = true;
            setTempMemories(prev => {
              const updatedTempMemories = [...prev, newTempMemory];
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
        model: imageGen ? 'image' : model,
        id: assistantMessageId,
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

  const chatContainerRef = useRef(); // the scrollable container

  const isAtBottom = () => {
    const container = chatContainerRef.current;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop <= container.clientHeight + 1;
  };

  const scrollToBottom = () => {
    if (isAtBottom()) {
      if (loading || tapBottom) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
    const timer = setTimeout(() => {
      setTapBottom(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [loading, tapBottom]);

  useEffect(() => {
    setTapBottom(true);
  }, []);

  const getSendButtonClass = () => {
    if (loading || uploading || !input.trim()) return 'bg-gray-400 cursor-not-allowed';
    return imageGen ? 'bg-orange-600 hover:bg-orange-700' : model === 'gemini-2.5-flash-lite' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700';
  };
  const memoryUsagePercent = (memories.join('\n').length / MEMORY_LIMIT_CHARS) * 100;

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

  const uploadImg = async (file) => {
    setUploading(true);
    if (!file.type.includes('image')) {
      setFileName(file.name);
    }
    const base64String = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setCurrentBase64Image(base64String);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await fetch(`${BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || errorData.message || `Upload failed with status: ${uploadResponse.status}`);
      }

      const result = await uploadResponse.json();
      setUploading(false);

      setUploadedImages(prev => [
        ...prev,
        {
          chatId: chatId,
          uri: result.uri,
          mimeType: result.mimeType
        }
      ]);

    } catch (error) {
      console.error("Image upload error: ", error);
      alert(`Failed to upload image:\n${error.message}`);
      setFileImg(null);
      setFileDoc(null);
    }
  };

  const handleDocFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      e.target.value = null;
      return;
    }
    e.target.value = null;
    if (model !== 'gemini-2.5-flash-lite') {
      alert("Document uploads are only available in Advanced mode.");
      setShowAddFiles(false);
      return;
    }
    const validDocTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    setShowAddFiles(false);

    if (!validDocTypes.includes(file.type)) {
      alert("Please select a valid document (PDF, TXT, DOC, DOCX).");
      return;
    }

    // Set the file in state for UI preview
    setFileDoc(file);

    uploadImg(file);
  };

  const handleImgUpload = () => fileImgInputRef.current?.click();
  const handleImgFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      e.target.value = null;
      return;
    }

    e.target.value = null;

    if (fileImg) {
      alert("Only one image file can be uploaded at a time.");
      setShowAddFiles(false);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file (JPG, PNG, etc.).");
      return;
    }

    setFileImg(file);
    setShowAddFiles(false);
    uploadImg(file);

  };

  // Handle paste event
  const handlePaste = async (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault(); // Prevent pasting image as text (some browsers do this)
        const file = items[i].getAsFile();
        if (file) {
          await handlePastedOrDroppedImage(file);
        }
      }
    }
  };

  // Handle drag over (prevent default to allow drop)
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  // Handle drag leave (optional, for visual feedback later)
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Handle drop event
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        await handlePastedOrDroppedImage(file);
        break; // Only handle first image for now (since you support 1 at a time)
      }
    }
  };

  // Shared handler for both paste and drop
  const handlePastedOrDroppedImage = async (file) => {
    if (fileImg) {
      alert("An image has already been uploaded. Please remove it before adding a new one.");
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file (JPG, PNG, etc.).");
      return;
    }

    setFileImg(file);
    // Optional: Auto-hide the add files menu if open
    setShowAddFiles(false);
    uploadImg(file);
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
              <button onClick={() => setShowImportExportOptions(true)} className="px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all">Import/Export Chat</button>
            ) : (
              <button onClick={handleImportClick} className="px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all">Import Chat</button>
            )}
            {messages.length > 0 && <button onClick={handleClearChatClick} className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95 flex items-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-100">Clear Chat</button>}
            <button onClick={handleMemoriesClick} className="px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all active:scale-95 bg-yellow-50 text-yellow-800 hover:bg-yellow-100">Saved Memories</button>
            <button onClick={handleOptionsClick} className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all active:scale-95 ${systemPrompt.trim() || apiKey.trim() ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>Options</button>
            <button onClick={handleModelToggle} className={`w-28 text-center px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${model === 'gemini-2.5-flash-lite' ? 'bg-blue-100 hover:bg-blue-200 active:scale-95 text-blue-800' : 'bg-green-100 hover:bg-green-200 active:scale-95 text-green-800'}`}>{model === 'gemini-2.5-flash-lite' ? 'Advanced' : 'Basic'}</button>
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
        {showExportOptions && (<motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowExportOptions(false)} /><motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-xl w-full max-w-md"><div className="p-6"><h3 className="text-lg font-bold text-gray-800">Choose Export Format</h3><p className="text-sm text-gray-600 mt-2 mb-4"><b>Export as JSON</b> for a complete, lossless backup that can be imported later. (<span className='italic'>If the chat has images that will not be backed up</span>).<br /><br /><b>Export as TXT</b> for a simple, human-readable version.</p></div><div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl"><button onClick={() => setShowExportOptions(false)} className="px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button><button onClick={exportChatAsTxt} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700">Export as TXT</button><button onClick={exportChatAsJson} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Export as JSON</button></div></motion.div></motion.div>)}
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
                    With the Default Server Key the RateLimits are: Basic Model (7 RPM / 500 RPD), Advance Model (3 RPM / 100 RPD), Image Generation (1RPM, 10RPD)
                    <br />
                    <br />
                    With your own API Key the RateLimits are: Basic (30 RPM / 14,350 RPD), Advance (15 RPM / 1000 RPD), Image Generation (10RPM, 100RPD) for FREE.
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
                  v1.5.3
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
      <main ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 max-w-4xl mx-auto w-full" onClick={() => { setIsMenuOpen(false); setShowAddFiles(false); }}>

        <div className="space-y-4">
          {messages.length === 0 ? (<div className="text-center py-12 text-gray-500 bg-white rounded-xl border max-w-2xl mx-auto"><p className="text-lg mb-3">{noChatGreet}</p><div className="flex justify-center gap-4 mt-4"><div onClick={() => setModel('gemma-3-27b-it')} className="p-3 bg-green-50 hover:bg-green-100 active:scale-95 transition-all rounded-lg cursor-pointer"><div className="font-medium w-24 text-green-600">Basic</div></div><div onClick={() => setModel('gemini-2.5-flash-lite')} className="p-3 bg-blue-50 hover:bg-blue-100 transition-all active:scale-95 rounded-lg cursor-pointer"><div className="font-medium w-24 text-blue-600">Advanced</div></div></div>{systemPrompt.trim() && <div className="mt-4 p-3 bg-indigo-50 rounded-lg md:max-w-md max-w-[80%] mx-auto"><p className="text-sm text-indigo-700">System prompt is active.</p></div>}</div>) : (
            <AnimatePresence>
              {messages.map((msg) => {
                const thought = thinkingProcesses.find(t => t.id === msg.id);
                return (
                  <ChatMessage
                    key={msg.id}
                    msg={msg}
                    thought={thought}
                    messageImageMap={messageImageMap}
                    getTextToRender={getTextToRender}
                    getUserBubbleClass={getUserBubbleClass}
                  />
                );
              })}
            </AnimatePresence>
          )}
          {loading && (<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full flex justify-start"><div className="max-w-3xl rounded-2xl p-4 bg-white border shadow-sm text-black flex items-center gap-3"><span className="text-sm">{modelUsed === 'basic' ? 'Responding...' : modelUsed === 'advance+' ? 'Thinking Deeply...' : modelUsed === 'image' ? 'Generating...' : 'Thinking...'}</span><div className="flex space-x-1"><motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} /><motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} /><motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} /></div></div></motion.div>)}
          <div className='w-full h-3 md:h-1 bg-transparent' ref={chatEndRef} />
        </div>

      </main>

      <footer className="bg-white border border-b-0 border-x-0 md:border-none md:bg-slate-50 p-1 md:pb-5 sticky bottom-0 rounded-t-3xl md:rounded-none">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`max-w-4xl relative w-full bg-white mx-auto md:border rounded-2xl md:shadow-lg transition-colors ${isDragging ? 'border-2 border-blue-500 bg-blue-50' : ''}`}
        >
          {!isViewingBottom &&
            <button
              type='button'
              onClick={() => { setTapBottom(true) }}
              className='absolute right-0 -top-14 md:right-1 md:-top-14 bg-white hover:bg-slate-100 shadow-lg flex justify-center items-center rounded-full p-2 active:scale-95 transition-all'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </button>
          }

          {fileImg && (
            <div className="p-2 border-b-0 border-gray-200">
              <div className="relative inline-block bg-gray-100 p-1 rounded-lg">
                {uploading ? (
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
                    src={URL.createObjectURL(fileImg)}
                    alt="Selected"
                    className="h-20 w-20 object-cover rounded-md"
                  />
                )}
                {!uploading &&
                  <button
                    type="button"
                    onClick={() => {
                      setFileImg(null);
                      setUploadedImages(prev => prev.slice(0, -1));
                      if (fileImgInputRef.current) {
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
            </div>
          )}

          {fileDoc && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative inline-block bg-gray-100 p-1 rounded-lg">
                {uploading ? (
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
                  <div className="h-20 w-20 flex flex-col items-center justify-center p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <line x1="10" y1="9" x2="8" y2="9"></line>
                    </svg>
                    <span className="text-xs mt-1 text-center max-w-full truncate">{fileDoc.name}</span>
                  </div>
                )}
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => {
                      setFileDoc(null);
                      setUploadedImages(prev => prev.slice(0, -1)); // Pop last uploaded item
                      if (fileDocInputRef.current) {
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
            </div>
          )}

          <TextareaAutosize
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            placeholder={`${imageGen ? 'Enter Image Generation prompt...' : `Ask anything... (Model: ${model === 'gemini-2.5-flash-lite' ? 'Advanced' : 'Basic'})`}`}

            className={`w-full flex bg-white items-center px-4 py-3 resize-none outline-none transition-all rounded-2xl`}
            minRows={1}
            maxRows={5}
          />
          <div className='p-2 flex relative justify-start gap-2 h-[56px] transition-all'>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileImgInputRef}
              onChange={handleImgFileChange}
            />
            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              ref={fileDocInputRef}
              onChange={handleDocFileChange}
            />
            <AnimatePresence>
              {showAddFiles &&
                <motion.div
                  initial={{ width: 0, height: 0, opacity: 0, x: -30, y: 20 }}
                  animate={{ width: "auto", height: "auto", opacity: 1, x: 0, y: 0 }}
                  exit={{ width: 0, height: 0, opacity: 0, x: -10, y: 10 }}
                  className={`absolute w-max h-max left-9 flex flex-col bottom-16 overflow-hidden bg-white/60 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200`}>
                  {model === 'gemini-2.5-flash-lite' && <button onClick={() => { fileDocInputRef.current?.click() }} className='p-4 pb-1 text-nowrap hover:scale-105 transition-all'>Upload Files</button>}
                  <button onClick={handleImgUpload} className={`p-4 ${model === 'gemini-2.5-flash-lite' && 'pt-2'} text-nowrap hover:scale-105 transition-all`}>Upload Image</button>
                </motion.div>
              }
            </AnimatePresence>

            <motion.button
              type="button"
              title="Upload Images/Files (Experimental)"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => { setShowAddFiles(!showAddFiles) }}
              className={`aspect-square flex items-center justify-center ${imageGen && 'cursor-not-allowed text-gray-300'}`}
              disabled={imageGen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-7 ${showAddFiles ? 'hidden' : 'block'}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>

              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`size-7 ${!showAddFiles ? 'hidden' : 'block'}`}>
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
              </svg>


            </motion.button>

            <AnimatePresence>
              <motion.button
                type="button"
                title="Generate Images"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setImageGen(!imageGen); setShowAddFiles(false) }}
                className={`p-2 rounded-xl w-max md:w-48 text-center text-nowrap transition-colors ${imageGen
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
              >
                <div className='flex gap-2 items-center justify-center'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 hidden md:block">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>

                  <div className='hidden md:block'>Image Generation</div>
                  <div className='block md:hidden'>Image</div>
                </div>
              </motion.button>
            </AnimatePresence>

            <AnimatePresence>
              {model === 'gemma-3-27b-it' && !imageGen && (
                <motion.button
                  type="button"
                  title="More Creative Responses (can make mistake on factual answers)"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCreativeRP(!creativeRP)}
                  className={`p-2 rounded-xl w-max md:w-48 text-center text-nowrap transition-colors ${creativeRP
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  <div className='flex gap-2 items-center justify-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 hidden md:block">
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
                      <div className='block md:hidden'>Reasoning</div>

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
              whileTap={{ scale: 0.99 }}
              disabled={loading || uploading || (!input.trim())}
              className={`px-2 sm:px-6 absolute right-2 py-2 self-end rounded-xl text-white font-medium flex gap-2 items-center ${getSendButtonClass()} transition-colors duration-500`}
            >
              <div className='hidden md:block'>
                SEND
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 md:hidden lg:block">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </motion.button>
          </div>
        </form>
      </footer>
    </div >
  );
}
