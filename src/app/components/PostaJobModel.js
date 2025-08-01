"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function PostaJobModel({ onClose }) {
    const modalRef = useRef(null);
    const [formData, setFormData] = useState({
        title: "",
        company: "",
        email: "",
        location: "",
        experience: "",
        type: "",
        applyBefore: "",
        salary: "",
        description: "",
        skills: "",
        gender: "",
        industry: "",
        functionalArea: "",
        positions: ""
    });


    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            Title: formData.title,
            Company: formData.company,
            Email: formData.email,
            City: formData.location,
            Experience: formData.experience,
            Type: formData.type,
            ApplyBefore: formData.applyBefore,
            Salary: formData.salary,
            Description: formData.description,
            Skills: formData.skills.split(",").map((s) => s.trim()),
            Gender: formData.gender,
            Industry: formData.industry,
            FunctionalArea: formData.functionalArea,
            TotalPositions: formData.positions
        };


        try {
            const res = await fetch("/api/jobs/post", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Failed to post job");
            onClose();
            window.location.reload(); // Refresh job listings
        } catch (err) {
            alert("Error posting job: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-5xl h-[90vh] rounded-xl shadow-xl flex relative overflow-hidden"
            >
                {/* Left panel (brand) */}
                <div className="w-1/2 bg-[#f5f5f5] px-10 py-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-10">Job Information</h2>
                    </div>
                    <div className="flex justify-center items-center flex-grow">
                        <div className="flex items-center space-x-6">
                            <div className="text-[200px] font-bold text-gray-900">J.</div>
                            <div className="w-64 h-64 mb-30 flex items-center justify-center">
                                <Image
                                    src="/Images/smile.svg"
                                    alt="Welcome Graphic"
                                    width={280}
                                    height={280}
                                />
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600">Reach thousands of candidates in seconds.</p>
                </div>

                {/* Right panel (form) */}
                <div className="w-1/2 p-8 overflow-y-auto custom-scrollbar relative">
                    <form onSubmit={handleSubmit} className="space-y-4 text-sm text-black">
                        {/* Job Title */}
                        <div>
                            <label className="font-medium">Job Title *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
                        </div>

                        {/* Company */}
                        <div>
                            <label className="font-medium">Company *</label>
                            <input type="text" name="company" value={formData.company} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
                        </div>

                        {/* Company Email */}
                        <div>
                            <label className="font-medium">Company Email *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="font-medium">Location (City) *</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
                        </div>

                        {/* Experience */}
                        <div>
                            <label className="font-medium">Experience (in years) *</label>
                            <input type="number" name="experience" value={formData.experience} onChange={handleChange} min="0" required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
                        </div>

                        {/* Apply Before */}
                        <div>
                            <label className="font-medium">Apply Before *</label>
                            <input type="date" name="applyBefore" value={formData.applyBefore} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
                        </div>

                        {/* Salary */}
                        <div>
                            <label className="font-medium">Salary (PKR)</label>
                            <input type="number" name="salary" value={formData.salary} onChange={handleChange} min="0" required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
                        </div>

                        {/* Job Type Dropdown with hover + timeout simulation */}
                        <div className="relative group">
                            <label className="font-medium">Job Type *</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100 group-hover:block transition duration-200"
                            >
                                <option value="">Select Job Type</option>
                                <option value="Permanent">Permanent</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                                <option value="Part-time">Part-time</option>
                            </select>
                        </div>

                        {/* Gender Preference */}
                        <div>
                            <label className="font-medium">Gender Preference *</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100">
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Both">Both</option>
                            </select>
                        </div>

                        {/* Industry */}
                        <div>
                            <label className="font-medium">Industry *</label>
                            <input type="text" name="industry" value={formData.industry} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
                        </div>

                        {/* Functional Area */}
                        <div>
                            <label className="font-medium">Functional Area *</label>
                            <input type="text" name="functionalArea" value={formData.functionalArea} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
                        </div>

                        {/* Total Positions */}
                        <div>
                            <label className="font-medium">Total Positions *</label>
                            <input type="number" name="positions" value={formData.positions} onChange={handleChange} min="0" required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
                        </div>

                        {/* Job Description */}
                        <div>
                            <label className="font-medium">Job Description *</label>
                            <textarea name="description" rows={3} value={formData.description} onChange={handleChange} required className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
                        </div>

                        {/* Required Skills */}
                        <div>
                            <label className="font-medium">Required Skills (comma-separated) *</label>
                            <input type="text" name="skills" value={formData.skills} onChange={handleChange} required placeholder="e.g., Python, React, Excel" className="w-full p-2 mt-1 border border-gray-300 rounded bg-gray-100" />
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading} className="w-full py-3 mt-4 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">
                            {loading ? "Posting..." : "Post Job"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
