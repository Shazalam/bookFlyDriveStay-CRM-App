'use client';

import { useEffect, ReactNode } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  children: ReactNode;
  isSubmitting?: boolean;
  status: "BOOKED" | "MODIFIED" | "CANCELLED" | "REFUND";
}

export default function Modal({ isOpen, onClose, onSubmit, title, children, isSubmitting = false, status }: ModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset'; // Re-enable scrolling when modal closes
    };
  }, [isOpen, onClose]);

  // Determine button text and color based on status
  const getButtonConfig = () => {
    switch (status) {
      case "BOOKED":
        return {
          text: 'Send Booking Confirmation',
          color: 'bg-green-600 hover:bg-green-700 disabled:bg-green-400',
          loadingText: 'Sending Confirmation...'
        };
      case "MODIFIED":
        return {
          text: 'Send Modification Details',
          color: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400',
          loadingText: 'Sending Modification...'
        };
      case "CANCELLED":
        return {
          text: 'Send Cancellation Notice',
          color: 'bg-red-600 hover:bg-red-700 disabled:bg-red-400',
          loadingText: 'Sending Cancellation...'
        };
      case "REFUND":
        return {
          text: 'Send Refund Notice',
          color: 'bg-red-600 hover:bg-red-700 disabled:bg-red-400',
          loadingText: 'Sending Refund...'
        };
      default:
        return {
          text: 'Send Email',
          color: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400',
          loadingText: 'Sending...'
        };
    }
  };

  const buttonConfig = getButtonConfig();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        {/* Updated Footer with Status-Based Button */}
        <div className="flex justify-end items-center gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition shadow-sm disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className={`px-5 py-2 text-white rounded-lg text-sm font-medium transition shadow-md flex items-center justify-center ${buttonConfig.color}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                {buttonConfig.loadingText}
              </>
            ) : (
              buttonConfig.text
            )}
          </button>
        </div>
      </div>
    </div>
  );
}