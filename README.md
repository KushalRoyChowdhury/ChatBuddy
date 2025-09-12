# 💬 ChatBuddy - Your Intelligent Conversational AI

Welcome to ChatBuddy, a feature-rich, application that brings the power of advanced AI model access directly to your desktop (AI Models connected through Gemini API. Those models are not for self-hosting). Built with React, it offers a persistent, configurable, and highly interactive chat experience.


### Try Live Now: *👉 [Click Here](https://chatbuddy2025.onrender.com) 👈*

![ChatBuddy Homepage](frontend/public/screenshot/home.png)


## ✨ Key Features

ChatBuddy is more than just a simple chatbot. It's packed with advanced features designed for power users and developers.

-   **🧠 Dual AI Models**: Seamlessly switch between two powerful models:
    -   **Basic Model (`gemma-3-27b-it`)**: A fast and capable model perfect for general conversation, quick tasks and Role-Plays.
    -   **Advanced Model (`gemini-2.5-flash`)**: A state-of-the-art model for complex reasoning, deep analysis, and creative generation.
    -   **� Advanced Reasoning Mode**: A special multi-pass mode for the Advanced model, designed to tackle highly complex problems by thinking through them step-by-step. Best for Coding & Reasoning Tasks.

-   **📝 Persistent State**: Your entire session is saved locally in your browser's `localStorage`. This includes:
    -   Chat History
    -   Saved Memories
    -   Model Selection
    -   System Prompt & API Key

-   **🧠 Advanced Memory System**: The AI has a sophisticated memory system to maintain context and learn from your conversations.
    -   **Permanent Memory**: Instruct the AI to `remember`, `forget`, or `update` key information for long-term recall.
    -   **Temporary Memory**: A short-term buffer that holds recent context, automatically managed to stay within token limits.

-   **🔧 Full Configurability**: Tailor the AI's behavior to your exact needs through the **Options** menu.
    -   **Custom System Prompt**: Define the AI's personality, rules, and objectives to tune its responses.
    -   **Bring Your Own API Key**: Use your personal Gemini API key to unlock higher rate limits and a massive context window (up to 128k tokens with the Advanced model).

-   **💻 Rich Markdown & Code Rendering**:
    -   Full Markdown support for formatting responses.
    -   Beautiful, syntax-highlighted code blocks with a one-click "Copy" button.

-   **🛠️ Utility Features**:
    -   **Export Chat**: Save your conversation history to a human-readable `.txt` file or a complete `.json` backup.
    -   **Import Chat**: Load a previous chat session from a `.json` file to continue where you left off.
    -   **Import Export Memories**: Take backup or add new memories from other devices.
    -   **Clear Chat/Memory**: Easily manage your session by clearing the chat or temporary memory.
    -   **Full App Reset**: A one-click option to reset the entire application to its default state.

-   **📱 Responsive Design**: A clean, modern, and fully responsive UI that works beautifully on both desktop and mobile devices.

## ⚙️ Technologies Used

This project is built with a modern and powerful tech stack:

-   **Frontend**:
    -   **React**: For building the user interface.
    -   **Tailwind CSS**: For utility-first styling.
    -   **Framer Motion**: For smooth and beautiful animations.
    -   **React Markdown**: For rendering AI responses with rich formatting.
    -   **React Syntax Highlighter**: For elegant code block rendering.
-   **Backend**: Node.js with Express.

## 🚀 Getting Started

To run ChatBuddy locally, you'll need to set up both the frontend and the backend.

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

**Uses Google AI API.**

ChatBuddy is designed to be flexible and powerful, giving you control over your AI experience.

### Default vs. Personal API Key

The application comes with a default API key that has strict rate limits to ensure fair use for everyone. For a significantly better experience, it is **highly recommended** to use your own free Gemini API key.

> **Note:** The default API key is for the developer-hosted public version. When running the application locally, you will need to provide your own API key.

> **Privacy Notice**: If using the public hosted version, none of your chats or details ate logged. All data stays between you and API service provider. For more details read [Google ToS](https://ai.google.dev/gemini-api/terms).


| Feature               | Default Server Key (Free Tier) [Per User]  | Your Own Key (Free Tier)                 |
| --------------------- | ------------------------------------------ | ---------------------------------------- |
| **Context Window**    | Basic: 6k / Advanced: 64k                  | Basic: 6k / **Advanced: 128k**           |
| **Rate Limits (RPM)** | Basic: 7 / Advanced: 3                     | Basic: 30 / **Advanced: 15**             |
| **Rate Limits (RPD)** | Basic: 500 / Advanced: 100                 | Basic: 14,350 / **Advanced: 1000**       |

> **NOTE:** *Context Window sizes are for chat history. Memories and System Prompts are not counted towards the mentioned limits.*

> Your Own API Key Limits are shown as per Google Free Quota *(Updated: 2025 SEP)*.


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
  "response": "Got it, Alex! I'll remember that you're a software developer."
}
```

-   `"action"`: Can be `remember`, `forget`, `update`, or `temp`.
-   `"target"`: The piece of information to act upon.
-   `"response"`: The user-facing text that gets displayed in the chat.

This allows for dynamic and context-aware conversations that evolve over time. You can view and manage all permanent memories from the "Saved Memories" modal.

## 📜 Source Code

The application source code (frontend and backend) is available on GitHub. Fork it, modify it, and make it your own. If you find it useful, please consider giving it a star!

---

*Thank you for using ChatBuddy!*

*v1.1 - By KushalRoyChowdhury*
