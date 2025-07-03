"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const Header = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Check auth state on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.authenticated ? data.user : null));
  }, []);

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  // Logout logic
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  return (
    <>
      {/* Moving Strip */}
      <div className="w-full bg-[#ededed] py-2 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee-loop">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="font-bold text-gray-900 mx-4">
              New season, New skills! 😊
            </span>
          ))}
        </div>
      </div>

      {/* Header Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-black">Job Finder</span>
          </a>

          {/* Navigation Links */}
          <ul className="hidden md:flex space-x-6 text-gray-900 font-medium">
            <li><a href="trends" className="hover:text-blue-600">Trends</a></li>
            <li><a href="#" className="hover:text-blue-600">Directory</a></li>
            <li><a href="/industry" className="hover:text-blue-600">Industry</a></li>
            <li><a href="#" className="hover:text-blue-600">Market</a></li>
          </ul>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Profile Icon or Dropdown */}
                <div className="relative flex items-center">
                  <a href="/UserProfile">
                    {user.photo ? (
                      <img
                        src={`/uploads/${user.photo}`}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-lg text-black">
                        {user.email?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </a>
                </div>
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Show only if NOT logged in */}
                <a
                  href="/signup"
                  className="bg-black text-white px-4 py-2 rounded-lg font-medium"
                >
                  Sign Up
                </a>
                <a
                  href="/login"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Log In
                </a>
              </>
            )}
          </div>
        </div>
      </nav>
      <style>
        {`
          @keyframes marquee-loop {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee-loop {
            display: flex;
            gap: 1px;
            animation: marquee-loop 30s linear infinite;
            white-space: nowrap;
          }
        `}
      </style>
    </>
  );
};

export default Header;
