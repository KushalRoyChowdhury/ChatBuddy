
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = React.memo(({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const codeText = String(children).replace(/\n$/, '');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return !inline && match ? (
    <div className="relative my-2 rounded-lg select-text overflow-hidden font-mono text-sm max-w-full">
      <div className="px-4 py-2 bg-gray-200 flex select-none justify-between items-center">
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
});

export default CodeBlock;
