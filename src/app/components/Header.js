"use client";

import React, { useState, useEffect, useRef } from "react";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModel";
import ChatBox from "./ChatBox";
import PostaJobModel from "./PostaJobModel";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";

const Header = () => {
  const {
    showLoginModal,
    setShowLoginModal,
    showSignupModal,
    setShowSignupModal,
    searchTerm,
    setSearchTerm,
    showPostaJobModel,
    setShowPostaJobModel,
  } = useUI();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const dropdownRef = useRef(null);
  const { user, setUser } = useAuth();
  const router = useRouter();

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      // You can trigger API search here if needed
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch user session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated) setUser(data.user);
        else setUser(null);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, [setUser]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      await new Promise((resolve) => setTimeout(resolve, 200));

      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();
      if (!data.authenticated) {
        setUser(null);
        router.push("/");
        window.location.reload();
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Logout error:", err);
      setUser(null);
    }
  };

  return (
    <>
      <nav>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 overflow-x-hidden">
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap">
            {/* Left: Logo + Nav */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
              <a href="/" className="text-2xl font-bold text-gray-900 mb-1 md:mb-0">
                JobFinder.
              </a>
              <ul className="flex space-x-4 text-lg text-black font-medium">
                <li><a href="/trends" className="hover:text-blue-600">Trends</a></li>
                <li><a href="/recommendation" className="hover:text-blue-600">Recommendation</a></li>
                <li><a href="/industry" className="hover:text-blue-600">Industry</a></li>
                <li><button onClick={() => setShowChatbot(true)} className="hover:text-blue-600 text-black">Chatbot</button></li>
              </ul>
            </div>

            {/* Center: Search */}
            <div className="relative w-full max-w-[590px]">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                <FaSearch />
              </span>
              <input
                type="text"
                placeholder="Search by Jobs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 rounded-md bg-[#ededed] text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Right: Auth Buttons or Profile */}
            <div className="relative" ref={dropdownRef}>
              {user ? (
                <div className="relative">
                  <div
                    onClick={() => setShowDropdown((prev) => !prev)}
                    className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-semibold text-lg cursor-pointer border-2 border-gray-300"
                  >
                    {user?.username?.trim()?.charAt(0)?.toUpperCase() ||
                      user?.email?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </div>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-80">
                      <div className="px-4 py-3 text-sm text-gray-900 font-semibold border-b">
                        {user?.username || user?.email}
                      </div>
                      <ul className="text-sm text-gray-700">
                        <li>
                          <button
                            onClick={() => {
                              setShowDropdown(false);
                              router.push("/UserProfile");
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            Profile
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setShowDropdown(false);
                              router.push("/dashboard");
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            Dashboard
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setShowDropdown(false);
                              router.push("/notifications");
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            Favorites
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                          >
                            Logout
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-3">
                  <button
                    data-open-signup
                    onClick={() => setShowPostaJobModel(true)}
                    className=" text-black font-bold py-2 px-4 rounded hover:bg-gray-200"
                  >
                    Post a Job
                  </button>
                  <button
                    data-open-signup
                    onClick={() => setShowSignupModal(true)}
                    className="bg-black text-white font-bold py-2 px-4 rounded hover:bg-gray-800"
                  >
                    Sign Up
                  </button>
                  <button
                    data-open-login
                    onClick={() => setShowLoginModal(true)}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Log In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      {showSignupModal && <SignupModal onClose={() => setShowSignupModal(false)} />}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showPostaJobModel && <PostaJobModel onClose={() => setShowPostaJobModel(false)} />}

      {/* ✅ Chatbot Modal */}
      {showChatbot && <ChatBox onClose={() => setShowChatbot(false)} />}

    </>
  );
};

export default Header;
