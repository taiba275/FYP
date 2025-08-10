"use client";

import { useState } from "react";
import JobRecommendationForm from "./JobRecommendationForm";
import JobResultsList from "./JobResultsList";

const API_BASE_RECOMMEND = process.env.NEXT_PUBLIC_RECOMMENDATION_API || ""; // change to 'resume' if your FastAPI expects that

export default function JobRecommendationPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!API_BASE_RECOMMEND) {
      alert("API base URL is not set. Check .env.local and restart dev server.");
      return;
    }

    setLoading(true);

    try {
      // ---------- 1) Extract fields from resume ----------
      const UPLOAD_FIELD = "resume"; // must match FastAPI param name

      const formData = new FormData();
      formData.append(UPLOAD_FIELD, file); // match your FastAPI parameter name

      const extractRes = await fetch(`${API_BASE_RECOMMEND}/extract-resume`, {
        method: "POST",
        body: formData, // don't set Content-Type for FormData
      });

      if (!extractRes.ok) {
        const txt = await extractRes.text().catch(() => "");
        throw new Error(`Extract failed (${extractRes.status}): ${txt}`);
      }

      const extracted = await extractRes.json();

      // ---------- 2) Build payload for recommendation ----------
      const payload = {
        skills: (extracted?.skills || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        experience: Number.parseInt(extracted?.experience ?? 0) || 0,
        qualification: extracted?.qualification || "",
        location: extracted?.location || "",
      };

      // ---------- 3) Get recommendations ----------
      const recommendRes = await fetch(`${API_BASE_RECOMMEND}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!recommendRes.ok) {
        const txt = await recommendRes.text().catch(() => "");
        throw new Error(`Recommend failed (${recommendRes.status}): ${txt}`);
      }

      const recommended = await recommendRes.json();
      setJobs(Array.isArray(recommended) ? recommended : []);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to extract or fetch recommendations.");
    } finally {
      setLoading(false);
      // reset the input so user can re-upload the same file if needed
      e.target.value = "";
    }
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

        {/* slide-in animation */}
        <style jsx>{`
          .form-container {
            animation: slideIn 0.6s ease-out;
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
