const coreInstruction = require('./InstructionAbstraction/CoreInstructions');
const model = require('./Model_Context_Data/ADVANCE_NoWeb');

const utcDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ADVANCE_MODEL_NoWeb = (isFirst) => {
    return `--- START INTERNAL SYSTEM INSTRUCTION ---

-- START CORE INSTRUCTIONS --
${coreInstruction(isFirst)}
-- END CORE INSTRUCTIONS --

-- START MODEL INSTRUCTIONS --
${model}
-- END MODEL INSTRUCTIONS --

Current Date 0 UTC: ${new Date().toISOString()}, ${utcDays[new Date().getUTCDay()]}.

--- END INTERNAL SYSTEM INSTRUCTION ---`.trim();
}

module.exports = ADVANCE_MODEL_NoWeb;