"use client";

import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

export default function JobDetailsPage({ params }) {
  const { id } = params;
  const [job, setJob] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/jobs/${id}`)
      .then((res) => res.json())
      .then(setJob)
      .catch(console.error);
  }, [id]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    let date = new Date(dateValue);

    // Try parsing "dd/mm/yyyy" manually if needed
    if (isNaN(date)) {
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


  const formatSalary = (post) => {
    const lower = post.salary_lower;
    const upper = post.salary_upper;
    const currency = post.currency || "PKR";

    if (typeof lower === "number" && typeof upper === "number") {
      const format = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${currency}. ${format(lower)} - ${format(upper)}/month`;
    }
    return post.Salary || "Not disclosed";
  };

  const capitalizeWords = (str = "") =>
    str
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const capitalizeSentences = (text = "") =>
    text
      .split(/([.?!]\s*)/g)
      .map((part, i) =>
        i % 2 === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part
      )
      .join("");


  const toggleFavorite = async () => {
    const res = await fetch("/api/user/favorites", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ jobId: job._id }),
    });

    const data = await res.json();
    const fav = data.favorites?.some((j) => j.toString() === job._id);
    setIsFavorite(fav);
  };

  const handleShare = () => {
    const jobUrl = `${window.location.origin}/jobs/${job._id}`;
    navigator.clipboard.writeText(jobUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => alert("Failed to copy link"));
  };

  const handleApplyNow = () => {
    if (job["Job URL"]) {
      window.open(job["Job URL"], "_blank");
    } else if (job.CompanyEmail) {
      window.location.href = `mailto:${job.CompanyEmail}`;
    } else {
      alert("No application method available.");
    }
  };

  if (!job) {
    return (
      <div className="w-full h-[50vh] flex flex-col justify-center items-center bg-white">
        <div className="custom-loader wrapper scale-[1.4] mb-6">
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
        </div>
        <p className="text-gray-700 text-xl font-semibold mb-1">
          Loading Job Details for You…
        </p>
        <p className="text-gray-500 text-base">
          Please wait while we fetch the complete information
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-12 p-16">
        {/* LinkedIn icon */}
        <div className="absolute right-14 mr-14 z-10">
          <img
            src="../Images/LinkedIn.png"
            alt="LinkedIn"
            className="w-16 h-16"
            title="View on LinkedIn"
          />
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          {capitalizeWords(job.Title)}
        </h2>

        <p className="text-gray-700 text-lg mb-1">
          <strong>🏢 Company:</strong> {capitalizeWords(job.Company)}
        </p>
        <p className="text-gray-700 text-lg mb-1">
          <strong>📍 Location:</strong> {capitalizeWords(job.City)}
        </p>
        <p className="text-gray-700 text-lg mb-1">
          <strong>🧑‍💼 Experience:</strong> {job.Experience || "Not mentioned"}
        </p>
        <p className="text-gray-700 text-lg mb-1">
          <strong>🕒 Job Type:</strong> {job["Job Type"]}
        </p>
        <p className="text-gray-700 text-lg mb-1">
          <strong>📅 Posting Date:</strong> {formatDate(job["Posting Date"])}
        </p>
        <p className="text-gray-700 text-lg mb-1">
          <strong>⏳ Apply Before:</strong> {formatDate(job["Apply Before"])}
        </p>
        <p className="text-gray-700 text-lg mb-6">
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
              {job.Skills.split(",").map((skill, i) => (
                <li key={i}>{skill.trim()}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 justify-end items-center">
          <button
            onClick={handleShare}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-lg font-medium hover:bg-gray-300 transition"
          >
            🔗 {copied ? "Link Copied!" : "Share Job"}
          </button>

          <button
            onClick={toggleFavorite}
            className={`px-4 py-2 rounded-md text-lg font-medium transition ${isFavorite
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
          >
            {isFavorite ? "🤍 Favorited" : "❤️ Add to Favorites"}
          </button>

          <button
            onClick={handleApplyNow}
            className="bg-gray-900 text-white px-6 py-2 rounded-md text-lg font-medium hover:bg-gray-800 transition"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}
