// components/Navbar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  FiPlus,
  FiLogOut,
  FiSettings,
  FiUser,
  FiHelpCircle,
  FiEdit3,
  FiXCircle,
} from "react-icons/fi";
import { IoCarSport } from "react-icons/io5"; // 🚗 car icon for branding

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const pathname = usePathname();

  // Don't render navbar on auth pages
  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (isAuthPage) return null;

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="mx-auto px-3 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center py-3">
          {/* Logo and title */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 group-hover:shadow-lg transition-transform duration-300">
              <IoCarSport className="w-10 h-10 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-blue-700 transition-colors">
              CRM
            </span>
          </Link>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {/* New Booking Button */}
            <Link
              href="/bookings/new"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 text-sm hover:scale-105"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Booking</span>
            </Link>

            {/* Modification Button */}
            {/* New Customer */}
            <Link
              href="/bookings/modification"
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 text-sm hover:scale-105"
            >
              <FiEdit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modification</span>
            </Link>


            {/* Cancellation Button */}
            <Link
              href="/bookings/cancel"
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-1.5 text-sm hover:scale-105"
            >
              <FiXCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cancellation</span>
            </Link>

            {/* User menu */}
            {user && (
              <div className="relative group ml-2">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        width={32} // Required
                        height={32} // Required
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <FiUser className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                </button>

                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-200">
                  <Link
                    href="/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiUser className="w-4 h-4 mr-2" />
                    Your Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiSettings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiHelpCircle className="w-4 h-4 mr-2" />
                    Help & Support
                  </Link>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={onLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer"
                  >
                    <FiLogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
