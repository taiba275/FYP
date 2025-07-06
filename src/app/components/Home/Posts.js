"use client";

import Link from "next/link";
import { FaThLarge, FaList } from "react-icons/fa";

function capitalizeWords(str = "") {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function capitalizeSentences(text = "") {
  return text
    .split(/([.?!]\s*)/g)
    .map((part, i) =>
      i % 2 === 0
        ? part.charAt(0).toUpperCase() + part.slice(1)
        : part
    )
    .join("");
}

export default function Posts({ jobs = [], viewMode = "grid", setViewMode }) {
  return (
    <div className="flex flex-col items-center justify-center w-full px-4 md:px-8">

      {/* ✅ Dynamic job count and view toggle */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center mb-6">
        <p className="text-sm md:text-base text-gray-700 mb-2 md:mb-0">
          <strong className="text-black">{jobs.length}</strong> job opportunities waiting.
        </p>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode('list')}
            className="bg-gray-200 hover:bg-gray-400 p-1 rounded transition"
            title="List View"
          >
            <FaList className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className="bg-gray-200 hover:bg-gray-400 p-1 rounded transition"
            title="Grid View"
          >
            <FaThLarge className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* ✅ Job cards grid */}
      <div
        className={`w-full ${
          viewMode === "list"
            ? "flex flex-col gap-4"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        }`}
      >
        {jobs.map((post) => (
          <Link key={post._id} href={`/jobs/${post._id}`} passHref>
            <div
              className={`cursor-pointer bg-white rounded-lg shadow-md p-5 border border-gray-200 
                hover:shadow-xl transition-transform hover:-translate-y-1 flex flex-col h-auto overflow-hidden
                ${viewMode === "list" ? "w-full" : ""}`}
            >
              <div className="flex justify-between items-center mb-3">
                <h5 className="text-lg font-semibold text-gray-900 truncate w-4/5">
                  {capitalizeWords(post.Company)}
                </h5>
                {post.Remote && (
                  <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md">REMOTE</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                {capitalizeWords(post.Title)}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3 overflow-hidden">
                {capitalizeSentences(post.Description)}
              </p>
              <div className="flex flex-col text-sm text-gray-500 mb-3">
                <p className="truncate">
                  <span className="font-semibold">📍 Area:</span> {post.Area || "Not mentioned"}
                </p>
                <p className="truncate">
                  <span className="font-semibold">🌆 City:</span> {post.City}
                </p>
                <p className={`font-bold ${post.Salary ? "text-green-500" : "text-yellow-500"}`}>
                  <span className="font-semibold">💰 Salary:</span> {post.Salary || "Not Disclosed"}
                </p>
              </div>
              <button className="w-full bg-gray-900 text-white py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition">
                View Details
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
