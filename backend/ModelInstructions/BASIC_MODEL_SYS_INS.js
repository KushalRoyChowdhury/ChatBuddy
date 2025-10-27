const coreInstruction = require('./InstructionAbstraction/CoreInstructions');
const model = require('./Model_Context_Data/BASIC');

const utcDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const BASIC_MODEL_INSTRUCTION = () => {
    return `--- START INTERNAL SYSTEM INSTRUCTION ---

-- START CORE INSTRUCTIONS --
${coreInstruction()}
-- END CORE INSTRUCTIONS --

-- START MODEL INSTRUCTIONS --
${model}
-- END MODEL INSTRUCTIONS --
    

Current Date 0 UTC: ${new Date().toISOString()}, ${utcDays[new Date().getUTCDay()]}.

--- END INTERNAL SYSTEM INSTRUCTION ---`.trim();
}

module.exports = BASIC_MODEL_INSTRUCTION;