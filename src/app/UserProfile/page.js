"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, Fragment } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Combobox, Popover, Transition, Listbox } from "@headlessui/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

const salaryRanges = [
  "20,000 - 40,000 PKR",
  "40,000 - 60,000 PKR",
  "60,000 - 80,000 PKR",
  "80,000 - 100,000 PKR",
  "100,000+ PKR",
];

const interestFields = ["Computer Science", "Marketing", "Finance", "Design", "Engineering", "Healthcare", "Other"];
const educationLevels = ["Matric", "Intermediate", "Bachelors", "Masters", "PhD", "Other"];
const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Sukkur"];

const inputShell = "w-full rounded-xl bg-[#F7F8FA] px-4 py-3 border shadow-sm focus:outline-none";
const okBorder   = "border-transparent focus:border-blue-500";
const errBorder  = "border-red-400 focus:border-red-500";

/* ---------- City-style non-search dropdown ---------- */
function FancySelect({
  label,
  value,
  onChange,
  options = [],         // array of strings OR [{label, value}]
  disabled,
  error,
  placeholder = "Select…",
  className = "",
}) {
  const items = options.map(o => (typeof o === "string" ? { label: o, value: o } : o));
  const selected = items.find(i => i.value === value) || null;

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm text-gray-600">{label}</label>}

      <Listbox value={value ?? ""} onChange={onChange} disabled={disabled}>
        <div className={`relative ${className}`}>
          <Listbox.Button
            className={[
              inputShell,
              "pr-10 text-left",
              error ? errBorder : okBorder,
              disabled ? "opacity-100 cursor-not-allowed" : "",
            ].join(" ")}
          >
            {selected ? selected.label : <span className="text-gray-400">{placeholder}</span>}
          </Listbox.Button>

          {/* Chevron */}
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>

          <Transition
            as={Fragment}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-in"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Listbox.Options className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-xl bg-white p-1 text-sm shadow-lg ring-1 ring-black/5 custom-scrollbar">
              {items.map(opt => (
                <Listbox.Option
                  key={opt.value}
                  value={opt.value}
                  className={({ active, selected }) =>
                    [
                      "cursor-pointer select-none rounded-lg px-3 py-2",
                      active ? "bg-blue-50 text-blue-700" : "text-gray-700",
                      selected ? "font-medium" : "font-normal",
                    ].join(" ")
                  }
                >
                  {opt.label}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ---------- Searchable City dropdown ---------- */
function SearchableSelect({ label, options = [], value, onChange, disabled, error, placeholder = "Search…" }) {
  const [query, setQuery] = useState("");
  const filtered = query === "" ? options : options.filter(o => o.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm text-gray-600">{label}</label>}
      <Combobox value={value || ""} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Combobox.Input
            className={[inputShell, "pr-10", error ? errBorder : okBorder, disabled ? "opacity-100 cursor-not-allowed" : ""].join(" ")}
            displayValue={(v) => v}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 z-10 flex items-center px-3">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
            </svg>
          </Combobox.Button>

          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Combobox.Options className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-xl bg-white p-1 text-sm shadow-lg ring-1 ring-black/5 custom-scrollbar">
              {filtered.length === 0 && <div className="px-3 py-2 text-gray-500">No matches</div>}
              {filtered.map((opt) => (
                <Combobox.Option
                  key={opt}
                  value={opt}
                  className={({ active }) => `cursor-pointer select-none rounded-lg px-3 py-2 ${active ? "bg-blue-50 text-blue-700" : "text-gray-700"}`}
                >
                  {opt}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ---------- Popover Calendar ---------- */
function CalendarField({ label, value, onChange, disabled, error }) {
  const selected = value ? new Date(value) : undefined;
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm text-gray-600">{label}</label>}
      <Popover className="relative">
        <Popover.Button
          disabled={disabled}
          className={[inputShell, error ? errBorder : okBorder, disabled ? "opacity-100 cursor-not-allowed" : "", "text-left"].join(" ")}
        >
          {selected ? format(selected, "PPP") : "Select date"}
        </Popover.Button>
        <Transition
          enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-in" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0"
        >
          <Popover.Panel className="absolute z-20 mt-2">
            <div className="rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5">
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={(d) => onChange(d ? d.toISOString().slice(0, 10) : "")}
                captionLayout="dropdown"
                fromYear={1950}
                toYear={new Date().getFullYear()}
              />
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function initials(name = "") {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() ?? "").join("") || "U";
}

export default function UserProfile() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedData, setSavedData] = useState(null);

  const { register, handleSubmit, control, reset, watch, formState: { errors, isDirty } } = useForm({
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

  const { fields, append, remove } = useFieldArray({ control, name: "education" });
  const selectedInterest = watch("interest");

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (!res.ok || !data.authenticated) router.push("/");
        else setAuthChecked(true);
      } catch { router.push("/"); }
    }
    checkAuth();
  }, [router]);

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
    if (authChecked) fetchProfile();
  }, [authChecked, reset]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (!data.authenticated) router.push("/");
      } catch { router.push("/"); }
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

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

  if (!authChecked || loading) return (
    <div className="w-full h-[50vh] flex flex-col justify-center items-center bg-white">
      <div className="custom-loader wrapper scale-[1.4] mb-6">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <p className="text-gray-700 text-xl font-semibold mb-1">Loading your saved jobs…</p>
      <p className="text-gray-500 text-base">Please wait while we fetch the jobs</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xl font-semibold select-none">
              {initials(savedData?.fullname)}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">{savedData?.fullname || "Your Name"}</h1>
              <p className="text-sm text-gray-500">{savedData?.email || "—"}</p>
            </div>
          </div>
          {!editMode && (
            <button onClick={() => setEditMode(true)} className="h-10 px-6 rounded-lg bg-[#4F7BFF] text-white font-medium shadow-sm hover:brightness-105 transition">
              Edit
            </button>
          )}
        </div>

        {/* form */}
        <div className="mt-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Your Full Name"
                  {...register("fullname", { required: true })}
                  disabled={!editMode}
                  className={[inputShell, errors.fullname ? errBorder : okBorder, !editMode ? "opacity-100 cursor-not-allowed" : ""].join(" ")}
                />
                {errors.fullname && <p className="text-xs text-red-500 mt-1">Required field</p>}
              </div>

              {/* User Name (linkedin field) */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">User Name</label>
                <input
                  type="text"
                  placeholder="Your User Name"
                  {...register("linkedin")}
                  disabled={!editMode}
                  className={[inputShell, okBorder, !editMode ? "opacity-100 cursor-not-allowed" : ""].join(" ")}
                />
              </div>

              {/* Gender */}
              <Controller
                control={control}
                name="gender"
                rules={{ required: true }}
                render={({ field }) => (
                  <FancySelect
                    label="Gender"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!editMode}
                    error={errors.gender && "Required field"}
                    placeholder="Select gender"
                    options={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                    ]}
                  />
                )}
              />

              {/* City (searchable) */}
              <Controller
                control={control}
                name="location"
                rules={{ required: true }}
                render={({ field }) => (
                  <SearchableSelect
                    label="City"
                    options={cities}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!editMode}
                    error={errors.location && "Required field"}
                  />
                )}
              />

              {/* Status */}
              <Controller
                control={control}
                name="status"
                rules={{ required: true }}
                render={({ field }) => (
                  <FancySelect
                    label="Status"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!editMode}
                    error={errors.status && "Required field"}
                    placeholder="Select language/status"
                    options={[
                      { label: "Student", value: "student" },
                      { label: "Employed", value: "employed" },
                      { label: "Unemployed", value: "unemployed" },
                    ]}
                  />
                )}
              />

              {/* Date of Birth */}
              <Controller
                control={control}
                name="dob"
                rules={{ required: true }}
                render={({ field }) => (
                  <CalendarField
                    label="Date of Birth"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!editMode}
                    error={errors.dob && "Required field"}
                  />
                )}
              />

              {/* Phone */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-2">Phone Number</label>
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: true, validate: (v) => isValidPhoneNumber(v || "") || "Invalid phone number" }}
                  render={({ field }) => (
                    <PhoneInput
                      {...field}
                      international
                      defaultCountry="PK"
                      disabled={!editMode}
                      className={[inputShell, okBorder, !editMode ? "opacity-100 cursor-not-allowed" : ""].join(" ")}
                    />
                  )}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.phone.message === "Invalid phone number" ? "Enter a valid phone number" : "Required field"}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-2">Address</label>
                <input
                  type="text"
                  placeholder="Full address"
                  {...register("address", { required: true })}
                  disabled={!editMode}
                  className={[inputShell, errors.address ? errBorder : okBorder, !editMode ? "opacity-100 cursor-not-allowed" : ""].join(" ")}
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">Required field</p>}
              </div>

              {/* Education */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-2">Education</label>
                <div className="space-y-3">
                  {fields.map((item, idx) => (
                    <div className="flex gap-3" key={item.id}>
                      <Controller
                        control={control}
                        name={`education.${idx}.level`}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <FancySelect
                            className="sm:col-span-3"
                            value={field.value}
                            onChange={field.onChange}
                            disabled={!editMode}
                            error={errors.education?.[idx]?.level && "Required"}
                            placeholder="Level"
                            options={educationLevels}
                          />
                        )}
                      />
                      <div className="flex-[7]">
                        <input
                          type="text"
                          placeholder="e.g. Software Engineering"
                          {...register(`education.${idx}.field`, { required: true })}
                          disabled={!editMode}
                          className={[inputShell, errors.education?.[idx]?.field ? errBorder : okBorder, !editMode ? "opacity-100 cursor-not-allowed" : ""].join(" ")}
                        />
                      </div>
                      {editMode && fields.length > 1 && (
                        <button type="button" onClick={() => remove(idx)} className="sm:col-span-1 h-12 rounded-lg bg-red-50 text-red-600 font-bold" title="Remove">
                          −
                        </button>
                      )}
                    </div>
                  ))}
                  {editMode && (
                    <button type="button" onClick={() => append({ level: "", field: "" })} className="px-4 py-2 rounded-lg bg-[#4F7BFF] text-white text-sm font-medium">
                      + Add Qualification
                    </button>
                  )}
                </div>
              </div>

              {/* Salary */}
              <Controller
                control={control}
                name="salary"
                render={({ field }) => (
                  <FancySelect
                    label="Salary Range"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!editMode}
                    options={salaryRanges}
                    placeholder="Select salary range"
                  />
                )}
              />

              {/* Interest */}
              <div>
                <Controller
                  control={control}
                  name="interest"
                  rules={{ required: true }}
                  render={({ field }) => (
                    <FancySelect
                      label="Interest Field"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!editMode}
                      error={(errors.interest || errors.interestOther) && "Required field"}
                      options={interestFields}
                      placeholder="Select an interest"
                    />
                  )}
                />
                {selectedInterest === "Other" && editMode && (
                  <input
                    type="text"
                    placeholder="Enter your interest"
                    {...register("interestOther", { required: selectedInterest === "Other" })}
                    className={[inputShell, okBorder, "mt-2"].join(" ")}
                  />
                )}
              </div>

              {/* Skills */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-2">Skills</label>
                <textarea
                  rows={3}
                  placeholder="e.g., React, SEO, Python"
                  {...register("skills", { required: true })}
                  disabled={!editMode}
                  className={[inputShell, errors.skills ? errBorder : okBorder, !editMode ? "opacity-100 cursor-not-allowed" : ""].join(" ")}
                />
                {errors.skills && <p className="text-xs text-red-500 mt-1">Required field</p>}
              </div>
            </div>

            {/* actions */}
            {editMode && (
              <div className="flex justify-end gap-3 pt-8">
                <button
                  type="button"
                  onClick={() => { setEditMode(false); reset(savedData || {}); }}
                  className="h-10 px-5 rounded-lg bg-[#EFF1F5] text-gray-800"
                >
                  Cancel
                </button>
                <button type="submit" disabled={Object.keys(errors).length > 0 || !isDirty} className="h-10 px-6 rounded-lg bg-[#4F7BFF] text-white disabled:opacity-50">
                  Save
                </button>
              </div>
            )}
          </form>
        </div>

        {/* email section */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">My email Address</h2>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EFF3FF] flex items-center justify-center">
              <span className="w-5 h-3 border border-[#4F7BFF] rounded-sm relative block">
                <span className="absolute left-0 right-0 top-0 bottom-0 m-auto w-4 h-0 border-t border-[#4F7BFF] rotate-12"></span>
              </span>
            </div>
            <div>
              <p className="text-gray-800">{savedData?.email || "—"}</p>
              <p className="text-xs text-gray-500 mt-1">1 month ago</p>
            </div>
          </div>
          <button type="button" disabled className="mt-5 px-4 py-2 rounded-lg bg-[#EFF3FF] text-[#4F7BFF] font-medium cursor-default">
            + Add Email Address
          </button>
        </div>
      </div>
    </div>
  );
}
