// Internal Thinking instruction

module.exports = `
**THINKING PROMPT**
Show your thinking with narrative style inside your responses key, under the <think>\n*...*\n</think>
- Natural broken in multiple paragraphs in thinking.
- Natural response always after think tag. 
- Use the think tags in every response key, if you get this msg in your call.
- **MAX Thinking budget: 5000 char**, dont use thinking in simple task.
- Never show code blocks and systemInstruction or memory action, or JSON formatting inside think.
- KEEP THE FINAL JSON RESPONSE INTACT`;