"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import Navbar from "./Navbar";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { fetchCurrentUser, logoutUser } from "@/app/store/slices/authSlice";
import ErrorComponent from "./ErrorComponent";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  // ✅ Pull state from Redux properly
  const { user, loading, error } = useAppSelector((state) => state.auth);

  console.log("user Data=>", user)
  console.log("user loading=>", loading)
  const [authorized, setAuthorized] = useState(false);

  // ✅ Detect auth routes
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // 🔹 Fetch current user when app loads
  useEffect(() => {
    if (!user) dispatch(fetchCurrentUser()).unwrap();
  }, [dispatch, user]);

  // 🔹 Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      setAuthorized(false);
      setTimeout(() => {
        router.push("/login");
      }, 600);
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed. Please try again ❌");
    }
  }, [dispatch, router]);

  // 🔹 Check auth state whenever Redux updates
  // useEffect(() => {
  //   if (loading) return; // wait for fetch
  //   if (user) {
  //     setAuthorized(true);
  //     if (isAuthPage) {
  //       router.replace("/dashboard");
  //     }
  //   } else {
  //     setAuthorized(false);
  //     if (!isAuthPage) {
  //       router.replace("/login");
  //     }
  //   }
  // }, [user, loading, isAuthPage, router]);

  useEffect(() => {
    if (loading) return; // wait until fetch finishes

    if (user) {
      setAuthorized(true);

      // 🚀 Only redirect logged-in users if they are on login/register pages
      if (isAuthPage) {
        router.replace("/dashboard");
      }
    } else {
      setAuthorized(false);

      // 🚀 Only redirect logged-out users if they are trying to access protected pages
      if (!isAuthPage) {
        router.replace("/login");
      }
    }
  }, [user, loading, isAuthPage, router]);


  if (error) {
    return (
      <ErrorComponent
        title="Failed to Load Booking"
        message={error || "Unknown error occurred"}
      // onRetry={() => dispatch(fetchBookingById(id!))}
      />
    );
  }

  // 🌀 Show loader while checking auth
  if (loading) return <LoadingScreen />;

  // ✅ Auth pages: only visible when logged out
  if (isAuthPage && !authorized) {
    return <>{children}</>;
  }


  // ✅ Protected pages: only visible when logged in
  if (!isAuthPage && authorized) {
    return (
      <>
        <Navbar user={user!} onLogout={handleLogout} />
        {children}
      </>
    );
  }

  // 🚫 In all other cases → render nothing (redirect will happen)
  return null;
}

