"use client";

import { useState } from "react";
import JobRecommendationForm from "./JobRecommendationForm";
import JobResultsList from "./JobResultsList";

export default function JobRecommendationPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-r from-gray-100 to-gray-200">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Job Recommendation Form
        </h2>

        <JobRecommendationForm setJobs={setJobs} setLoading={setLoading} loading={loading} />
        <JobResultsList jobs={jobs} />
      </div>
    </div>
  );
}
