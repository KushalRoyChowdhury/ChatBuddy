import React from 'react';

const Header = React.memo(({
  model,
  handleModelToggle,
  toggleSidebar,
  glassMode
}) => {
  return (
    <header className={`${glassMode ? 'backdrop-blur-xl bg-white/80 dark:bg-[rgb(50,50,50)]/80 border-b border-white/20 dark:border-white/10' : 'backdrop-blur-none bg-white dark:bg-[rgb(50,50,50)] border-b border-gray-200 dark:border-gray-700'} transition-colors duration-300 shadow-sm p-4 sticky top-0 z-20`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95 text-gray-700 dark:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">ChatBuddy</h1>
        </div>
        <div className="">
          <button onClick={handleModelToggle} className={`w-32 text-center px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${model === 'gemini-2.5-flash-lite' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95' : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30 hover:shadow-green-500/50 active:scale-95'}`}>{model === 'gemini-2.5-flash-lite' ? 'Advanced' : 'Basic'}</button>
        </div>
      </div>
    </header>
  );
});

export default Header;