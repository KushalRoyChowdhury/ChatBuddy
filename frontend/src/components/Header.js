import React from 'react';

const Header = React.memo(({
  model,
  handleModelToggle,
  toggleSidebar
}) => {
  return (
    <header className="bg-white/40 dark:bg-black/10 backdrop-blur-lg shadow-sm p-4 sticky top-0 z-20">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="p-2 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <h1 className="text-xl font-bold">ChatBuddy</h1>
        </div>
        <div className="">
          <button onClick={handleModelToggle} className={`w-28 text-center px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${model === 'gemini-2.5-flash-lite' ? 'bg-blue-100 hover:bg-blue-200 active:scale-95 text-blue-800 dark:bg-blue-800/70 dark:hover:bg-blue-800 dark:text-blue-300' : 'bg-green-100 hover:bg-green-200 active:scale-95 text-green-800 dark:bg-green-800/70 dark:hover:bg-green-800 dark:text-green-300'}`}>{model === 'gemini-2.5-flash-lite' ? 'Advanced' : 'Basic'}</button>
        </div>
      </div>
    </header>
  );
});

export default Header;