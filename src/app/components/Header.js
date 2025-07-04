"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

const Header = ({ onSearch }) => {
  const [user, setUser] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearch) onSearch(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue, onSearch]);

  // Check user authentication
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.authenticated ? data.user : null));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  return (
    <>
      {/* Marquee Strip
      <div className=" bg-[#ededed] py-2 text-sm text-gray-700 font-medium">
        <div className="flex whitespace-nowrap animate-marquee-loop px-4">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="mx-6">
              New season, New skills!
            </span>
          ))}
        </div>
      </div> */}

      {/* Header */}
      <nav>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2 overflow-x-hidden">
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap">

            {/* Left: Logo + Nav */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
              <a href="/" className="text-2xl font-bold text-gray-900 mb-1 md:mb-0">Job Finder</a>
              <ul className="flex space-x-4 text-sm text-gray-800 font-medium">
                <li><a href="/trends" className="hover:text-blue-600">Trends</a></li>
                <li><a href="#" className="hover:text-blue-600">Directory</a></li>
                <li><a href="/industry" className="hover:text-blue-600">Industry</a></li>
                <li><a href="#" className="hover:text-blue-600">Market</a></li>
              </ul>
            </div>

            {/* Center: Search */}
            <div className="relative w-full max-w-[620px]">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                <FaSearch />
              </span>
              <input
                type="text"
                placeholder="Search by Jobs"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full py-2 pl-10 pr-4 rounded-md bg-[#ededed] text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {inputValue && (
                <button
                  onClick={() => setInputValue("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Right: Auth Buttons */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <a href="/UserProfile">
                    {user.photo ? (
                      <img
                        src={`/uploads/${user.photo}`}
                        alt="Profile"
                        className="w-9 h-9 rounded-full object-cover border border-gray-300"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center font-semibold text-gray-700">
                        {user.email?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </a>
                  <button
                    onClick={handleLogout}
                    className="text-sm py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a href="/signup" className="bg-black text-white font-bold py-2 px-4 rounded hover:bg-gray-900">
                    Sign Up
                  </a>
                  <a href="/login" className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600">
                    Log In
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Marquee Animation */}
      <style>{`
        @keyframes marquee-loop {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee-loop {
          display: flex;
          gap: 2rem;
          animation: marquee-loop 30s linear infinite;
          white-space: nowrap;
        }
      `}</style>
    </>
  );
};

export default Header;
