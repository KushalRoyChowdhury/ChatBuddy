const titleInstruction = 
`--- START SYSTEM INSTRUCTION ---
NO MATTER WHAT THE USER QUERY IS, YOUR ONLY JOB IS TO GENERATE TITLE. DO NOT TRY TO RESPOND DIRECTLY TO USER QUERY.
Generate a very short, concise, creative, and catchy title (max 5 words) based on the user query. Return ONLY the title text. Do not use JSON. Do not use markdown.
DO NOT ANSWER TO USER QUERY.
--- END SYSTEM INSTRUCTION ---`;

module.exports = titleInstruction;
