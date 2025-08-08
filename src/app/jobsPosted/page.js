// C:\Projects\FYP\src\app\jobsPosted\page.js
"use client";

import { useEffect, useState } from "react";
import { FaThLarge, FaList } from "react-icons/fa";
import Link from "next/link";
import JobDetailsModal from "../components/JobDetailsModal";
import { useRouter } from "next/navigation";

// ------- helpers copied from Posts.js -------
function capitalizeWords(str = "") {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
function capitalizeSentences(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .split(/([.?!]\s*)/g)
    .map((part, i) => (i % 2 === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join("");
}
function formatSalary(post) {
  const lower = post.salary_lower;
  const upper = post.salary_upper;
  const currency = post.currency || "PKR";
  const isValidNumber = (val) => typeof val === "number" && !isNaN(val) && val > 0;

  if (isValidNumber(lower) && isValidNumber(upper)) {
    const withCommas = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${currency.toLowerCase()}. ${withCommas(lower)} - ${withCommas(upper)}/month`;
  }
  if (post.Salary && typeof post.Salary === "string") return post.Salary;
  return "Not disclosed";
}
// -------------------------------------------

export default function JobsPostedPage() {
  const [jobsPosted, setJobsPosted] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [rightClickedJobId, setRightClickedJobId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user/jobsPosted", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setJobsPosted(data.jobsPosted || []))
      .catch((e) => console.error("Error loading posted jobs:", e));
  }, []);

  // close right-click highlight when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => rightClickedJobId && setRightClickedJobId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [rightClickedJobId]);

  const handleEdit = (jobId) => {
    router.push(`/edit-job/${jobId}`);
  };

  const handleDelete = async (jobId) => {
    if (!confirm("Delete this job?")) return;
    try {
      const res = await fetch(`/api/jobs/delete-with-faiss?jobId=${jobId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setJobsPosted((prev) => prev.filter((j) => j._id !== jobId));
    } catch (e) {
      console.error("❌ Failed to delete job:", e);
      alert("Failed to delete job. Please try again.");
    }
  };

  async function openJobDetails(id) {
    try {
      const res = await fetch(`/api/jobs/${id}`);
      const data = await res.json();
      setSelectedJob(data);
    } catch (err) {
      console.error("Failed to fetch job:", err);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 md:px-8">
      {/* header: count + view toggle */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center mb-6 mt-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">
          Your Posted Jobs
        </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode("list")}
            className="bg-gray-200 hover:bg-gray-400 p-1 rounded transition"
            title="List View"
          >
            <FaList className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className="bg-gray-200 hover:bg-gray-400 p-1 rounded transition"
            title="Grid View"
          >
            <FaThLarge className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* subheader: total */}
      <div className="w-full mb-4">
        <p className="text-sm md:text-base text-gray-700">
          <strong className="text-black">{jobsPosted.length}</strong> jobs posted.
        </p>
      </div>

      {/* empty state */}
      {jobsPosted.length === 0 ? (
        <p className="text-gray-600 w-full">You haven’t posted any jobs yet.</p>
      ) : (
        <div
          className={`w-full ${
            viewMode === "list"
              ? "flex flex-col gap-4"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          }`}
        >
          {jobsPosted.map((post) => (
            <Link
              key={post._id}
              href={`/jobs/${post._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div
                onContextMenu={(e) => {
                  e.stopPropagation();
                  setRightClickedJobId(post._id);
                }}
                className={`cursor-pointer bg-white rounded-lg shadow-md p-5 
                ${rightClickedJobId === post._id ? "border-black" : "border-gray-200"}
                border hover:shadow-xl transition-transform hover:-translate-y-1 
                flex flex-col h-auto overflow-hidden relative ${
                  viewMode === "list" ? "w-full" : ""
                }`}
              >
                {/* External source icon (only if present) */}
                {post.LinkedInURL && (
                  <div className="absolute top-3 right-3 z-10">
                    <a href={post.LinkedInURL} target="_blank" rel="noopener noreferrer">
                      <img
                        src="/Images/LinkedIn.png"
                        alt="LinkedIn"
                        className="w-5 h-5"
                        title="View on LinkedIn"
                      />
                    </a>
                  </div>
                )}

                      {/* ▼ REPLACE your old "header" block with THIS */}
      {/* header + actions on same line (no absolute) */}
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-lg font-semibold text-gray-900 truncate pr-3">
          {capitalizeWords(post.Company)}
        </h5>

        <div className={`flex items-center gap-3 shrink-0 ${post.LinkedInURL ? 'mr-8' : ''}`}>
          {post.Remote && (
            <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md whitespace-nowrap">
              REMOTE
            </span>
          )}

          <button
            className="bg-gray-200 text-gray-600 px-4 py-2 rounded font-bold hover:bg-gray-300 transition"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(post._id); }}
          >
            Edit
          </button>

          <button
            className="bg-black text-white font-bold py-2 px-4 rounded hover:bg-gray-600"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(post._id); }}
          >
            Delete
          </button>
        </div>
      </div>
      {/* ▲ END header replacement */}


               

                {/* title + summary */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                  {capitalizeWords(post.Title)}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3 overflow-hidden">
                  {capitalizeSentences(post.Description)}
                </p>

                {/* meta */}
                <div className="flex flex-col text-sm text-gray-500 mb-3">
                  <p className="truncate flex items-center gap-2 text-[#B81212]">
                    <img src="/Images/pin.png" alt="Location" className="w-4 h-4 inline" />
                    <strong>Area:</strong> {post.Area || "Not mentioned"}
                  </p>

                  <p className="truncate flex items-center gap-2 text-black">
                    <img src="/Images/city.png" alt="City" className="w-4 h-4 inline" />
                    <strong>City:</strong>{" "}
                    {post.City?.toLowerCase()
                      .split(" ")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </p>

                  <p
                    className={`font-bold flex items-center gap-2 ${
                      post.salary_lower && post.salary_upper
                        ? "text-green-500"
                        : post.Salary
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    <img src="/Images/salary.png" alt="Salary" className="w-4 h-4 inline" />
                    <strong>Salary:</strong> {formatSalary(post)}
                  </p>
                </div>

                {/* Quick View */}
                <button
                  onClick={(e) => {
                    e.preventDefault(); // prevent <Link> navigation
                    openJobDetails(post._id);
                  }}
                  className="w-full bg-gray-900 text-white py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition"
                >
                  Quick View
                </button>

                
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedJob && (
        <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
