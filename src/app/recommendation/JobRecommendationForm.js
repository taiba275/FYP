"use client";

import { useForm } from "react-hook-form";
import pakistanCities from "@/utils/pakistanCities"; // full list

const qualifications = [
  "Matric",
  "Intermediate",
  "Bachelor",
  "Master",
  "PhD",
  "Other",
];

export default function JobRecommendationForm({ setJobs, setLoading, loading }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
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
        data.qualification === "Other"
          ? data.customQualification
          : data.qualification;

      const payload = {
        skills: data.skills.split(",").map((s) => s.trim()),
        experience: Math.max(0, parseInt(data.experience)),
        qualification: finalQualification,
        location: data.location,
      };

      const res = await fetch("http://localhost:8001/recommend", {
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
    <div className="form-container bg-white rounded-2xl shadow-lg p-8 text-left">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Skills */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Skills <span className="text-red-600">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="e.g., JavaScript, Python, Project Management, Communication..."
            {...register("skills", { required: true })}
            className={`w-full px-4 py-3 border rounded-xl transition-all resize-none text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.skills ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.skills && (
            <span className="text-red-500 text-xs">Required field</span>
          )}
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Experience (in years) <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            min={0}
            placeholder="e.g., 3"
            {...register("experience", {
              required: true,
              min: { value: 0, message: "Experience cannot be negative" },
            })}
            className={`w-full px-4 py-3 border rounded-xl transition-all text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.experience ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.experience && (
            <span className="text-red-500 text-xs">
              {errors.experience.message || "Required field"}
            </span>
          )}
        </div>

        {/* Qualification — typable */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Qualification <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            list="qualification-list"
            placeholder="Select or type your qualification"
            {...register("qualification", { required: true })}
            className={`w-full px-4 py-3 border rounded-xl transition-all text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.qualification ? "border-red-300" : "border-gray-300"
            }`}
            autoComplete="off"
          />
          <datalist id="qualification-list">
            {qualifications.map((q) => (
              <option key={q} value={q} />
            ))}
          </datalist>
          {errors.qualification && (
            <span className="text-red-500 text-xs">Required field</span>
          )}
        </div>

        {/* Custom qualification (unchanged logic) */}
        {selectedQualification === "Other" && (
          <div>
            <input
              type="text"
              placeholder="Enter your qualification"
              {...register("customQualification", { required: true })}
              className={`w-full px-4 py-3 border rounded-xl transition-all text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.customQualification ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.customQualification && (
              <span className="text-red-500 text-xs">Required field</span>
            )}
          </div>
        )}

        {/* City — typable from pakistanCities */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            City <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            list="city-list"
            placeholder="Select or type your city"
            {...register("location", { required: true })}
            className={`w-full px-4 py-3 border rounded-xl transition-all text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.location ? "border-red-300" : "border-gray-300"
            }`}
            autoComplete="off"
          />
          <datalist id="city-list">
            {pakistanCities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
          {errors.location && (
            <span className="text-red-500 text-xs">Required field</span>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-900 focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Fetching…" : "Get My Recommendations"}
          </button>
        </div>
      </form>

      {/* slide-in animation */}
      <style jsx>{`
        .form-container {
          animation: slideIn 0.6s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
