const mainContext = require('../ChatBuddy_CoreInstructions/chatBuddy');
const memoryBehaviour = require('../ChatBuddy_CoreInstructions/memoryInstructions');
const modelBehaviour = require('../ChatBuddy_CoreInstructions/modelBehaviour');



const coreInstructions = (isFirst) => {
return `${mainContext}

-- START MEMORY BEHAVIOUR --
${memoryBehaviour}
-- END MEMORY BEHAVIOUR --

-- START BEHAVIOUR INSTRUCTION --
${modelBehaviour}
-- END BEHAVIOUR INSTRUCTION --`.trim();
}

module.exports = coreInstructions;