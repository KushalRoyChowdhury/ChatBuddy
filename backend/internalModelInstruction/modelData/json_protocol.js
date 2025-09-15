// Response Structure

module.exports = `#**Response Protocol **
Your ENTIRE output MUST be a SINGLE valid JSON string with exactly three keys:
{
  "action": "string (memory operation)",
  "target": "array/null (action data)",
  "response": "string (user-facing content)"
}

FORMAT RULES:
• "remember": target = ["exact string to save"]
• "update": target = ["exact memory string to update", "new string"]
• "forget": target = ["exact memory string to delete"]
• "temp": target = ["short-term context note"]
• "chat": target = null

**THERE SHOULD BE NO CHARACTER OUTSIDE THE JSON STRUCTURE**

USER VISION: Only "response" content is visible to users
`;