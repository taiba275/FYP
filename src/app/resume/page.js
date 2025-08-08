"use client";

import { useState } from "react";
import JobResultsList from "../recommendation/JobResultsList";

export default function Page() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("http://localhost:8001/extract-resume", {
        method: "POST",
        body: formData,
      });
      const extracted = await res.json();

      const payload = {
        skills: (extracted.skills || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        experience: Math.max(0, parseInt(extracted.experience)) || 0,
        qualification: extracted.qualification || "",
        location: extracted.location || "",
      };

      const recommendRes = await fetch("http://localhost:8001/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const recommended = await recommendRes.json();
      setJobs(recommended);
    } catch (err) {
      alert("Failed to extract or fetch recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-r from-gray-100 to-gray-200">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Upload your resume to get recommendations
        </h2>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleResumeUpload}
          disabled={loading}
          className="w-full border border-gray-300 bg-gray-100 text-black rounded p-2 mb-2"
        />
        <small className="text-xs text-gray-500">
          Accepted formats: .pdf, .doc, .docx
        </small>

        {loading && (
          <p className="mt-3 text-sm text-gray-600">Processing...</p>
        )}

        <p className="mt-4 text-sm text-center text-gray-600">
          No resume available?{" "}
          <a href="/recommendation" className="text-blue-600 underline hover:text-blue-800">
            Enter details
          </a>
        </p>

        <JobResultsList jobs={jobs} />
      </div>
    </div>
  );
}
