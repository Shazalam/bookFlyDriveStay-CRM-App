"use client";

import { useState } from "react";
import Image from "next/image";

interface VehicleSelectorProps {
  value: string; // current vehicleImage (Cloudinary URL)
  onChange: (url: string) => void; // callback when vehicleImage changes
}

export default function VehicleSelector({ value, onChange }: VehicleSelectorProps) {
  const [preview, setPreview] = useState(value || "");
  const [uploading, setUploading] = useState(false);

  async function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          setUploading(true);

          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (data.success) {
            const url = data.result.secure_url;
            setPreview(url);
            onChange(url); // ✅ only notify parent
          }

          setUploading(false);
        }
      }
    }
  }

  return (
    <div className="md:col-span-2 relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Vehicle Image (Paste from clipboard)
      </label>
      <input
        type="text"
        onPaste={handlePaste}
        placeholder="Click here and press Ctrl+V to paste an image"
        className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition hover:border-indigo-400"
      />

      {uploading && <p className="text-sm text-blue-500 mt-2">Uploading...</p>}

      {preview && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 shadow-xl overflow-hidden transition hover:shadow-2xl">
          <div className="flex flex-col items-center p-6">
            <div className="relative w-full max-w-md h-64 flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-md">
              <Image
                src={preview}
                alt="Vehicle"
                fill
                className="object-contain p-4"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
