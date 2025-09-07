"use client";

import { motion } from "framer-motion";
import { IoCarSport } from "react-icons/io5";

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      
      {/* Animated Car with bounce */}
      <motion.div
        initial={{ x: "-100vw" }}
        animate={{ x: "100vw" }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        className="w-full overflow-hidden"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="w-fit mx-auto"
        >
          <IoCarSport className="text-indigo-600 w-16 h-16 md:w-20 md:h-20 drop-shadow-lg" />
        </motion.div>
      </motion.div>

      {/* Road line animation */}
      <motion.div
        animate={{ backgroundPositionX: ["0%", "100%"] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="w-48 h-1 mt-2 bg-gradient-to-r from-transparent via-indigo-400 to-transparent bg-[length:200%_100%] rounded-full"
      />

      {/* Loading Text with fade effect */}
      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Loading...
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm md:text-base">
          Please wait while we prepare your bookings and vehicles 🚗✈️
        </p>
      </motion.div>

      {/* Fancy Gradient Spinner */}
      <div className="mt-10 relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-purple-500 border-b-indigo-400 border-l-purple-300 animate-spin"></div>
      </div>
    </div>
  );
}
