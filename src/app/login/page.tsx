"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast"; // ✅ make sure this is imported
import LoadingButton from "@/components/LoadingButton";
import { loginUser } from "../store/slices/authSlice";
import { useAppDispatch } from "../store/hooks";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  // async function handleLogin(e: React.FormEvent) {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const res = await fetch("/api/auth/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     const data = await res.json();
  //     console.log("login response =>", data);
  //     setLoading(false);

  //     if (res.ok && data.success) {
  //       toast.success("Login successful! Redirecting...");

  //       // 🚀 Redirect immediately when login succeeds
  //       router.push("/dashboard");
  //     } else {
  //       toast.error(data.error || "Invalid credentials");
  //     }
  //   }catch (err: unknown) {
  //     setLoading(false);
  //     const message = err instanceof Error ? err.message : "Error loading booking";
  //     toast.error(message || "Network error, please try again");
  //   }
  // }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const toastId = toast.loading("Signing in...");
    setLoading(true);
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      console.log("LoginPage login result:", result);
      setLoading(false);
      
      toast.success(`Welcome back, ${result?.user.name}!`, { id: toastId });

      router.push("/dashboard");
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : "Login failed ❌";
      toast.error(message, { id: toastId });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        {/* Brand */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow">
            ✈️
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">
            BookFlyDriveStay
          </h1>
          <p className="text-sm text-gray-500">Agent Login</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg p-3 bg-white placeholder-gray-400 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white placeholder-gray-400 text-gray-700  focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm pr-10"
                placeholder="Enter your password"
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
          </div>
          <>
            <LoadingButton
              type="submit"
              loading={loading}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
            >
              {loading ? (
                "Logging in..."
              ) : (
                "Login"
              )}
            </LoadingButton>
          </>
        </form>

        {/* Footer */}
        <p className="text-sm text-center text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-indigo-600 font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
