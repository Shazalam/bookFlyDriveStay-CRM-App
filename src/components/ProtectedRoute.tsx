"use client";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import Navbar from "./Navbar";
import toast from "react-hot-toast";
import { logout } from "@/lib/auth/logout";
import { fetchCurrentUser } from "@/app/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  // ✅ Detect auth routes
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Fetch current user using Redux thunk
  useEffect(() => {
    if (user) return; // already have user
    dispatch(fetchCurrentUser())
      .unwrap()
      .catch((error) => {
        console.error("Failed to fetch user:", error);
        toast.error("Failed to load user information");
      });
  }, [dispatch, user]);

  const handleLogout = useCallback(async () => {
    console.log("handleLogout");
    setLoading(true);

    const toastId = toast.loading("Signing out...");

    try {
      await logout(); // <-- your API call to clear session

      setAuthorized(false); // reset auth state immediately

      toast.success("Signed out successfully ✅", { id: toastId });

      setTimeout(() => {
        router.push("/login");
      }, 600);
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed. Please try again ❌", { id: toastId });
      // stay on same route if logout fails
    } finally {
      setLoading(false);
    }
  }, [router]);


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
        {user && <Navbar user={user} onLogout={handleLogout} />}
        {children}
      </>
    );
  }

  // 🚫 In all other cases → render nothing (router will redirect anyway)
  return null;
}