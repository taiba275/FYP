"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { FaThLarge, FaList, FaBriefcase, FaIdBadge, FaUserTie, FaHeart, FaRegHeart } from "react-icons/fa";
import JobDetailsModal from "../JobDetailsModal";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import JobTotal from "@/app/components/Home/JobTotal";

const ICONS = {
  linkedin: "/Images/LinkedIn.png",
  rozee: "/Images/rozee.pk.png",
  local: "/Images/j..png",
};

function getApplyUrl(post) {
  return (
    post["Job URL"] ??
    post.JobURL ??
    post.LinkedInURL ??
    post.jobUrl ??
    ""
  );
}

function getSourceBadge(post) {
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

  return { src: ICONS.local, alt: "Apply here", href: raw || `/jobs/${post._id}`, title: "Apply here" };
}

function capitalizeWords(str = "") {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function capitalizeSentences(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .split(/([.?!]\s*)/g)
    .map((part, i) =>
      i % 2 === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part
    )
    .join("");
}

function formatSalary(post) {
  const lower = post.salary_lower;
  const upper = post.salary_upper;
  const currency = post.currency || "PKR";

  const isValidNumber = (val) =>
    typeof val === "number" && !isNaN(val) && val > 0;

  if (isValidNumber(lower) && isValidNumber(upper)) {
    const formatWithCommas = (num) =>
      num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${currency.toLowerCase()}. ${formatWithCommas(lower)} - ${formatWithCommas(upper)}/month`;
  }

  if (typeof post.Salary === "string") {
    const s = post.Salary.trim();
    if (/^not\s+mentioned$/i.test(s)) return "Not mentioned";
    return s.replace(/\bnot\s+mentioned\b/gi, "Not mentioned");
  }

  return "Not disclosed";
}

export default function Posts({
  jobs = [],
  viewMode = "grid",
  setViewMode,
  onFavoriteToggle,
  showTotals = true,
  showViewToggle = true,
  totalsOverride = null,
}) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loadingPreviewId, setLoadingPreviewId] = useState(null);
  const [rightClickedJobId, setRightClickedJobId] = useState(null);
  const bcRef = useRef(null);

  useEffect(() => {
    try { bcRef.current = new BroadcastChannel("favorites"); } catch {}
    return () => { try { bcRef.current?.close(); } catch {} };
  }, []);

  const { user } = useAuth();

  async function openJobDetails(id) {
    setLoadingPreviewId(id);
    try {
      const res = await fetch(`/api/jobs/${id}`);
      const data = await res.json();
      setSelectedJob(data);
    } catch (err) {
      console.error("Failed to fetch job:", err);
    } finally {
      setLoadingPreviewId(null);
    }
  }

  useEffect(() => {
    if (!user) { setFavorites([]); return; }
    fetch("/api/user/favorites", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const favIds = (data.favorites || []).map((j) => (j._id || j).toString());
        setFavorites(favIds);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const onFavChanged = (payload) => {
      const { jobId, isFavorite } =
        payload?.detail || payload?.data || payload || {};
      if (!jobId) return;
      const id = String(jobId);
      setFavorites((prev) => {
        const has = prev.includes(id);
        if (isFavorite && !has) return [...prev, id];
        if (!isFavorite && has) return prev.filter((x) => x !== id);
        return prev;
      });
    };

    const onWindow = (e) => onFavChanged(e);
    window.addEventListener("favorites:changed", onWindow);

    let bc;
    try {
      bc = new BroadcastChannel("favorites");
      bc.onmessage = (e) => onFavChanged(e);
    } catch {}

    const onStorage = (e) => {
      if (e.key !== "favorites:changed") return;
      try {
        onFavChanged(JSON.parse(e.newValue || "{}"));
      } catch {}
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("favorites:changed", onWindow);
      window.removeEventListener("storage", onStorage);
      try { bc && bc.close(); } catch {}
    };
  }, []);

  const toggleFavorite = async (jobId) => {
    if (!user) return alert("Please log in to save jobs.");

    const idStr = String(jobId);
    const wasFavorite = favorites.includes(idStr);
    const prevFavorites = favorites;

    setFavorites(wasFavorite ? favorites.filter((id) => id !== idStr) : [...favorites, idStr]);
    onFavoriteToggle?.(idStr, !wasFavorite);

    try {
      const res = await fetch("/api/user/favorites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) throw new Error("Failed to toggle favorite");

      const data = await res.json();
      const serverFavIds = (data.favorites || []).map((j) => (j._id || j).toString());
      setFavorites(serverFavIds);

      const isNowFavorite = serverFavIds.includes(idStr);
      window.dispatchEvent(new CustomEvent("favorites:changed", {
        detail: { jobId: idStr, isFavorite: isNowFavorite },
      }));
      try { bcRef.current?.postMessage({ jobId: idStr, isFavorite: isNowFavorite }); } catch {}
      try { localStorage.setItem("favorites:changed", JSON.stringify({ jobId: idStr, isFavorite: isNowFavorite, ts: Date.now() })); } catch {}
    } catch (err) {
      console.error("Error updating favorites:", err);
      setFavorites(prevFavorites);
      onFavoriteToggle?.(idStr, wasFavorite);

      window.dispatchEvent(new CustomEvent("favorites:changed", {
        detail: { jobId: idStr, isFavorite: wasFavorite },
      }));
      try { bcRef.current?.postMessage({ jobId: idStr, isFavorite: wasFavorite }); } catch {}
      try { localStorage.setItem("favorites:changed", JSON.stringify({ jobId: idStr, isFavorite: wasFavorite, ts: Date.now() })); } catch {}
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (rightClickedJobId) setRightClickedJobId(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [rightClickedJobId]);

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 md:px-8">
        {(showTotals || showViewToggle) && (
        <div className="w-full flex items-center justify-between mb-6">
          {showTotals && (
            <p className="text-sm md:text-base text-gray-700">
              {totalsOverride ?? <JobTotal className="w-full md:w-auto" />} {/* 👈 NEW */}
            </p>
          )}
          {showViewToggle && (
            <div className="flex items-center space-x-3">
              <button onClick={() => setViewMode("list")} className="bg-gray-200 hover:bg-gray-400 p-1 rounded transition" title="List View">
                <FaList className="w-4 h-4 text-gray-700" />
              </button>
              <button onClick={() => setViewMode("grid")} className="bg-gray-200 hover:bg-gray-400 p-1 rounded transition" title="Grid View">
                <FaThLarge className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* {(showTotals || showViewToggle) && (
        <div className="w-full flex items-center justify-between mb-6">
          {showTotals && (
            <p className="text-sm md:text-base text-gray-700">
              <JobTotal className="w-full md:w-auto" />
            </p>
          )}
          {showViewToggle && (
            <div className="flex items-center space-x-3">
              <button onClick={() => setViewMode("list")} className="bg-gray-200 hover:bg-gray-400 p-1 rounded transition" title="List View">
                <FaList className="w-4 h-4 text-gray-700" />
              </button>
              <button onClick={() => setViewMode("grid")} className="bg-gray-200 hover:bg-gray-400 p-1 rounded transition" title="Grid View">
                <FaThLarge className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          )}
        </div>
      )} */}

      {/* Job cards */}
      <div
        className={`w-full ${
          viewMode === "list"
            ? "flex flex-col gap-4"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        }`}
      >
        {jobs.map((post) => {
          const badge = getSourceBadge(post);
          return (
            <div key={post._id} className="relative">
              {/* The ONLY anchor: the card link */}
              <Link
                href={`/jobs/${post._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div
                  onContextMenu={(e) => {
                    e.stopPropagation();
                    setRightClickedJobId(post._id);
                  }}
                  className={`cursor-pointer bg-white rounded-lg shadow-md p-5 
                    ${rightClickedJobId === post._id ? "border-black" : "border-gray-200"}
                    border hover:shadow-xl transition-transform hover:-translate-y-1 
                    flex flex-col h-auto overflow-hidden relative ${viewMode === "list" ? "w-full" : ""}`}
                >
                  {/* Heart icon (button, not anchor) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (user) toggleFavorite(post._id);
                    }}
                    className={`absolute top-3 right-10 text-xl z-10 ${
                      user ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                    }`}
                    title={
                      !user
                        ? "Login to save jobs"
                        : favorites.includes(String(post._id))
                          ? "Remove from favorites"
                          : "Add to favorites"
                    }
                  >
                    {favorites.includes(String(post._id)) ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FaRegHeart className="text-gray-400 hover:text-red-500" />
                    )}
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-lg font-semibold text-gray-900 truncate w-4/5">
                      {capitalizeWords(post.Company)}
                    </h5>
                    {post.Remote && (
                      <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md">
                        REMOTE
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                    {capitalizeWords(post.Title)}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3 overflow-hidden">
                    {capitalizeSentences(post.Description)}
                  </p>

                  <div className="flex flex-col text-sm text-blue-500 mb-3">
                    <p className="truncate flex items-center gap-2 text-blue">
                      <FaBriefcase className="inline w-4 h-4 text-blue" aria-hidden />
                      <strong>Role:</strong>{" "}
                      {capitalizeWords(post?.ExtractedRole || "Not mentioned")}
                    </p>

                    <p className="truncate flex items-center gap-2 text-black">
                      <img src="/Images/city.png" alt="City" className="w-4 h-4 inline" />
                      <strong>City:</strong>{" "}
                      {post.City?.toLowerCase()
                        .split(" ")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </p>

                    <p className="truncate flex items-center gap-2 text-[#B81212]">
                      <img src="/Images/pin.png" alt="Location" className="w-4 h-4 inline" />
                      <strong>Area:</strong> {post.Area || "Not mentioned"}
                    </p>

                    <p
                      className={`font-bold flex items-center gap-2 ${
                        post.salary_lower && post.salary_upper
                          ? "text-green-500"
                          : post.Salary
                            ? "text-green-500"
                            : "text-yellow-500"
                      }`}
                    >
                      <img src="/Images/salary.png" alt="Salary" className="w-4 h-4 inline" />
                      <strong>Salary:</strong> {formatSalary(post)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => { e.preventDefault(); openJobDetails(post._id); }}
                    disabled={loadingPreviewId === post._id}
                    aria-busy={loadingPreviewId === post._id}
                    className={`w-full bg-gray-900 text-white py-2 rounded-md text-sm font-medium transition
                      ${loadingPreviewId === post._id ? "opacity-70 cursor-wait" : "hover:bg-gray-800"}`}
                  >
                    {loadingPreviewId === post._id ? "Loading..." : "Preview"}
                  </button>
                </div>
              </Link>

              {/* Badge rendered as a SIBLING (not inside the Link) */}
              {badge && (
                <div className="absolute top-3 right-3 z-20">
                  <a
                    href={badge.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={badge.title}
                    aria-label={badge.title}
                  >
                    <img src={badge.src} alt={badge.alt} className="w-5 h-5" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedJob && (
        <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
