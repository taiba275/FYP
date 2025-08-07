"use client";

import { useState, useEffect } from "react";
import { FaThLarge, FaList } from "react-icons/fa";
import { FaHeart, FaRegHeart } from "react-icons/fa"; // ❤️ icons
import JobDetailsModal from "../JobDetailsModal";
import { useAuth } from "../../context/AuthContext"; // auth context

function capitalizeWords(str = "") {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function capitalizeSentences(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .split(/([.?!]\s*)/g)
    .map((part, i) =>
      i % 2 === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part
    )
    .join("");
}

export default function Posts({ jobs = [], viewMode = "grid", setViewMode }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();

  // Fetch job details
  async function openJobDetails(id) {
    try {
      const res = await fetch(`/api/jobs/${id}`);
      const data = await res.json();
      setSelectedJob(data);
    } catch (err) {
      console.error("Failed to fetch job:", err);
    }
  }

  // Fetch user's favorite jobs
  useEffect(() => {
    if (!user) return;
    fetch("/api/user/favorites", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const favIds = data.favorites?.map((j) => j._id) || [];
        setFavorites(favIds);
      });
  }, [user]);

  // Toggle favorite for a job
  const toggleFavorite = async (jobId) => {
    if (!user) return alert("Please log in to save jobs.");
    try {
      const res = await fetch("/api/user/favorites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      const favIds = data.favorites?.map((j) => j.toString()) || [];
      setFavorites(favIds);
    } catch (err) {
      console.error("Error updating favorites:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 md:px-8">
      {/* Job count and view toggle */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center mb-6">
        <p className="text-sm md:text-base text-gray-700 mb-2 md:mb-0">
          <strong className="text-black">{jobs.length}</strong> job opportunities waiting.
        </p>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode("list")}
            className="bg-gray-200 hover:bg-gray-400 p-1 rounded transition"
            title="List View"
          >
            <FaList className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className="bg-gray-200 hover:bg-gray-400 p-1 rounded transition"
            title="Grid View"
          >
            <FaThLarge className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Job cards */}
      <div
        className={`w-full ${
          viewMode === "list"
            ? "flex flex-col gap-4"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        }`}
      >
        {jobs.map((post) => (
          <div
            key={post._id}
            className={`cursor-pointer bg-white rounded-lg shadow-md p-5 border border-gray-200 
              hover:shadow-xl transition-transform hover:-translate-y-1 flex flex-col h-auto overflow-hidden
              relative ${viewMode === "list" ? "w-full" : ""}`}
          >
            {/* Heart icon */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (user) {
                  toggleFavorite(post._id);
                }
              }}
              className={`absolute top-3 right-3 text-xl z-10 ${
                user ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
              title={
                !user
                  ? "Login to save jobs"
                  : favorites.includes(post._id)
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              {favorites.includes(post._id) ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart className="text-gray-400 hover:text-red-500" />
              )}
            </div>

            <div className="flex justify-between items-center mb-3">
              <h5 className="text-lg font-semibold text-gray-900 truncate w-4/5">
                {capitalizeWords(post.Company)}
              </h5>
              {post.Remote && (
                <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md">
                  REMOTE
                </span>
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
                <strong>📍 Area:</strong> {post.Area || "Not mentioned"}
              </p>
              <p className="truncate">
                <strong>🌆 City:</strong> {post.City?.toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
              </p>
              <p
                className={`font-bold ${
                  post.Salary ? "text-green-500" : "text-yellow-500"
                }`}
              >
                <strong>💰 Salary:</strong> {post.Salary || "Not Disclosed"}
              </p>
            </div>
            <button
              onClick={() => openJobDetails(post._id)}
              className="w-full bg-gray-900 text-white py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
