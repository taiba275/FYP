import { notFound } from "next/navigation";
import { mongoose } from '../../../library/mongodb';
import JobModel from '@/app/models/Job'; // adjust if needed

function capitalizeWords(str = "") {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function capitalizeSentences(text = "") {
  return text
    .split(/([.?!]\s*)/g)
    .map((part, i) =>
      i % 2 === 0
        ? part.charAt(0).toUpperCase() + part.slice(1)
        : part
    )
    .join("");
}

// function formatDescription(description = "") {
//   const bullets = [];
//   let intro = "";
//   let ending = "";

//   // Normalize and split by lines or periods
//   const sentences = description
//     .split(/[\r\n.]+/)
//     .map((s) => s.trim())
//     .filter((s) => s.length > 0);

//   // Find first "Responsibilities" or bullet-like line
//   let bulletStartIndex = sentences.findIndex((s) =>
//     s.toLowerCase().includes("responsibilities")
//   );

//   if (bulletStartIndex === -1) bulletStartIndex = 1;

//   intro = sentences.slice(0, bulletStartIndex).join(". ") + ".";
//   bullets.push(...sentences.slice(bulletStartIndex, -1));
//   ending = sentences[sentences.length - 1] + ".";

//   return { intro, bullets, ending };
// }


async function getJob(id) {
  await mongoose.connect(process.env.MONGODB_URI);
  return JobModel.findById(id).lean();
}


export default async function JobDetails({ params }) {
  if (!params?.id) return notFound();

  const job = await getJob(params.id.toString());

  if (!job) return notFound();

  // const { intro, bullets, ending } = formatDescription(job.Description);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold text-gray-900">{capitalizeWords(job.Title)}</h1>
      <p className="text-lg text-gray-700">{capitalizeWords(job.Company)}</p>
      <p className="text-gray-600">📍 {capitalizeWords(job["Job Location"] || "")}</p>
      <p className="text-green-600 font-bold">💰 {job.Salary || "Not Disclosed"}</p>
      <p className="mt-3 text-black">{job.Description}</p>

      <div className="mt-5 text-black">
          <h3 className="font-semibold text-lg mt-4">Required Skills:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-800">
            {job.Skills?.split(',').map((skill) => (
              <li key={skill.trim()}>{skill.trim()}</li>
            ))}
          </ul>
        <h3 className="mt-3 text-xl font-semibold">Job Details:</h3>
        <ul className="list-disc list-inside text-gray-700">
          <li>Industry: {capitalizeWords(job.Industry)}</li>
          <li>Functional Area: {capitalizeWords(job["Functional Area"])}</li>
          <li>Total Positions: {job["Total Positions"]}</li>
          <li>Shift: {capitalizeWords(job["Job Shift"])}</li>
          <li>Type: {capitalizeWords(job["Job Type"])}</li>
          <li>Gender: {capitalizeWords(job.Gender)}</li>
          <li>Minimum Education: {capitalizeWords(job["Minimum Education"])}</li>
          <li>Degree Title: {capitalizeWords(job["Degree Title"])}</li>
          <li>Career Level: {capitalizeWords(job["Career Level"])}</li>
          <li>Experience: {capitalizeWords(job.Experience)}</li>
          <li>Apply Before: {job["Apply Before"]}</li>
          <li>Posting Date: {job["Posting Date"]}</li>
        </ul>
      </div>

      {job["Job URL"] ? (
      <a
        href={job["Job URL"]}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-lg font-medium hover:bg-blue-700"
      >
        Apply Now
      </a>
    ) : (
      <p className="mt-6 text-red-600 text-lg font-semibold">
        Job no longer available
      </p>
    )}

    </div>
  );
}
