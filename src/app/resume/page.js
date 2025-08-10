"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import JobResultsList from "../recommendation/JobResultsList";

export default function ResumePage() {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState("");
  const [jobs, setJobs] = useState([]);

  const fileInputRef = useRef(null);

  const chooseFile = () => fileInputRef.current?.click();

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFile(f);
  };
  const onInputChange = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  function handleFile(f) {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx"].includes(ext)) {
      setErr("Only PDF or DOCX are supported.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErr("File size must be less than 10MB.");
      return;
    }
    setErr("");
    setFile(f);
    setJobs([]);
    setSuccess(false);
  }

  const removeSelected = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFile(null);
    setJobs([]);
    setSuccess(false);
    setErr("");
  };

  const formatSize = (bytes) => {
    if (!Number.isFinite(bytes)) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const analyze = async () => {
    if (!file || loading) return;
    setLoading(true);
    setSuccess(false);
    setErr("");

    try {
      // 1) extract
      const fd = new FormData();
      fd.append("resume", file);
      const res = await fetch(`/api/resume/extract`, { method: "POST", body: fd });
      const resText = await res.text();
      if (!res.ok) throw new Error(`extract-resume ${res.status}: ${resText}`);
      let extracted;
      try { extracted = JSON.parse(resText); }
      catch { throw new Error(`extract-resume returned non-JSON: ${resText.slice(0,300)}`); }

      // 2) payload
      const skillsRaw = extracted?.skills ?? [];
      const skills = Array.isArray(skillsRaw)
        ? skillsRaw.map(s => String(s).trim()).filter(Boolean)
        : String(skillsRaw).split(",").map(s => s.trim()).filter(Boolean);

      const payload = {
        skills,
        experience: Math.max(0, parseInt(extracted?.experience)) || 0,
        qualification: extracted?.qualification || "",
        location: extracted?.location || "",
      };

      // 3) recommend
      const rec = await fetch(`/api/resume/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const recText = await rec.text();
      if (!rec.ok) throw new Error(`recommend ${rec.status}: ${recText}`);
      let recommended = [];
      try { recommended = JSON.parse(recText); }
      catch { throw new Error(`recommend returned non-JSON: ${recText.slice(0,300)}`); }

      setJobs(Array.isArray(recommended) ? recommended : []);
      setSuccess(true);

      setTimeout(() => {
        document.getElementById("resume-results")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch (e) {
      console.error(e);
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header ONLY is centered */}
        <div className="space-y-4 text-center">
          <h1 className="text-5xl md:text-4xl font-bold text-gray-800 leading-tight">
            Upload your resume to get{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              recommendations
            </span>
          </h1>
        </div>

        {/* Upload Section (no global text-center around results) */}
        <div className="max-w-2xl mx-auto mt-12">
          {!file && !loading && (
            <div
              role="button"
              tabIndex={0}
              onClick={chooseFile}
              onKeyDown={(e) => (e.key === "Enter" ? chooseFile() : null)}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`bg-white rounded-2xl shadow-lg border-2 border-dashed p-16 cursor-pointer transition-all duration-300 ${
                dragOver ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-gray-300"
              }`}
            >
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 rounded-full">
                    <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); chooseFile(); }}
                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-12 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-900 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Choose File
                  </button>
                </div>

                <p className="text-gray-500 text-lg text-center">
                  Accepted formats: <span className="font-medium text-gray-700">.pdf, .docx</span>
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={onInputChange}
          />

          {file && !loading && (
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-3 rounded-xl">
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">{file.name}</p>
                    <p className="text-gray-500">{formatSize(file.size)}</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={analyze}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-800 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Analyzing..." : "Get Recommendations"}
                  </button>
                  <button
                    onClick={removeSelected}
                    className="text-red-500 hover:text-red-700 p-3 rounded-xl hover:bg-red-50 transition-all"
                    aria-label="Remove file"
                    title="Remove file"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {err && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 text-left">
              {err}
            </div>
          )}

          {loading && (
            <div className="space-y-6 mt-8 text-center">
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 rounded-full animate-pulse">
                  <svg className="h-12 w-12 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </div>
              <p className="text-xl font-medium text-gray-700">Analyzing your resume...</p>
              <p className="text-gray-500">This may take a few moments</p>
            </div>
          )}

          {success && !loading && (
            <div className="space-y-8 mt-8 text-center">
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-4 rounded-full">
                  <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Analysis Complete!</h2>
                <p className="text-xl text-gray-600">Your personalized recommendations are ready.</p>
              </div>
              <button
                onClick={() => document.getElementById("resume-results")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-200 shadow-lg"
              >
                View Recommendations
              </button>
            </div>
          )}

          {/* Alternate Option */}
          {!loading && (
            <div className="mt-12 text-center">
              <p className="text-gray-600 text-lg mb-6">No resume available?</p>
              <button
                onClick={() => router.push("/recommendation")}
                className="bg-white text-gray-700 border-2 border-gray-300 px-10 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-md"
              >
                Enter Details
              </button>
            </div>
          )}
        </div>

        {/* RESULTS: no wrapper classes so JobResultsList keeps its own styling */}
        <section id="resume-results">
          <JobResultsList jobs={jobs} />
        </section>
      </div>
    </div>
  );
}
