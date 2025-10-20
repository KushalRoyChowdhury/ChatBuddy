
import React from 'react';

const ChatListItem = ({ chat, isActive, onClick }) => {
  const lastMessage = chat.chat[chat.chat.length - 1];
  const snippet = lastMessage ? lastMessage.content.substring(0, 30) : 'No messages yet';

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer border-b border-gray-200 ${isActive ? 'bg-blue-200' : 'hover:bg-gray-200'}`}>
      <p className="font-semibold">{chat.title || `Chat ${chat.chatID.substring(0, 8)}`}</p>
      <p className="text-sm text-gray-600 truncate">{snippet}</p>
    </div>
  );
};

export default ChatListItem;
