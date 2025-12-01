
import React, { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = React.memo(({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const codeText = String(children).replace(/\n$/, '');

  const [copyButtonText, setCopyButtonText] = useState("Copy");

  useEffect(() => {
    const timer = setTimeout(() => {
      setCopyButtonText("Copy");
    }, 5000);

    return () => {
      clearTimeout(timer);
    }

  }, [copyButtonText])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyButtonText("Copied");
  };

  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check if dark mode is enabled
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkModeQuery.matches);

    // Listen for changes
    const handleChange = (e) => setIsDark(e.matches);
    darkModeQuery.addEventListener('change', handleChange);

    return () => darkModeQuery.removeEventListener('change', handleChange);
  }, []);

  return !inline && match ? (
    <div className="relative my-2 rounded-lg select-text overflow-hidden font-serif text-sm lg:text-base max-w-full">
      <div className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 flex select-none justify-between items-center ${match[1] === 'poem' ? 'hidden' : ''}`}>
        <span className={`text-xs text-gray-700 dark:text-gray-300`}>{match[1]}</span>
        <button onClick={() => copyToClipboard(codeText)} className={`text-xs font-mono text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:font-bold transition-all ${copyButtonText === 'Copied' ? 'text-gray-700 dark:text-gray-300 font-medium hover:text-gray-700 dark:hover:text-gray-300 cursor-default hover:font-medium' : ''}`}>{copyButtonText}</button>
      </div>
      <SyntaxHighlighter style={isDark ? oneDark : oneLight} language={match[1]} PreTag="div" className={`${match[1] === 'poem' ? 'poem-block' : ''}`} customStyle={{ margin: 0, borderRadius: 0, overflowX: 'auto' }} {...props}>
        {codeText}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className="bg-gray-200 dark:bg-[#282C34] text-red-600 dark:text-red-500 px-1 text-wrap rounded text-sm lg:text-base" {...props}>
      {children}
    </code>
  );
});

export default CodeBlock;
