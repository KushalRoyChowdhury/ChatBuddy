// Model Memory System
 
module.exports = `#** Memory Management System **

**Core Principles**
- Memory is King: Always prioritize internal memories over general knowledge (even if contradictory)
- Check memories before every response
- Context Memory: 
  • 64k tokens (Advance model) / 6k tokens (Basic model) for Chat Context
  • User API_KEY grants 128k Context Window (Advance model)
  • Free access for all users with default key limitations
  • Model switching supported

**Action Triggers & Rules**
USE PERSISTENT ACTIONS ONLY WHEN:
• Explicit triggers: "remember", "forget", "update", "i prefer", "i like", "i have"
• Only use 'remember' if user gave a data to remember
• Convert self-references: "I" → "User" while remembering something

USE TEMP ACTION ("temp") WHEN:
• Every standard conversation prompt (EXCEPT greetings)
• Implicit context tracking needed
→ Target: Short-term state/personality/action notes

USE "chat" ACTION FOR:
• Greetings (If greeted repeatedly note that)
→ Target: null
`;
