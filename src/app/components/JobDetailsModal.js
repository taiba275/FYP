"use client";

import React, { useEffect, useRef } from "react";

export default function JobDetailsModal({ job, onClose }) {
    const modalRef = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
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

    return (
        <>
            {/* Overlay and Modal */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div
                    ref={modalRef}
                    className="relative w-[90%] max-w-5xl bg-white rounded-xl shadow-lg p-8 overflow-y-auto max-h-[90vh] custom-scrollbar"
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
                        <strong>📅 Posting Date:</strong>
                        {job["Posting Date"]}
                    </p>
                    <p className="text-gray-700 text-lg mb-2">
                        <strong>⏳ Apply Before:</strong> {job["Apply Before"]}
                    </p>
                    <p className="text-gray-700 text-lg mb-4">
                        <strong>💰 Salary:</strong> {job.Salary || "Not mentioned"}
                    </p>

                   <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
                      <strong className="text-2xl">Job Description</strong><br /> 
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
                                const shareData = {
                                    title: job.Title,
                                    text: `Check out this job at ${job.Company}`,
                                    url: window.location.href,
                                };
                                if (navigator.share) {
                                    navigator.share(shareData).catch(console.error);
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert("Link copied to clipboard");
                                }
                            }}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-lg font-medium hover:bg-gray-300 transition"
                        >
                            🔗 Share Job
                        </button>

                        {/* Add to Favorites */}
                        <button
                            onClick={() => alert("Added to favorites!")} // Replace with real logic
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-lg font-medium hover:bg-gray-300 transition"
                        >
                            ❤️ Add to Favorites
                        </button>

                        {/* Apply Now */}
                        <a
                          href={job["Job URL"] || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-900 text-white px-6 py-2 rounded-md text-lg font-medium hover:bg-gray-800 transition"
                        >
                          Apply Now
                        </a>
                                                
                    </div>
                </div>
            </div>

            {/* Close Button (floating) */}
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
        </>
    );
}
