"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
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
      postingDate: ""
    },
  });

  useEffect(() => {
  if (initialData) {
    const mappedData = {
      jobTitle: initialData.Title || "",
      companyName: initialData.Company || "",
      companyEmail: initialData.CompanyEmail || "",
jobRole: initialData.jobRole || initialData.ExtractedRole || "",

      jobLocation: initialData["Job Location"] || "",
      city: initialData.City || "",
      gender: initialData.Gender || "",
      education: initialData["Minimum Education"] || "",
      degreeTitle: initialData["Degree Title"] || "",
      minExperience: initialData.salary_lower?.toString() || "",  // if min/max were mapped into Experience Range or Experience string
      maxExperience: initialData.salary_upper?.toString() || "",
      currency: initialData.currency || "PKR",
      minSalary: initialData.salary_lower?.toString() || "",
      maxSalary: initialData.salary_upper?.toString() || "",
      skills: initialData.Skills || "",
      industry: initialData.Industry || "",
      industryOther: "",  // optional
      functionalArea: initialData["Functional Area"] || "",
      functionalAreaOther: "",  // optional
      totalPositions: (initialData["Total Positions"] || "").replace(/[^\d]/g, "") || "",
      jobShift: initialData["Job Shift"] || "",
      jobType: initialData["Job Type"] || "",
      applyBefore: initialData["Apply Before"]?.split("T")[0] || "",
      postingDate: initialData["Posting Date"]?.split("T")[0] || "",
    };

    reset(mappedData);
  }
}, [initialData, reset]);


  const watchIndustry = watch("industry");
  const watchFunctionalArea = watch("functionalArea");

  const onSubmit = async (data) => {
    const payload = { ...data };
    const method = editMode ? "PUT" : "POST";
    const url = editMode ? `/api/jobs/${jobId}` : `/api/jobs/post`;

    const email = payload.companyEmail.toLowerCase();
    if (email.includes("gmail.com") || email.includes("yahoo.com") || email.includes("outlook.com")) {
      alert("Use a valid company email (no Gmail/Yahoo)");
      return;
    }

    const total = parseInt(payload.totalPositions);
    if (isNaN(total) || total <= 0) {
      alert("Enter valid total positions");
      return;
    }

    payload.totalPositions = total;

    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        alert(editMode ? "Job updated!" : "Job posted!");
        router.push("/jobsPosted");
      } else {
        alert(result.message || "Something went wrong.");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <div className="flex justify-center py-12 px-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-8">
        <h2 className="text-2xl font-bold text-center mb-6">{editMode ? "Edit Job" : "Post a Job"}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">Job Title</label>
            <input {...register("jobTitle", { required: true })} className="w-full border rounded p-2" />
            {errors.jobTitle && <p className="text-red-500 text-sm">Required</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium">Company Name</label>
            <input {...register("companyName", { required: true })} className="w-full border rounded p-2" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Company Email</label>
            <input {...register("companyEmail", { required: true })} className="w-full border rounded p-2" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Job Role</label>
            <input {...register("jobRole", { required: true })} className="w-full border rounded p-2" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Job Location</label>
            <input {...register("jobLocation")} className="w-full border rounded p-2" />
          </div>

          <div>
            <label className="block mb-1 font-medium">City</label>
            <select {...register("city")} className="w-full border rounded p-2">
              <option value="">Select City</option>
              {cities.map((city, i) => <option key={i} value={city}>{city}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Experience (Years)</label>
            <div className="flex gap-2">
              <input type="number" {...register("minExperience")} className="w-1/2 border rounded p-2" placeholder="Min" min={0} />
              <input type="number" {...register("maxExperience")} className="w-1/2 border rounded p-2" placeholder="Max" min={0} />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Salary</label>
            <div className="flex gap-2">
              <select {...register("currency")} className="w-1/3 border rounded p-2">
                {currencies.map((cur, i) => <option key={i} value={cur}>{cur}</option>)}
              </select>
              <input type="number" {...register("minSalary")} className="w-1/3 border rounded p-2" placeholder="Min" />
              <input type="number" {...register("maxSalary")} className="w-1/3 border rounded p-2" placeholder="Max" />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Skills (comma-separated)</label>
            <input {...register("skills")} className="w-full border rounded p-2" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Industry</label>
            <select {...register("industry")} className="w-full border rounded p-2">
              <option value="">Select Industry</option>
              {industries.map((ind, i) => <option key={i} value={ind}>{ind}</option>)}
              <option value="Other">Other</option>
            </select>
            {watchIndustry === "Other" && (
              <input {...register("industryOther")} className="w-full mt-2 border rounded p-2" placeholder="Enter Industry" />
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Functional Area</label>
            <select {...register("functionalArea")} className="w-full border rounded p-2">
              <option value="">Select Area</option>
              {functionalAreas.map((fa, i) => <option key={i} value={fa}>{fa}</option>)}
              <option value="Other">Other</option>
            </select>
            {watchFunctionalArea === "Other" && (
              <input {...register("functionalAreaOther")} className="w-full mt-2 border rounded p-2" placeholder="Enter Functional Area" />
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Total Positions</label>
            <input type="number" {...register("totalPositions")} className="w-full border rounded p-2" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Job Shift</label>
            <select {...register("jobShift")} className="w-full border rounded p-2">
              <option value="">Select Shift</option>
              {shifts.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Job Type</label>
            <select {...register("jobType")} className="w-full border rounded p-2">
              <option value="">Select Type</option>
              {jobTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Gender</label>
            <select {...register("gender")} className="w-full border rounded p-2">
              <option value="">Select Gender</option>
              {genders.map((g, i) => <option key={i} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Minimum Education</label>
            <select {...register("education")} className="w-full border rounded p-2">
              <option value="">Select Education</option>
              {educations.map((e, i) => <option key={i} value={e}>{e}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Degree Title</label>
            <select {...register("degreeTitle")} className="w-full border rounded p-2">
              <option value="">Select Degree</option>
              {degrees.map((d, i) => <option key={i} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Apply Before</label>
              <input type="date" {...register("applyBefore")} className="w-full border rounded p-2" />
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Posting Date</label>
              <input type="date" {...register("postingDate")} className="w-full border rounded p-2" />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end pt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Submit Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
