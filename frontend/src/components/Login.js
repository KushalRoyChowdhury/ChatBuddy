import React from 'react';
import logo from '../assets/icon-512x512.png'
import { useState } from 'react';

export default function Login({ handleLogin }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  return (
    <div className="flex flex-col select-none items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <div className="p-5 bg-white dark:bg-[rgb(30,30,30)] flex items-center justify-center gap-5 rounded-2xl shadow-md dark:shadow-lg dark:shadow-[rgb(50,50,50)]">

        <div className={`w-52 h-52 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-950 dark:brightness-[0.85] hidden md:block`}>
          <img onLoad={() => setIsImageLoaded(true)} src={logo} alt="ChatBuddy Logo" className={`w-full h-full object-contain transition-all duration-500 ease-in-out ${isImageLoaded ? 'opacity-100 blur-none scale-[1.2]' : 'opacity-0 blur-md scale-150'}`} />
        </div>

        <div className='h-52 flex flex-col justify-center items-center'>
          <h1 className="text-2xl font-bold mb-4">Welcome to ChatBuddy</h1>
          <p className="mb-6">Please log in to continue.</p>
          <button
            onClick={handleLogin}
            className="bg-white dark:bg-[rgb(40,40,40)] dark:text-gray-50 border active:scale-[0.98] transition-all border-gray-300 flex gap-2 justify-center items-center w-full hover:bg-gray-50 dark:hover:bg-[rgb(50,50,50)] text-gray-800 font-medium py-2 px-4 rounded-full shadow-sm duration-200"
          >
            <svg width="25" height="25" viewBox="-0.5 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.83 24c0-1.52.25-2.99.7-4.36L2.62 13.6C1.08 16.73.21 20.26.21 24s.87 7.26 2.41 10.39l7.9-6.05c-.45-1.36-.7-2.82-.7-4.34" fill="#FBBC05" />
              <path d="M23.71 10.13c3.31 0 6.3 1.17 8.65 3.09l6.84-6.4C35.04 2.77 29.7.53 23.71.53c-9.29 0-17.27 5.31-21.09 13.07l7.91 6.04c1.82-5.53 7.02-9.51 13.18-9.51" fill="#EB4335" />
              <path d="M23.71 37.87c-6.16 0-11.36-3.98-13.18-9.51l-7.91 6.04C6.45 42.16 14.43 47.47 23.71 47.47c5.73 0 11.2-2.03 15.31-5.85l-7.51-5.8c-2.12 1.33-4.79 2.05-7.81 2.05" fill="#34A853" />
              <path d="M46.15 24c0-1.39-.21-2.88-.53-4.27H23.71v9.07h12.6c-.63 3.09-2.35 5.47-4.8 7l7.51 5.81c4.31-4 7.11-9.97 7.11-17.61" fill="#4285F4" />
            </svg>
            Sign in with Google
          </button>
        </div>

      </div>
    </div>
  );
}
