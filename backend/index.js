require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);

// --- Constants ---
const SERVER_API_KEY = process.env.GEMINI_API_KEY;
const MODELS = [
    'gemma-3-27b-it',
    'gemini-2.5-flash-lite'
];
const GEMMA_HISTORY_LIMIT_CHARS = 6000 * 4;
const GEMINI_HISTORY_LIMIT_CHARS = 64000 * 4;
const GEMINI_PRO_HISTORY_LIMIT_CHARS = 128000 * 4;

const INTERNAL_MEMORY_PROMPT = require('./internalModelInstruction/internalSystemPrompt');
const INTERNAL_THINK_PROMPT = require('./internalModelInstruction/internalThinkInstruction');

// --- Rate Limiting Middleware (RPM and RPD) Default Key ---
const basicMinuteLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 7, message: { error: { message: 'Rate limit exceeded for Basic model. Try again in a moment. Switch to other models or your Own API Key' } } });
const basicDayLimiter = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 500, message: { error: { message: 'Daily limit reached for Basic model. Try again tomorrow. Switch to other models or your Own API Key' } } });
const advancedMinuteLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 3, message: { error: { message: 'Rate limit exceeded for Advance model. Try again in a moment. Switch to Basic model or your Own API Key' } } });
const advancedDayLimiter = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 100, message: { error: { message: 'Daily limit reached for Advance model. Try again tomorrow. Switch to Basic model or your Own API Key' } } });

const basicLimiters = [basicMinuteLimiter, basicDayLimiter];
const advancedLimiters = [advancedMinuteLimiter, advancedDayLimiter];

// --- Rate Limiting Middleware (RPM and RPD) User Key (Rate Limited safely under Google Default Free Tier) ---
const basicMinuteLimiterUSER = rateLimit({ windowMs: 1 * 60 * 1000, max: 30, message: { error: { message: 'Rate limit exceeded for Basic model. Try again in a moment. Switch to other models or your Own API Key' } } });
const basicDayLimiterUSER = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 14350, message: { error: { message: 'Daily limit reached for Basic model. Try again tomorrow. Switch to other models or your Own API Key' } } });
const advancedMinuteLimiterUSER = rateLimit({ windowMs: 1 * 60 * 1000, max: 15, message: { error: { message: 'Rate limit exceeded for Advance model. Try again in a moment. Switch to Basic model or your Own API Key' } } });
const advancedDayLimiterUSER = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 1000, message: { error: { message: 'Daily limit reached for Advance model. Try again tomorrow. Switch to Basic model or your Own API Key' } } });


const basicLimitersUser = [basicMinuteLimiterUSER, basicDayLimiterUSER];
const advancedLimitersUser = [advancedMinuteLimiterUSER, advancedDayLimiterUSER];

// --- Helper Function for History Truncation ---
const getTruncatedHistory = (fullHistory, limit) => {
    let truncatedHistory = [];
    let currentChars = 0;
    for (let i = fullHistory.length - 1; i >= 0; i--) {
        const message = fullHistory[i];
        const messageChars = message.content.length;
        if (currentChars + messageChars > limit) break;
        truncatedHistory.unshift(message);
        currentChars += messageChars;
    }
    return truncatedHistory;
};

// --- Dynamic Rate Limiter Middleware ---
const applyRateLimiter = (req, res, next) => {
    const { apiKey: userApiKey, modelIndex } = req.body;
    if (userApiKey) {
        if (modelIndex === 0) {
            // Sequentially apply the basic limiters
            express.Router().use(basicLimitersUser)(req, res, next);
        } else if (modelIndex === 1) {
            // Sequentially apply the advanced limiters
            express.Router().use(advancedLimitersUser)(req, res, next);
        } else {
            next();
        }
    }
    else {
        if (modelIndex === 0) {
            // Sequentially apply the basic limiters
            express.Router().use(basicLimiters)(req, res, next);
        } else if (modelIndex === 1) {
            // Sequentially apply the advanced limiters
            express.Router().use(advancedLimiters)(req, res, next);
        } else {
            next();
        }
    }
};

// --- Troll ---
app.get('/', (req, res) => {
    const roasts = [
        "Don't Sniff this /dev/null. Its all underlying Truma.. 😵‍💫😵‍💫😵‍💫",
        "You really typed this URL? Touch some grass, bro 🌱",
        "Congrats. You just found nothing. Literally. 🚮",
        "404? Nah, you get 100% psychological damage instead 💀",
        "This is not an API, this is your life choices flashing before your eyes. 😭"
    ];
    console.warn(`'${req.ip} Sniffed.'`)
    res.status(418).send(roasts[Math.floor(Math.random() * roasts.length)]);
});

// --- Health Check ---
app.get('/health', (req, res) => {
    res.status(200).send();
});


// --- Main API Endpoint ---
app.post("/model", applyRateLimiter, async (req, res) => {
    let { history, memory, temp, sys, modelIndex, apiKey: userApiKey, creativeRP, advanceReasoning, webSearch } = req.body;
    let retry = true;

    start:
    try {
        const finalApiKey = userApiKey || SERVER_API_KEY;
        let INTERNAL_SYSTEM_PROMPT = INTERNAL_MEMORY_PROMPT;

        if (modelIndex === 1 && advanceReasoning) {
            INTERNAL_SYSTEM_PROMPT += INTERNAL_THINK_PROMPT;
        }
        if (!finalApiKey) {
            return res.status(500).json({ error: { message: 'API key is not configured.' } });
        }

        const genAI = new GoogleGenerativeAI(finalApiKey);

        if (modelIndex === undefined || modelIndex < 0 || modelIndex >= MODELS.length) {
            return res.status(400).json({ error: { message: 'A valid model index (0 or 1) must be provided.' } });
        }
        if (!history || !Array.isArray(history) || history.length === 0) {
            return res.status(400).json({ error: { message: 'A valid chat history must be provided.' } });
        }

        const selectedModel = MODELS[modelIndex];

        let finalSystemPrompt = INTERNAL_SYSTEM_PROMPT;
        if (memory && memory.length > 0) finalSystemPrompt += `\n\n--- LONG-TERM MEMORIES ---\n- ${memory.join('\n- ')}`;
        if (temp && temp.length > 0) finalSystemPrompt += `\n\n--- TEMPORARY NOTES ---\n- ${temp.join('\n- ')}`;
        if (sys && sys.trim()) finalSystemPrompt += `\n\n--- USER'S SYSTEM PROMPT ---\n${sys.trim()}`;

        let genModel;
        let latestUserMessage;
        let historyForSDK;

        let contextLimit = modelIndex === 0
            ? GEMMA_HISTORY_LIMIT_CHARS
            : (userApiKey ? GEMINI_PRO_HISTORY_LIMIT_CHARS : GEMINI_HISTORY_LIMIT_CHARS);

        const truncatedHistory = getTruncatedHistory(history, contextLimit);
        const latestUserMessageTurn = truncatedHistory.pop();
        latestUserMessage = latestUserMessageTurn.content;

        historyForSDK = truncatedHistory.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        if (modelIndex === 0) { // Gemma logic
            latestUserMessage = `${finalSystemPrompt}\n\n--- CURRENT CONVERSATION ---\nUSER: ${latestUserMessage}`;
            genModel = genAI.getGenerativeModel({
                model: selectedModel,
                ...(creativeRP && {
                    generationConfig: {
                        temperature: 2,
                        topP: 1,
                        topK: 0,
                    },
                })
            });
        } else { // Gemini logic

            genModel = genAI.getGenerativeModel({
                model: selectedModel,
                systemInstruction: { parts: [{ text: finalSystemPrompt }] },
                ...(webSearch && {
                    tools: [{
                        googleSearch: {}
                    }]
                }),
                ...(advanceReasoning && {
                    tool_config: {
                        reasoning_config: {
                            mode: 'MULTI_PASS'
                        }
                    }
                })
            });
        }

        const chat = genModel.startChat({ history: historyForSDK });
        const result = await chat.sendMessage(latestUserMessage);
        const response = result.response;
        let text = response.text();
        text = text.replace(/^```json\s*([\s\S]*?)\s*```$/m, "$1");


        res.status(200).json({
            candidates: [{ content: { parts: [{ text }], role: 'model' } }]
        });

    } catch (error) {
        console.error("Error calling API:", error);

        if (error.toString().includes('429') && retry) {
            console.log('API-side rate limit reached. Attempting fallback...');
            modelIndex = modelIndex === 1 ? 0 : 1;
            retry = false;
            break start;
        }

        res.status(error.status || 500).json({
            error: { message: error.statusText || 'An internal server error occurred.' }
        });
    }
});

app.listen(PORT);
