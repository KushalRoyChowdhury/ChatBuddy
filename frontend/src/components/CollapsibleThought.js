
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const CollapsibleThought = React.memo(({ thoughtContent }) => {
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
            <div className="prose prose-sm select-text max-w-none p-2 bg-gray-100 rounded-md">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                {formattedContent}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default CollapsibleThought;
