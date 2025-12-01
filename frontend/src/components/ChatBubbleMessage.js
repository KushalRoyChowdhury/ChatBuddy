import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import CodeBlock from './CodeBlock';

import 'katex/dist/katex.min.css';
import 'katex/dist/contrib/mhchem.js';
import physicsMacros from 'katex-physics';

const allMacros = {
  ...physicsMacros,
};

/**
 * Fixes KaTeX escaping issues in Markdown.
 * * Markdown parsers (like remark) "eat" backslashes. This is a problem
 * for KaTeX, which needs '\\' for newlines (which is '\\\\' in a JS string).
 * * This function finds all math blocks ($...$ and $$...$$) and ensures
 * that '\\' (2 slashes) becomes '\\\\' (4 slashes), and that existing
 * '\\\\' (4 slashes) are preserved.
 * * @param {string} markdownString The raw markdown content.
 * @returns {string} The processed string with fixed escapes.
 */
function fixKatexEscaping(markdownString) {
  const mathBlockRegex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
  const tempToken = '___LATEX_NEWLINE_TOKEN___';

  return markdownString.replace(mathBlockRegex, (match) => {
    let processedMatch = match.replace(/\\\\\\\\/g, tempToken);

    processedMatch = processedMatch.replace(/\\\\/g, '\\\\\\\\');

    processedMatch = processedMatch.replace(new RegExp(tempToken, 'g'), '\\\\\\\\');

    return processedMatch;
  });
}

/**
 * Converts latex code blocks to katex blocks.
 * @param {string} markdownString The raw markdown content.
 * @returns {string} The processed string.
 */
function stripLatexWrapper(markdownString) {
  const latexBlockRegex = /\u0060\u0060\u0060latex\n([\s\S]*?)\n\u0060\u0060\u0060/g;
  return markdownString.replace(latexBlockRegex, '$$$1$$');
}


const ChatBubbleMessage = React.memo(({ content }) => {
  const strippedContent = stripLatexWrapper(content);
  const fixedContent = fixKatexEscaping(strippedContent);

  return (
    <div className="prose prose-sm max-w-none select-text selection:bg-purple-500/30 prose-p:text-inherit markdown-content text-sm lg:text-base">
      <ReactMarkdown
        components={{ code: CodeBlock }}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          [rehypeKatex, {
            throwOnError: false,
            errorColor: '#cc0000',
            macros: allMacros,
          }]
        ]}
      >
        {fixedContent}
      </ReactMarkdown>
    </div>
  );
});

export default ChatBubbleMessage;