"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Posts from "@/app/components/Home/Posts";

export default function RoleJobsPage() {
  const { role } = useParams();
  const decodedRole = decodeURIComponent(role);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch(
          `/api/jobs-by-role?role=${encodeURIComponent(decodedRole)}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [decodedRole]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center w-full">
        Jobs for: {decodedRole}
      </h1>

      {loading ? (
        <div className="w-full h-[50vh] flex flex-col justify-center items-center bg-white">
          <div className="custom-loader wrapper scale-[1.4] mb-6">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
          </div>
          <p className="text-gray-700 text-xl font-semibold mb-1">
            Loading Jobs list for You…
          </p>
          <p className="text-gray-500 text-base">
            Please wait while we fetch the perfect matches
          </p>
        </div>
      ) : (
        <Posts jobs={jobs} viewMode={viewMode} setViewMode={setViewMode} />
      )}
    </div>
  );
}
