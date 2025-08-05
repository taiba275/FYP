"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import JobDetailsModal from "../../components/JobDetailsModal";

function capitalizeWords(str = "") {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function JobsPostedPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchJobs = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/jobs/posted", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setJobs(data.jobs || []);
        } else {
          setError(data.message || "Failed to fetch posted jobs.");
        }
      } catch (err) {
        setError("Something went wrong while fetching jobs.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-600">
        Please log in to view your posted jobs.
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Jobs You've Posted
      </h1>

      {loading ? (
        <p className="text-gray-600">Loading jobs...</p>
      ) : error ? (
        <p className="text-red-600 text-md">{error}</p>
      ) : jobs.length === 0 ? (
        <p className="text-gray-500 text-lg">You haven't posted any jobs yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition cursor-pointer"
              onClick={() => setSelectedJob(job)}
            >
              <h2 className="text-xl font-semibold text-gray-800 truncate">
                {capitalizeWords(job.Title || "Untitled Job")}
              </h2>
              <p className="text-gray-600 truncate mb-1">
                {capitalizeWords(job.Company || "No Company")}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                📍 {job.City || "Unknown"} | 💰 {job.Salary || "Not disclosed"}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {job.Description || "No description provided."}
              </p>
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}
