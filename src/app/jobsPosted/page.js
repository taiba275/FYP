// C:\Projects\FYP\src\app\jobsPosted\page.js
"use client";

import { useEffect, useState } from "react";
import JobDetailsModal from "../components/JobDetailsModal";
import { useRouter } from "next/navigation";

export default function JobsPostedPage() {
  const [jobsPosted, setJobsPosted] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user/jobsPosted", { credentials: "include" })
      .then(res => res.json())
      .then(data => setJobsPosted(data.jobsPosted || []));
  }, []);

  const handleEdit = (jobId) => {
    router.push(`/edit-job/${jobId}`); // You should have an edit page already or create one
  };

    const handleDelete = async (jobId) => {
    const res = await fetch(`/api/jobs/delete-with-faiss?jobId=${jobId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      setJobsPosted(prev => prev.filter(job => job._id !== jobId)); // 👈 This removes the job from UI
    } else {
      console.error("❌ Failed to delete job from server.");
      alert("Failed to delete job. Please try again.");
    }
  };


  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Posted Jobs</h1>

      {jobsPosted.length === 0 ? (
        <p className="text-gray-600">You haven't posted any jobs yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobsPosted.map(job => (
            <div
              key={job._id}
              className="bg-white p-5 rounded-lg shadow-md border border-gray-200 relative hover:shadow-lg transition"
            >
              <h3
                onClick={() => setSelectedJob(job)}
                className="text-xl font-bold text-gray-800 mb-2 cursor-pointer"
              >
                {job.Title}
              </h3>
              <p className="text-sm text-gray-600 mb-1">{job.Company}</p>
              <p className="text-sm text-gray-600">{job.City}</p>

              <div className="flex justify-end mt-4 gap-2">
                <button
                  className="text-blue-600 text-sm underline"
                  onClick={() => handleEdit(job._id)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 text-sm underline"
                  onClick={() => handleDelete(job._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
