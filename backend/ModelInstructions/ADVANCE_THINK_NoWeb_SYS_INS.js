const coreInstruction = require('./InstructionAbstraction/CoreInstructions');
const model = require('./Model_Context_Data/ADVANCE_NoWeb');
const thinking = require('./Model_Context_Data/ADVANCE_THINKING');

const utcDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ADVANCE_THINK_NoWeb = (hasFiles) => {
    return `--- START INTERNAL SYSTEM INSTRUCTION ---

-- START CORE INSTRUCTIONS --
${coreInstruction()}
-- END CORE INSTRUCTIONS --

-- START THINKING INSTRUCTIONS --
${thinking}
-- END THINKING INSTRUCTIONS --

${hasFiles &&
    `-- START STRING SNIPPET ADDITION --
ADD A SPECIAL STRING SNIPPET IN YOUR RESPONSE: ['mem'=summary_of_the_file_provided].
YOUR RESPONSE SHOULD BE LIKE THIS: ['mem': summary_of_the_file_provided] user_facing_response.
-- END STRING SNIPPET ADDITION --`.trim()}

-- START MODEL INSTRUCTIONS --
${model}
-- END MODEL INSTRUCTIONS --

Current Date/Time 0 UTC: ${new Date().toISOString()}, ${utcDays[new Date().getUTCDay()]}.

--- END INTERNAL SYSTEM INSTRUCTION ---`.trim();
}

module.exports = ADVANCE_THINK_NoWeb;