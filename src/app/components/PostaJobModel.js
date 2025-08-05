// "use client";

// import { useState } from "react";
// import { useUI } from "../context/UIContext";
// import { useAuth } from "../context/AuthContext";
// import cities from "../../utils/pakistanCities";
// import industries from "../../utils/industries";
// import jobTypes from "../../utils/jobTypes";
// import shifts from "../../utils/jobShifts";
// import educations from "../../utils/educations";
// import degrees from "../../utils/degreeTitles";
// import genders from "../../utils/genders";


// export default function PostaJobModel({ onClose }) {
//   const { user } = useAuth();
//   const { setShowPostaJobModel } = useUI();

//   const [form, setForm] = useState({
//     Title: "",
//     Company: "",
//     CompanyEmail: "",
//     JobRole: "",
//     JobLocation: "",
//     City: "",
//     ExperienceLower: "",
//     ExperienceUpper: "",
//     currency: "PKR",
//     salary_lower: "",
//     salary_upper: "",
//     Skills: "",
//     Industry: "",
//     IndustryOther: "",
//     FunctionalArea: "",
//     FunctionalAreaOther: "",
//     TotalPositions: "",
//     JobShift: "",
//     JobType: "",
//     Gender: "",
//     MinimumEducation: "",
//     DegreeTitle: "",
//     ApplyBefore: "",
//     PostingDate: new Date().toISOString().slice(0, 10),
//   });

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const professionalEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async () => {
//     if (!user) return alert("You must be logged in.");

//     const companyEmail = form.CompanyEmail.trim();
//     const domain = companyEmail.split("@")[1];

//     if (
//       !professionalEmailPattern.test(companyEmail) ||
//       ["gmail.com", "yahoo.com", "outlook.com"].includes(domain)
//     ) {
//       setError("Please use a professional company email address.");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     const payload = {
//       ...form,
//       Industry:
//         form.Industry === "Other" ? form.IndustryOther : form.Industry,
//       FunctionalArea:
//         form.FunctionalArea === "Other"
//           ? form.FunctionalAreaOther
//           : form.FunctionalArea,
//       userId: user._id,
//     };

//     try {
//       const res = await fetch("/api/jobs/post", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         alert("Job posted successfully!");
//         setShowPostaJobModel(false);
//       } else {
//         setError(data.message || "Failed to post job.");
//       }
//     } catch (err) {
//       setError("Server error.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
//       <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl p-6 relative">
//         <h2 className="text-2xl font-bold mb-4 text-center">Post a Job</h2>
//         {error && (
//           <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <input name="Title" placeholder="Job Title" onChange={handleChange} className="input" />
//           <input name="Company" placeholder="Company Name" onChange={handleChange} className="input" />
//           <input name="CompanyEmail" placeholder="Company Email" onChange={handleChange} className="input" />
//           <input name="JobRole" placeholder="Job Role" onChange={handleChange} className="input" />
//           <input name="JobLocation" placeholder="Job Location" onChange={handleChange} className="input" />
//           <select name="City" onChange={handleChange} className="input">
//             <option value="">Select City</option>
//             {cities.map((city, i) => (
//               <option key={i}>{city}</option>
//             ))}
//           </select>

//           {/* Experience */}
//           <div className="flex gap-2">
//             <input type="number" name="ExperienceLower" placeholder="Experience From (years)" onChange={handleChange} className="input" />
//             <input type="number" name="ExperienceUpper" placeholder="To" onChange={handleChange} className="input" />
//           </div>

//           {/* Salary + currency */}
//           <div className="flex gap-2">
//             <select name="currency" onChange={handleChange} className="input">
//               <option>PKR</option>
//               <option>USD</option>
//               <option>GBP</option>
//             </select>
//             <input type="number" name="salary_lower" placeholder="Salary From" onChange={handleChange} className="input" />
//             <input type="number" name="salary_upper" placeholder="To" onChange={handleChange} className="input" />
//           </div>

//           <input name="Skills" placeholder="Skills (comma separated)" onChange={handleChange} className="input col-span-2" />

//           {/* Industry */}
//           <div className="flex flex-col">
//             <select name="Industry" onChange={handleChange} className="input">
//               <option value="">Select Industry</option>
//               {industries.map((ind, i) => (
//                 <option key={i}>{ind}</option>
//               ))}
//               <option>Other</option>
//             </select>
//             {form.Industry === "Other" && (
//               <input name="IndustryOther" placeholder="Other Industry" onChange={handleChange} className="input mt-2" />
//             )}
//           </div>

//           {/* Functional Area */}
//           <div className="flex flex-col">
//             <select name="FunctionalArea" onChange={handleChange} className="input">
//               <option value="">Functional Area</option>
//               <option>IT</option>
//               <option>Design</option>
//               <option>Marketing</option>
//               <option>Other</option>
//             </select>
//             {form.FunctionalArea === "Other" && (
//               <input name="FunctionalAreaOther" placeholder="Other Area" onChange={handleChange} className="input mt-2" />
//             )}
//           </div>

//           <input name="TotalPositions" placeholder="Total Positions" onChange={handleChange} className="input" />
//           <select name="JobShift" onChange={handleChange} className="input">
//             <option value="">Select Shift</option>
//             {shifts.map((s, i) => (
//               <option key={i}>{s}</option>
//             ))}
//           </select>
//           <select name="JobType" onChange={handleChange} className="input">
//             <option value="">Select Type</option>
//             {jobTypes.map((j, i) => (
//               <option key={i}>{j}</option>
//             ))}
//           </select>
//           <select name="Gender" onChange={handleChange} className="input">
//             <option value="">Select Gender</option>
//             {genders.map((g, i) => (
//               <option key={i}>{g}</option>
//             ))}
//           </select>
//           <select name="MinimumEducation" onChange={handleChange} className="input">
//             <option value="">Minimum Education</option>
//             {educations.map((e, i) => (
//               <option key={i}>{e}</option>
//             ))}
//           </select>
//           <select name="DegreeTitle" onChange={handleChange} className="input">
//             <option value="">Degree Title</option>
//             {degrees.map((d, i) => (
//               <option key={i}>{d}</option>
//             ))}
//           </select>
//           <input type="date" name="ApplyBefore" onChange={handleChange} className="input" />
//         </div>

//         <div className="flex justify-between mt-6">
//           <button
//             onClick={() => {
//               onClose();
//               setError("");
//             }}
//             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-4 py-2 rounded"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded"
//           >
//             {loading ? "Posting..." : "Post Job"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }





// // "use client";
// // import { useEffect, useRef, useState } from "react";
// // import Image from "next/image";

// // export default function PostaJobModel({ onClose }) {
// //     const modalRef = useRef(null);
// //     const [formData, setFormData] = useState({
// //         title: "",
// //         company: "",
// //         email: "",
// //         location: "",
// //         experience: "",
// //         type: "",
// //         applyBefore: "",
// //         salary: "",
// //         description: "",
// //         skills: "",
// //         gender: "",
// //         industry: "",
// //         functionalArea: "",
// //         positions: ""
// //     });


// //     const [loading, setLoading] = useState(false);

// //     useEffect(() => {
// //         const handleEsc = (e) => {
// //             if (e.key === "Escape") onClose();
// //         };
// //         window.addEventListener("keydown", handleEsc);
// //         return () => window.removeEventListener("keydown", handleEsc);
// //     }, [onClose]);

// //     const handleChange = (e) => {
// //         const { name, value } = e.target;
// //         setFormData((prev) => ({ ...prev, [name]: value }));
// //     };

// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
// //         setLoading(true);
// //         const payload = {
// //             Title: formData.title,
// //             Company: formData.company,
// //             Email: formData.email,
// //             City: formData.location,
// //             Experience: formData.experience,
// //             Type: formData.type,
// //             ApplyBefore: formData.applyBefore,
// //             Salary: formData.salary,
// //             Description: formData.description,
// //             Skills: formData.skills.split(",").map((s) => s.trim()),
// //             Gender: formData.gender,
// //             Industry: formData.industry,
// //             FunctionalArea: formData.functionalArea,
// //             TotalPositions: formData.positions
// //         };


// //         try {
// //             const res = await fetch("/api/jobs/post", {
// //                 method: "POST",
// //                 headers: { "Content-Type": "application/json" },
// //                 body: JSON.stringify(payload),
// //             });
// //             if (!res.ok) throw new Error("Failed to post job");
// //             onClose();
// //             window.location.reload(); // Refresh job listings
// //         } catch (err) {
// //             alert("Error posting job: " + err.message);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     return (
// //         <div
// //             className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
// //             onClick={(e) => e.target === e.currentTarget && onClose()}
// //         >
// //             <div
// //                 ref={modalRef}
// //                 onClick={(e) => e.stopPropagation()}
// //                 className="bg-white w-full max-w-5xl h-[90vh] rounded-xl shadow-xl flex relative overflow-hidden"
// //             >
// //                 {/* Left panel (brand) */}
// //                 <div className="w-1/2 bg-[#f5f5f5] px-10 py-6 flex flex-col justify-between">
// //                     <div>
// //                         <h2 className="text-3xl font-bold text-gray-900 mb-10">Job Information</h2>
// //                     </div>
// //                     <div className="flex justify-center items-center flex-grow">
// //                         <div className="flex items-center space-x-6">
// //                             <div className="text-[200px] font-bold text-gray-900">J.</div>
// //                             <div className="w-64 h-64 mb-30 flex items-center justify-center">
// //                                 <Image
// //                                     src="/Images/smile.svg"
// //                                     alt="Welcome Graphic"
// //                                     width={280}
// //                                     height={280}
// //                                 />
// //                             </div>
// //                         </div>
// //                     </div>

// //                     <p className="text-sm text-gray-600">Reach thousands of candidates in seconds.</p>
// //                 </div>

// //                 {/* Right panel (form) */}
// //                 <div className="w-1/2 p-8 overflow-y-auto custom-scrollbar relative">
// //                     <form onSubmit={handleSubmit} className="space-y-4 text-sm text-black">
// //                         {/* Job Title */}
// //                         <div>
// //                             <label className="font-medium">Job Title *</label>
// //                             <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
// //                         </div>

// //                         {/* Company */}
// //                         <div>
// //                             <label className="font-medium">Company *</label>
// //                             <input type="text" name="company" value={formData.company} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
// //                         </div>

// //                         {/* Company Email */}
// //                         <div>
// //                             <label className="font-medium">Company Email *</label>
// //                             <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
// //                         </div>

// //                         {/* Location */}
// //                         <div>
// //                             <label className="font-medium">Location (City) *</label>
// //                             <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
// //                         </div>

// //                         {/* Experience */}
// //                         <div>
// //                             <label className="font-medium">Experience (in years) *</label>
// //                             <input type="number" name="experience" value={formData.experience} onChange={handleChange} min="0" required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
// //                         </div>

// //                         {/* Apply Before */}
// //                         <div>
// //                             <label className="font-medium">Apply Before *</label>
// //                             <input type="date" name="applyBefore" value={formData.applyBefore} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
// //                         </div>

// //                         {/* Salary */}
// //                         <div>
// //                             <label className="font-medium">Salary (PKR)</label>
// //                             <input type="number" name="salary" value={formData.salary} onChange={handleChange} min="0" required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
// //                         </div>

// //                         {/* Job Type Dropdown with hover + timeout simulation */}
// //                         <div className="relative group">
// //                             <label className="font-medium">Job Type *</label>
// //                             <select
// //                                 name="type"
// //                                 value={formData.type}
// //                                 onChange={handleChange}
// //                                 required
// //                                 className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100 group-hover:block transition duration-200"
// //                             >
// //                                 <option value="">Select Job Type</option>
// //                                 <option value="Permanent">Permanent</option>
// //                                 <option value="Contract">Contract</option>
// //                                 <option value="Internship">Internship</option>
// //                                 <option value="Part-time">Part-time</option>
// //                             </select>
// //                         </div>

// //                         {/* Gender Preference */}
// //                         <div>
// //                             <label className="font-medium">Gender Preference *</label>
// //                             <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100">
// //                                 <option value="">Select Gender</option>
// //                                 <option value="Male">Male</option>
// //                                 <option value="Female">Female</option>
// //                                 <option value="Both">Both</option>
// //                             </select>
// //                         </div>

// //                         {/* Industry */}
// //                         <div>
// //                             <label className="font-medium">Industry *</label>
// //                             <input type="text" name="industry" value={formData.industry} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
// //                         </div>

// //                         {/* Functional Area */}
// //                         <div>
// //                             <label className="font-medium">Functional Area *</label>
// //                             <input type="text" name="functionalArea" value={formData.functionalArea} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
// //                         </div>

// //                         {/* Total Positions */}
// //                         <div>
// //                             <label className="font-medium">Total Positions *</label>
// //                             <input type="number" name="positions" value={formData.positions} onChange={handleChange} min="0" required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
// //                         </div>

// //                         {/* Job Description */}
// //                         <div>
// //                             <label className="font-medium">Job Description *</label>
// //                             <textarea name="description" rows={3} value={formData.description} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
// //                         </div>

// //                         {/* Required Skills */}
// //                         <div>
// //                             <label className="font-medium">Required Skills (comma-separated) *</label>
// //                             <input type="text" name="skills" value={formData.skills} onChange={handleChange} required placeholder="e.g., Python, React, Excel" className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
// //                         </div>

// //                         {/* Submit */}
// //                         <button type="submit" disabled={loading} className="w-full py-3 mt-4 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">
// //                             {loading ? "Posting..." : "Post Job"}
// //                         </button>
// //                     </form>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // }
