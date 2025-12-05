import React, { useState } from 'react';
import logo from '../assets/icon-512x512.png';
import { motion, AnimatePresence } from 'framer-motion';

const PrivacyModal = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
    onClick={onClose}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white/90 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-white/20 dark:border-white/10 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Privacy Policy</h2>
      <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300 leading-relaxed">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 mb-4">
          <p className="mb-2">
            <span className="font-semibold text-gray-900 dark:text-white">Data Privacy:</span> Your chats, memories, and API keys are <span className="font-bold text-red-500">not</span> logged or stored on the server.
          </p>
          <p className="mb-0">
            Google login credentials are stored locally in secure httpOnly cookies.
          </p>
        </div>
        <p className="mb-4 text-xs text-gray-500">
          *Uploaded files are stored for 48 hours on Google Cloud (according to <a href="https://ai.google.dev/gemini-api/docs/files" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Gemini Files API Policy</a>).
        </p>
        <p className="text-xs italic text-gray-400">
          To avoid file save in external project consider using your own API Key.
        </p>
      </div>
      <button
        onClick={onClose}
        className="mt-6 w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 rounded-xl font-medium transition-all active:scale-[0.98]"
      >
        Understood
      </button>
    </motion.div>
  </motion.div>
);

export default function Login({ handleLogin }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const isProd = window.location.hostname === 'chatbuddy2026.onrender.com';

  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-black overflow-hidden relative font-sans select-none selection:bg-purple-500/30">

      <AnimatePresence>
        {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      </AnimatePresence>

      {/* Background Gradient/Shape - Visible on both, acts as main background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{
            x: ["0%", "20%", "0%", "-20%", "0%"],
            y: ["-20%", "0%", "20%", "0%", "-20%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-20%] left-[-10%] aspect-[2/1.5] h-[70%] bg-purple-400/30 dark:bg-purple-600/30 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: '12s' }}
        />
        <motion.div
          animate={{
            x: ["0%", "-20%", "0%", "20%", "0%"],
            y: ["20%", "0%", "-20%", "0%", "20%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-20%] right-[-10%] aspect-[2/1.5] h-[70%] bg-blue-400/30 dark:bg-blue-600/30 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: '12s', animationDelay: '3s' }}
        />
        <motion.div animate={{ x: ["0%", "20%", "0%", "-20%", "0%"], y: ["-20%", "0%", "20%", "0%", "-20%"], }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[40%] left-[40%] aspect-[2/1.5] h-[40%] bg-indigo-300/20 dark:bg-indigo-500/20 rounded-full blur-[72px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '6s' }} />
      </div>

      {/* Desktop: Split Layout Container */}
      <div className="relative z-10 w-full flex flex-col md:flex-row h-screen">

        {/* Left Side (Desktop) / Top Side (Mobile) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full md:w-1/2 h-[45%] md:h-full flex flex-col items-center justify-end md:justify-center relative p-8 pb-0 md:pb-8"
        >
          {/* Logo Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            className="relative w-40 h-40 md:w-80 md:h-80 mb-4 md:mb-0"
          >
            {/* Glowing effect behind logo */}
            <div className="absolute inset-0 bg-purple-500/10 dark:bg-white/10 rounded-full blur-3xl transform scale-75" />

            <motion.img
              src={logo}
              alt="ChatBuddy Logo"
              onLoad={() => setIsImageLoaded(true)}
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className={`w-full h-full object-contain drop-shadow-2xl relative z-10 transition-opacity duration-700 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </motion.div>

          {/* Text visible mostly on Desktop, hidden/smaller on mobile if needed */}
          <div className="text-center md:text-left hidden md:block">
            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-white/60 tracking-tight mb-4">
              ChatBuddy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-md mx-auto md:mx-0 font-light">
              Your intelligent companion for seamless conversations.
            </p>
          </div>
        </motion.div>

        {/* Right Side (Desktop) / Bottom Side (Mobile) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full md:w-1/2 h-[55%] md:h-full flex flex-col items-center justify-start md:justify-center p-6 md:p-12 relative"
        >
          {/* Glass Card - Centered on Mobile, Right side on Desktop */}
          <div className="pointer-events-auto w-full max-w-md p-8 rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl flex flex-col items-center text-center">

            {/* Mobile-only Header inside card */}
            <div className="md:hidden mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">ChatBuddy</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Sign in to continue your journey.</p>
            </div>

            <div className="hidden md:block mb-10">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Get Started</h3>
              <p className="text-gray-600 dark:text-gray-400">Sign in to continue your journey</p>
            </div>

            <motion.button
              onClick={handleLogin}
              className="group w-full bg-white/50 hover:scale-[1.02] active:scale-[0.97] dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EB4335" />
              </svg>
              <span className="text-lg tracking-wide">Sign in with Google</span>
            </motion.button>

            {isProd && (
              <div className="mt-8 text-xs text-gray-500 dark:text-gray-500">
                By continuing, you agree to our{' '}
                <button
                  onClick={() => setShowPrivacy(true)}
                  className="underline hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                >
                  Privacy Policy
                </button>.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
