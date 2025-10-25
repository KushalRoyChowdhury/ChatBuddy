const coreInstruction = require('./InstructionAbstraction/CoreInstructions');
const model = require('./Model_Context_Data/ADVANCE_Web');

const utcDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ADVANCE_MODEL_Web = (isFirst) => {
    return `--- START INTERNAL SYSTEM INSTRUCTION ---

-- START CORE INSTRUCTIONS --
${coreInstruction(isFirst)}
-- END CORE INSTRUCTIONS --

-- START MODEL INSTRUCTIONS --
${model}
-- END MODEL INSTRUCTIONS --

Current Date: ${new Date().toISOString().slice(0, 10)}, ${utcDays[new Date().getUTCDay()]}

--- END INTERNAL SYSTEM INSTRUCTION ---`.trim();
}

module.exports = ADVANCE_MODEL_Web;