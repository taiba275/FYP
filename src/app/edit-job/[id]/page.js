"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import JobForm from "../../components/JobForm";

export default function EditJobPage() {
  const { id } = useParams();
  const [jobData, setJobData] = useState(null);

  useEffect(() => {
  async function fetchJob() {
    const res = await fetch(`/api/jobs/${id}?raw=false`); // or just omit `?raw` — defaults to wrapped
    const data = await res.json();
    
    if (res.ok && data.job) {
      setJobData(data.job); // ✅ only set if job exists
    } else {
      console.error("❌ Failed to fetch job or job missing in response", data);
    }
  }

  fetchJob();
}, [id]);

  return (
    <>
      {jobData ? (
        <JobForm
          editMode={true}
          initialData={jobData}  
          jobId={id}              
        />
      ) : (
        <p className="text-center py-10 text-gray-500">Loading...</p>
      )}
    </>
  );
}
