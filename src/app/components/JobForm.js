"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import industries from "@/utils/industries";
import jobTypes from "@/utils/jobTypes";
import shifts from "@/utils/jobShifts";
import educations from "@/utils/educations";
import degrees from "@/utils/degreeTitles";
import genders from "@/utils/genders";
import functionalAreas from "@/utils/functionalAreas";
import currencies from "@/utils/currencies";
import cities from "@/utils/pakistanCities";



export default function JobForm({ initialData = null, editMode = false, jobId = null }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  //const { reset } = useForm(); // ✅ only used for reset

  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    companyEmail: "",
    jobRole: "",
    jobLocation: "",
    city: "",
    gender: "",
    education: "",
    degreeTitle: "",
    minExperience: "",
    maxExperience: "",
    currency: "PKR",
    minSalary: "",
    maxSalary: "",
    skills: "",
    industry: "",
    industryOther: "",
    functionalArea: "",
    functionalAreaOther: "",
    totalPositions: "",
    jobShift: "",
    jobType: "",
    applyBefore: "",
    postingDate: "",
    jobDescription: "",
  });
useEffect(() => {
  if (initialData) {
    const experienceText = initialData.Experience || "";
    const match = experienceText.match(/(\d+)\s*years?\s*-\s*(\d+)\s*years?/i);

    const minExp = match?.[1] || "";
    const maxExp = match?.[2] || "";

    setFormData({
      jobTitle: initialData.Title || "",
      companyName: initialData.Company || "",
      companyEmail: initialData.CompanyEmail || "",
      jobRole: initialData.ExtractedRole || "",
      jobLocation: initialData["Job Location"] || "",
      city: initialData.City || "",
      gender: initialData.Gender || "",
      education: initialData["Minimum Education"] || "",
      degreeTitle: initialData["Degree Title"] || "",
      minExperience: minExp,
      maxExperience: maxExp,
      currency: initialData.currency || "PKR",
      minSalary: initialData.salary_lower || "",
      maxSalary: initialData.salary_upper || "",
      skills: initialData.Skills || "",
      industry: initialData.Industry || "",
      industryOther: "",
      functionalArea: initialData["Functional Area"] || "",
      functionalAreaOther: "",
      totalPositions: initialData["Total Positions"]?.split(" ")[0] || "",
      jobShift: initialData["Job Shift"] || "",
      jobType: initialData["Job Type"] || "",
      applyBefore: initialData["Apply Before"]?.substring(0, 10) || "",
      postingDate: initialData["Posting Date"]?.substring(0, 10) || "",
      jobDescription: initialData.Description || "",
    });
  }
}, [initialData]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      ["minExperience", "maxExperience", "minSalary", "maxSalary", "totalPositions"].includes(name) &&
      Number(value) < 0
    ) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = formData.companyEmail.toLowerCase();
    if (!email.includes("@") || email.includes("gmail.com") || email.includes("yahoo.com") || email.includes("outlook.com")) {
      setError("Please enter a valid company email address (not personal like Gmail, Yahoo, etc.)");
      return;
    }

    const totalPositions = parseInt(formData.totalPositions);
    if (isNaN(totalPositions) || totalPositions <= 0) {
      setError("Please enter a valid number for total positions.");
      return;
    }

    const payload = { ...formData, totalPositions };
    const method = editMode ? "PUT" : "POST";
    const url = editMode ? `/api/jobs/${jobId}` : `/api/jobs/post`;

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowSuccess(true);
        if (!editMode) {
          setFormData({
            ...formData,
            jobTitle: "", companyName: "", companyEmail: "", jobRole: "",
            jobLocation: "", city: "", gender: "", education: "", degreeTitle: "",
            minExperience: "", maxExperience: "", currency: "PKR", minSalary: "",
            maxSalary: "", skills: "", industry: "", industryOther: "",
            functionalArea: "", functionalAreaOther: "", totalPositions: "",
            jobShift: "", jobType: "", applyBefore: "", postingDate: "", jobDescription: "",
          });
        }
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

return (
  <div className="max-w-[1400px] mx-auto px-4 py-8">
    {/* <h2 className="text-2xl font-semibold text-center mb-8">Post a Job</h2> */}
    <h2 className="text-2xl font-bold text-center mb-6">{editMode ? "Edit Job" : "Post a Job"}</h2>

          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-6">{error}</div>}
          {showSuccess && (
            <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-10 p-6 rounded-xl border border-green-500 shadow-lg">
              <h3 className="text-green-700 text-xl font-semibold mb-4">{editMode ? "Job Updated!" : "Job Posted Successfully!"}</h3>
              <button onClick={() => setShowSuccess(false)} className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
                {editMode ? "Close" : "Post Another Job"}
              </button>
            </div>
          )}
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* --- Left Column --- */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block font-medium mb-1">Job Title</label>
            <input name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Company Email</label>
            <input name="companyEmail" value={formData.companyEmail} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Job Location</label>
            <input name="jobLocation" value={formData.jobLocation} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>

          <div>
            <label className="block font-medium mb-1">Experience (Years)</label>
            <div className="flex gap-2">
              <input type="number" name="minExperience" value={formData.minExperience} onChange={handleChange} placeholder="Min" className="w-1/2 border rounded p-2" min={0} />
              <input type="number" name="maxExperience" value={formData.maxExperience} onChange={handleChange} placeholder="Max" className="w-1/2 border rounded p-2" min={0} />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Skills (comma-separated)</label>
            <input name="skills" value={formData.skills} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block font-medium mb-1">Functional Area</label>
            <select name="functionalArea" value={formData.functionalArea} onChange={handleChange} className="w-full border rounded p-2">
              <option value="">Select Functional Area</option>
              {functionalAreas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Job Shift</label>
            <select name="jobShift" value={formData.jobShift} onChange={handleChange} className="w-full border rounded p-2">
              <option value="">Select Shift</option>
              {shifts.map((shift) => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded p-2">
              <option value="">Select Gender</option>
              {genders.map((gender) => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Degree Title</label>
            <select name="degreeTitle" value={formData.degreeTitle} onChange={handleChange} className="w-full border rounded p-2">
              <option value="">Select Degree</option>
              {degrees.map((deg) => (
                <option key={deg} value={deg}>{deg}</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- Middle Column --- */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block font-medium mb-1">Company Name</label>
            <input name="companyName" value={formData.companyName} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Job Role</label>
            <input name="jobRole" value={formData.jobRole} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">City</label>
            <select name="city" value={formData.city} onChange={handleChange} className="w-full border rounded p-2">
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>


          <div>
            <label className="block font-medium mb-1">Salary</label>
            <div className="flex gap-2">
              <select name="currency" value={formData.currency} onChange={handleChange} className="w-1/3 border rounded p-2">
                {currencies.map((cur, i) => <option key={i} value={cur}>{cur}</option>)}
              </select>
              <input type="number" name="minSalary" value={formData.minSalary} onChange={handleChange} placeholder="Min" className="w-1/3 border rounded p-2" min={0} />
              <input type="number" name="maxSalary" value={formData.maxSalary} onChange={handleChange} placeholder="Max" className="w-1/3 border rounded p-2" min={0} />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Industry</label>
            <select name="industry" value={formData.industry} onChange={handleChange} className="w-full border rounded p-2">
              <option value="">Select Industry</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Total Positions</label>
            <input type="text" name="totalPositions" value={formData.totalPositions} onChange={handleChange} className="w-full border rounded p-2" placeholder="e.g. 1 post, 3 vacancies, multiple" />

          </div>
          <div>
            <label className="block font-medium mb-1">Job Type</label>
            <select name="jobType" value={formData.jobType} onChange={handleChange} className="w-full border rounded p-2">
              <option value="">Select Type</option>
              {jobTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Minimum Education</label>
            <select name="education" value={formData.education} onChange={handleChange} className="w-full border rounded p-2">
              <option value="">Select Education</option>
              {educations.map((edu) => (
                <option key={edu} value={edu}>{edu}</option>
              ))}
            </select>
          </div>
           <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-medium mb-1">Apply Before</label>
                <input type="date" name="applyBefore" value={formData.applyBefore} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">Posting Date</label>
                <input type="date" name="postingDate" value={formData.postingDate} onChange={handleChange} className="w-full border rounded p-2" />
              </div>
            </div>
          </div>

        {/* --- Right Column: Job Description Only --- */}
        <div className="flex flex-col">
          <label className="block font-medium mb-2">Job Specification</label>
          <textarea
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleChange}
            rows={25}
            placeholder="Describe the responsibilities, expectations, and qualifications for the role..."
            className="border rounded p-3 w-full h-full resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center mt-8">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Submit Job
        </button>
      </div>
    </form>
  </div>
);
}