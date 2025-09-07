"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import LoadingButton from "@/components/LoadingButton";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast.success("Account created! Please log in.");
      router.push("/login");
    } else {
      toast.error(data.error || "Something went wrong");
    }
  }

  function getPasswordStrength(password: string) {
    if (password.length < 6) return { label: "Too short", color: "bg-red-500 w-1/4" };

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    const strength = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean)
      .length;

    if (strength <= 1) return { label: "Weak", color: "bg-red-500 w-1/4" };
    if (strength === 2) return { label: "Fair", color: "bg-yellow-500 w-2/4" };
    if (strength === 3) return { label: "Good", color: "bg-blue-500 w-3/4" };
    if (strength === 4 && password.length >= 8)
      return { label: "Strong", color: "bg-green-500 w-full" };

    return { label: "Weak", color: "bg-red-500 w-1/4" };
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        {/* Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg shadow">
            🚗
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">BookFlyDriveStay</h1>
          <p className="text-sm text-gray-500">Create your agent account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
              placeholder="John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg p-3 bg-white placeholder-gray-400 text-gray-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm"
              placeholder="yourname@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-sm pr-10"
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {/* Strength Meter */}
            {password && (
              <div className="mt-2">
                <div className="h-2 w-full bg-gray-200 rounded">
                  <div
                    className={`h-2 rounded transition-all duration-300 ${getPasswordStrength(password).color}`}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {getPasswordStrength(password).label}
                </p>
              </div>
            )}
          </div>

          <LoadingButton
            type="submit"
            loading={loading}
            className="w-full py-3 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Registering..." : "Register"}
          </LoadingButton>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
