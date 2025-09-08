"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import Navbar from "./Navbar";
import toast from "react-hot-toast";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Mock user data - replace with actual authentication context
  const user = {
    name: "John Doe",
    email: "john.doe@example.com"
  };

  const handleLogout = useCallback(() => {
    // Implement logout logic here
    toast.success("Logged out successfully");
    router.push("/login");
  }, [router]);

  console.log("protected Routes")

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          setAuthorized(true);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) return <LoadingScreen />;
  if (!authorized) return null; // prevent flicker

  return (<>
    <Navbar user={user} onLogout={handleLogout} />
    {children}
  </>);
}
