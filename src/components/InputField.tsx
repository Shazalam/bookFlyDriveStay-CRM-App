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
  min?: string; // Make optional since not all input types need 
  step?: string; // Added for number inputs
  disabled?: boolean; // Added for disabled state
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
  min, // Destructure the min prop
  step, // Destructure the step prop
  disabled = false, // Destructure the disabled prop
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
        min={min} // Pass min to input element
        step={step} // Pass step to input element
        disabled={disabled} // Pass disabled to input element
        className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 placeholder-gray-400 
                   focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition 
                   hover:border-indigo-400"
      />
    </div>
  );
}
