"use client";

import { Loader2 } from "lucide-react";
import React from "react";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export default function LoadingButton({
  loading = false,
  children,
  className = "",
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium shadow transition 
        ${props.disabled || loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"} 
        ${className}`}
    >
      {loading && <Loader2 className="animate-spin h-5 w-5" />}
      {children}
    </button>
  );
}
