"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useForm, Controller, useFieldArray } from "react-hook-form";

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
  "Other",
];

const educationLevels = [
  "Matric",
  "Intermediate",
  "Bachelors",
  "Masters",
  "PhD",
  "Other",
];

const cities = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan",
  "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Sukkur",
];

export default function UserProfile() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false); // ✅ to ensure protected access
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedData, setSavedData] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      fullname: "",
      dob: "",
      gender: "",
      phone: "",
      education: [{ level: "", field: "" }],
      status: "",
      location: "",
      address: "",
      salary: "",
      interest: "",
      interestOther: "",
      skills: "",
      linkedin: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  const selectedInterest = watch("interest");

  // ✅ Step 1: Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();

        if (!res.ok || !data.authenticated) {
          router.push("/"); // Redirect if not authenticated
        } else {
          setAuthChecked(true); // Allow rest of the page to load
        }
      } catch {
        router.push("/");
      }
    }

    checkAuth();
  }, []);

  // ✅ Step 2: Fetch profile data if authenticated
  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        if (!Array.isArray(data.user.education) || data.user.education.length === 0) {
          data.user.education = [{ level: "", field: "" }];
        }
        setSavedData(data.user);
        reset(data.user);
      }
      setLoading(false);
    }

    if (authChecked) {
      fetchProfile();
    }
  }, [authChecked, reset]);

  // ✅ Step 3: Redirect if logged out while on this page
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (!data.authenticated) {
          router.push("/");
        }
      } catch {
        router.push("/");
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        education: Array.isArray(data.education) ? data.education : [{ level: "", field: "" }],
        interest: data.interest === "Other" ? data.interestOther : data.interest,
      };
      delete payload.interestOther;

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditMode(false);
        router.push("/");
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // ✅ Don't render anything until auth and profile are loaded
  if (!authChecked || loading) return <div className="p-6 text-center">Loading...</div>;


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-200 to-gray-100 p-6">
      <div className="max-w-2xl w-full bg-white shadow-xl rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">User Profile</h2>

        {!editMode && (
          <div className="mb-6 text-right">
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Profile
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              {...register("fullname", { required: true })}
              disabled={!editMode}
              className={`w-full p-3 border ${
                errors.fullname ? "border-red-500" : "border-gray-400"
              } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 placeholder-gray-500 ${
                !editMode && "cursor-not-allowed"
              }`}
            />
            {errors.fullname && <span className="text-red-500 text-xs">Required field</span>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              {...register("dob", { required: true })}
              disabled={!editMode}
              className={`w-full p-3 border ${
                errors.dob ? "border-red-500" : "border-gray-400"
              } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 ${
                !editMode && "cursor-not-allowed"
              }`}
            />
            {errors.dob && <span className="text-red-500 text-xs">Required field</span>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender <span className="text-red-600">*</span>
            </label>
            <select
              {...register("gender", { required: true })}
              disabled={!editMode}
              className={`w-full p-3 border ${
                errors.gender ? "border-red-500" : "border-gray-400"
              } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 ${
                !editMode && "cursor-not-allowed"
              }`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <span className="text-red-500 text-xs">Required field</span>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-600">*</span>
            </label>
            <Controller
              name="phone"
              control={control}
              rules={{
                required: true,
                validate: (value) => isValidPhoneNumber(value || "") || "Invalid phone number",
              }}
              render={({ field }) => (
                <PhoneInput
                  {...field}
                  international
                  defaultCountry="PK"
                  disabled={!editMode}
                  className={`w-full border ${
                    errors.phone ? "border-red-500" : "border-gray-400"
                  } bg-gray-100 text-black rounded p-2 focus:outline-none focus:border-blue-600 ${
                    !editMode ? "cursor-not-allowed" : ""
                  }`}
                />
              )}
            />
            {errors.phone && (
              <span className="text-red-500 text-xs">
                {errors.phone.message === "Invalid phone number"
                  ? "Enter a valid phone number"
                  : "Required field"}
              </span>
            )}
          </div>

          {/* Education */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Education <span className="text-red-600">*</span>
            </label>
            {fields.map((item, idx) => (
              <div
                className="flex flex-col sm:flex-row gap-3 mb-2"
                key={item.id}
              >
                <select
                  {...register(`education.${idx}.level`, { required: true })}
                  disabled={!editMode}
                  className={`w-full sm:w-1/3 p-3 border ${
                    errors.education?.[idx]?.level
                      ? "border-red-500"
                      : "border-gray-400"
                  } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 ${
                    !editMode && "cursor-not-allowed"
                  }`}
                >
                  <option value="">Level</option>
                  {educationLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="e.g. Software Engineering"
                  {...register(`education.${idx}.field`, { required: true })}
                  disabled={!editMode}
                  className={`w-full sm:w-2/3 p-3 border ${
                    errors.education?.[idx]?.field
                      ? "border-red-500"
                      : "border-gray-400"
                  } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 placeholder-gray-500 ${
                    !editMode && "cursor-not-allowed"
                  }`}
                />
                {editMode && fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-red-600 font-bold px-2"
                  >
                    −
                  </button>
                )}
              </div>
            ))}
            {editMode && (
              <button
                type="button"
                className="mt-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => append({ level: "", field: "" })}
              >
                + Add Qualification
              </button>
            )}
            {errors.education && (
              <span className="text-red-500 text-xs">
                Please complete all qualifications
              </span>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Status <span className="text-red-600">*</span>
            </label>
            <select
              {...register("status", { required: true })}
              disabled={!editMode}
              className={`w-full p-3 border ${
                errors.status ? "border-red-500" : "border-gray-400"
              } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 ${
                !editMode && "cursor-not-allowed"
              }`}
            >
              <option value="">Select status</option>
              <option value="student">Student</option>
              <option value="employed">Employed</option>
              <option value="unemployed">Unemployed</option>
            </select>
            {errors.status && <span className="text-red-500 text-xs">Required field</span>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-600">*</span>
            </label>
            <select
              {...register("location", { required: true })}
              disabled={!editMode}
              className={`w-full p-3 border ${
                errors.location ? "border-red-500" : "border-gray-400"
              } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 ${
                !editMode && "cursor-not-allowed"
              }`}
            >
              <option value="">Select a city</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.location && <span className="text-red-500 text-xs">Required field</span>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              placeholder="Full address"
              {...register("address", { required: true })}
              disabled={!editMode}
              className={`w-full p-3 border ${
                errors.address ? "border-red-500" : "border-gray-400"
              } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 placeholder-gray-500 ${
                !editMode && "cursor-not-allowed"
              }`}
            />
            {errors.address && <span className="text-red-500 text-xs">Required field</span>}
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary Range
            </label>
            <select
              {...register("salary")}
              disabled={!editMode}
              className="w-full p-3 border border-gray-400 bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600"
            >
              <option value="">Select salary range</option>
              {salaryRanges.map((range, idx) => (
                <option key={idx} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>

          {/* Interest */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Field <span className="text-red-600">*</span>
            </label>
            <select
              {...register("interest", { required: true })}
              disabled={!editMode}
              className={`w-full p-3 border ${
                errors.interest ? "border-red-500" : "border-gray-400"
              } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 ${
                !editMode && "cursor-not-allowed"
              }`}
            >
              <option value="">Select an interest</option>
              {interestFields.map((field, idx) => (
                <option key={idx} value={field}>
                  {field}
                </option>
              ))}
            </select>
            {selectedInterest === "Other" && editMode && (
              <input
                type="text"
                placeholder="Enter your interest"
                {...register("interestOther", {
                  required: selectedInterest === "Other",
                })}
                className={`w-full mt-2 p-3 border ${
                  errors.interestOther ? "border-red-500" : "border-gray-400"
                } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 placeholder-gray-500`}
              />
            )}
            {(errors.interest || errors.interestOther) && (
              <span className="text-red-500 text-xs">Required field</span>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills <span className="text-red-600">*</span>
            </label>
            <textarea
              rows="3"
              placeholder="e.g., React, SEO, Python"
              {...register("skills", { required: true })}
              disabled={!editMode}
              className={`w-full p-3 border ${
                errors.skills ? "border-red-500" : "border-gray-400"
              } bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 placeholder-gray-500 ${
                !editMode && "cursor-not-allowed"
              }`}
            />
            {errors.skills && <span className="text-red-500 text-xs">Required field</span>}
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <input
              type="text"
              placeholder="LinkedIn profile link"
              {...register("linkedin")}
              disabled={!editMode}
              className="w-full p-3 border border-gray-400 bg-gray-100 text-black rounded focus:outline-none focus:border-blue-600 placeholder-gray-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-end mt-6">
            {editMode ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    reset(savedData || {}); // Reset to last fetched data
                  }}
                  className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100 bg-gray-300 text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={Object.keys(errors).length > 0 || !isDirty}                >
                  Save
                </button>
              </>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
