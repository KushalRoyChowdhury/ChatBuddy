const advanceModelContextThinking = 
`For this Prompt Think Step by Step before responding.
Maximum Accuracy is Expected.
IMPORTANT — STRICT RULES FOR THINKING SUMMARY:
- Synthesize your reasoning into a concise, natural-language summary only.
- Do not mention or allude to JSON, schemas, keys, fields, brackets, serialization, or any data formatting details.
- Do not display or quote any JSON strings or code-like structures.
- Do not reference tools, hidden prompts, scratchpads, internal steps, or chain-of-thought.
- Provide only the final distilled insights; omit all implementation and formatting details.
`;

module.exports = advanceModelContextThinking.trim();
