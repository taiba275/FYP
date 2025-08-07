"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function JobDetailsModal({ job, onClose }) {
  const modalRef = useRef();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !event.target.closest("#email-modal")
      ) {
        onClose();
      }
    }


    function handleEsc(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    if (!user || !job?._id) return;
    fetch("/api/user/favorites", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const exists = data.favorites?.some((j) => j._id === job._id);
        setIsFavorite(exists);
      });
  }, [user, job]);

  const toggleFavorite = async () => {
    if (!user) {
      alert("Please log in to save jobs.");
      return;
    }

    const res = await fetch("/api/user/favorites", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ jobId: job._id }),
    });

    const data = await res.json();
    const isNowFav = data.favorites?.some((j) => j.toString() === job._id);
    setIsFavorite(isNowFav);
  };

  if (!job) return null;

  function capitalizeWords(str = "") {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function capitalizeSentences(text = "") {
    return text
      .split(/([.?!]\s*)/g)
      .map((part, i) =>
        i % 2 === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part
      )
      .join("");
  }
  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    // If it's already a Date object or ISO string
    let date = new Date(dateValue);

    // If it's an invalid date (e.g. "30/10/2024"), manually parse it
    if (isNaN(date)) {
      // Try to parse "dd/mm/yyyy"
      const parts = String(dateValue).split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        date = new Date(`${year}-${month}-${day}`);
      }
    }

    if (isNaN(date)) return "Invalid date";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  function formatSalary(post) {
    const lower = post.salary_lower;
    const upper = post.salary_upper;
    const currency = post.currency || "PKR";

    const isValidNumber = (val) =>
      typeof val === "number" && !isNaN(val) && val > 0;

    if (isValidNumber(lower) && isValidNumber(upper)) {
      const formatWithCommas = (num) =>
        num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      return `${currency.toLowerCase()}. ${formatWithCommas(lower)} - ${formatWithCommas(upper)}/month`;
    }

    // Fallback to Salary string (dataset jobs)
    if (post.Salary && typeof post.Salary === "string") {
      return post.Salary;
    }

    return "Not mentioned";
  }

  const handleApplyNow = () => {
    if (job["Job URL"]) {
      window.open(job["Job URL"], "_blank");
    } else if (job.CompanyEmail) {
      setShowEmailModal(true);
    } else {
      alert("No application method available for this job.");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(job.CompanyEmail);
      setCopied(true); // trigger copied state
      setTimeout(() => setCopied(false), 2000); // hide after 2 seconds
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      const textArea = document.createElement("textarea");
      textArea.value = job.CompanyEmail;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err2) {
        alert("Failed to copy. Please do it manually.");
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <>
      {/* Overlay and Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div
          ref={modalRef}
          className="relative w-full max-w-6xl bg-white rounded-xl shadow-lg p-8 overflow-y-auto max-h-[90vh] custom-scrollbar"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {capitalizeWords(job.Title)}
          </h2>

          <p className="text-gray-700 text-lg mb-2">
            <strong>🏢 Company:</strong> {capitalizeWords(job.Company)}
          </p>
          <p className="text-gray-700 text-lg mb-2">
            <strong>📍 Location:</strong> {capitalizeWords(job.City)}
          </p>
          <p className="text-gray-700 text-lg mb-2">
            <strong>🧑‍💼 Experience:</strong> {job.Experience || "Not mentioned"}
          </p>
          <p className="text-gray-700 text-lg mb-2">
            <strong>🕒 Job Type:</strong> {job["Job Type"]}
          </p>
          <p className="text-gray-700 text-lg mb-2">
            <strong>📅 Posting Date:</strong> {formatDate(job["Posting Date"])}
          </p>
          <p className="text-gray-700 text-lg mb-4">
            <strong>⏳ Apply Before:</strong> {formatDate(job["Apply Before"])}
          </p>

          {/* <p >📅 Posting Date: {formatDate(job["Posting Date"])}</p>
          <p>⏳ Apply Before: {formatDate(job["Apply Before"])}</p> */}

          <p className="text-gray-700 text-lg mb-4">
            <strong>💰 Salary:</strong> {formatSalary(job)}
          </p>


          <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
            <strong className="text-2xl">Job Description</strong>
            <br />
            {capitalizeSentences(job.Description)}
          </p>

          {job.Skills && (
            <div className="mt-6">
              <strong className="text-lg text-gray-800">Required Skills:</strong>
              <ul className="list-disc list-inside mt-2 text-gray-700">
                {job.Skills.split(",").map((skill, index) => (
                  <li key={index}>{skill.trim()}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3 justify-end items-center">
            {/* Share Job */}
            <button
              onClick={() => {
                const jobUrl = `${window.location.origin}/jobs/${job._id}`;
                navigator.clipboard.writeText(jobUrl)
                  .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  })
                  .catch(() => alert("Failed to copy link"));
              }}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-lg font-medium hover:bg-gray-300 transition"
            >
              🔗 {copied ? "Link Copied!" : "Share Job"}
            </button>


            {/* Favorite Button */}
            <button
              onClick={toggleFavorite}
              className={`px-4 py-2 rounded-md text-lg font-medium transition ${isFavorite
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
            >
              {isFavorite ? "❤️ Favorited" : "🤍 Add to Favorites"}
            </button>

            {/* Apply Now Button */}
            <button
              onClick={handleApplyNow}
              className="bg-gray-900 text-white px-6 py-2 rounded-md text-lg font-medium hover:bg-gray-800 transition"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>

      {/* Apply Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-[9999] flex items-center justify-center">
          <div
            id="email-modal" // ✅ proper use here
            className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md relative"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Apply via Email</h3>
            <p className="text-gray-700 text-lg mb-2">Send your CV to:</p>

            <div className="flex items-center justify-between bg-gray-100 border rounded-md px-4 py-2 mb-4">
              <span className="text-gray-900 font-medium">{job.CompanyEmail}</span>
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 text-sm font-semibold transition"
                title="Copy to clipboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M16 8h2a2 2 0 012 2v8a2 2 0 01-2 2H10a2 2 0 01-2-2v-2"
                  />
                </svg>
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}


      {onClose && (
        <button
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            cursor: "pointer",
            background: "#111",
            color: "#fff",
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
            zIndex: 9999,
            transition: "opacity 0.3s ease-in-out",
          }}
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth={2.5}
            width="26"
            height="26"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

    </>
  );
}
