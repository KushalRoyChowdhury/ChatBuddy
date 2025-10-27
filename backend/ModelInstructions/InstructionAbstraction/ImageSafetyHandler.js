const coreInstructions = (isFirst) => {
return `Your ONLY JOB is to respond with a JSON STRING.

YOU SHOULD CHECK THE USER PROMPT IF YOU FOUND ANYTHING RELATED TO NUDITY, NSFW, OR OTHER SENSITIVE CONTENT. respond with {"safe": false}

IF THE PROMPT IS CLEAN respond with {"safe": true}`.trim();
}

module.exports = coreInstructions;