import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ chatSessions, activeChatId, setActiveChatId, setChatSessions, isSidebarOpen, setIsSidebarOpen, isDesktop, handleSettingsClick, handleImportClick, setShowExportOptions, setTempMemories, setUploadedImages, setMessageImageMap, loading, setShowNotAvailablePopup, setThinkingProcesses, glassMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [userData, setUserData] = useState(null);
  const mobileSidebarRef = useRef(null);
  const [animationClass, setAnimationClass] = useState('');


  useEffect(() => {
    setSearchTerm("");
  }, [activeChatId]);

  useEffect(() => {
    document.title = (chatSessions.find(session => session.chatID === activeChatId)?.title || 'ChatBuddy') === 'New Chat' ? 'ChatBuddy' : (chatSessions.find(session => session.chatID === activeChatId)?.title || 'ChatBuddy');
  }, [chatSessions, activeChatId]);

  useEffect(() => {
    const sidebar = mobileSidebarRef.current;
    if (!sidebar) return;

    if (isSidebarOpen) {
      sidebar.classList.remove('hide', '-translate-x-full');
      sidebar.classList.add('show', 'block');
      setAnimationClass('show');
    } else {
      if (sidebar.classList.contains('-translate-x-full')) {
        return;
      }

      const style = window.getComputedStyle(sidebar);
      const matrix = new DOMMatrixReadOnly(style.transform);
      const currentX = matrix.m41;

      const animationName = `slideOutDynamic-${Date.now()}`;
      const keyframes = `
        @keyframes ${animationName} {
          from {
            transform: translateX(${currentX}px);
          }
          to {
            transform: translateX(-100%);
          }
        }
      `;

      const styleSheet = document.createElement('style');
      styleSheet.id = animationName;
      styleSheet.innerText = keyframes;
      document.head.appendChild(styleSheet);

      sidebar.style.animation = `${animationName} 250ms cubic-bezier(.32,.88,.7,1.05)`;

      const handleAnimationEnd = () => {
        sidebar.style.animation = '';
        sidebar.classList.remove('show', 'block');
        sidebar.classList.add('hide', '-translate-x-full');
        const styleElement = document.getElementById(animationName);
        if (styleElement) {
          document.head.removeChild(styleElement);
        }
      };

      sidebar.addEventListener('animationend', handleAnimationEnd, { once: true });
    }
  }, [isSidebarOpen]);


  const handleLogout = async () => {
    try {
      await fetch('/auth/logout');
      setUserData(null);
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const createNewChat = () => {
    if (loading) {
      setShowNotAvailablePopup(true);
      return;
    }
    const newChatId = crypto.randomUUID();
    setActiveChatId(newChatId);
    if (!isDesktop) {
      setIsSidebarOpen(false);
    }
  };

  const deleteChat = (chatIdToDelete) => {
    if (loading) {
      setShowNotAvailablePopup(true);
      return;
    }
    const chatMessages = chatSessions.find(session => session.chatID === chatIdToDelete)?.chat || [];
    const messageIdsToDelete = new Set(chatMessages.map(msg => msg.id));

    setChatSessions(prevSessions => prevSessions.filter(session => session.chatID !== chatIdToDelete));
    setTempMemories(prevMemories => prevMemories.filter(memory => memory.id !== chatIdToDelete));
    setUploadedImages(prevImages => prevImages.filter(image => !messageIdsToDelete.has(image.id)));
    setMessageImageMap(prevMap => prevMap.filter(map => !messageIdsToDelete.has(map.id)));
    setThinkingProcesses(prev => {
      const newThinkingProcesses = { ...prev };
      delete newThinkingProcesses[chatIdToDelete];
      return newThinkingProcesses;
    });

    if (activeChatId === chatIdToDelete) {
      const newActiveId = crypto.randomUUID();
      setActiveChatId(newActiveId);
    }
  };

  const handleRenameStart = (chatId, currentTitle) => {
    setRenamingId(chatId);
    setRenameValue(currentTitle);
  };

  const handleRenameChange = (e) => {
    setRenameValue(e.target.value);
  };

  const handleRenameSubmit = (chatId) => {
    setChatSessions(prevSessions =>
      prevSessions.map(session =>
        session.chatID === chatId ? { ...session, title: renameValue } : session
      )
    );
    setRenamingId(null);
    setRenameValue('');
  };

  const handleKeyPress = (e, chatId) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(chatId);
    }
  };

  const filteredChatSessions = chatSessions.filter(session => {
    const searchTermLower = searchTerm.toLowerCase();

    return (
      session.title.toLowerCase().includes(searchTermLower) ||
      (session.chat && session.chat.some(message =>
        message.content && message.content.toLowerCase().includes(searchTermLower)
      ))
    );
  });



  const activeChat = chatSessions.find(session => session.chatID === activeChatId);

  const desktopSidebar = (
    <AnimatePresence>
      <motion.div
        className={`pl-8 border-r rounded-br-3xl shadow flex flex-col fixed top-0 left-0 z-50 h-dvh w-[22.2rem] transition-colors duration-300 ${glassMode ? 'bg-white/80 backdrop-blur-xl border-white/20 dark:bg-[rgb(50,50,50)]/80 dark:border-white/10' : 'bg-gray-50 dark:bg-[rgb(50,50,50)] border-gray-200 dark:border-gray-700'}`}
        animate={{ x: isSidebarOpen ? '-10%' : '-110%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 27 }}
      >
        <div className="flex min-w-80 justify-between items-center mb-4 flex-shrink-0 p-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h1>
          <button onClick={createNewChat} className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95">New Chat</button>
        </div>
        <div className="mb-4 min-w-80 flex-shrink-0 px-4">
          <input
            type="text"
            placeholder="Search Chats..."
            value={searchTerm}
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-black/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
        <div className="flex-1 min-w-80 overflow-y-auto px-4">
          {filteredChatSessions.map(session => (
            <div
              key={session.chatID}
              className={`p-3 h-12 mb-2 rounded-xl w-full cursor-pointer group flex items-center transition-all ${session.chat.length === 0 && 'hidden'} ${activeChatId === session.chatID ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100' : 'hover:bg-gray-200/50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'}`}
              onClick={() => {
                if (loading) {
                  setShowNotAvailablePopup(true);
                } else {
                  setActiveChatId(session.chatID);
                }
              }}
            >
              {renamingId === session.chatID ? (
                <input
                  type="text"
                  value={renameValue}
                  onChange={handleRenameChange}
                  onBlur={() => handleRenameSubmit(session.chatID)}
                  onKeyPress={(e) => handleKeyPress(e, session.chatID)}
                  className="w-full p-1 border rounded-md"
                  autoFocus
                />
              ) : (
                <div className="flex justify-between items-center w-full">
                  <p className="font-semibold truncate">
                    {session.title}
                  </p>
                  <div className="flex items-center">
                    <button onClick={(e) => { e.stopPropagation(); handleRenameStart(session.chatID, session.title); }} className="p-1 text-gray-500 hover:text-gray-700 hidden group-hover:block">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteChat(session.chatID); }} className="p-1 text-red-500 hover:text-red-700 hidden group-hover:block">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-4 min-w-80">
          {activeChat && activeChat.chat.length > 0 ? (
            <button onClick={() => setShowExportOptions(true)} className="w-full px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20 transition-all active:scale-[0.97] mb-2">Export Chat</button>
          ) : (
            <button onClick={handleImportClick} className="w-full px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20 transition-all active:scale-[0.97] mb-2">Import Chat</button>
          )}
          <button onClick={handleSettingsClick} className="w-full px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20 transition-all active:scale-[0.97]">Settings</button>
        </div>
        {userData && (
          <div className="p-4 min-w-80 border-t border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center">
              <img src={userData.picture} alt="User Avatar" className="w-10 h-10 rounded-full mr-3" />
              <div className="flex-1">
                <p className="font-semibold truncate text-gray-900 dark:text-white">{userData.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{userData.email}</p>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3h12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  const mobileSidebar = (
    <>
      <AnimatePresence>
        {isSidebarOpen &&
          <motion.div
            className={`fixed inset-0 top-0 left-0 bottom-0 overflow-hidden transition-all bg-black bg-opacity-50 z-50 ${glassMode ? 'backdrop-blur-sm' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
          />
        }
      </AnimatePresence>
      <div ref={mobileSidebarRef} className={`fixed top-0 left-0 h-full z-50 sidebar hide -translate-x-full`} >

        <div className={`w-96 max-w-[80vw] h-full border-r shadow-2xl rounded-r-2xl flex flex-col transition-colors duration-300 ${glassMode ? 'bg-white/90 border-white/90 dark:bg-[rgb(50,50,50)]/90 dark:border-white/90' : 'bg-gray-50 dark:bg-[rgb(50,50,50)] border-gray-200 dark:border-gray-700'}`}>
          <div className="flex justify-between items-center mb-4 flex-shrink-0 p-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h1>
            <button onClick={createNewChat} className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all active:scale-95">New Chat</button>
          </div>
          <div className="mb-4 flex-shrink-0 px-4">
            <input
              type="text"
              placeholder="Search Chats..."
              value={searchTerm}
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-black/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
          <div className="flex-1 overflow-y-auto px-4">
            {filteredChatSessions.map(session => (
              <div
                key={session.chatID}
                className={`p-3 mb-2 rounded-xl cursor-pointer flex items-center transition-all ${session.chat.length === 0 && 'hidden'} ${activeChatId === session.chatID ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100' : 'hover:bg-gray-200/50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'}`}
                onClick={() => {
                  if (loading) {
                    setShowNotAvailablePopup(true);
                  } else {
                    setActiveChatId(session.chatID);
                    setIsSidebarOpen(false);
                  }
                }}
              >
                {renamingId === session.chatID ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={handleRenameChange}
                    onBlur={() => handleRenameSubmit(session.chatID)}
                    onKeyPress={(e) => handleKeyPress(e, session.chatID)}
                    className="w-full p-1 border rounded-md"
                    autoFocus
                  />
                ) : (
                  <div className="flex justify-between items-center w-full">
                    <p className="font-semibold truncate">
                      {session.title}
                    </p>
                    <div className="flex items-center">
                      <button onClick={(e) => { e.stopPropagation(); handleRenameStart(session.chatID, session.title); }} className="p-1 text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteChat(session.chatID); }} className="p-1 text-red-500 hover:text-red-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-4">
            {activeChat && activeChat.chat.length > 0 ? (
              <button onClick={() => { setShowExportOptions(true); setIsSidebarOpen(false); }} className="w-full px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20 transition-all active:scale-[0.97] mb-2">Export Chat</button>
            ) : (
              <button onClick={() => { handleImportClick(); setIsSidebarOpen(false); }} className="w-full px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20 transition-all active:scale-[0.97] mb-2">Import Chat</button>
            )}
            <button onClick={() => { handleSettingsClick(); setIsSidebarOpen(false); }} className="w-full px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20 transition-all active:scale-[0.97]">Settings</button>
          </div>
          {userData && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700/50">
              <div className="flex items-center">
                <img src={userData.picture} alt="User Avatar" className="w-10 h-10 rounded-full mr-3" />
                <div className="flex-1">
                  <p className="font-semibold truncate text-gray-900 dark:text-white">{userData.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{userData.email}</p>
                </div>
                <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3h12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>

  );

  return isDesktop ? desktopSidebar : mobileSidebar;
};

export default React.memo(Sidebar);
