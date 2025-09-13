"use client";

import React from "react";

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  min?: string;      // optional
  step?: string;     // optional
  disabled?: boolean;
  readOnly?: boolean;
  title?:""
}

export default function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  min,
  step,
  title,
  disabled = false,
  readOnly = false,     // ✅ added here
}: InputFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        min={min}
        step={step}
        title={title}
        disabled={disabled}
        readOnly={readOnly}   // ✅ now works
        className={`w-full border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition 
          hover:border-indigo-400
          ${disabled || readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
        `}
      />
    </div>
  );
}
