'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorComponentProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorComponent({
  title = 'Something went wrong',
  message = 'We couldn’t load the content. Please try again later.',
  onRetry,
}: ErrorComponentProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-md"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
