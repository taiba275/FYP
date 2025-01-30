import { notFound } from "next/navigation";

async function getJob(jobId) {
  if (!jobId) return null;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/jobs/${jobId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function JobDetails({ params }) {
  if (!params || !params?.id) {
    return notFound();
  }

  const job = await getJob(params.id.toString());

  if (!job) {
    return notFound();
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold text-gray-900">{job.Title}</h1>
      <p className="text-lg text-gray-700">{job.Company}</p>
      <p className="text-gray-600">📍 {job["Job Location"]}</p>
      <p className="text-green-600 font-bold">💰 {job.Salary || "Not Disclosed"}</p>
      <p className="mt-3 text-black">{job.Description}</p>

      <div className="mt-5">
        <h3 className="text-xl font-semibold">Job Details:</h3>
        <ul className="list-disc list-inside text-gray-700">
          <li>Industry: {job.Industry}</li>
          <li>Functional Area: {job["Functional Area"]}</li>
          <li>Total Positions: {job["Total Positions"]}</li>
          <li>Shift: {job["Job Shift"]}</li>
          <li>Type: {job["Job Type"]}</li>
          <li>Gender: {job.Gender}</li>
          <li>Minimum Education: {job["Minimum Education"]}</li>
          <li>Degree Title: {job["Degree Title"]}</li>
          <li>Career Level: {job["Career Level"]}</li>
          <li>Experience: {job.Experience}</li>
          <li>Apply Before: {job["Apply Before"]}</li>
          <li>Posting Date: {job["Posting Date"]}</li>
        </ul>
      </div>

      <a
        href="#"
        className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-lg font-medium hover:bg-blue-700"
      >
        Apply Now
      </a>
    </div>
  );
}
