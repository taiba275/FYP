"use client";

import React, { useState } from "react";

const Header = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <>
      {/* Moving Strip (Unchanged as per request) */}
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
          {/* Left Section (Logo) */}
          <a href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-black">Job Finder</span>
          </a>

          {/* Middle Section (Navigation Links) */}
          <ul className="hidden md:flex space-x-6 text-gray-900 font-medium">
            <li className="relative group">
              <a href="#">Trends</a>
              {/* <button
                onClick={toggleDropdown}
                className="flex items-center space-x-1 hover:text-blue-600"
              >
                <span>Explore</span>
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                  <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                    By Category
                  </a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                    By Technology
                  </a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                    Collections
                  </a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                    Blogs
                  </a>
                </div>
              )} */}
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Directory
              </a>
            </li>
            <li className="relative">
              <a href="#" className="hover:text-blue-600 flex items-center">
                Conferences
                <span className="ml-1 text-xs bg-black text-white px-2 py-1 rounded-full">
                  2
                </span>
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-600">
                Market
              </a>
            </li>
          </ul>

          {/* Right Section (Search, Profile, Buttons) */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <input
                type="text"
                className="w-64 pl-10 pr-4 py-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by Jobs"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 11a4 4 0 100-8 4 4 0 000 8zm2 2h2m4-4v2m2 2a6 6 0 00-6 6m6-6h2m-4 4v2"
                />
              </svg>
            </div>

            {/* Profile & Notifications */}
            <div className="relative flex items-center">
              <a
                href="/UserProfile"
                >
                 <img
                src="./Images/founder.jpeg"
                alt="Profile"
                className="w-11 h-10 rounded-full border border-gray-300"
              />
              </a>
             
              {/* <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-semibold rounded-full px-2">
                2
              </span> */}
            </div>

            {/* Buttons */}
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
          </div>
        </div>
      </nav>

      {/* Tailwind CSS animation for scrolling text */}
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