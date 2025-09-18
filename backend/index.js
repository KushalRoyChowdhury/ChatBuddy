// Update 1.5
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
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

const INTERNAL_MEMORY_PROMPT = require('./internalModelInstruction/internalSystemPrompt');
const BASIC_MODEL_CONTEXT = require('./internalModelInstruction/modelData/model_context_BASIC');
const ADVANCED_MODEL_CONTEXT = require('./internalModelInstruction/modelData/model_context_ADVANCE');

// --- Rate Limiting Middleware (RPM and RPD) Default Key ---
const basicMinuteLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 5, message: { error: { message: 'Rate limit exceeded for Basic model. Try again in a moment. Switch to other models or your Own API Key' } } });
const basicDayLimiter = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 500, message: { error: { message: 'Daily limit reached for Basic model. Try again tomorrow. Switch to other models or your Own API Key' } } });
const advancedMinuteLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 3, message: { error: { message: 'Rate limit exceeded for Advance model. Try again in a moment. Switch to Basic model or your Own API Key' } } });
const advancedDayLimiter = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 100, message: { error: { message: 'Daily limit reached for Advance model. Try again tomorrow. Switch to Basic model or your Own API Key' } } });
const imageGenMinuteLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 1, message: { error: { message: 'Rate limit exceeded for Image Generation. Try again in a moment or switch to your Own API Key' } } });
const imageGenDayLimiter = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 10, message: { error: { message: 'Daily Limit on Image generation reached. Try again tomorrow or switch to your Own API Key' } } });

const basicLimiters = [basicMinuteLimiter, basicDayLimiter];
const advancedLimiters = [advancedMinuteLimiter, advancedDayLimiter];
const imageGenLimiters = [imageGenMinuteLimiter, imageGenDayLimiter];


// --- Rate Limiting Middleware (RPM and RPD) User Key (Rate Limited safely under Google Default Free Tier) ---
const basicMinuteLimiterUSER = rateLimit({ windowMs: 1 * 60 * 1000, max: 30, message: { error: { message: 'Rate limit exceeded for Basic model. Try again in a moment. Switch to other models or your Own API Key' } } });
const basicDayLimiterUSER = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 14350, message: { error: { message: 'Daily limit reached for Basic model. Try again tomorrow. Switch to other models or your Own API Key' } } });
const advancedMinuteLimiterUSER = rateLimit({ windowMs: 1 * 60 * 1000, max: 15, message: { error: { message: 'Rate limit exceeded for Advance model. Try again in a moment. Switch to Basic model or your Own API Key' } } });
const advancedDayLimiterUSER = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 1000, message: { error: { message: 'Daily limit reached for Advance model. Try again tomorrow. Switch to Basic model or your Own API Key' } } });
const imageGenMinuteLimiterUSER = rateLimit({ windowMs: 1 * 60 * 1000, max: 10, message: { error: { message: 'Rate limit exceeded for Image Generation. Try again in a moment or switch to your Own API Key' } } });
const imageGenDayLimiterUSER = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 100, message: { error: { message: 'Daily Limit on Image generation reached. Try again tomorrow or switch to your Own API Key' } } });

const basicLimitersUser = [basicMinuteLimiterUSER, basicDayLimiterUSER];
const advancedLimitersUser = [advancedMinuteLimiterUSER, advancedDayLimiterUSER];
const imageGenLimitersUser = [imageGenMinuteLimiterUSER, imageGenDayLimiterUSER];

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
        } else if (modelIndex === 2) {
            // Sequentially apply the image generation limiters
            express.Router().use(imageGenLimitersUser)(req, res, next);
        }
        else {
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
        } else if (modelIndex === 2) {
            // Sequentially apply the image generation limiters
            express.Router().use(imageGenLimiters)(req, res, next);
        }
        else {
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

// --- Image Upload ---
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
app.post('/model', applyRateLimiter, async (req, res) => {
    let { history, memory, temp, sys, modelIndex, apiKey: userApiKey, creativeRP, advanceReasoning, webSearch, images } = req.body;
    let retry = true;
    start:
    try {
        const finalApiKey = userApiKey || SERVER_API_KEY;
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

        let INTERNAL_SYSTEM_PROMPT = INTERNAL_MEMORY_PROMPT;
        if (modelIndex === 0) {
            INTERNAL_SYSTEM_PROMPT += BASIC_MODEL_CONTEXT;
        } else if (modelIndex === 1) {
            INTERNAL_SYSTEM_PROMPT += ADVANCED_MODEL_CONTEXT;
        }

        const selectedModel = MODELS[modelIndex];

        let finalSystemPrompt = INTERNAL_SYSTEM_PROMPT;
        if (memory && memory.length > 0) finalSystemPrompt += `\n\n--- LONG-TERM MEMORIES ---\n- ${memory.join('\n- ')}`;
        if (temp && temp.length > 0) finalSystemPrompt += `\n\n--- TEMPORARY NOTES ---\n- ${temp.join('\n- ')}`;
        if (sys && sys.trim()) finalSystemPrompt += `\n\n--- USER'S SYSTEM PROMPT ---\n${sys.trim()}`;

        let contextLimit = modelIndex === 0
            ? GEMMA_HISTORY_LIMIT_CHARS
            : (userApiKey ? GEMINI_PRO_HISTORY_LIMIT_CHARS : GEMINI_HISTORY_LIMIT_CHARS);

        const truncatedHistory = getTruncatedHistory(history, contextLimit);

        const latestUserMessageTurn = truncatedHistory.pop();
        let latestUserMessage = latestUserMessageTurn.content

        const historyForSDK = truncatedHistory.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));
        console.log(historyForSDK)
        let result;

        if (modelIndex === 0) { // Gemma logic
            // Build the text part
            const gemmaMessageWithSystemPrompt = `${finalSystemPrompt}\n\n--- CURRENT Conversation ---\nUSER: ${latestUserMessage}`;

            // Start with the full history
            let gemmaContents = [...historyForSDK];

            // If there are images, add each one as a separate user message
            if (images && images.length > 0) {
                images.forEach(image => {
                    if (image.uri) {
                        const imagePart = createUserContent([
                            createPartFromUri(image.uri, image.mimeType || "image/png")
                        ]);
                        gemmaContents.push(imagePart);
                    }
                });
            }

            // Finally, add the text message (with system prompt)
            gemmaContents.push({
                role: 'user',
                parts: [createPartFromText(gemmaMessageWithSystemPrompt)]
            });

            result = await genAI.models.generateContent({
                model: selectedModel,
                contents: gemmaContents,
                config: {
                    temperature: creativeRP ? 2 : 1,
                    topP: creativeRP ? 1 : 0.95,
                    topK: creativeRP ? 0 : 128,
                    safetySettings: safetySettings
                }
            });
        } else if (modelIndex === 1) { // Gemini logic
            let geminiContents = [...historyForSDK];

            if (images && images.length > 0) {
                images.forEach(image => {
                    if (image.uri) {
                        const imagePart = createUserContent([
                            createPartFromUri(image.uri, image.mimeType)
                        ]);
                        geminiContents.push(imagePart);
                    }
                });
            }

            geminiContents.push({
                role: 'user',
                parts: [createPartFromText(latestUserMessage)]
            });

            result = await genAI.models.generateContent({
                model: selectedModel,
                contents: geminiContents,
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
                        thinkingBudget: advanceReasoning ? 24576 : 0,
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
            console.log(latestUserMessage)
            result = await genAI.models.generateContent({
                model: selectedModel,
                contents: latestUserMessage,
                config: {
                    responseModalities: [Modality.TEXT, Modality.IMAGE],
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
        // If an image was generated, embed it as a data URL in the text
        if (generatedImage) {
            text = `${generatedImage.mimeType};base64,${generatedImage.base64Data}`;
        } else {
            // Fallback: use cleaned answer + thought (as before)
            text = answer.replace(/^```json\s*([\s\S]*?)\s*```$/m, "$1");
            if (thought.length > 0) {
                text = thought + text;
            }
        }

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

app.listen(PORT);
