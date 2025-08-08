// C:\Projects\FYP\src\app\favorites\page.js
"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import JobDetailsModal from "../components/JobDetailsModal";
import Posts from "../components/Home/Posts";
import { useUI } from "../context/UIContext";
import { FaThLarge, FaList,FaRegHeart } from "react-icons/fa";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [clearing, setClearing] = useState(false); // NEW
  const { searchTerm } = useUI();

  function normalizeString(v) {
    if (v == null) return "";
    if (Array.isArray(v)) return v.join(" ");
    return String(v);
  }

  function matchesSearch(post, termRaw) {
    const term = (termRaw || "").trim().toLowerCase();
    if (!term) return true;
    const haystack = [
      post.Title,
      post.Company,
      post.City,
      post.Area,
      post.ExtractedRole,
      post["Functional Area"] ?? post.FunctionalArea,
      post["Job Type"],
      post["Job Location"],
      post.Industry,
    ]
      .map(normalizeString)
      .join(" ")
      .toLowerCase();

    return term.split(/\s+/).every((t) => haystack.includes(t));
  }

  const filteredFavorites = useMemo(
    () => favorites.filter((p) => matchesSearch(p, searchTerm)),
    [favorites, searchTerm]
  );

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/favorites", { credentials: "include" });
      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      console.error("Error fetching favorites:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // --- Delay removal after unheart ---
  const pendingRemovals = useRef(new Map());

  const handleFavoriteToggle = useCallback((jobId, isNowFavorite) => {
    const id = String(jobId);
    const map = pendingRemovals.current;

    if (!isNowFavorite) {
      if (map.has(id)) clearTimeout(map.get(id));
      const t = setTimeout(() => {
        setFavorites((prev) => prev.filter((j) => String(j._id || j.id) !== id));
        map.delete(id);
      }, 500);
      map.set(id, t);
    } else {
      if (map.has(id)) {
        clearTimeout(map.get(id));
        map.delete(id);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      for (const t of pendingRemovals.current.values()) clearTimeout(t);
      pendingRemovals.current.clear();
    };
  }, []);

  // NEW: Clear all favorites
  const clearAllFavorites = useCallback(async () => {
    if (!favorites.length || clearing) return;
    const ok = window.confirm("Unfavorite all saved jobs?");
    if (!ok) return;

    try {
      setClearing(true);
      const res = await fetch("/api/user/favorites", {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to clear favorites");
      // Optimistically clear UI
      setFavorites([]);
      // Clean up any pending timeouts just in case
      for (const t of pendingRemovals.current.values()) clearTimeout(t);
      pendingRemovals.current.clear();
    } catch (e) {
      console.error("Failed to unfavorite all:", e);
      alert("Sorry, something went wrong clearing favorites.");
    } finally {
      setClearing(false);
    }
  }, [favorites.length, clearing]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
      <h2 className="text-3xl font-bold text-center mt-4">Your Saved Jobs</h2>

      {loading ? (
        <div className="w-full h-[50vh] flex flex-col justify-center items-center bg-white">
          <div className="custom-loader wrapper scale-[1.4] mb-6">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
          </div>
          <p className="text-gray-700 text-xl font-semibold mb-1">Loading your saved jobs…</p>
          <p className="text-gray-500 text-base">Please wait while we fetch the jobs</p>
        </div>
      ) : (
        <>
          {/* One line: left = count, right = buttons */}
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
            <div className="w-full flex items-center justify-between mb-6">
              <div className="text-sm md:text-base text-gray-700">
                {searchTerm?.trim() ? (
                  <>
                    Showing <strong className="text-black">{filteredFavorites.length}</strong> of{" "}
                    <strong className="text-black">{favorites.length}</strong> saved jobs for “{searchTerm}”.
                  </>
                ) : (
                  <>
                    <strong className="text-black">{favorites.length}</strong> saved jobs.
                  </>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {/* NEW: Unfavorite all button — placed to the LEFT of view toggles */}
                <button
                  onClick={clearAllFavorites}
                  disabled={clearing || favorites.length === 0}
                  className={`bg-gray-200 hover:bg-gray-400 p-1 rounded transition
                  ${clearing || favorites.length === 0 ? "opacity-50 cursor-not-allowed" : ""} `}
                  title={clearing ? "Unfavoriting…" : "Unfavorite all"}
                  aria-label={clearing ? "Unfavoriting…" : "Unfavorite all"}
                >
                  <FaRegHeart className="w-4 h-4 text-gray-700" />
                </button>

                <button
                  onClick={() => setViewMode("list")}
                  className="bg-gray-200 hover:bg-gray-400 p-1 rounded transition"
                  title="List View"
                >
                  <FaList className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className="bg-gray-200 hover:bg-gray-400 p-1 rounded transition"
                  title="Grid View"
                >
                  <FaThLarge className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
          </div>

          {filteredFavorites.length === 0 ? (
            <div className="text-gray-600">No matches found.</div>
          ) : (
            <Posts
              jobs={filteredFavorites}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onCardClick={(job) => setSelectedJob(job)}
              onFavoriteToggle={handleFavoriteToggle}
              showTotals={false}        // hide totals inside Posts
              showViewToggle={false}    // hide toggles inside Posts
            />
          )}

          {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
        </>
      )}
    </div>
  );
}
