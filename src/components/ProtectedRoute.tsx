"use client";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import Navbar from "./Navbar";
import toast from "react-hot-toast";
import { logout } from "@/lib/auth/logout";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // ✅ Detect auth routes
  const isAuthPage = pathname === "/login" || pathname === "/register";

  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
  };

  const handleLogout = useCallback(async () => {
    // logout logic
    toast.success("Logged out successfully");
    setAuthorized(false);
    router.push("/login");
     if (authorized) return;
      setAuthorized(true);
  
      const toastId = toast.loading("Signing out...");
  
      try {
        await logout();
  
        toast.success("Signed out successfully ✅", { id: toastId });
  
        // 🔹 Redirect to login after a short delay for smooth UX
        setTimeout(() => {
          router.push("/login");
        }, 600);
      } catch (err) {
        console.error("Logout failed:", err);
        toast.error("Logout failed. Please try again ❌", { id: toastId });
      } finally {
        setAuthorized(false);
      }
  }, [router,authorized]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          setAuthorized(true);
          // ✅ If logged in and trying to access login/register → redirect
          if (isAuthPage) {
            router.replace("/dashboard");
          }
        } else {
          setAuthorized(false);
          // ✅ If not logged in and on protected route → redirect
          if (!isAuthPage) {
            router.replace("/login");
          }
        }
      } catch {
        setAuthorized(false);
        if (!isAuthPage) {
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router, isAuthPage]);

  if (loading) return <LoadingScreen />;

  // ✅ Auth pages: only visible when logged out
  if (isAuthPage && !authorized) {
    return <>{children}</>;
  }

  // ✅ Protected pages: only visible when logged in
  if (!isAuthPage && authorized) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        {children}
      </>
    );
  }

  // 🚫 In all other cases → render nothing (router will redirect anyway)
  return null;
}
