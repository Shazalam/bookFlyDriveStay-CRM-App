"use client";

import { motion } from "framer-motion";
import { IoCarSport } from "react-icons/io5";

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">

      {/* Car icon with gentle bounce */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      >
        <IoCarSport className="text-indigo-600 w-14 h-14 md:w-16 md:h-16 drop-shadow-md" />
      </motion.div>

      {/* Smooth gradient loader ring */}
      <div className="mt-6 relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-purple-500 animate-spin-slow"></div>
      </div>

      {/* Subtle loading text */}
      <motion.p
        className="mt-6 text-gray-600 dark:text-gray-300 text-sm md:text-base font-medium tracking-wide"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        Loading, please wait...
      </motion.p>
    </div>
  );
}
