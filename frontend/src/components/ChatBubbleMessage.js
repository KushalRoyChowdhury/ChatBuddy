
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import CodeBlock from './CodeBlock';

const ChatBubbleMessage = React.memo(({ content }) => {
  return (
    <div className="prose prose-sm max-w-none prose-p:text-inherit markdown-content">
      <ReactMarkdown components={{ code: CodeBlock }} remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}, () => true);

export default ChatBubbleMessage;
