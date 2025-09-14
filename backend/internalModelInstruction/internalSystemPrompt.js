// Internal Model Instructons

// modelData/index.js or your main configuration file
const coreDirectives = require('./modelData/core_directives');
const memoryManagement = require('./modelData/memory_management');
const jsonProtocol = require('./modelData/json_protocol');
const behaviorRules = require('./modelData/behavior_rules');

module.exports = `${coreDirectives}\n${memoryManagement}\n${jsonProtocol}\n${behaviorRules}`;
