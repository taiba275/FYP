"use client";
import { useEffect, useState } from "react";
import JobForm from "@/app/components/JobForm"; // adjust if different

export default function EditJobPage({ params }) {
  const { id } = params;                // /edit-job/[id]
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) throw new Error("Failed to load job");
        const data = await res.json();
        setJobData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  return (
    <>
      {jobData ? (
        <JobForm editMode={true} initialData={jobData} jobId={id} />
      ) : loading ? (
        <div className="w-full h-[50vh] flex flex-col justify-center items-center bg-white text-center py-10 text-gray-500">
          <div className="custom-loader wrapper scale-[1.4] mb-6">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
          </div>
          <p className="text-gray-700 text-xl font-semibold mb-1">
            Loading Edit Page for You…
          </p>
          <p className="text-gray-500 text-base">
            Please wait while we fetch the Edit Page data
          </p>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">Job not found.</p>
      )}
    </>
  );
}
