"use client";

import { useState } from "react";
import JobRecommendationForm from "./JobRecommendationForm";
import JobResultsList from "./JobResultsList";

export default function JobRecommendationPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
        skills: extracted.skills?.split(",").map((s) => s.trim()) || [],
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
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-r from-gray-100 to-gray-200">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">

        {/* ================= Resume Upload Section ================= */}
        {!showForm && (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Upload your resume to get recommendations
            </h2>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="w-full border border-gray-300 bg-gray-100 text-black rounded p-2 mb-2"
            />
            <small className="text-xs text-gray-500">
              Accepted formats: .pdf, .doc, .docx
            </small>

            <p className="mt-4 text-sm text-gray-600">
              No resume available?{" "}
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-600 underline hover:text-blue-800"
              >
                Enter details
              </button>
            </p>
          </div>
        )}

        {/* ================= Manual Form Section ================= */}
        {showForm && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
              Fill in your details manually
            </h2>

            <JobRecommendationForm
              setJobs={setJobs}
              setLoading={setLoading}
              loading={loading}
            />

            <p className="mt-4 text-sm text-center text-gray-600">
              Resume available?{" "}
              <button
                onClick={() => setShowForm(false)}
                className="text-blue-600 underline hover:text-blue-800"
              >
                Upload resume for recommendations
              </button>
            </p>
          </>
        )}

        {/* ================= Recommendation Results ================= */}
        <JobResultsList jobs={jobs} />
      </div>
    </div>
  );
}
