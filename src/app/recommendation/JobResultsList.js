"use client";

import { useState } from "react";
import JobDetailsModal from "../components/JobDetailsModal"; // adjust if path differs

// Helper: Capitalize every word in title
function toTitleCase(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper: Capitalize only first letter of a sentence
function capitalizeFirstLetter(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function JobResultsList({ jobs }) {
  const [selectedJob, setSelectedJob] = useState(null);

  if (!jobs || jobs.length === 0) return null;

  return (
    <>
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Top 10 Job Matches
        </h3>
        <ul className="space-y-4">
          {jobs.map((job, index) => (
            <li key={index} className="p-4 bg-gray-50 border rounded">
              <h4 className="font-bold text-lg text-gray-800">
                {toTitleCase(job.Title || job.title)} -{" "}
                <span className="text-sm font-semibold">
                  {(job.City || job.location)?.toLowerCase()}
                </span>
              </h4>
              <p className="text-gray-600 text-sm mt-1">
                {capitalizeFirstLetter(
                  (job.Description || job.description)?.slice(0, 120)
                )}
                ...
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  Match Score: {job.score}%
                </span>
                <button
                  onClick={() => setSelectedJob(job)}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 text-sm"
                >
                  View Details
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {selectedJob && (
        <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </>
  );
}
