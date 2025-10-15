// Update 1.6.1
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { GoogleGenAI, createUserContent, createPartFromUri, createPartFromText, Modality } = require('@google/genai');


const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);
app.use(fileUpload({
    useTempFiles: false,
    tempFileDir: '/tmp/',
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
}));

// --- Constants ---
const SERVER_API_KEY = process.env.GEMINI_API_KEY;
const MODELS = [
    'gemma-3-27b-it',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash-preview-image-generation'
];
const GEMMA_HISTORY_LIMIT_CHARS = 6000 * 4;
const GEMINI_HISTORY_LIMIT_CHARS = 64000 * 4;
const GEMINI_PRO_HISTORY_LIMIT_CHARS = 128000 * 4;

const basic = require('./ModelInstructions/BASIC_MODEL_SYS_INS');
const advance = require('./ModelInstructions/ADVANCE_MODEL_NoWeb_SYS_INS');
const advance_web = require('./ModelInstructions/ADVANCE_MODEL_Web_SYS_INS');
const advance_thinking = require('./ModelInstructions/ADVANCE_THINK_NoWeb_SYS_INS');
const advance_thinking_web = require('./ModelInstructions/ADVANCE_THINK_Web_SYS_INS');



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

const safetySettings = [
    {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_NONE",
    },
    {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_NONE",
    },
    {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE",
    },
    {
        category: "HARM_CATEGORY_CIVIC_INTEGRITY",
        threshold: "BLOCK_NONE",
    },
    {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_NONE",
    }
];

// Rate Limiter
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

const RATE_LIMIT_DB_FILE = path.join(__dirname, 'rate-limiter-db.json');
let rateLimitDB = {};

const loadRateLimitDB = async () => {
    try {
        const data = await fs.readFile(RATE_LIMIT_DB_FILE, 'utf8');
        if (data) rateLimitDB = JSON.parse(data);
    } catch (err) {
        if (err.code !== 'ENOENT') console.error('⚠️ Error loading rate limit database:', err.message);
    }
};

const saveRateLimitDB = async () => {
    try {
        await fs.writeFile(RATE_LIMIT_DB_FILE, JSON.stringify(rateLimitDB, null, 2), 'utf8');
    } catch (err) {
        console.error('⚠️ Error saving rate limit database:', err.message);
    }
};

function getIp(req) {
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    if (ip && ip.includes('::ffff:')) return ip.split(':').pop();
    return ip;
}

const limitConfigs = {
    basic: { maxM: 5, maxD: 500 },
    advanced: { maxM: 3, maxD: 100 },
    image: { maxM: 1, maxD: 10 },
    basicUser: { maxM: 30, maxD: 14350 },
    advancedUser: { maxM: 15, maxD: 1000 },
    imageUser: { maxM: 10, maxD: 100 },
};

async function checkRateLimit(req) {
    try {
        if (!req.body || typeof req.body.modelIndex === 'undefined') {
            return { allowed: false, status: 400, message: 'Invalid request body.' };
        }

        const { modelIndex, apiKey: userApiKey } = req.body;
        let userId = userApiKey && typeof userApiKey === 'string' && userApiKey.trim() !== ''
            ? crypto.createHash('sha256').update(userApiKey).digest('hex')
            : getIp(req);

        const limitKey = `${userId}:${modelIndex}`;
        const now = new Date();

        if (!rateLimitDB[limitKey]) {
            // If the user has no record, they are definitely allowed.
            return { allowed: true };
        }

        const limitRecord = rateLimitDB[limitKey];
        const lastUpdateM = new Date(limitRecord.lastUpdateM);
        const lastUpdateD = new Date(limitRecord.lastUpdateD);

        // Check if the windows have expired (but don't reset here, just check against the count)
        const isMinuteExpired = (now.getTime() - lastUpdateM.getTime()) > 60 * 1000;
        const isDayExpired = (now.getTime() - lastUpdateD.getTime()) > 24 * 60 * 60 * 1000;

        const isUserRequest = !!userApiKey;
        let limits;
        if (modelIndex === 0) limits = isUserRequest ? limitConfigs.basicUser : limitConfigs.basic;
        else if (modelIndex === 1) limits = isUserRequest ? limitConfigs.advancedUser : limitConfigs.advanced;
        else if (modelIndex === 2) limits = isUserRequest ? limitConfigs.imageUser : limitConfigs.image;
        else return { allowed: true };

        // If the window is NOT expired and the hit count is at max, deny.
        if (!isMinuteExpired && limitRecord.hitM >= limits.maxM) {
            return { allowed: false, status: 429, message: 'Too many requests. Try again in a moment.' };
        }
        if (!isDayExpired && limitRecord.hitD >= limits.maxD) {
            return { allowed: false, status: 429, message: 'Daily limit reached for this model. Try again tomorrow or switch to different model.' };
        }

        return { allowed: true };

    } catch (error) {
        console.error("ERROR during rate limit check:", error);
        return { allowed: false, status: 500, message: 'Internal Server Error.' };
    }
}

async function incrementHitCount(req) {
    try {
        if (!req.body || typeof req.body.modelIndex === 'undefined') return;

        const { modelIndex, apiKey: userApiKey } = req.body;
        let userId = userApiKey && typeof userApiKey === 'string' && userApiKey.trim() !== ''
            ? crypto.createHash('sha256').update(userApiKey).digest('hex')
            : getIp(req);

        const limitKey = `${userId}:${modelIndex}`;
        const now = new Date();

        if (!rateLimitDB[limitKey]) {
            rateLimitDB[limitKey] = { hitM: 0, hitD: 0, lastUpdateM: now.toISOString(), lastUpdateD: now.toISOString() };
        }

        const limitRecord = rateLimitDB[limitKey];
        const lastUpdateM = new Date(limitRecord.lastUpdateM);
        const lastUpdateD = new Date(limitRecord.lastUpdateD);

        // Reset counters if windows are expired, then increment
        if (now.getTime() - lastUpdateM.getTime() > 60 * 1000) {
            limitRecord.hitM = 1;
            limitRecord.lastUpdateM = now.toISOString();
        } else {
            limitRecord.hitM++;
        }

        if (now.getTime() - lastUpdateD.getTime() > 24 * 60 * 60 * 1000) {
            limitRecord.hitD = 1;
            limitRecord.lastUpdateD = now.toISOString();
        } else {
            limitRecord.hitD++;
        }

        await saveRateLimitDB();

    } catch (error) {
        console.error("ERROR incrementing hit count:", error);
    }
}



loadRateLimitDB();
setInterval(saveRateLimitDB, 30 * 1000);


/**
* Parses a potentially malformed, JSON-like string from an AI, extracts key values,
* applies defaults, and returns a clean, valid JSON string.
*
* @param {string} rawText The raw string input from the AI.
* @returns {string} A valid JSON string representing the parsed object.
*/
function sanitizeAndParseAIResponse(rawText) {
    // If the input is empty or not a string, return a default JSON structure.
    if (!rawText || typeof rawText !== 'string') {
        const defaultObj = {
            action: 'chat',
            target: [''],
            response: '',
        };
        return JSON.stringify(defaultObj, null, 2);
    }

    // --- Helper function to extract a value for a given key ---
    const extractValue = (key, text) => {

        const regex = new RegExp(
            `\\b${key}\\b\\s*[:=]\\s*` +
            `(` +
            `"(?:[^"\\\\]|\\\\.)*"` +
            `|` +
            `'(?:[^'\\\\]|\\\\.)*'` +
            `|` +
            `\\[(?:[^\\]\\\\]|\\\\.)*\\]` +
            `|` +

            `.+?` +
            `)` +

            `(?=\\s*,?\\s*\\b(?:action|target|response)\\b|\\s*[}\\]]|$)`,
            'is'
        );

        const match = text.match(regex);
        if (!match || !match[1]) {
            return null;
        }

        let value = match[1].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        return value;
    };

    const extractedAction = extractValue('action', rawText);
    const extractedTarget = extractValue('target', rawText);
    const extractedResponse = extractValue('response', rawText);

    const action = extractedAction || 'chat';

    const response = extractedResponse !== null ? extractedResponse : rawText;

    let target;
    if (extractedTarget) {
        try {
            target = JSON.parse(extractedTarget);

            if (!Array.isArray(target)) target = [target];
        } catch (e) {

            target = [extractedTarget];
        }
    } else {

        target = [''];
    }

    const finalObject = {
        action: action,
        target: target,
        response: response,
    };

    return JSON.stringify(finalObject, null, 2);
}




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

// --- File Upload ---
app.post('/upload', async (req, res) => {
    const ai = new GoogleGenAI({});
    try {
        // Check if a file was uploaded
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: 'No file uploaded or file field is not named "image".' });
        }

        const uploadedFile = req.files.image;

        const fileBuffer = uploadedFile.data;
        const fileName = uploadedFile.name;
        const fileType = uploadedFile.mimetype;

        const fileForUpload = new File([fileBuffer], fileName, {
            type: fileType,
            lastModified: Date.now(),
        });

        const fileSize = uploadedFile.size;

        const SIZE_LIMITS = {
            'image/': 20 * 1024 * 1024,    // 20MB for images
            'application/pdf': 50 * 1024 * 1024, // 50MB for PDF
            'text/plain': 1 * 1024 * 1024   // 1MB for TXT
        };

        // Determine applicable limit
        let maxFileSize = 20 * 1024 * 1024; // Fallback to global limit

        if (fileType.startsWith('image/')) {
            maxFileSize = SIZE_LIMITS['image/'];
        } else if (fileType === 'application/pdf') {
            maxFileSize = SIZE_LIMITS['application/pdf'];
        } else if (fileType === 'text/plain') {
            maxFileSize = SIZE_LIMITS['text/plain'];
        }

        // Validate file size
        if (fileSize > maxFileSize) {
            const maxSizeMB = maxFileSize / (1024 * 1024);
            return res.status(400).json({
                error: `File too large. Maximum size for ${fileType} is ${maxSizeMB}MB.`
            });
        }

        const modelFile = await ai.files.upload({
            file: fileForUpload,
            config: { mimeType: fileType }
        });

        if (modelFile.source === 'UPLOADED') {
            res.status(200).json({ uri: modelFile.uri, mimeType: fileType });
        }
        else {
            res.status(500).send();
        }


    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error during upload.' });
    }

});

// --- Main API Endpoint ---
app.post('/model', async (req, res) => {
    let { history, memory, temp, sys, modelIndex, apiKey, creativeRP, advanceReasoning, webSearch, images } = req.body;
    let retry = true;

    const limitResult = await checkRateLimit(req);
    if (!limitResult.allowed) {
        return res.status(limitResult.status).json({ error: { message: limitResult.message } });
    }

    start:
    try {
        const finalApiKey = apiKey || SERVER_API_KEY;
        if (!finalApiKey) {
            return res.status(500).json({ error: { message: 'API Key not valid.' } });
        }

        const genAI = new GoogleGenAI({ apiKey: finalApiKey });

        if (modelIndex === undefined || modelIndex < 0 || modelIndex >= MODELS.length) {
            return res.status(400).json({ error: { message: 'A valid model index (0 or 1) must be provided.' } });
        }
        if (!history || !Array.isArray(history) || history.length === 0) {
            return res.status(400).json({ error: { message: 'A valid chat history must be provided.' } });
        }

        let INTERNAL_SYSTEM_PROMPT = '';

        if (modelIndex === 0) INTERNAL_SYSTEM_PROMPT = basic();
        else if (modelIndex === 1 && !advanceReasoning && !webSearch) INTERNAL_SYSTEM_PROMPT = advance();
        else if (modelIndex === 1 && webSearch && !advanceReasoning) INTERNAL_SYSTEM_PROMPT = advance_web();
        else if (modelIndex === 1 && advanceReasoning && !webSearch) INTERNAL_SYSTEM_PROMPT = advance_thinking();
        else if (modelIndex === 1 && webSearch && advanceReasoning) INTERNAL_SYSTEM_PROMPT = advance_thinking_web();

        const selectedModel = MODELS[modelIndex];

        let finalSystemPrompt = INTERNAL_SYSTEM_PROMPT;
        if (sys && sys.trim()) finalSystemPrompt += `\n\n--- START USER'S SYSTEM PROMPT ---\n${sys.trim()}\n--- END USER'S SYSTEM PROMPT ---`;
        if (memory && memory.length > 0) finalSystemPrompt += `\n\n--- START LONG-TERM MEMORIES ---\n- ${memory.join('\n- ')}\n--- END LONG-TERM MEMORIES ---`;
        if (temp && temp.length > 0) finalSystemPrompt += `\n\n--- START RECENT CHATS ---\n- ${temp.join('\n- ')}\n--- END RECENT CHATS ---`;

        let contextLimit = modelIndex === 0
            ? GEMMA_HISTORY_LIMIT_CHARS
            : (apiKey ? GEMINI_PRO_HISTORY_LIMIT_CHARS : GEMINI_HISTORY_LIMIT_CHARS);

        const truncatedHistory = getTruncatedHistory(history, contextLimit);

        // New logic to build history with interleaved images
        const historyForSDK_NEW = truncatedHistory.map(msg => {
            const role = msg.role === 'assistant' ? 'model' : 'user';
            let parts = [];

            // If it's a user message, check for associated images
            if (role === 'user' && images && images.length > 0) {
                const associatedImages = images.filter(img => img.id === msg.id && img.uri);
                associatedImages.forEach(img => {
                    parts.push(createPartFromUri(img.uri, img.mimeType));
                });
            }

            // Add the text part
            parts.push(createPartFromText(msg.content));

            return { role, parts };
        });


        if (modelIndex === 0) { // Gemma logic
            const latestUserTurn = historyForSDK_NEW.pop();
            const latestUserMessageText = latestUserTurn.parts.map(p => p.text).join(' ');
            const gemmaMessageWithSystemPrompt = `${finalSystemPrompt}\n\n--- CURRENT PROMPT ---\nUSER: ${latestUserMessageText}`;

            latestUserTurn.parts = latestUserTurn.parts
                .filter(p => p.text === undefined) // Keep only non-text parts (images)
                .concat(createPartFromText(gemmaMessageWithSystemPrompt)); // Add the combined prompt

            const gemmaContents = [...historyForSDK_NEW, latestUserTurn];

            result = await genAI.models.generateContent({
                model: selectedModel,
                contents: gemmaContents,
                config: {
                    temperature: creativeRP ? 2 : 1,
                    topP: creativeRP ? 0.98 : 0.95,
                    topK: creativeRP ? 0 : 64,
                    safetySettings: safetySettings,
                }
            });
        } else if (modelIndex === 1) { // Gemini logic

            result = await genAI.models.generateContent({
                model: selectedModel,
                contents: historyForSDK_NEW,
                config: {
                    systemInstruction: {
                        role: "system",
                        parts: [{ text: finalSystemPrompt }]
                    },
                    temperature: advanceReasoning ? 0.9 : 1,
                    topP: advanceReasoning ? 0.9 : 0.98,
                    topK: advanceReasoning ? 64 : 128,
                    safetySettings: safetySettings,
                    thinkingConfig: {
                        thinkingBudget: advanceReasoning ? -1 : 0,
                        includeThoughts: advanceReasoning ? true : false,
                    },
                    ...(webSearch && {
                        tools: [
                            { urlContext: {} },
                            { googleSearch: {} }
                        ]
                    }),
                }
            });
        } else {
            result = await genAI.models.generateContent({
                model: selectedModel,
                contents: historyForSDK_NEW[historyForSDK_NEW.length - 1].parts,
                config: {
                    responseModalities: [Modality.TEXT, Modality.IMAGE],
                    safetySettings: safetySettings,
                },
            });

        }


        let thought = '';
        let answer = '';
        let generatedImage = null;


        for (const part of result.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64Image = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                generatedImage = {
                    base64Data: base64Image,
                    mimeType: mimeType
                };
            }
            else if (part.text) {
                if (part.thought) {
                    let thoughtWrapped = `<think>\n\n${part.text}\n\n</think>`;
                    thought = thoughtWrapped.replace(/```[a-zA-Z]*\s*([\s\S]*?)\s*```/g, "$1");
                } else {
                    answer = part.text;
                }
            }
        }

        let text = '';
        if (generatedImage) {
            text = `${generatedImage.mimeType};base64,${generatedImage.base64Data}`;
        } else {
            text = answer.replace(/^```json\s*([\s\S]*?)\s*```$/m, "$1");
            text = text.replace(/\\(?![ntr"'\\])/g, '\\\\');
        }

        if (!generatedImage) {
            try {
                JSON.parse(text);
            }
            catch (error) {
                console.log("JSON PARSE ERROR:", error.message);
                text = sanitizeAndParseAIResponse(text);
            }
        }

        if (thought.length > 0) {
            text = thought + text;
        }

        await incrementHitCount(req);

        res.status(200).json({
            candidates: [{ content: { parts: [{ text }], role: 'model' } }]
        });

    } catch (error) {
        console.error("GEMINI API ERROR:: ", error);
        if (error.toString().includes('429') && retry) {
            console.log('API-side rate limit reached. Attempting fallback...');
            modelIndex = modelIndex === 1 ? 0 : 1;
            retry = false;
            break start;
        }

        let errorMessage = error;
        res.status(error.status || 500).json({
            candidates: [{ content: { parts: [{ errorMessage }], role: 'model' } }]
        });
    }

});

app.listen(PORT, () => console.log(`Server Running on PORT: ${PORT}`));
