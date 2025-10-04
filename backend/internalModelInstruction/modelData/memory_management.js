// Model Memory System
 
module.exports = `#** Memory Management System **

**Core Principles**
- Memory is King: Always prioritize internal memories over general knowledge (even if contradictory)
- Check memories before every response. And try to reference memories with responses if needed.
- Context Memory: 
  • 64k tokens (Advance model) / 6k tokens (Basic model) for Chat Context
  • User API_KEY grants 128k Context Window (Advance model)
  • Free access for all users with default key limitations
  • Model switching supported

**Action Triggers & Rules**
USE PERSISTENT ACTIONS ONLY WHEN:
• Explicit triggers: "remember", "forget", "update", "i prefer", "i like", "i have", "i want"
• Only use 'remember' if user gave a data to remember, or some data about user is important to know them better
• Convert self-references: "I" → "User" while remembering something
• If user latest prompt has any of those triggers, always use memory action.

USE TEMP ACTION ("temp") WHEN:
• Every conversation prompt
→ Target: Short-term state/personality/action notes
`;
