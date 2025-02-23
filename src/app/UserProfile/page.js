"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";

const UserProfile = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const [submittedData, setSubmittedData] = useState(null);

  // Dropdown Data
  const salaryRanges = [
    "20,000 - 40,000 PKR",
    "40,000 - 60,000 PKR",
    "60,000 - 80,000 PKR",
    "80,000 - 100,000 PKR",
    "100,000+ PKR",
  ];

  const interestFields = [
    "Computer Science",
    "Marketing",
    "Finance",
    "Design",
    "Engineering",
    "Healthcare",
  ];

  const cities = [
    "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan",
    "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Sukkur",
  ];

  const onSubmit = (data) => {
    setSubmittedData(data);
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-200 to-gray-100 p-6">
      <div className="max-w-2xl w-full bg-white shadow-xl rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">User Profile</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Fullname */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              {...register("fullname", { required: true })}
              className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-100"
              placeholder="Enter your full name"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              {...register("age", { required: true })}
              className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-100"
              placeholder="Enter your age"
            />
          </div>

          {/* Location (City Dropdown) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Location (City)</label>
            <select
              {...register("location", { required: true })}
              className="mt-2 p-3 w-full border border-gray-300 rounded-lg bg-gray-100 text-gray-900 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a city</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Salary Range</label>
            <select
              {...register("salary", { required: true })}
              className="mt-2 p-3 w-full border border-gray-300 rounded-lg bg-gray-100 text-gray-900 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select salary range</option>
              {salaryRanges.map((range, index) => (
                <option key={index} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>

          {/* Interest Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Interest Field</label>
            <select
              {...register("interest", { required: true })}
              className="mt-2 p-3 w-full border border-gray-300 rounded-lg bg-gray-100 text-gray-900 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an interest</option>
              {interestFields.map((field, index) => (
                <option key={index} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>

          {/* Fields & Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Fields & Skills</label>
            <textarea
              {...register("skills")}
              rows="3"
              className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-100"
              placeholder="Enter your skills (e.g., React, SEO, Python)"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            Save Profile
          </button>
        </form>

        {/* Display Submitted Data */}
        {submittedData && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Submitted Data:</h3>
            <pre className="mt-2 text-sm text-gray-700">{JSON.stringify(submittedData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;