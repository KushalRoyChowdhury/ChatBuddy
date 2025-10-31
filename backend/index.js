// Update 2.2.2
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { GoogleGenAI, createPartFromUri, createPartFromText, Modality } = require('@google/genai');
const { google } = require('googleapis');
const cookieParser = require('cookie-parser');
const stream = require('stream');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;
const compression = require('compression');
const pako = require('pako');

const app = express();
const PORT = process.env.PORT || 8000;

const SERVER_API_KEY = process.env.GEMINI_API_KEY;

// Middleware
app.use(express.static(path.join(__dirname, 'build')));
app.use(compression({ level: 9 }));
app.use(cors({
    origin: [process.env.FRONTEND_URL, '::1'],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(fileUpload({
    useTempFiles: false,
    tempFileDir: '/tmp/',
    limits: { fileSize: 50 * 1024 * 1024 },
}));
app.use((req, res, next) => {
    if (req.headers['content-encoding'] === 'gzip' && req.headers['content-type'] === 'application/octet-stream') {
        const chunks = [];
        req.on('data', (chunk) => {
            chunks.push(chunk);
        });
        req.on('end', () => {
            req.body = Buffer.concat(chunks);
            next();
        });
    } else {
        next();
    }
});

app.use('/debug', (req, res) => {
    res.json({
        protocol: req.protocol,
        secure: req.secure,
        headers: {
            'x-forwarded-proto': req.get('x-forwarded-proto'),
            'x-forwarded-host': req.get('x-forwarded-host'),
            origin: req.get('origin')
        }
    });
});

// Google Drive API setup
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.CALLBACK_URL
);

const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
];

const setOAuthCredentials = async (req, res, next) => {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accessToken) {
        return res.status(401).send('Unauthorized. No access token.');
    }

    if (!refreshToken) {
        return res.status(401).send('Unauthorized. No refresh token. Please log out and log in again.');
    }

    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    try {
        const { token } = await oauth2Client.getAccessToken();

        if (token !== accessToken) {
            oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
            res.cookie('access_token', token, { httpOnly: true, maxAge: 86400000, sameSite: 'none', secure: true });
        }
        next();

    } catch (error) {
        console.error('Error refreshing access token:', error.message);
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return res.status(401).json({ error: 'Authentication expired. Please log in again.' });
    }
};


app.get('/auth/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    });
    res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });
        const { data } = await oauth2.userinfo.get();
        const email = data.email;

        res.cookie('access_token', tokens.access_token, { httpOnly: true, maxAge: 86400000, sameSite: 'none', secure: true });
        res.cookie('refresh_token', tokens.refresh_token, { httpOnly: true, maxAge: 2592000000, sameSite: 'none', secure: true });
        res.cookie('user_email', email, { httpOnly: false, sameSite: 'none', maxAge: 2592000000, secure: true });

        res.redirect(process.env.FRONTEND_URL);
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.status(500).send('Authentication failed');
    }
});

app.get('/auth/status', (req, res) => {
    if (req.cookies.access_token) {
        res.json({ isAuthenticated: true });
    } else {
        res.json({ isAuthenticated: false });
    }
});

app.get('/auth/logout', (req, res) => {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('user_email');
    res.json({ success: true });
});

app.get('/auth/user', setOAuthCredentials, async (req, res) => {
    try {
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });
        const { data } = await oauth2.userinfo.get();
        res.json(data);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Failed to fetch user data');
    }
});

const drive = google.drive('v3');

app.get('/api/drive/read', setOAuthCredentials, async (req, res) => {
    try {
        const response = await drive.files.list({
            auth: oauth2Client,
            q: "name='chatbuddy_data.bin'",
            spaces: 'drive',
            fields: 'files(id, name, modifiedTime)',
        });

        if (response.data.files.length === 0) {
            return res.status(404).send('File not found');
        }

        const fileId = response.data.files[0].id;
        const modifiedTime = response.data.files[0].modifiedTime;

        const fileResponse = await drive.files.get(
            { auth: oauth2Client, fileId: fileId, alt: 'media' },
            { responseType: 'arraybuffer' }
        );

        const compressedData = Buffer.from(fileResponse.data);
        const decompressedData = pako.ungzip(compressedData, { to: 'string' });
        const jsonData = JSON.parse(decompressedData);

        res.json({ modifiedTime, data: jsonData });

    } catch (error) {
        console.error('Error reading from Google Drive:', error);
        res.status(500).send('Failed to read from Google Drive');
    }
});

app.post('/api/drive/write', setOAuthCredentials, async (req, res) => {
    const compressedData = req.body;

    try {
        const listResponse = await drive.files.list({
            auth: oauth2Client,
            q: "name='chatbuddy_data.bin'",
            spaces: 'drive',
            fields: 'files(id)',
        });

        const fileMetadata = {
            name: 'chatbuddy_data.bin',
        };

        const media = {
            mimeType: 'application/octet-stream',
            body: stream.Readable.from(compressedData)
        };

        if (listResponse.data.files.length > 0) {
            const fileId = listResponse.data.files[0].id;
            await drive.files.update({
                auth: oauth2Client,
                fileId: fileId,
                media: media,
            });
            res.send('File updated successfully');
        } else {
            await drive.files.create({
                auth: oauth2Client,
                resource: fileMetadata,
                media: media,
                fields: 'id'
            });
            res.send('File created successfully');
        }
    } catch (error) {
        console.error('Error writing to Google Drive:', error);
        res.status(500).send('Failed to write to Google Drive');
    }
});


// --- Constants ---
const MODELS = [
    'gemma-3-27b-it',   // Basic Model
    'gemini-2.5-flash-lite',    // Advanced Model
    'gemini-2.0-flash-preview-image-generation',    // Image Model
    'gemma-3-12b-it'     // Memory & Format Handler
];
const GEMMA_HISTORY_LIMIT_CHARS = 6000 * 4;
const GEMINI_HISTORY_LIMIT_CHARS = 64000 * 4;
const GEMINI_PRO_HISTORY_LIMIT_CHARS = 128000 * 4;

const basic = require('./ModelInstructions/BASIC_MODEL_SYS_INS');
const advance = require('./ModelInstructions/ADVANCE_MODEL_NoWeb_SYS_INS');
const advance_web = require('./ModelInstructions/ADVANCE_MODEL_Web_SYS_INS');
const advance_thinking = require('./ModelInstructions/ADVANCE_THINK_NoWeb_SYS_INS');
const advance_thinking_web = require('./ModelInstructions/ADVANCE_THINK_Web_SYS_INS');

const INTERNAL_MEMORY_PROMPT = require('./ModelInstructions/InstructionAbstraction/CoreInstructionMemory');


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
    image: { maxM: 3, maxD: 25 },
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
        const userEmail = req.cookies.user_email;
        let userId;

        if (userApiKey && typeof userApiKey === 'string' && userApiKey.trim() !== '') {
            userId = crypto.createHash('sha256').update(userApiKey).digest('hex');
        } else if (userEmail) {
            userId = crypto.createHash('sha256').update(userEmail).digest('hex');
        } else {
            userId = getIp(req);
        }

        const limitKey = `${userId}:${modelIndex}`;
        const now = new Date();

        if (!rateLimitDB[limitKey]) {
            // If the user has no record, they are definitely allowed.
            return { allowed: true };
        }

        const limitRecord = rateLimitDB[limitKey];
        const lastUpdateM = new Date(limitRecord.lastUpdateM);

        if (new Date(limitRecord.lastUpdateD).toISOString().slice(0, 10) < new Date().toISOString().slice(0, 10)) {
            limitRecord.hitD = 0;
            limitRecord.hitM = 0;
        }

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
        const userEmail = req.cookies.user_email;
        let userId;

        if (userApiKey && typeof userApiKey === 'string' && userApiKey.trim() !== '') {
            userId = crypto.createHash('sha256').update(userApiKey).digest('hex');
        } else if (userEmail) {
            userId = crypto.createHash('sha256').update(userEmail).digest('hex');
        } else {
            userId = getIp(req);
        }

        const limitKey = `${userId}:${modelIndex}`;
        const now = new Date();

        if (!rateLimitDB[limitKey]) {
            rateLimitDB[limitKey] = { hitM: 1, hitD: 1, lastUpdateM: now.toISOString(), lastUpdateD: now.toISOString() };
            await saveRateLimitDB();
            return;
        }

        const limitRecord = rateLimitDB[limitKey];
        const lastUpdateM = new Date(limitRecord.lastUpdateM);

        // Reset minute counter if window is expired
        if (now.getTime() - lastUpdateM.getTime() > 60 * 1000) {
            limitRecord.hitM = 1;
        } else {
            limitRecord.hitM++;
        }
        limitRecord.lastUpdateM = now.toISOString(); // Always update last minute-update time

        // Reset daily counter if date has changed
        if (new Date(limitRecord.lastUpdateD).toISOString().slice(0, 10) < now.toISOString().slice(0, 10)) {
            limitRecord.hitD = 1;
        } else {
            limitRecord.hitD++;
        }
        limitRecord.lastUpdateD = now.toISOString(); // Always update last day-update time


        await saveRateLimitDB();

    } catch (error) {
        console.error("ERROR incrementing hit count:", error);
    }
}



app.post('/checkLimit', async (req, res) => {
    try {
        const { apiKey: userApiKey } = req.body;
        const userEmail = req.cookies.user_email;
        let userId;

        if (userApiKey && typeof userApiKey === 'string' && userApiKey.trim() !== '') {
            userId = crypto.createHash('sha256').update(userApiKey).digest('hex');
        } else if (userEmail) {
            userId = crypto.createHash('sha256').update(userEmail).digest('hex');
        } else {
            // No identifier, so no limits to check
            return res.json({ basic: 0, advance: 0, image: 0 });
        }

        const today = new Date().toISOString().slice(0, 10);
        const usage = { basic: 0, advance: 0, image: 0 };

        for (let i = 0; i < 3; i++) {
            const limitKey = `${userId}:${i}`;
            const modelType = i === 0 ? 'basic' : i === 1 ? 'advance' : 'image';

            if (rateLimitDB[limitKey]) {
                const limitRecord = rateLimitDB[limitKey];
                const lastUpdateDate = new Date(limitRecord.lastUpdateD).toISOString().slice(0, 10);

                if (lastUpdateDate === today) {
                    usage[modelType] = limitRecord.hitD || 0;
                }
            }
        }

        res.json(usage);

    } catch (error) {
        console.error("ERROR during /checkLimit:", error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
});

// --- Troll ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'), (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send("Error loading application.");
        }
    });
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
        let maxFileSize = 50 * 1024 * 1024; // Fallback to global limit

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
    let { history, memory, temp, sys, modelIndex, creativeRP, advanceReasoning, webSearch, images, apiKey, isFirst, zoneInfo } = req.body;

    const limitResult = await checkRateLimit(req);
    if (!limitResult.allowed) {
        return res.status(limitResult.status).json({ error: { message: limitResult.message } });
    }

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

        const mainModels = async () => {

            let contextLimit = modelIndex === 0
                ? GEMMA_HISTORY_LIMIT_CHARS
                : (apiKey ? GEMINI_PRO_HISTORY_LIMIT_CHARS : GEMINI_HISTORY_LIMIT_CHARS);

            const truncatedHistory = getTruncatedHistory(history, contextLimit);

            const historyForSDK_NEW = truncatedHistory.map(msg => {
                const role = msg.role === 'assistant' ? 'model' : 'user';
                let parts = [];

                if (role === 'user' && images && images.length > 0) {
                    const associatedImages = images.filter(img => img.id === msg.id && img.uri);
                    associatedImages.forEach(img => {
                        parts.push(createPartFromUri(img.uri, img.mimeType));
                    });
                }

                let content;
                try {
                    content = JSON.parse(msg.content).response;
                } catch (err) { content = msg.content }
                parts.push(createPartFromText(content));

                return { role, parts };
            });

            let hasFiles;
            try {
                hasFiles = historyForSDK_NEW[historyForSDK_NEW.length - 1].parts.length === 2;
            }
            catch (err) { hasFiles = false; }

            let INTERNAL_SYSTEM_PROMPT = '';

            if (modelIndex === 0) INTERNAL_SYSTEM_PROMPT = basic(hasFiles, zoneInfo);
            else if (modelIndex === 1 && !advanceReasoning && !webSearch) INTERNAL_SYSTEM_PROMPT = advance(hasFiles, zoneInfo);
            else if (modelIndex === 1 && webSearch && !advanceReasoning) INTERNAL_SYSTEM_PROMPT = advance_web(hasFiles, zoneInfo);
            else if (modelIndex === 1 && advanceReasoning && !webSearch) INTERNAL_SYSTEM_PROMPT = advance_thinking(hasFiles, zoneInfo);
            else if (modelIndex === 1 && webSearch && advanceReasoning) INTERNAL_SYSTEM_PROMPT = advance_thinking_web(hasFiles, zoneInfo);

            const selectedModel = MODELS[modelIndex];

            let finalSystemPrompt = INTERNAL_SYSTEM_PROMPT;
            if (sys && sys.trim()) finalSystemPrompt += `\n\n--- START USER'S SYSTEM PROMPT ---\n${sys.trim()}\n--- END USER'S SYSTEM PROMPT ---`;
            if (memory && memory.length > 0) finalSystemPrompt += `\n\n--- START LONG-TERM MEMORIES ---\n- ${memory.join('\n- ')}\n--- END LONG-TERM MEMORIES ---`;
            if (temp && temp.length > 0) finalSystemPrompt += `\n\n--- START RECENT CHATS ---\n- ${temp.join('\n- ')}\n--- END RECENT CHATS ---`;

            let thought = '';
            let answer = '';
            let generatedImage = null;

            if (modelIndex === 0) { // Gemma logic
                const latestUserTurn = historyForSDK_NEW.pop();
                const latestUserMessageText = latestUserTurn.parts.map(p => p.text).join(' ');
                const gemmaMessageWithSystemPrompt = `${finalSystemPrompt}\n\n--- CURRENT PROMPT ---\nUSER: ${latestUserMessageText}`;

                latestUserTurn.parts = latestUserTurn.parts
                    .filter(p => p.text === undefined)
                    .concat(createPartFromText(gemmaMessageWithSystemPrompt)); // Add the combined prompt

                const gemmaContents = [...historyForSDK_NEW, latestUserTurn];


                result = await genAI.models.generateContent({
                    model: selectedModel,
                    contents: gemmaContents,
                    config: {
                        temperature: creativeRP ? 1.5 : 1,
                        topP: creativeRP ? 0.98 : 0.95,
                        topK: creativeRP ? 256 : 64,
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
                let prompt = historyForSDK_NEW[historyForSDK_NEW.length - 1].parts;

                result = await genAI.models.generateContent({
                    model: selectedModel,
                    contents: prompt,
                    config: {
                        responseModalities: [Modality.TEXT, Modality.IMAGE],
                        safetySettings: safetySettings,
                    },
                });
            }

            try {
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
            } catch (err) {

                let text = JSON.stringify({
                    action: 'chat',
                    target: [],
                    response: 'PROHIBITED CONTENT'
                })
                return res.status(200).json({
                    candidates: [{ content: { parts: [{ text }], role: 'model' } }]
                });

            }


            let mainText = '';
            if (generatedImage) {
                mainText = `${generatedImage.mimeType};base64,${generatedImage.base64Data}`;
            } else {

                mainText = answer.replace(/\\(?![ntr"'\\])/g, '\\');
            }
            return { mainText, thought }
        }

        const helper = async (mainModelText) => {

            let finalMemoryPrompt = INTERNAL_MEMORY_PROMPT(isFirst, zoneInfo);
            if (memory && memory.length > 0) finalMemoryPrompt += `\n\n--- START LONG-TERM MEMORIES ---\n- ${memory.join('\n- ')}\n--- END LONG-TERM MEMORIES ---`;

            contextLimit = 6000 * 4;

            let shortHistory = getTruncatedHistory(history, contextLimit);

            const historyForMemory = shortHistory.map(msg => {
                const role = msg.role === 'assistant' ? 'model' : 'user';
                let parts = [];

                let content;
                try {
                    content = JSON.parse(msg.content).response;
                } catch (err) { content = msg.content }
                parts.push(createPartFromText(content));

                return { role, parts };
            });

            const latestUserTurn = historyForMemory.pop();
            const latestUserMessageText = latestUserTurn.parts.map(p => p.text).join(' ');
            const memoryMessageWithSystemPrompt = `${finalMemoryPrompt}\n\n--- CURRENT PROMPT ---\nUSER: ${latestUserMessageText}\nMODEL RESPONSE: ${mainModelText.length > (5000 * 4) ? mainModelText.slice(0, (5000 * 4)) + '...' : mainModelText}}`;

            latestUserTurn.parts = latestUserTurn.parts
                .filter(p => p.text === undefined)
                .concat(createPartFromText(memoryMessageWithSystemPrompt));

            const memoryContents = [...historyForMemory, latestUserTurn];

            result = await genAI.models.generateContent({
                model: MODELS[3],
                contents: memoryContents,
                config: { safetySettings: safetySettings }
            });

            let text = result.candidates[0].content.parts[0].text;
            text = text.replace(/^```json\s*([\s\S]*?)\s*```$/m, "$1");
            return text;
        }

        // let [mainModel, format] = await Promise.all([mainModels(), helper()]);

        let mainModel = await mainModels();
        let format = await helper(mainModel.mainText);

        mainModel.mainText = mainModel.mainText.replace(/\[['"]?mem['"]?\s*=\s*[\s\S]*?\]/g, '');
        mainModel.mainText = mainModel.mainText.replace(/\[['"]?bio['"]?\s*=\s*[\s\S]*?\]/g, '');

        let text = '';
        try {
            text = JSON.parse(format);
            text = { ...text, response: `${mainModel.mainText}` };
            text = JSON.stringify(text);
        } catch (err) {
            text = mainModel.mainText;
        }


        if (mainModel.thought.length > 0) {
            text = mainModel.thought + text;
        }

        await incrementHitCount(req);

        res.status(200).json({
            candidates: [{ content: { parts: [{ text }], role: 'model' } }]
        });

    } catch (error) {
        console.error("GEMINI API ERROR:: ", error);
        if (error.toString().includes('503')) {
            const fallbackObject = {
                action: 'chat',
                target: [],
                response: "Server Overloaded. Try again later."
            };

            text = JSON.stringify(fallbackObject);

            res.status(200).json({
                candidates: [{ content: { parts: [{ text }], role: 'model' } }]
            });
            return;
        }

        if (error.toString().includes('429')) {
            const fallbackObject = {
                action: 'chat',
                target: [],
                response: "Server Busy. Try again later."
            };

            text = JSON.stringify(fallbackObject);

            res.status(200).json({
                candidates: [{ content: { parts: [{ text }], role: 'model' } }]
            });
            return;
        }

        let errorMessage = error;
        res.status(error.status || 500).json({
            candidates: [{ content: { parts: [{ errorMessage }], role: 'model' } }]
        });
    }

});

const startServer = async () => {
    await loadRateLimitDB();
    setInterval(saveRateLimitDB, 5 * 1000);
    app.listen(PORT, () => console.log(`Server Running on PORT: ${PORT}`));
};

startServer();
