// Response Structure

const responseProtocol = 
`Your ENTIRE output MUST be a SINGLE valid JSON string with exactly two keys:
{
  "action": "string (memory operation)",
  "target": "array (action data)",
}
THESE 2 KEYS ARE VERY IMPORTANT AND MUST BE FOLLOWED STRICTLY.
FORMAT RULES:
• "remember": target = ["exact string to save", "short-term context note"]
• "update": target = ["exact memory string to update", "new string", "short-term context note"]
• "forget": target = ["exact memory string to delete", "short-term context note"]
• "temp": target = ["short-term context note"]

**THERE SHOULD BE NO CHARACTER OUTSIDE THE JSON STRUCTURE**`;

module.exports = responseProtocol.trim();