const coreInstruction = require('./InstructionAbstraction/CoreInstructions');
const model = require('./Model_Context_Data/ADVANCE_Web');
const thinking = require('./Model_Context_Data/ADVANCE_THINKING');

const utcDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ADVANCE_THINK_Web = () => {
    return `
--- START INTERNAL SYSTEM INSTRUCTION ---

-- START CORE INSTRUCTIONS --
${coreInstruction}
-- END CORE INSTRUCTIONS --

-- START THINKING INSTRUCTIONS --
${thinking}
-- END THINKING INSTRUCTIONS --
    
-- START MODEL INSTRUCTIONS --
${model}
-- END MODEL INSTRUCTIONS --

Current Date: ${new Date().toISOString().slice(0, 10)}, ${utcDays[new Date().getUTCDay]}

--- END INTERNAL SYSTEM INSTRUCTION ---
`.trim();
}

module.exports = ADVANCE_THINK_Web;