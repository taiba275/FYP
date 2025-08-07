"use client";

import React, { useState, useEffect, useRef } from "react";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModel";
import ChatBox from "./ChatBox";
import Resume from "./Resume";
import PostaJobModel from "./PostaJobModel";
import { useRouter } from "next/navigation";
import { FaSearch, FaBars, FaTimes } from "react-icons/fa";
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
  const [showResume, setShowResume] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });
  const dropdownTimeout = useRef(null);

  useEffect(() => {
    return () => clearTimeout(dropdownTimeout.current);
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showDropdown && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - 192 + window.scrollX,
      });
    }
  }, [showDropdown]);

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

  const renderNavLinks = () => (
    <>
      <li><a href="/trends" className="hover:text-blue-600 block py-2">Trends</a></li>
      <li><a href="/recommendation" className="hover:text-blue-600 block py-2">Recommendation</a></li>
      <li><a href="/industry" className="hover:text-blue-600 block py-2">Industry</a></li>
      <li><button onClick={() => setShowChatbot(true)} className="hover:text-blue-600 block py-2">Chatbot</button></li>
      <li><button onClick={() => setShowResume(true)} className="hover:text-blue-600 block py-2">Resume</button></li>
    </>
  );

  return (
    <>
      <nav>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Logo */}
          <div className="flex items-center space-x-4">
            <a href="/" className="text-2xl font-bold text-gray-900">JobFinder.</a>
          </div>

          {/* Middle: Nav Links */}
          <ul className="hidden lg:flex space-x-6 text-lg text-black font-medium">
            {renderNavLinks()}
          </ul>

          {/* Center: Search bar (ALWAYS visible) */}
          <div className="relative max-w-[560px] w-full flex-1 sm:flex-initial">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search by Jobs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 rounded bg-[#ededed] text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Right: Auth or Profile */}
          <div className="hidden lg:flex items-center space-x-4" ref={dropdownRef}>
            {user ? (
              <div className="relative flex items-center gap-3">
                <button
                  onClick={() => router.push("/jobs/post")}
                  // className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
                  // className="bg-black text-white font-bold py-2 px-4 rounded hover:bg-gray-800"
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-bold hover:bg-gray-300 transition"
                >
                  Post a Job
                </button>
                <div
                  onMouseEnter={() => {
                    clearTimeout(dropdownTimeout.current);
                    setShowDropdown(true);
                  }}
                  onMouseLeave={() => {
                    dropdownTimeout.current = setTimeout(() => {
                      setShowDropdown(false);
                    }, 300);
                  }}
                  className="relative"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-semibold text-lg cursor-pointer border-2 border-gray-300">
                    {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                  </div>

                  {/* Dropdown */}
                  {showDropdown && (
                    <div
                      className="fixed w-48 bg-white mt-1 border border-gray-200 rounded shadow-lg z-[9999]"
                      style={{ top: dropdownCoords.top, left: dropdownCoords.left }}
                    >
                      <div className="px-4 py-3 text-sm text-gray-900 font-semibold border-b break-words max-w-full truncate">
                        {user?.username || user?.email}
                      </div>
                      <ul className="text-sm text-gray-700">
                        <li>
                          <button onClick={() => { setShowDropdown(false); router.push("/UserProfile"); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">Profile</button>
                        </li>
                        <li>
                          <button onClick={() => { setShowDropdown(false); router.push("/jobsPosted"); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">Jobs Posted</button>
                        </li>
                        <li>
                          <button onClick={() => { setShowDropdown(false); router.push("/favorites"); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">Favorites</button>
                        </li>
                        <li>
                          <button onClick={() => { setShowDropdown(false); handleLogout(); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">Logout</button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex space-x-3">
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

          {/* Hamburger: visible below lg */}
          <div className="lg:hidden">
            <button onClick={() => setMobileMenuOpen(true)} className="text-xl text-gray-700">
              <FaBars />
            </button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div
            className="fixed text-black inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-72 bg-white h-full p-6 shadow-md overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <FaTimes />
                </button>
              </div>
              <ul className="space-y-4">{renderNavLinks()}</ul>

              <div className="mt-6">
                {user ? (
                  <>
                    <button onClick={() => { router.push("/jobs/post"); setMobileMenuOpen(false); }} className="w-full mb-2 bg-black py-2 rounded text-white">Post a Job</button>
                    <button onClick={() => { router.push("/UserProfile"); setMobileMenuOpen(false); }} className="w-full mb-2 border py-2 rounded">Profile</button>
                    <button onClick={() => { router.push("/jobsPosted"); setMobileMenuOpen(false); }} className="w-full mb-2 border py-2 rounded">Jobs Posted</button>
                    <button onClick={() => { router.push("/favorites"); setMobileMenuOpen(false); }} className="w-full mb-2 border py-2 rounded">Favorites</button>
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full mt-2 bg-red-600 text-white py-2 rounded">Logout</button>
                  </>
                ) : (
                  <>
                    <button
                      data-open-signup
                      onClick={() => { setShowSignupModal(true); setMobileMenuOpen(false); }}
                      className="w-full mb-2 bg-black text-white py-2 rounded"
                    >
                      Sign Up
                    </button>
                    <button
                      data-open-login
                      onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }}
                      className="w-full bg-blue-500 text-white py-2 rounded"
                    >
                      Log In
                    </button>

                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Modals */}
      {showSignupModal && <SignupModal onClose={() => setShowSignupModal(false)} />}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showPostaJobModel && <PostaJobModel onClose={() => setShowPostaJobModel(false)} />}
      {showChatbot && <ChatBox onClose={() => setShowChatbot(false)} />}
      {showResume && <Resume onClose={() => setShowResume(false)} />}
    </>
  );
};

export default Header;
