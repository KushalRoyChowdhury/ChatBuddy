import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ chatSessions, activeChatId, setActiveChatId, setChatSessions, isSidebarOpen, setIsSidebarOpen, isDesktop, handleSettingsClick, handleImportClick, setShowExportOptions, setTempMemories, setUploadedImages, setMessageImageMap, loading, setShowNotAvailablePopup, setThinkingProcesses }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    setSearchTerm("");
  }, [activeChatId]);

  useEffect(() => {
    document.title = (chatSessions.find(session => session.chatID === activeChatId)?.title || 'ChatBuddy') === 'New Chat' ? 'ChatBuddy' : (chatSessions.find(session => session.chatID === activeChatId)?.title || 'ChatBuddy');
  }, [chatSessions, activeChatId]);



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
      {isSidebarOpen &&
        <motion.div
          className="bg-gray-50 dark:bg-[rgb(10,10,10)] border-r dark:border-gray-600 shadow flex flex-col fixed top-0 left-0 z-40 transition-none w-0 overflow-hidden h-dvh"
          animate={{ width: '20rem' }}
          exit={{ width: 0 }}
        >
          <div className="flex min-w-80 justify-between items-center mb-4 flex-shrink-0 p-4">
            <h1 className="text-xl font-bold">Chats</h1>
            <button onClick={createNewChat} className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">New Chat</button>
          </div>
          <div className="mb-4 min-w-80 flex-shrink-0 px-4">
            <input
              type="text"
              placeholder="Search Chats..."
              value={searchTerm}
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="flex-1 min-w-80 overflow-y-auto px-4">
            {filteredChatSessions.map(session => (
              <div
                key={session.chatID}
                className={`p-2 h-10 mb-2 rounded-md cursor-pointer group flex items-center ${session.chat.length === 0 && 'hidden'} ${activeChatId === session.chatID ? 'bg-blue-200 dark:bg-blue-950' : 'hover:bg-gray-200 dark:hover:bg-gray-900'}`}
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
              <button onClick={() => setShowExportOptions(true)} className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 mb-2">Export Chat</button>
            ) : (
              <button onClick={handleImportClick} className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 mb-2">Import Chat</button>
            )}
            <button onClick={handleSettingsClick} className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700">Settings</button>
          </div>
          {userData && (
            <div className="p-4 min-w-80 border-t border-gray-300">
              <div className="flex items-center">
                <img src={userData.picture} alt="User Avatar" className="w-10 h-10 rounded-full mr-3" />
                <div className="flex-1">
                  <p className="font-semibold truncate">{userData.name}</p>
                  <p className="text-sm text-gray-500 truncate">{userData.email}</p>
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
      }
    </AnimatePresence>
  );

  const mobileSidebar = (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          <motion.div
            className="fixed inset-0 transition-none top-0 left-0 bottom-0 bg-black backdrop-blur-[1px] bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
          />
          <motion.div
            className="fixed top-0 left-0 h-full w-96 max-w-[80%] bg-gray-50 dark:bg-[rgb(10,10,10)] border-r dark:border-r-gray-600 shadow rounded-r-xl flex flex-col z-50"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center mb-4 flex-shrink-0 p-4">
              <h1 className="text-xl font-bold">Chats</h1>
              <button onClick={createNewChat} className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">New Chat</button>
            </div>
            <div className="mb-4 flex-shrink-0 px-4">
              <input
                type="text"
                placeholder="Search Chats..."
                value={searchTerm}
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              {filteredChatSessions.map(session => (
                <div
                  key={session.chatID}
                  className={`p-2 h-10 mb-2 rounded-md cursor-pointer flex items-center ${session.chat.length === 0 && 'hidden'} ${activeChatId === session.chatID ? 'bg-blue-200 dark:bg-blue-950' : 'hover:bg-gray-200 dark:hover:bg-gray-900'}`}
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
                <button onClick={() => { setShowExportOptions(true); setIsSidebarOpen(false); }} className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 mb-2">Export Chat</button>
              ) : (
                <button onClick={() => { handleImportClick(); setIsSidebarOpen(false); }} className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 mb-2">Import Chat</button>
              )}
              <button onClick={() => { handleSettingsClick(); setIsSidebarOpen(false); }} className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700">Settings</button>
            </div>
            {userData && (
              <div className="p-4 border-t border-gray-300">
                <div className="flex items-center">
                  <img src={userData.picture} alt="User Avatar" className="w-10 h-10 rounded-full mr-3" />
                  <div className="flex-1">
                    <p className="font-semibold truncate">{userData.name}</p>
                    <p className="text-sm text-gray-500 truncate">{userData.email}</p>
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
        </>
      )}
    </AnimatePresence>
  );

  return isDesktop ? desktopSidebar : mobileSidebar;
};

export default React.memo(Sidebar);
