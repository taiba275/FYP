"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRef } from "react";

export const dynamic = "force-dynamic";


const ICONS = {
  linkedin: "/Images/LinkedIn.png",
  rozee: "/Images/rozee.pk.png",
  local: "/Images/j..png",
};


function getApplyUrl(post) {
  // Prefer the “Job URL” used by the Apply Now button (different keys just in case)
  return (
    post["Job URL"] ??
    post.JobURL ??
    post.LinkedInURL ?? // legacy
    post.jobUrl ??      // safety
    ""
  );
}

function getSourceBadge(post) {
  // Jobs created on our website
  if (post.userId) {
    return {
      src: ICONS.local,
      alt: "Posted on our site",
      href: getApplyUrl(post) || `/jobs/${post._id}`,
      title: "Job posted on our site",
    };
  }

  const raw = getApplyUrl(post);
  if (!raw) return null;

  let host = "";
  try {
    host = new URL(raw).hostname.toLowerCase();
  } catch {
    // non-URL string; treat as local/fallback
    return {
      src: ICONS.local,
      alt: "Apply here",
      href: raw || `/jobs/${post._id}`,
      title: "Apply here",
    };
  }

  if (host.includes("linkedin.com")) {
    return { src: ICONS.linkedin, alt: "LinkedIn", href: raw, title: "View on LinkedIn" };
  }
  if (host.includes("rozee.pk")) {
    return { src: ICONS.rozee, alt: "ROZEE.PK", href: raw, title: "View on ROZEE.PK" };
  }

  // default/fallback
  return { src: ICONS.local, alt: "Apply here", href: raw || `/jobs/${post._id}`, title: "Apply here" };
}


export default function JobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const bcRef = useRef(null);

    useEffect(() => {
    try { bcRef.current = new BroadcastChannel("favorites"); } catch {}
    return () => { try { bcRef.current?.close(); } catch {} };
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/jobs/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then(setJob)
      .catch(console.error);
  }, [id]);

  useEffect(() => {
  if (!job) return;
  fetch("/api/user/favorites", { credentials: "include" })
    .then((r) => r.json())
    .then((data) => {
      const ids = (data.favorites || []).map((j) => (j._id || j).toString());
      setIsFavorite(ids.includes(job._id));
    })
    .catch(() => {});
}, [job]);


useEffect(() => {
  const handler = (e) => {
    const { jobId, isFavorite } = e.detail || {};
    if (!job || jobId !== job._id) return;
    setIsFavorite(!!isFavorite);
  };
  window.addEventListener("favorites:changed", handler);
  return () => window.removeEventListener("favorites:changed", handler);
}, [job]);


  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    let date = new Date(dateValue);

    // Try parsing "dd/mm/yyyy" manually if needed
    if (isNaN(date)) {
      const parts = String(dateValue).split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        date = new Date(`${year}-${month}-${day}`);
      }
    }

    if (isNaN(date)) return "Invalid date";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };


  const formatSalary = (post) => {
    const lower = post.salary_lower;
    const upper = post.salary_upper;
    const currency = post.currency || "PKR";

    if (typeof lower === "number" && typeof upper === "number") {
      const format = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `${currency}. ${format(lower)} - ${format(upper)}/month`;
    }
    return post.Salary || "Not disclosed";
  };

  const capitalizeWords = (str = "") =>
    str
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const capitalizeSentences = (text = "") =>
    text
      .split(/([.?!]\s*)/g)
      .map((part, i) =>
        i % 2 === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part
      )
      .join("");


 const toggleFavorite = async () => {
    const res = await fetch("/api/user/favorites", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ jobId: job._id }),
    });
    const data = await res.json();

    const fav = (data.favorites || []).some(
      (j) => (j._id || j).toString() === job._id
    );
    setIsFavorite(fav);

    const payload = { jobId: job._id.toString(), isFavorite: fav };

    // same-tab (modal/list on same page)
    window.dispatchEvent(new CustomEvent("favorites:changed", { detail: payload }));

    // cross-tab
    try { bcRef.current?.postMessage(payload); } catch {}

    // fallback to storage (fires only on other tabs)
    try { localStorage.setItem("favorites:changed", JSON.stringify({ ...payload, ts: Date.now() })); } catch {}
  };


  const handleShare = () => {
    const jobUrl = `${window.location.origin}/jobs/${job._id}`;
    navigator.clipboard.writeText(jobUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => alert("Failed to copy link"));
  };

  const handleApplyNow = () => {
    if (job["Job URL"]) {
      window.open(job["Job URL"], "_blank");
    } else if (job.CompanyEmail) {
      window.location.href = `mailto:${job.CompanyEmail}`;
    } else {
      alert("No application method available.");
    }
  };

  if (!job) {
    return (
      <div className="w-full h-[50vh] flex flex-col justify-center items-center bg-white">
        <div className="custom-loader wrapper scale-[1.4] mb-6">
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
        </div>
        <p className="text-gray-700 text-xl font-semibold mb-1">
          Loading Job Details for You…
        </p>
        <p className="text-gray-500 text-base">
          Please wait while we fetch the complete information
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-12 p-16">
        {/* Source badge (LinkedIn / ROZEE / Local) */}
          {(() => {
            const badge = getSourceBadge(job);
            if (!badge) return null;
            return (
              <div className="absolute right-14 mr-14 z-10">
                <a href={badge.href} target="_blank" rel="noopener noreferrer">
                  <img
                    src={badge.src}
                    alt={badge.alt}
                    className="w-16 h-16"
                    title={badge.title}
                  />
                </a>
              </div>
            );
          })()}

        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          {capitalizeWords(job.Title)}
        </h2>

        <p className="text-gray-700 text-lg mb-1">
          <strong>🏢 Company:</strong> {capitalizeWords(job.Company)}
        </p>
        <p className="text-gray-700 text-lg mb-1">
          <strong>📍 Location:</strong> {capitalizeWords(job.City)}
        </p>
        <p className="text-gray-700 text-lg mb-1">
          <strong>🧑‍💼 Experience:</strong> {job.Experience || "Not mentioned"}
        </p>
        <p className="text-gray-700 text-lg mb-1">
          <strong>🕒 Job Type:</strong> {job["Job Type"]}
        </p>
        <p className="text-gray-700 text-lg mb-1">
          <strong>📅 Posting Date:</strong> {formatDate(job["Posting Date"])}
        </p>
        <p className="text-gray-700 text-lg mb-1">
          <strong>⏳ Apply Before:</strong> {formatDate(job["Apply Before"])}
        </p>
        <p className="text-gray-700 text-lg mb-6">
          <strong>💰 Salary:</strong> {formatSalary(job)}
        </p>

        <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
          <strong className="text-2xl">Job Description</strong>
          <br />
          {capitalizeSentences(job.Description)}
        </p>

        {job.Skills && (
          <div className="mt-6">
            <strong className="text-lg text-gray-800">Required Skills:</strong>
            <ul className="list-disc list-inside mt-2 text-gray-700">
              {job.Skills.split(",").map((skill, i) => (
                <li key={i}>{skill.trim()}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 justify-end items-center">
          <button
            onClick={handleShare}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-lg font-medium hover:bg-gray-300 transition"
          >
            🔗 {copied ? "Link Copied!" : "Share Job"}
          </button>

          <button
            onClick={toggleFavorite}
            className={`px-4 py-2 rounded-md text-lg font-medium transition ${isFavorite
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
          >
            {isFavorite ? "🤍 Favorited" : "❤️ Add to Favorites"}
          </button>

          <button
            onClick={handleApplyNow}
            className="bg-gray-900 text-white px-6 py-2 rounded-md text-lg font-medium hover:bg-gray-800 transition"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}
