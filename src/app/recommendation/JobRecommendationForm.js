"use client";

import { useForm } from "react-hook-form";

const cities = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan",
  "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Sukkur",
];

const qualifications = [
  "Matric", "Intermediate", "Bachelors", "Masters", "PhD", "Other",
];

export default function JobRecommendationForm({ setJobs, setLoading, loading }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      skills: "",
      experience: "",
      qualification: "",
      customQualification: "",
      location: "",
    },
  });

  const selectedQualification = watch("qualification");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const finalQualification =
        data.qualification === "Other" ? data.customQualification : data.qualification;

      const payload = {
        skills: data.skills.split(",").map((s) => s.trim()),
        experience: Math.max(0, parseInt(data.experience)),
        qualification: finalQualification,
        location: data.location,
      };

      const res = await fetch("http://localhost:8000/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const recommended = await res.json();
      setJobs(recommended);
    } catch (err) {
      alert("Error fetching recommendations.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Skills <span className="text-red-600">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="e.g., React, Python, SEO"
          {...register("skills", { required: true })}
          className={`w-full p-3 border ${
            errors.skills ? "border-red-500" : "border-gray-300"
          } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 placeholder-gray-500`}
        />
        {errors.skills && (
          <span className="text-red-500 text-xs">Required field</span>
        )}
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Experience (in years) <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          min={0}
          placeholder="e.g., 2"
          {...register("experience", {
            required: true,
            min: { value: 0, message: "Experience cannot be negative" },
          })}
          className={`w-full p-3 border ${
            errors.experience ? "border-red-500" : "border-gray-300"
          } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 placeholder-gray-500`}
        />
        {errors.experience && (
          <span className="text-red-500 text-xs">
            {errors.experience.message || "Required field"}
          </span>
        )}
      </div>

      {/* Qualification */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Qualification <span className="text-red-600">*</span>
        </label>
        <select
          {...register("qualification", { required: true })}
          className={`w-full p-3 border ${
            errors.qualification ? "border-red-500" : "border-gray-300"
          } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600`}
        >
          <option value="">Select qualification</option>
          {qualifications.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
        {errors.qualification && (
          <span className="text-red-500 text-xs">Required field</span>
        )}
      </div>

      {/* Custom qualification */}
      {selectedQualification === "Other" && (
        <div>
          <input
            type="text"
            placeholder="Enter your qualification"
            {...register("customQualification", { required: true })}
            className={`w-full p-3 border ${
              errors.customQualification ? "border-red-500" : "border-gray-300"
            } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 placeholder-gray-500`}
          />
          {errors.customQualification && (
            <span className="text-red-500 text-xs">Required field</span>
          )}
        </div>
      )}

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City <span className="text-red-600">*</span>
        </label>
        <select
          {...register("location", { required: true })}
          className={`w-full p-3 border ${
            errors.location ? "border-red-500" : "border-gray-300"
          } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600`}
        >
          <option value="">Select city</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        {errors.location && (
          <span className="text-red-500 text-xs">Required field</span>
        )}
      </div>

      {/* Submit */}
      <div className="text-right pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Fetching..." : "Get Recommendations"}
        </button>
      </div>
    </form>
  );
}
