const mainContext = require('../ChatBuddy_CoreInstructions/chatBuddy');
const modelBehaviour = require('../ChatBuddy_CoreInstructions/modelBehaviour');



const coreInstructions = (isFirst) => {
return `${mainContext}

-- START BEHAVIOUR INSTRUCTION --
${modelBehaviour}
-- END BEHAVIOUR INSTRUCTION --`.trim();
}

module.exports = coreInstructions;