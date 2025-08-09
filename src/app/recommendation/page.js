"use client";

import { useState } from "react";
import Link from "next/link";
import JobRecommendationForm from "./JobRecommendationForm";
import JobResultsList from "./JobResultsList";

export default function RecommendationPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    // Full-width background lives on the PAGE
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Hero header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            Get personalized{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              recommendations
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Tell us about yourself to get personalized job recommendations
          </p>
        </div>

        {/* Form card */}
        <div className="mt-8">
          <JobRecommendationForm
            setJobs={setJobs}
            setLoading={setLoading}
            loading={loading}
          />
        </div>

        {/* Move the resume link BELOW the form */}
        <p className="mt-4 text-sm text-center text-gray-600">
          Resume available?{" "}
          <Link href="/resume" className="text-blue-700 underline hover:text-blue-900">
            Upload that instead
          </Link>
        </p>

        {/* Results (keep your existing component) */}
        <div className="mt-10">
          <JobResultsList jobs={jobs} />
        </div>
      </div>
    </div>
  );
}
