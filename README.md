# 💬 ChatBuddy - Your Intelligent Conversational AI

Welcome to ChatBuddy, a feature-rich web application that brings the power of advanced AI models directly to your browser. Built with React and Node.js, and powered by the latest `@google/genai` SDK (AI Models can not run locally), it offers a persistent, configurable, and highly interactive chat experience.

### Try Live Now: *👉 [Click Here](https://chatbuddy2026.onrender.com) 👈*

![ChatBuddy Homepage](frontend/public/screenshot/home.png)

## 📜 Table of Contents

- [✨ Key Features](#-key-features)
- [⚙️ Technologies Used](#️-technologies-used)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [🤖 AI Models & API Keys](#-ai-models--api-keys)
  - [Public Version and Privacy Policy](#public-version-and-privacy-policy)
  - [How to get your key](#how-to-get-your-key)
- [🛠️ How the Memory System Works](#️-how-the-memory-system-works)
- [🤝 Contributing](#-contributing)
- [📜 Source Code](#️-source-code)
- [📝 Future Updates](#-future-updates)
- [⚠️ Disclaimer](#️-disclaimer)

## ✨ Key Features

ChatBuddy is more than just a simple chatbot. It's packed with advanced features designed for power users and developers.

-   **💬 Multi-Chat Support**: Manage multiple conversations at once. Each chat is saved independently, allowing you to switch between different topics and contexts without losing your history.
-   **🖼️ Image Sharing**: Upload and discuss images directly in the chat.
-   **🎬 Video & Audio Sharing**: Share video and audio files with the Advanced Model.
-   **📂 File Sharing**: Share documents and text files (`PDF`, `TXT`, `DOCX`, etc.).
-   **🎨 Image Generation**: Create 1k resolution images in any aspect ratio from your text descriptions.
-   **🧠 Multiple Models**: Seamlessly switch between a fast, general-purpose model and a state-of-the-art advanced model for complex tasks.
-   **💭 Advanced Reasoning Mode**: A special mode for the Advanced model to tackle complex problems step-by-step.
-   **🤔 Model Thinking Transparency**: See the AI's reasoning process.
-   **🔎 Google Search**: The advanced model can access Google Search for up-to-date information.
-   **📝 Persistent State**: Your session is saved in `localStorage` and can be synced with Google Drive.
-   **🔄 Cross-Device Sync**: Sync your chat history and memories across multiple devices via Google Drive.
-   **🧠 Advanced Memory System**: A sophisticated memory system to maintain context and learn from conversations.
-   **🔧 Full Configurability**: Tailor the AI's behavior with custom instructions and your own API key.
-   **💻 Rich Markdown & Code Rendering**: Full GFM Markdown and LaTeX support.
-   **🛠️ Utility Features**: Export/import chats, memories, and full app data.
-   **📱 Responsive Design**: A clean, modern, and fully responsive UI.
-   **🌗 Auto Dark Mode**: The UI automatically adapts to your system's theme.
-   **🚄 Performance Friendly**: Enjoy a smooth and snappy UI with memoized components; for an even smoother experience, especially on lower-end devices, you can toggle off **Advanced Rendering** in the **Settings** menu.

---

## ⚙️ Technologies Used

-   **Frontend**: React, Tailwind CSS, Framer Motion
-   **Backend**: Node.js with Express, @google/genai SDK

---

## 🚀 Getting Started

To use ChatBuddy locally, you'll need to set up both the frontend and the backend. For self-hosting with cloud sync capabilities (Google Drive API), a Google Cloud project with OAuth2 Consent Setup is required.

### Prerequisites

-   Node.js (which includes npm)

### Frontend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/KushalRoyChowdhury/ChatBuddy
    cd ChatBuddy/frontend
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

1.  **Navigate to the backend directory:**
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
    The backend server will start on port `8000`.

---

## 🤖 AI Models & API Keys

Powered by the official Google AI SDK (`@google/genai`).

### Public Version and Privacy Policy

On the hosted version, the app has strict rate limits. It is **highly recommended** to use your own free Gemini API key for a better experience.

| Feature               | Without Personal Key (Free Tier)           | With Personal Key (Free Tier)                   |
| --------------------- | ------------------------------------------ | ----------------------------------------------- |
| **Context Window**    | Basic: 6k / Advanced: 64k                  | Basic: 6k / *Advanced: 128k*                    |
| **Rate Limits (RPM)** | Basic: 7 / Advanced: 3 / Image Gen: 3      | Basic: 30 / Advanced: 15 / Image Gen: 10        |
| **Rate Limits (RPD)** | Basic: 500 / Advanced: 100                 | Basic: 14,350 / Advanced: 1000                  |

> **NOTE:** *Context Window sizes are only for chat history. Memories, System Prompts and other Referencing features are not counted towards the mentioned limits.*

> Your own API key limits are shown according to Google’s free quota *(Updated: September 2025)*.

> **Privacy Policy**: Your chats, memories, and API keys are not logged or stored on the server. Uploaded files are stored for 48 hours on Google Cloud. Google login credentials are stored locally in cookies.

### How to get your key

1.  Go to [Google AI Studio](https://aistudio.google.com).
2.  Click "Create API key".
3.  Paste the key into the "Gemini API Key" field in the ChatBuddy **Options** menu.

---

## 🛠️ How the Memory System Works

ChatBuddy uses a dual-model architecture. A helper model manages memory based on your conversation.

**Helper Model Actions**:
```json
{
  "action": "remember",
  "target": ["User's name is Alex."]
}
```
-   `"action"`: Can be `remember`, `forget`, `update`, or `temp`.
-   `"target"`: The information to act upon.

You can view and manage permanent memories from the `Saved Memories` modal.

---

## 🤝 Contributing

This project is considered feature-complete, but contributions for stability and security are welcome. If you find a bug or have a suggestion for improvement, please open an issue or submit a pull request.

---

## 📜 Source Code

The application source code is available on GitHub. If you find it useful, please consider giving it a star!

---

## 📝 Future Updates

With the release of `ChatBuddy v2.2.2`, this project is now considered feature-complete and no further feature enhancements are planned. However, it will continue to receive stability and security updates as needed.

---

## ⚠️ Disclaimer

**Version 2.0 and above is not backward compatible with data from v1.X.** Due to significant data structure changes, older `.json` files & chats cannot be imported. Permanent Memories will be migrated automatically.

---

*Thank you for using ChatBuddy!*

*v2.3.1-LTS - By KushalRoyChowdhury*
