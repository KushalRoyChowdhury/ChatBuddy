const coreInstruction = require('./InstructionAbstraction/CoreInstructions');
const model = require('./Model_Context_Data/ADVANCE_NoWeb');
const thinking = require('./Model_Context_Data/ADVANCE_THINKING');


const ADVANCE_THINK_NoWeb = (zoneInfo, apiKey) => {

    let now = new Date();
    const optionsDate = {
        timeZone: zoneInfo,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    const optionsDay = {
        timeZone: zoneInfo,
        weekday: 'long'
    };

    return `--- START INTERNAL SYSTEM INSTRUCTION ---

-- START CORE INSTRUCTIONS --
${coreInstruction()}
-- END CORE INSTRUCTIONS --

-- START THINKING INSTRUCTIONS --
${thinking}
-- END THINKING INSTRUCTIONS --

-- START MODEL INSTRUCTIONS --
${model(apiKey)}
-- END MODEL INSTRUCTIONS --

Current Date: ${now.toLocaleString('en-US', optionsDate)}, ${new Intl.DateTimeFormat('en-US', optionsDay).format(now)}.

--- END INTERNAL SYSTEM INSTRUCTION ---`.trim();
}

module.exports = ADVANCE_THINK_NoWeb;