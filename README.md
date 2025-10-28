# 💬 ChatBuddy - Your Intelligent Conversational AI 

Welcome to ChatBuddy, a feature-rich web application that brings the power of advanced AI models directly to your browser (AI models can't be run locally). Built with React and Node.js, powered by the latest `@google/genai` SDK, it offers a persistent, configurable, and highly interactive chat experience.


### Try Live Now: *👉 [Click Here](https://chatbuddy2026.onrender.com) 👈*

![ChatBuddy Homepage](frontend/public/screenshot/home.png) 


## ✨ Key Features

ChatBuddy is more than just a simple chatbot. It's packed with advanced features designed for power users and developers.

-   **💬 Multi-Chat Support**: Manage multiple conversations at once. Each chat is saved independently, allowing you to switch between different topics and contexts without losing your history.

-   **🖼️ Image Sharing**: Upload and discuss images directly in the chat. The AI can understand and analyze the content of your images, opening up new possibilities for visual-based conversations.

-   **🎬 Video & Audio Sharing**: Share video and audio files with the Advanced Model. The AI can process and understand the content, allowing for discussions and analysis of multimedia files.

-   **📂 File Sharing**: Share documents and text files (`PDF`, `TXT`, `DOCX`, etc.) with the Advanced Model. The AI can read and analyze the content of your files, making it perfect for summarizing documents, answering questions about reports, or analyzing data.

-   **🎨 Image Generation (`gemini-2.0-image-preview`)**: Create stunning 1k resolution images in any aspect ratio from your text descriptions. Bring your ideas to life with the power of AI-driven image synthesis, perfect for creative projects, brainstorming, or just for fun **AVAILABLE TILL 2025-NOV-12**.

-   **🧠 Dual AI Models**: Seamlessly switch between two powerful models:
    -   **Basic Model (`gemma-3-27b-it`)**: A fast and capable model perfect for general conversation, quick tasks and Role-Plays.
    -   **Advanced Model (`gemini-2.5-flash`)**: A state-of-the-art model for complex reasoning, deep analysis, and creative generation.
    -   **💭 Advanced Reasoning Mode**: A special multi-pass mode for the Advanced model, designed to tackle complex problems by thinking through them step-by-step. Best for Coding & Reasoning Tasks.
    -   **🤔 Model Thinking Transparency**: See the AI's step-by-step reasoning process for complex queries when using the Advanced Reasoning mode.
    -   **🔎 Google Search**: The advanced model can access Google Search to provide responses with the most up-to-date information.

-   **📝 Persistent State**: Your entire session is saved in your browser's `localStorage`, `sessionStorage`, `cookies`. `Google Drive` for Sync. This includes:
    -   Chat History
    -   Saved Memories
    -   Model Selection
    -   System Prompt & API Key
    -   Nickname

-   **🔄 Cross-Device Sync**: Sync your chat history and memories across multiple devices by linking your Google account. All data is securely stored in your Google Drive, ensuring you have access to your conversations anytime, anywhere, any device.

-   **🧠 Advance Memory System**: The AI has a sophisticated memory system to maintain context and learn from your conversations.
    -   **Permanent Memory**: Instruct the AI to `remember`, `forget`, or `update` key information for long-term recall. AI can also remember specific things based on context.
    -   **Temporary Memory**: A short-term buffer that holds recent chats, managed automatically by the application.

-   **🔧 Full Configurability**: Tailor the AI's behavior to your exact needs through the **Options** menu.
    -   **Custom System Prompt**: Define the AI's personality, rules, and objectives to tune its responses.
    -   **Bring Your Own API Key**: Use your personal Gemini API key to unlock higher rate limits and a massive context window (up to 128k tokens with the Advanced model).

-   **💻 Rich Markdown & Code Rendering**:
    -   Full Markdown support for formatting responses.
    -   LaTeX Rendering for Mathematical Equations.
    -   Beautiful, syntax-highlighted code blocks.

-   **🛠️ Utility Features**:
    -   **Export Chat**: Save your conversation history to a human-readable `.txt` file or a complete `.json` backup.
    -   **Import Chat**: Load a previous chat session from a `.json` file to continue where you left off.
    -   **Import / Export Memories**: Back up or add new memories from other devices.
    -   **Clear Chat/Memory**: Easily manage your session by clearing the chat or temporary memory.
    -   **Full App Reset**: A one-click option to reset the entire application to its default state.

-   **📱 Responsive Design**: A clean, modern, and fully responsive UI that works beautifully on both desktop and mobile devices.
-   **🚄 Performance Friendly**: Experience a smooth and snappy UI with memoized components.

## ⚠️ Disclaimer

**Version 2.0 and above is not backward compatible with data from v1.X** Due to significant data structure changes in this release, older `.json` chat files cannot be imported. Permanent Memories will be migrated automatically.

## ⚙️ Technologies Used

This project is built with a modern and powerful tech stack:

-   **Frontend**:
    -   **React**: For building the user interface.
    -   **Tailwind CSS**: For utility-first styling.
    -   **Framer Motion**: For smooth and beautiful animations.
-   **Backend**:
    -   Node.js with Express.
    -   @google/genai SDK

## 🚀 Getting Started

To use ChatBuddy locally, you'll need to set up both the frontend and the backend. For self-hosting with cloud sync capabilities, which is powered by the Google Drive API, a Google Cloud project with OAuth credentials is required.

### Prerequisites

-   Node.js (which includes npm)
-   A running instance of the ChatBuddy backend server.

### Frontend Setup (This Repository)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/KushalRoyChowdhury/ChatBuddy
    cd chatbuddy-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm start
    ```

    The application will be available at `http://localhost:3000`.

### Backend Setup

The backend server is required for the AI to function.

1.  **Navigate to the backend directory:**
    (Assuming you are in the `ChatBuddy` directory from the previous step)
    ```bash
    cd ../backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the server:**
    ```bash
    npm start
    ```

    The backend server will start, typically on port `8000`. The frontend is pre-configured to communicate with the backend on this port.



## 🤖 AI Models & API Keys

**Powered by the official Google AI SDK (`@google/genai`).**

ChatBuddy is designed to be flexible and powerful, giving you control over your AI experience.

### Public Version and Privacy (This information is not applicable if self-hosting)

On the hosted version, the app works without providing any keys but has strict rate limits to ensure fair use for everyone. For a significantly better experience, it is **highly recommended** to use your own free Gemini API key.


| Feature               | Without Personal Key (Free Tier)           | With Personal Key (Free Tier)                   |
| --------------------- | ------------------------------------------ | ----------------------------------------------- |
| **Context Window**    | Basic: 6k / Advanced: 64k                  | Basic: 6k / *Advanced: 128k*                    |
| **Rate Limits (RPM)** | Basic: 7 / Advanced: 3 / Image Gen: 3      | Basic: 30 / Advanced: 15 / Image Gen: 10        |
| **Rate Limits (RPD)** | Basic: 500 / Advanced: 100 / Image Gen: 25 | Basic: 14,350 / Advanced: 1000 / Image Gen: 100 |

> **NOTE:** *Context Window sizes are only for chat history. Memories, System Prompts and other Referencing features are not counted towards the mentioned limits.*

> Your own API key limits are shown according to Google’s free quota *(Updated: September 2025)*.

> **Privacy and Data Handling Policy (Public Hosted)**: None of your chats, memories, KEYs are logged/stored on the server. All data stays between you and API service provider. For more details read [Google ToS](https://ai.google.dev/gemini-api/terms). If you use the File Upload feature, the files will be stored for next 48 hours from uploading in Google Cloud Project (based on [Google Cloud Files Policy](https://ai.google.dev/gemini-api/docs/files)). All your  Google login Credentials are stored locally in your device. 


**How to get your key:**
1.  Go to [Google AI Studio](https://aistudio.google.com).
2.  Click "Create API key".
3.  Copy the key and paste it into the "Gemini API Key" field in the [ChatBuddy](https://chatbuddy2025.onrender.com/) **Options** menu.

## 🛠️ How the Memory System Works

The AI can manage its own memory based on your conversation. The App listens for specific JSON commands within its responses.

```json
{
  "action": "remember",
  "target": "The user's name is Alex and they are a software developer.",
}
```

-   `"action"`: Can be `remember`, `forget`, `update`, or `temp`.
-   `"target"`: The piece of information to act upon.

This allows for dynamic and context-aware conversations that evolve over time. You can view and manage all permanent memories from the "Saved Memories" modal.

**Memory is handled by `Gemma3-12b-it`**.

## 📜 Source Code

The application source code (frontend and backend) is available on GitHub. Fork it, modify it, and make it your own. If you find it useful, please consider giving it a star! The codebase has been improved for readability, making it easier for open-source contributors to get involved.


*Thank you for using ChatBuddy!*

*v2.1.1 - By KushalRoyChowdhury*
