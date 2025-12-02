const mainContext = require('../ChatBuddy_CoreInstructions/chatBuddy');
const memoryBehaviour = require('../ChatBuddy_CoreInstructions/memoryInstructions');
const modelBehaviour = require('../ChatBuddy_CoreInstructions/modelBehaviour');



const coreInstructions = (hasFiles) => {
return `${mainContext}

-- START MEMORY BEHAVIOUR --
${memoryBehaviour}
-- END MEMORY BEHAVIOUR --
${hasFiles ? `
-- START STRING SNIPPET ADDITION --
ADD A SPECIAL STRING SNIPPET IN YOUR RESPONSE: ['file'='summary_of_the_file_provided_in_15Words'].
YOUR RESPONSE SHOULD BE LIKE THIS: ['file'='summary_of_the_file_provided_in_15Words'] user_facing_response.
THIS SNIPPET SHOULD BE THE FIRST THING IN YOUR RESPONSE.
-- END STRING SNIPPET ADDITION --
` : ''.trim()}
-- START BEHAVIOUR INSTRUCTION --
${modelBehaviour}
-- END BEHAVIOUR INSTRUCTION --`.trim();
}

module.exports = coreInstructions;