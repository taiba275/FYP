// "use client";

// import { useForm } from "react-hook-form";
// import { useState } from "react";

// const cities = [
//   "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan",
//   "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Sukkur",
// ];

// const qualifications = [
//   "Matric",
//   "Intermediate",
//   "Bachelors",
//   "Masters",
//   "PhD",
//   "Other",
// ];

// export default function Page() {
//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       skills: "",
//       experience: "",
//       qualification: "",
//       customQualification: "",
//       location: "",
//     },
//   });

//   const selectedQualification = watch("qualification");
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const onSubmit = async (data) => {
//     setLoading(true);
//     try {
//       const finalQualification =
//         data.qualification === "Other" ? data.customQualification : data.qualification;

//       const payload = {
//         skills: data.skills.split(",").map((s) => s.trim()),
//         experience: Math.max(0, parseInt(data.experience)),
//         qualification: finalQualification,
//         location: data.location,
//       };

//       const res = await fetch("http://localhost:8000/recommend", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const recommended = await res.json();
//       setJobs(recommended);
//     } catch (err) {
//       alert("Error fetching recommendations.");
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center px-4">
//       <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
//         <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
//           Job Recommendation Form
//         </h2>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//           {/* Skills */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Skills <span className="text-red-600">*</span>
//             </label>
//             <textarea
//               rows={3}
//               placeholder="e.g., React, Python, SEO"
//               {...register("skills", { required: true })}
//               className={`w-full p-3 border ${
//                 errors.skills ? "border-red-500" : "border-gray-300"
//               } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 placeholder-gray-500`}
//             />
//             {errors.skills && (
//               <span className="text-red-500 text-xs">Required field</span>
//             )}
//           </div>

//           {/* Experience */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Experience (in years) <span className="text-red-600">*</span>
//             </label>
//             <input
//               type="number"
//               min={0}
//               placeholder="e.g., 2"
//               {...register("experience", {
//                 required: true,
//                 min: { value: 0, message: "Experience cannot be negative" },
//               })}
//               className={`w-full p-3 border ${
//                 errors.experience ? "border-red-500" : "border-gray-300"
//               } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 placeholder-gray-500`}
//             />
//             {errors.experience && (
//               <span className="text-red-500 text-xs">
//                 {errors.experience.message || "Required field"}
//               </span>
//             )}
//           </div>

//           {/* Qualification */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Qualification <span className="text-red-600">*</span>
//             </label>
//             <select
//               {...register("qualification", { required: true })}
//               className={`w-full p-3 border ${
//                 errors.qualification ? "border-red-500" : "border-gray-300"
//               } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600`}
//             >
//               <option value="">Select qualification</option>
//               {qualifications.map((q) => (
//                 <option key={q} value={q}>
//                   {q}
//                 </option>
//               ))}
//             </select>
//             {errors.qualification && (
//               <span className="text-red-500 text-xs">Required field</span>
//             )}
//           </div>

//           {/* Custom qualification if Other is selected */}
//           {selectedQualification === "Other" && (
//             <div>
//               <input
//                 type="text"
//                 placeholder="Enter your qualification"
//                 {...register("customQualification", { required: true })}
//                 className={`w-full p-3 border ${
//                   errors.customQualification ? "border-red-500" : "border-gray-300"
//                 } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 placeholder-gray-500`}
//               />
//               {errors.customQualification && (
//                 <span className="text-red-500 text-xs">Required field</span>
//               )}
//             </div>
//           )}

//           {/* Location */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               City <span className="text-red-600">*</span>
//             </label>
//             <select
//               {...register("location", { required: true })}
//               className={`w-full p-3 border ${
//                 errors.location ? "border-red-500" : "border-gray-300"
//               } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600`}
//             >
//               <option value="">Select city</option>
//               {cities.map((city) => (
//                 <option key={city} value={city}>
//                   {city}
//                 </option>
//               ))}
//             </select>
//             {errors.location && (
//               <span className="text-red-500 text-xs">Required field</span>
//             )}
//           </div>

//           {/* Submit */}
//           <div className="text-right pt-4">
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               {loading ? "Fetching..." : "Get Recommendations"}
//             </button>
//           </div>
//         </form>

//         {/* Results */}
//         {jobs.length > 0 && (
//           <div className="mt-8">
//             <h3 className="text-xl font-semibold text-gray-800 mb-4">
//               Top 10 Job Matches
//             </h3>
//             <ul className="space-y-4">
//               {jobs.map((job, index) => (
//                 <li key={index} className="p-4 bg-gray-50 border rounded">
//                   <h4 className="font-bold text-lg text-gray-800">
//                     {job.title} - <span className="text-sm">{job.location}</span>
//                   </h4>
//                   <p className="text-gray-600 text-sm mt-1">
//                     {job.description?.slice(0, 120)}...
//                   </p>
//                   <div className="text-right mt-1 text-xs text-gray-500">
//                     Match Score: {job.score}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client"
import JobRecommendationPage from "./JobRecommendationPage";

export default function Page() {
  return <JobRecommendationPage />;
}







// 'use client';
// import React, { useEffect, useState } from 'react';
// import { getRecommendedJobs } from '../../utils/Endpoints';
// import JobDetailsModal from '../components/JobDetailsModal';

// export default function RecommendationPage() {
//   const [recommendedJobs, setRecommendedJobs] = useState([]);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [noData, setNoData] = useState(false);

//   useEffect(() => {
//     const fetchRecommendedJobs = async () => {
//       try {
//         const userId = localStorage.getItem('userId');
//         if (!userId) return;

//         setLoading(true);
//         const data = await getRecommendedJobs(userId);
//         setRecommendedJobs(data);

//         setNoData(!data || data.length === 0);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching recommended jobs:', error);
//         setLoading(false);
//       }
//     };

//     fetchRecommendedJobs();
//   }, []);

//   const handleViewDetails = (job) => {
//     setSelectedJob(job);
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedJob(null);
//   };

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-6">Recommended Jobs</h1>

//       {loading && <p>Loading...</p>}
//       {noData && <p>No recommended jobs found.</p>}

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {recommendedJobs.map((job) => (
//           <div key={job._id} className="bg-white shadow-md rounded-lg p-5 border">
//             <h2 className="text-lg font-semibold mb-1">{job.jobTitle}</h2>
//             <p className="text-sm text-gray-600 mb-2">{job.companyName}</p>
//             <p className="text-sm text-gray-500">{job.jobLocation}</p>

//             <button
//               onClick={() => handleViewDetails(job)}
//               className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//             >
//               View Job Details
//             </button>
//           </div>
//         ))}
//       </div>

//       {showModal && selectedJob && (
//         <JobDetailsModal
//           onClose={handleCloseModal}
//           title={selectedJob.jobTitle}
//           location={selectedJob.jobLocation}
//           salary={selectedJob.salary}
//           description={selectedJob.jobDescription}
//           jobType={selectedJob.jobType}
//           applyLink={selectedJob.applyLink}
//           companyName={selectedJob.companyName}
//           experience={selectedJob.experience}
//           qualification={selectedJob.qualification}
//           deadline={selectedJob.deadline}
//         />
//       )}
//     </div>
//   );
// }
