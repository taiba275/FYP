'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import JobDetailsModal from "../components/JobDetailsModal";
import Posts from "../components/Home/Posts";

export default function JobsPostedPage() {
  const [postedJobs, setPostedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/user/jobsPosted", {
        credentials: "include",
      });
      const data = await res.json();
      setPostedJobs(data.jobsPosted || []);
    } catch (err) {
      console.error("Error fetching posted jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (!mounted) return null;

  return (
    <div>
      <h2 className="text-4xl font-extrabold text-center mt-4">Your Posted Jobs</h2>

      {loading ? (
        <div className="w-full h-[50vh] flex flex-col justify-center items-center bg-white">
          <div className="custom-loader wrapper scale-[1.4] mb-6">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
          </div>
          <p className="text-gray-700 text-xl font-semibold mb-1">
            Loading your saved jobs…
          </p>
          <p className="text-gray-500 text-base">
            Please wait while we fetch the jobs
          </p>
        </div>
      ) : (
        <>
          <Posts
            jobs={postedJobs}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onFavoriteToggle={fetchJobs}
            onCardClick={(job) => setSelectedJob(job)}
            context="posted"
          />

          {selectedJob && (
            <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
          )}
        </>
      )}
    </div>
  );
}

