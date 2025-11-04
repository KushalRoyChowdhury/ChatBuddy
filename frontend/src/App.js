import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pako from 'pako';
import { useInView, motion } from 'framer-motion';
import Header from './components/Header';
import ChatLog from './components/ChatLog';
import MessageInput from './components/MessageInput';
import Modals from './components/Modals';
import Sidebar from './components/Sidebar';
import useMediaQuery from './hooks/useMediaQuery';
import Login from './components/Login';

const compress = (string, level) => {
  const compressed = pako.gzip(string, { level });
  return btoa(String.fromCharCode.apply(null, compressed));
};

const decompress = (base64String) => {
  // atob decodes the base64 string back to a binary string.
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  // Decompress and return as a string, ready for JSON.parse()
  return pako.ungzip(bytes, { to: 'string' });
};



// --- Application Constants ---
const MEMORY_LIMIT_CHARS = 2000 * 4;
const TEMP_MEMORY_LIMIT_CHARS = 6000 * 4;
const BACKEND_URL = `${process.env.REACT_APP_BACKEND_URL}`;

const getTextToRender = (msg) => {
  let textToRender = msg.content;
  if (msg.role === 'assistant') {
    try {
      const parsedData = JSON.parse(msg.content);
      if (typeof parsedData.response === 'string') {
        textToRender = parsedData.response;
      }
    } catch (e) { }
  }
  return textToRender;
};

const getUserBubbleClass = (msgModel) => {
  return msgModel === 'gemini-2.5-flash-lite'
    ? 'bg-blue-100 text-blue-900 rounded-br-none'
    : msgModel === 'image' ? 'bg-orange-100 text-orange-900 rounded-br-none' : 'bg-green-100 text-green-900 rounded-br-none';
};

export default function App() {
  useEffect(() => { fetch(`${BACKEND_URL}/health`, { method: 'GET' }) }, []);

  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // --- State Management ---
  const [chatSessions, setChatSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('chatSessions');
      if (!saved) return [];

      try {
        return JSON.parse(decompress(saved)) || [];
      } catch {
        return JSON.parse(saved) || [];
      }
    } catch {
      return [];
    }
  });
  const [activeChatId, setActiveChatId] = useState(() => sessionStorage.getItem('activeChatId') || crypto.randomUUID());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState(() => sessionStorage.getItem('selectedModel') || 'gemma-3-27b-it');
  const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem('systemPrompt') || '');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('geminiApiKey') || '');
  const [memories, setMemories] = useState(() => {
    try {
      const saved = localStorage.getItem('chatMemories');
      if (!saved) return [];

      try {
        return JSON.parse(decompress(saved)) || [];
      } catch {
        return JSON.parse(saved) || [];
      }
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isViewingBottom, setIsViewingBottom] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showMergeConflict, setShowMergeConflict] = useState(false);

  const [usage, setUsage] = useState({ "basic": 0, "advance": 0, "image": 0 });


  // --- New/Modified State ---
  const [tempMemories, setTempMemories] = useState(() => {
    try {
      const data = localStorage.getItem('chatTempMemories');
      if (!data) return [];
      try {
        return JSON.parse(decompress(data)) || [];
      } catch {
        return JSON.parse(data) || [];
      }
    } catch {
      return [];
    }
  });

  const [thinkingProcesses, setThinkingProcesses] = useState(() => {
    try {
      const data = localStorage.getItem('thinkingProcesses');
      if (!data) return {};
      try {
        return JSON.parse(decompress(data)) || {};
      } catch {
        return JSON.parse(data) || {};
      }
    } catch {
      return {};
    }
  });

  const [uploadedImages, setUploadedImages] = useState(() => {
    try {
      const saved = localStorage.getItem('uploadedImages');
      if (!saved) return [];

      let parsed;
      try {
        parsed = JSON.parse(decompress(saved)) || [];
      } catch {
        parsed = JSON.parse(saved) || [];
      }

      const now = Date.now();
      const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

      const filtered = parsed.filter(obj => {
        if (!obj || !obj.saved) return false;

        const diff = now - new Date(obj.saved).getTime();
        return diff < FORTY_EIGHT_HOURS;
      });

      return filtered;
    } catch {
      return [];
    }
  });



  const [messageImageMap, setMessageImageMap] = useState(() => {
    try {
      const saved = localStorage.getItem('messageImageMap');
      if (!saved) return [];

      let parsed;
      try {
        parsed = JSON.parse(decompress(saved)) || [];
      } catch {
        parsed = JSON.parse(saved) || [];
      }

      const now = Date.now();
      const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

      const filtered = parsed.filter(obj => {
        if (!obj.saved) return false;
        const diff = now - new Date(obj.saved).getTime();
        return diff < FORTY_EIGHT_HOURS;
      });

      return filtered;
    } catch {
      return [];
    }
  });


  // UI-related state
  const [showOptions, setShowOptions] = useState(false);
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
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
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
  const [showNotAvailablePopup, setShowNotAvailablePopup] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [userNickname, setUserNickname] = useState(() => localStorage.getItem('userNickname') || '');
  const [showImportAppDataConfirm, setShowImportAppDataConfirm] = useState(false);
  const [appDataToImport, setAppDataToImport] = useState(null);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);


  // Refs
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const memoryFileInputRef = useRef(null);
  const fileImgInputRef = useRef(null);
  const appDataFileInputRef = useRef(null);
  const previousActiveChatIdRef = useRef();

  // --- Data Sync ---
  const saveDataToDrive = useCallback(async () => {
    if (!isAuthenticated) return;

    const lastModified = new Date().toISOString();

    const appData = {
      chatSessions,
      systemPrompt,
      apiKey,
      memories,
      tempMemories,
      thinkingProcesses,
      uploadedImages,
      messageImageMap,
      userNickname,
      lastModified: lastModified
    };
    localStorage.setItem('lastModified', lastModified);

    try {
      let data = JSON.stringify(appData);
      data = pako.gzip(data, { level: 9 });

      sessionStorage.setItem('needRead', 'true');

      await fetch(`${BACKEND_URL}/api/drive/write`,
        {
          method: 'POST',
          headers: {
            'Content-Encoding': 'gzip',
            'Content-Type': 'application/octet-stream'
          },
          body: data,
          credentials: 'include'
        }
      );
    } catch (error) {
      console.error('Error saving data to Google Drive:', error);
    }
  }, [isAuthenticated, chatSessions, model, systemPrompt, apiKey, memories, tempMemories, thinkingProcesses, uploadedImages, messageImageMap, userNickname]);


  // --- State Persistence Effects ---
  useEffect(() => { localStorage.setItem('chatSessions', compress(JSON.stringify(chatSessions), 9)); }, [chatSessions]);
  useEffect(() => { sessionStorage.setItem('activeChatId', activeChatId); }, [activeChatId]);
  useEffect(() => { sessionStorage.setItem('selectedModel', model); }, [model]);
  useEffect(() => { localStorage.setItem('systemPrompt', systemPrompt); }, [systemPrompt]);
  useEffect(() => { localStorage.setItem('geminiApiKey', apiKey); }, [apiKey]);
  useEffect(() => { localStorage.setItem('chatMemories', compress(JSON.stringify(memories), 6)); }, [memories]);
  useEffect(() => { localStorage.setItem('userNickname', userNickname); }, [userNickname]);

  useEffect(() => {
    if (activeChatId) {
      const activeChat = chatSessions.find(session => session.chatID === activeChatId);
      if (activeChat) {
        setMessages(activeChat.chat);
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [activeChatId, chatSessions]);

  useEffect(() => {
    if (chatSessions.length === 0) {
      const newChatId = crypto.randomUUID();
      setActiveChatId(newChatId);
      setChatSessions([{ chatID: newChatId, title: 'New Chat', chat: [] }]);
    }
  }, [chatSessions.length]);

  useEffect(() => {
    setIsSidebarOpen(isDesktop);
  }, [isDesktop]);

  // --- Modified Persistence ---
  useEffect(() => { localStorage.setItem('chatTempMemories', compress(JSON.stringify(tempMemories), 8)); }, [tempMemories]);
  useEffect(() => { localStorage.setItem('thinkingProcesses', compress(JSON.stringify(thinkingProcesses), 9)); }, [thinkingProcesses]);
  useEffect(() => {
    localStorage.setItem('uploadedImages', compress(JSON.stringify(uploadedImages), 9));
  }, [uploadedImages]); // Stores the image URI
  useEffect(() => {
    localStorage.setItem('messageImageMap', compress(JSON.stringify(messageImageMap), 9));
  }, [messageImageMap]); // Stores the image data to show in chat. 

  const isBottomAtView = useInView(chatEndRef);

  useEffect(() => {
    if (isBottomAtView) {
      setIsViewingBottom(true);
    } else {
      setIsViewingBottom(false);
    }
  }, [isBottomAtView]);

  let hasRun = useRef(null);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const checkAuthStatus = async () => {
      try {
        setIsCheckingLogin(true);
        const response = await fetch(`${BACKEND_URL}/auth/status`, { credentials: 'include' });
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        setIsCheckingLogin(false);
        if (data.isAuthenticated) {

          const userResponse = await fetch(`${BACKEND_URL}/auth/user`, { credentials: 'include' });
          if (userResponse.ok) {
            const profileData = await userResponse.json();
            setUserProfile(profileData);
          }

          if (sessionStorage.getItem('needRead') === 'false') return;

          const driveResponse = await fetch(`${BACKEND_URL}/api/drive/read`, { credentials: 'include' });
          if (driveResponse.ok) {
            const driveData = await driveResponse.json();
            const localLastModified = localStorage.getItem('lastModified');
            if (localLastModified === driveData.data.lastModified) {
              console.log("No Changes");
              return;
            } else {
              console.log("Syncing...");
              setChatSessions(driveData.data.chatSessions || []);
              setSystemPrompt(driveData.data.systemPrompt || '');
              setApiKey(driveData.data.apiKey || '');
              setMemories(driveData.data.memories || []);
              setTempMemories(driveData.data.tempMemories || []);
              setThinkingProcesses(driveData.data.thinkingProcesses || {});
              setUploadedImages(() => {
                const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
                const now = Date.now();

                const incoming = driveData.data.uploadedImages || [];

                return Array.isArray(incoming)
                  ? incoming.filter(obj => {
                    if (!obj.saved || typeof obj.saved !== "string" || obj.saved.trim() === "") return false;
                    const diff = now - new Date(obj.saved).getTime();
                    return diff < FORTY_EIGHT_HOURS;
                  })
                  : [];
              });

              setMessageImageMap(() => {
                const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
                const now = Date.now();

                const incoming = driveData.data.messageImageMap || [];

                return Array.isArray(incoming)
                  ? incoming.filter(obj => {
                    if (!obj.saved || typeof obj.saved !== "string" || obj.saved.trim() === "") return false;
                    const diff = now - new Date(obj.saved).getTime();
                    return diff < FORTY_EIGHT_HOURS;
                  })
                  : [];
              });
              setUserNickname(driveData.data.userNickname || '');
            }
          }
        }
      } catch (error) {
        console.error('Error during initial data load:', error);
      }
    };
    checkAuthStatus();

    const purgeExpiredImages = () => {
      const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
      const now = Date.now();

      setMessageImageMap(prev =>
        prev.filter(obj => {
          if (!obj.saved) return false;
          const diff = now - new Date(obj.saved).getTime();
          return diff < FORTY_EIGHT_HOURS;
        })
      );
    };

    const interval = setInterval(purgeExpiredImages, 10000);
    purgeExpiredImages();

    return () => clearInterval(interval);

  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      saveDataToDrive();
    }, 3000);
    return () => clearTimeout(debounce);
  }, [systemPrompt, userNickname, saveDataToDrive]);

  useEffect(() => {
    if (previousActiveChatIdRef.current) {
      const previousChat = chatSessions.find(session => session.chatID === previousActiveChatIdRef.current);
      if (previousChat && previousChat.chat.length > 0) {
        const lastMessage = previousChat.chat[previousChat.chat.length - 1];
        if (lastMessage.role === 'assistant') {
          saveDataToDrive();
        }
      }
    }
    previousActiveChatIdRef.current = activeChatId;
  }, [activeChatId, chatSessions, saveDataToDrive]);


  // --- Event Handlers & Logic ---
  const handleResetApp = async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, { credentials: 'include' });
      localStorage.clear();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
    setChatSessions([]);
    setMessages([]);
    setMemories([]);
    setTempMemories([]);
    setThinkingProcesses({}); // Clear thinking processes
    setSystemPrompt('');
    setApiKey('');
    setModel('gemma-3-27b-it');
    localStorage.clear();
    setShowResetConfirm(false);
    setShowOptions(false);
    window.location.reload();
  };

  const handleOverwriteLocal = async () => {

  };

  const handleOverwriteRemote = () => {
    saveDataToDrive();
    setShowMergeConflict(false);
  };

  const deleteMemory = (memToDelete) => {
    setMemories(prevMemories => prevMemories.filter(mem => mem !== memToDelete));
  };

  const handleModelToggle = () => {
    setModel(prev => prev === 'gemini-2.5-flash-lite' ? 'gemma-3-27b-it' : 'gemini-2.5-flash-lite');
  };

  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, { credentials: 'include' });
      localStorage.clear();
      sessionStorage.clear();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleOptionsClick = () => {
    setIsMenuOpen(false);
    setShowOptions(true);
  };

  const handleMemoriesClick = () => {
    setIsMenuOpen(false);
    setShowMemories(true);
  };

  const handleSettingsClick = () => {
    setIsMenuOpen(false);
    setShowSettings(true);
  };

  const exportAppData = () => {
    const appData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      appData[key] = localStorage.getItem(key);
    }
    const jsonString = JSON.stringify(appData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chatbuddy-app-data-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportAppDataClick = () => {
    appDataFileInputRef.current.click();
  };

  const handleAppDataFileSelected = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setAppDataToImport(content);
        setShowImportAppDataConfirm(true);
      };
      reader.readAsText(file);
    } else {
      alert("Import failed: Please select a valid .json file.");
    }
    event.target.value = null;
  };

  const confirmImportAppData = () => {
    if (!appDataToImport) return;
    try {
      const importedData = JSON.parse(appDataToImport);
      for (const key in importedData) {
        if (Object.hasOwnProperty.call(importedData, key)) {
          localStorage.setItem(key, importedData[key]);
        }
      }
      setShowImportAppDataConfirm(false);
      setAppDataToImport(null);
      sessionStorage.setItem('needRead', 'false');
      window.location.reload();
    } catch (error) {
      console.error("App Data Import Error:", error);
      alert(`App data import failed: ${error.message}`);
      setShowImportAppDataConfirm(false);
      setAppDataToImport(null);
    }
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
    try {
      const importedData = JSON.parse(fileToImport);
      if (!importedData.chatHistory || !Array.isArray(importedData.chatHistory)) {
        throw new Error("Invalid file format: 'chatHistory' is missing or not an array.");
      }
      const newChatId = crypto.randomUUID();
      const newChatSession = {
        chatID: newChatId,
        title: importedData.chatHistory[0]?.content.split(' ').slice(0, 5).join(' ') || 'New Chat',
        chat: importedData.chatHistory
      };
      setChatSessions(prevSessions => [...prevSessions, newChatSession]);
      setActiveChatId(newChatId);
      setSystemPrompt(importedData.systemPrompt || '');
      setThinkingProcesses(prev => ({ ...prev, [newChatId]: [] }));// Clear old thinking processes on import
      setShowImportConfirm(false);
      setFileToImport(null);
    } catch (error) {
      console.error("Import Error:", error);
      alert(`File integrity invalid. Import failed.\n\nDetails: ${error.message}`);
      setSystemPrompt(backupPrompt);
      // No need to restore messages, as it's derived from chatSessions
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


  const abortControllerRef = useRef(null);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const sendMessage = async () => {
    if ((!input.trim()) || loading) return;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    let messageID = Date.now();
    const userMessage = {
      role: 'user',
      content: input,
      model: imageGen ? 'image' : model,
      id: messageID
    };

    if (currentBase64Image) {
      if (fileName) {
        setMessageImageMap(prev => [
          ...prev,
          {
            id: messageID,
            base64Data: null,
            mimeType: null,
            fileName: fileName,
            saved: new Date().toISOString(),
          }
        ]);
      }
      const img = new Image();
      img.src = `data:image/jpeg;base64,${currentBase64Image}`;
      img.onload = () => {
        const maxWidth = 256;
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
            id: messageID,
            base64Data: resized,
            mimeType: 'image/jpeg',
            saved: new Date().toISOString(),
          }
        ]);
        setCurrentBase64Image(null);
      };
    }

    let finalUploadedImages = uploadedImages;

    if (uploadedImages.length > 0) {
      const lastImage = uploadedImages[uploadedImages.length - 1];
      if (lastImage.id === null) {
        const updatedImages = [...uploadedImages];
        updatedImages[uploadedImages.length - 1] = {
          ...lastImage,
          id: messageID,
        };
        setUploadedImages(updatedImages);
        finalUploadedImages = updatedImages;
      }
    }

    const currentChatId = activeChatId;
    const isFirstMessage = messages.length === 0;

    setChatSessions(prevSessions => {
      const sessionIndex = prevSessions.findIndex(session => session.chatID === currentChatId);
      if (sessionIndex > -1) {
        const updatedSession = {
          ...prevSessions[sessionIndex],
          chat: [...prevSessions[sessionIndex].chat, userMessage]
        };
        const otherSessions = prevSessions.filter((_, index) => index !== sessionIndex);
        return [updatedSession, ...otherSessions];
      } else {
        return [{ chatID: currentChatId, title: 'New Chat', chat: [userMessage] }, ...prevSessions];
      }
    });

    setInput('');
    setFileImg(null);
    setFileDoc(null);
    setLoading(true);
    setFileName(false);

    try {
      const memoriesForModel = tempMemories
        .filter(mem => mem.id !== activeChatId)
        .map(mem => mem.memory);

      const currentChatImageUris = finalUploadedImages
        .filter(img => img.chatId === activeChatId)
        .map(img => ({
          uri: img.uri,
          mimeType: img.mimeType,
          id: img.id // now includes the new messageID!
        }));

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

      const getSystemPrompt = () => {
        if (userNickname && systemPrompt) {
          return `-- NAME "${userProfile.name.split(' ')[0]}" -- USER NICKNAME "${userNickname}" -- Instruction: ${systemPrompt}`;
        } else if (userNickname) {
          return `-- NAME "${userProfile.name.split(' ')[0]}" -- USER NICKNAME "${userNickname}" --`;
        }
        else if (!userNickname && systemPrompt) {
          return `-- NAME "${userProfile.name.split(' ')[0]}" -- ${systemPrompt}`;
        }
        return `-- NAME "${userProfile.name.split(' ')[0]}" --`;
      };

      const payload = {
        history: messages.concat(userMessage).map(msg => {
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
          return msg;
        }),
        memory: memories,
        temp: memoriesForModel,
        sys: getSystemPrompt(),
        apiKey: apiKey || "",
        email: localStorage.getItem('userEmail') || "",
        modelIndex: modelIndex,
        creativeRP: creativeRP,
        advanceReasoning: advanceReasoning,
        webSearch: webSearch,
        images: currentChatImageUris,
        isFirst: isFirstMessage,
        zoneInfo: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      const response = await fetch(`${BACKEND_URL}/model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload),
        signal
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
        setThinkingProcesses(prev => ({
          ...prev,
          [currentChatId]: [...(prev[currentChatId] || []), { id: assistantMessageId, content: thoughtContent }]
        }));
      }

      let permanentMemoryChanged = false;
      let tempMemoryChanged = false;
      try {
        const parsedResponse = JSON.parse(cleanJsonString);
        const { action, target, title } = parsedResponse;

        if (isFirstMessage) {
          const newTitle = title || userMessage.content.split(' ').slice(0, 5).join(' ');
          setChatSessions(prevSessions => prevSessions.map(session =>
            session.chatID === currentChatId
              ? { ...session, title: newTitle }
              : session
          ));
        }

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
          const newTempMemory = { memory: target[0], id: activeChatId };
          const alreadyExists = tempMemories.some(m => m.memory === target[0] && m.id === activeChatId);
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
        if (isFirstMessage) {
          setChatSessions(prevSessions => prevSessions.map(session =>
            session.chatID === currentChatId
              ? { ...session, title: userMessage.content.split(' ').slice(0, 5).join(' ') }
              : session
          ));
        }
        console.log("JSON Parse Error: ", e);
      }

      const assistantMessage = {
        role: 'assistant',
        content: cleanJsonString,
        model: imageGen ? 'image' : model,
        id: assistantMessageId,
        memoryStatus: permanentMemoryChanged && tempMemoryChanged ? 'both' : permanentMemoryChanged ? 'permanent' : tempMemoryChanged ? 'temporary' : null
      };
      setChatSessions(prevSessions =>
        prevSessions.map(session =>
          session.chatID === currentChatId
            ? { ...session, chat: [...session.chat, assistantMessage] }
            : session
        )
      );

    } catch (error) {
      if (error.name === 'AbortError') {
        const errorJsonString = `{"action":"none", "target":"", "response":"User cancelled the response."}`;
        const assistantMessage = { role: 'assistant', content: errorJsonString, model: model, id: Date.now() };
        setChatSessions(prevSessions =>
          prevSessions.map(session =>
            session.chatID === currentChatId
              ? { ...session, chat: [...session.chat, assistantMessage] }
              : session
          )
        );
      } else {
        console.error("API Error:", error);
        const errorJsonString = `{"action":"none", "target":"", "response":"❌ ${error.message}"}`;
        const assistantMessage = { role: 'assistant', content: errorJsonString, model: model, id: Date.now() };
        setChatSessions(prevSessions =>
          prevSessions.map(session =>
            session.chatID === currentChatId
              ? { ...session, chat: [...session.chat, assistantMessage] }
              : session
          )
        );
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
      try {
        const usageResponse = await fetch(`${BACKEND_URL}/checkLimit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({ apiKey: apiKey || "" }),
        });
        if (usageResponse.ok) {
          const usageData = await usageResponse.json();
          setUsage(usageData);
        }
      } catch (error) {
        console.error("Error fetching usage data:", error);
      }
    }
  };

  // Greetings
  let userName = userNickname || 'legend';
  const [greetings, setGreetings] = useState();

  useEffect(() => {
    userName = userNickname || userProfile?.name.split(' ')[0] || 'legend';
    userName = userName.charAt(0).toUpperCase() + userName.slice(1);
    const listGreetings = [
      "Start a Conversation",
      `Yo! Welcome back, ${userName}.`
    ]

    setGreetings(listGreetings[Math.floor(Math.random() * listGreetings.length)]);

  }, [userProfile]);

  const [noChatGreet, setNoChatGreet] = useState();
  useEffect(() => {
    setNoChatGreet(greetings);
  }, [greetings]);

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
  }, [loading, tapBottom, messages]);

  useEffect(() => {
    setTapBottom(true);
    const checkLimit = async () => {
      try {
        const usageResponse = await fetch(`${BACKEND_URL}/checkLimit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: 'include',
          body: JSON.stringify({ apiKey: apiKey || "" }),
        });
        if (usageResponse.ok) {
          const usageData = await usageResponse.json();
          setUsage(usageData);
        }
      } catch (error) {
        console.error("Error fetching usage data:", error);
      }
    }
    checkLimit();
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
          chatId: activeChatId,
          uri: result.uri,
          mimeType: result.mimeType,
          id: null,
          saved: new Date().toISOString(),
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
    const validDocTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4',
      'video/mpeg',
      'audio/mpeg',
      'audio/wav'
    ];
    setShowAddFiles(false);

    if (!validDocTypes.includes(file.type)) {
      alert("Please select a valid document (PDF, TXT, DOC, DOCX, MP4, MP3, WAV).");
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
        e.preventDefault();
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
        break;
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

  const imageGenAvailable = new Date() < new Date('2025-11-12');

  // --- JSX Rendering ---

  if (isCheckingLogin) {
    return <div></div>;
  }

  if (!isAuthenticated) {
    localStorage.clear();
    return <Login handleLogin={handleLogin} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-dvh font-medium max-w-[100vw] select-none bg-gray-50 flex font-sans">
      <Sidebar
        chatSessions={chatSessions}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        setChatSessions={setChatSessions}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isDesktop={isDesktop}
        handleSettingsClick={handleSettingsClick}
        handleImportClick={handleImportClick}
        setShowExportOptions={setShowExportOptions}
        setTempMemories={setTempMemories}
        setUploadedImages={setUploadedImages}
        setMessageImageMap={setMessageImageMap}
        loading={loading}
        setShowNotAvailablePopup={setShowNotAvailablePopup}
        setThinkingProcesses={setThinkingProcesses}
      />
      <main className={`flex-1 w-full flex flex-col transition-all bg-white duration-300 ${isSidebarOpen && 'lg:ml-[20rem]'}`}>
        <Header
          model={model}
          handleModelToggle={handleModelToggle}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <input type="file" ref={fileInputRef} onChange={handleFileSelected} accept="application/json" className="hidden" />
        <input type="file" ref={memoryFileInputRef} onChange={handleMemoryFileSelected} accept="application/json" className="hidden" />
        <input type="file" ref={appDataFileInputRef} onChange={handleAppDataFileSelected} accept="application/json" className="hidden" />

        <Modals
          userProfile={userProfile}
          showImportExportOptions={showImportExportOptions}
          setShowImportExportOptions={setShowImportExportOptions}
          handleImportClick={handleImportClick}
          setShowExportOptions={setShowExportOptions}
          showExportOptions={showExportOptions}
          exportChatAsTxt={exportChatAsTxt}
          exportChatAsJson={exportChatAsJson}
          showImportConfirm={showImportConfirm}
          setShowImportConfirm={setShowImportConfirm}
          confirmImport={confirmImport}
          setFileToImport={setFileToImport}
          showMemoriesImportExport={showMemoriesImportExport}
          setShowMemoriesImportExport={setShowMemoriesImportExport}
          handleImportMemoriesClick={handleImportMemoriesClick}
          exportMemoriesAsJson={exportMemoriesAsJson}
          showMemories={showMemories}
          setShowMemories={setShowMemories}
          memories={memories}
          memoryUsagePercent={memoryUsagePercent}
          MEMORY_LIMIT_CHARS={MEMORY_LIMIT_CHARS}
          deleteMemory={deleteMemory}
          showOptions={showOptions}
          setShowOptions={setShowOptions}
          apiKey={apiKey}
          setApiKey={setApiKey}
          setShowResetConfirm={setShowResetConfirm}
          showResetConfirm={showResetConfirm}
          handleResetApp={handleResetApp}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          showAbout={showAbout}
          setShowAbout={setShowAbout}
          handleOptionsClick={handleOptionsClick}
          handleMemoriesClick={handleMemoriesClick}
          exportAppData={exportAppData}
          showNotAvailablePopup={showNotAvailablePopup}
          setShowNotAvailablePopup={setShowNotAvailablePopup}
          showPersonalization={showPersonalization}
          setShowPersonalization={setShowPersonalization}
          userNickname={userNickname}
          setUserNickname={setUserNickname}
          systemPrompt={systemPrompt}
          setSystemPrompt={setSystemPrompt}
          handleImportAppDataClick={handleImportAppDataClick}
          showImportAppDataConfirm={showImportAppDataConfirm}
          setShowImportAppDataConfirm={setShowImportAppDataConfirm}
          confirmImportAppData={confirmImportAppData}
          isAuthenticated={isAuthenticated}
          handleLogin={handleLogin}
          handleLogout={handleLogout}
          showMergeConflict={showMergeConflict}
          setShowMergeConflict={setShowMergeConflict}
          handleOverwriteLocal={handleOverwriteLocal}
          handleOverwriteRemote={handleOverwriteRemote}
          usage={usage}
          imageGenAvailable={imageGenAvailable}
        />

        <ChatLog
          messages={messages}
          thinkingProcesses={thinkingProcesses[activeChatId] || []}
          messageImageMap={messageImageMap}
          getTextToRender={getTextToRender}
          getUserBubbleClass={getUserBubbleClass}
          loading={loading}
          modelUsed={modelUsed}
          chatEndRef={chatEndRef}
          noChatGreet={noChatGreet}
          setModel={setModel}
          systemPrompt={systemPrompt}
          setTapBottom={setTapBottom}
          setIsViewingBottom={setIsViewingBottom}
          activeChatId={activeChatId}
          setShowMemories={setShowMemories}
          fileImg={fileImg}
        />

        <MessageInput
          input={input}
          setInput={setInput}
          handleKeyPress={handleKeyPress}
          handlePaste={handlePaste}
          sendMessage={sendMessage}
          loading={loading}
          uploading={uploading}
          model={model}
          imageGen={imageGen}
          getSendButtonClass={getSendButtonClass}
          isDragging={isDragging}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          isViewingBottom={isViewingBottom}
          setTapBottom={setTapBottom}
          fileImg={fileImg}
          setFileImg={setFileImg}
          setUploadedImages={setUploadedImages}
          fileImgInputRef={fileImgInputRef}
          fileDoc={fileDoc}
          setFileDoc={setFileDoc}
          setFileName={setFileName}
          fileDocInputRef={fileDocInputRef}
          showAddFiles={showAddFiles}
          setShowAddFiles={setShowAddFiles}
          handleDocFileChange={handleDocFileChange}
          handleImgUpload={handleImgUpload}
          handleImgFileChange={handleImgFileChange}
          setImageGen={setImageGen}
          handleStop={handleStop}
          creativeRP={creativeRP}
          setCreativeRP={setCreativeRP}
          advanceReasoning={advanceReasoning}
          setAdvanceReasoning={setAdvanceReasoning}
          webSearch={webSearch}
          setWebSearch={setWebSearch}
          imageGenAvailable={imageGenAvailable}
        />
      </main>
    </motion.div>
  );
}
