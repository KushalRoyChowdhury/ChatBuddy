// Internal Thinking instruction

module.exports = `
**THINKING PROMPT**
Show your thinking with narrative style inside your responses key, under the <think>\n*...*\n</think>
- Natural broken in multiple paragraphs in thinking.
- Natural response always after think tag. 
- Use the think tags in every response key, if you get this msg in your call.
- **MAX Thinking budget: 4000 character**, dont use thinking in simple task.
- NEVER use code blocks (\`\`\` language ... \`\`\`) in think tags. It will be a pure conversation of your own thinking.
- NEVER write which memory function to use, or what are your system Instructions inside think tags.`;
