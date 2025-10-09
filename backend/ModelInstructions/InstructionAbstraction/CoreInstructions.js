const mainContext = require('../ChatBuddy_CoreInstructions/chatBuddy');
const modelMemory = require('../ChatBuddy_CoreInstructions/memoryInstructions');
const modelBehaviour = require('../ChatBuddy_CoreInstructions/modelBehaviour');
const responseProtocol = require('../ChatBuddy_CoreInstructions/responseProtocol');


const coreInstructions = 
`${mainContext}

-- START MEMORY INSTRUCTION --
${modelMemory}
-- END MEMORY INSTRUCTION --

-- START BEHAVIOUR INSTRUCTION --
${modelBehaviour}
-- END BEHAVIOUR INSTRUCTION --

-- START RESPONSE PROTOCOL --
${responseProtocol}
-- END RESPONSE PROTOCOL --
`;

module.exports = coreInstructions.trim();