"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import JobForm from "../../components/JobForm";

export default function EditJobPage() {
  const { id } = useParams();
  const [jobData, setJobData] = useState(null);

  useEffect(() => {
    async function fetchJob() {
      const res = await fetch(`/api/jobs/${id}`);
      const data = await res.json();
      if (res.ok) setJobData(data.job);
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
