"use client";

import LoginModal from "./LoginModal";
import SignupModal from "./SignupModel";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import ReactDOM from "react-dom";
import { useAuth } from "../context/AuthContext";

const Header = ({ onSearch }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownAnchorRef = useRef(null);
  const router = useRouter();

  const { user, setUser } = useAuth();
  const dropdownTimer = useRef(null);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearch) onSearch(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue, onSearch]);

  // Fetch user on mount
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
      if (
        dropdownAnchorRef.current &&
        !dropdownAnchorRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // 1. Logout (expire cookie)
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // 2. Wait briefly to ensure cookie clears
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 3. Refetch /me with no-cache to confirm logout
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store", // <--- THIS IS CRITICAL
      });

      const data = await res.json();

      if (!data.authenticated) {
        setUser(null);
        router.push("/"); // redirect if needed
      } else {
        console.warn("Still authenticated. Forcing logout UI.");
        setUser(null); // fallback
      }
    } catch (err) {
      console.error("Logout error:", err);
      setUser(null); // fail-safe
    }
  };

  const renderDropdown = () =>
    ReactDOM.createPortal(
      <div
        className="fixed w-48 mt-2 bg-white border border-gray-200 rounded-lg shadow-md z-[9999]"
        style={{
          top:
            dropdownAnchorRef.current?.getBoundingClientRect().bottom + 8 + "px",
          left:
            dropdownAnchorRef.current?.getBoundingClientRect().right -
            192 + "px",
        }}
      >
        <div className="px-4 py-3 text-sm text-gray-900 font-semibold border-b">
          {user?.username || user?.email}
        </div>
        <ul className="text-sm text-gray-700">
          <li>
            <a href="/UserProfile" className="block px-4 py-2 hover:bg-gray-100">
              Profile
            </a>
          </li>
          <li>
            <a href="/dashboard" className="block px-4 py-2 hover:bg-gray-100">
              Dashboard
            </a>
          </li>
          <li>
            <a href="/notifications" className="block px-4 py-2 hover:bg-gray-100">
              Favorites
            </a>
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
      </div>,
      document.body
    );

  return (
    <>
      {/* Header */}
      <nav>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 overflow-x-hidden">
          <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap">
            {/* Left: Logo + Nav */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
              <a href="/" className="text-2xl font-bold text-gray-900 mb-1 md:mb-0">
                JobFinder.
              </a>
              <ul className="flex space-x-4 text-lg text-black font-medium">
                <li>
                  <a href="/trends" className="hover:text-blue-600">Trends</a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">Directory</a>
                </li>
                <li>
                  <a href="/industry" className="hover:text-blue-600">Industry</a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">Chatbot</a>
                </li>
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

            {/* Right: Auth Buttons or Profile */}
            <div
              className="flex items-center space-x-3 relative"
              ref={dropdownAnchorRef}
              onMouseEnter={() => {
                if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
                setShowDropdown(true);
              }}
              onMouseLeave={() => {
                dropdownTimer.current = setTimeout(() => {
                  setShowDropdown(false);
                }, 300);
              }}
            >
              {user ? (
                <>
                  <img
                    src={user.photo ? `/uploads/${user.photo}` : "/default-avatar.png"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-gray-300"
                  />
                  {showDropdown && renderDropdown()}
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      {showSignupModal && (
        <SignupModal onClose={() => setShowSignupModal(false)} />
      )}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
};

export default Header;
