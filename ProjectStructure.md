# 📂 Project Structure

This document provides a detailed overview of the ChatBuddy project structure. The repository is organized into two main parts: a `frontend` and a `backend`.

## 🌳 Root Directory

The root directory contains the core project files, including configuration, documentation, and the main application folders.

-   `.gitignore`: Specifies intentionally untracked files to be ignored by Git.
-   `changelogs.md`: A log of notable changes made to the project.
-   `LICENSE`: The MIT License file for the project.
-   `README.md`: The main README file with an overview of the project.
-   `frontend/`: The directory containing the React-based frontend application.
-   `backend/`: The directory containing the Node.js backend server.

## ⚛️ Frontend (`frontend/`)

The `frontend/` directory contains the complete React-based user interface.

-   `public/`: Holds the static assets and the main `index.html` file for the React application.
    -   `icon-192x192.png`: 192x192 pixel icon for the application.
    -   `icon-512x512.png`: 512x512 pixel icon for the application.
    -   `index.html`: The main HTML file that serves as the entry point for the React app.
    -   `manifest.json`: The web app manifest for PWA features.
    -   `robots.txt`: Instructions for web crawlers.
    -   `screenshot/`: Contains screenshots of the application.
-   `src/`: Contains the source code for the React application.
    -   `assets/`: Contains static assets like images.
    -   `components/`: Includes all the reusable React components that make up the UI, such as chat bubbles, message inputs, and modals.
    -   `hooks/`: Contains custom React hooks used for managing side effects and shared logic.
    -   `App.js`: The main component of the React application.
    -   `index.css`: The main stylesheet for the application.
    -   `index.js`: The entry point for the React application.
-   `.env.dev`: Environment variables for the development environment.
-   `package.json`: Defines the project's dependencies and scripts.
-   `package-lock.json`: Records the exact version of each dependency.
-   `tailwind.config.js`: Configuration file for the Tailwind CSS framework.

## ⚙️ Backend (`backend/`)

The `backend/` directory contains the Node.js and Express server that powers the application's backend.

-   `build/`: The production build of the frontend application, served by the backend.
-   `ModelInstructions/`: This folder contains the system instructions and context data for the different AI models, shaping their behavior and responses.
    -   `ChatBuddy_CoreInstructions/`: Core instructions for the ChatBuddy AI.
    -   `InstructionAbstraction/`: Abstractions for core instructions.
    -   `Model_Context_Data/`: Context data for the different AI models.
-   `.env.dev`: Environment variables for the development environment.
-   `index.js`: The main entry point for the server, responsible for handling API requests and communicating with the Google AI SDK.
-   `package.json`: Defines the project's dependencies and scripts.
-   `package-lock.json`: Records the exact version of each dependency.
