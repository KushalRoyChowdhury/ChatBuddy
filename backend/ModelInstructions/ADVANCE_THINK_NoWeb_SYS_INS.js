const coreInstruction = require('./InstructionAbstraction/CoreInstructions');
const model = require('./Model_Context_Data/ADVANCE_NoWeb');
const thinking = require('./Model_Context_Data/ADVANCE_THINKING');

const ADVANCE_THINK_NoWeb = () => {
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

Current Date: ${new Date().toISOString().slice(0, 10)}

--- END INTERNAL SYSTEM INSTRUCTION ---
`.trim();
}

module.exports = ADVANCE_THINK_NoWeb;