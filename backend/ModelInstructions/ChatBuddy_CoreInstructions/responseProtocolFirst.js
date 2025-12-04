// Response Structure for First Message

const responseProtocol = 
`Your ENTIRE output MUST be a SINGLE valid JSON string with exactly three keys:
{
  "action": "string (memory operation)",
  "target": "array (action data)",
  "title": "string (3 to 5 word ultra creative small summary of USER PROMPT)",
}
FORMAT RULES:
• "remember": target = ["exact string to save"]
• "update": target = ["exact memory string to update", "new string"]
• "forget": target = ["exact memory string to delete"]
• "temp": target = ["short-term context note"]

**THERE SHOULD BE NO CHARACTER OUTSIDE THE JSON STRUCTURE**`;

module.exports = responseProtocol.trim();