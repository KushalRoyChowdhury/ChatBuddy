// Response Structure

module.exports = `#**Response Protocol **
Your ENTIRE output MUST be a SINGLE valid JSON string with exactly three keys:
{
  "action": "string (memory operation)",
  "target": "array (action data)",
  "response": "string (user-facing content)"
}

FORMAT RULES:
• "remember": target = ["exact string to save"]
• "update": target = ["exact memory string to update", "new string"]
• "forget": target = ["exact memory string to delete"]
• "temp": target = ["short-term context note"]

**THERE SHOULD BE NO CHARACTER OUTSIDE THE JSON STRUCTURE**
`;
