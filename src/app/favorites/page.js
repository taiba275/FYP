// C:\Projects\FYP\src\app\favorites\page.js
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import JobDetailsModal from "../components/JobDetailsModal";
import Posts from "../components/Home/Posts";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

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

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  // --- Delay removal after unheart ---
  const pendingRemovals = useRef(new Map());

  const handleFavoriteToggle = useCallback((jobId, isNowFavorite) => {
    const id = String(jobId);
    const map = pendingRemovals.current;

    if (!isNowFavorite) {
      // schedule remove after 500ms so user sees the unheart
      if (map.has(id)) clearTimeout(map.get(id));
      const t = setTimeout(() => {
        setFavorites(prev => prev.filter(j => String(j._id || j.id) !== id));
        map.delete(id);
      }, 500);
      map.set(id, t);
    } else {
      // re-hearted: cancel pending removal
      if (map.has(id)) {
        clearTimeout(map.get(id));
        map.delete(id);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      // cleanup any timers on unmount
      for (const t of pendingRemovals.current.values()) clearTimeout(t);
      pendingRemovals.current.clear();
    };
  }, []);

  return (
    <div>
      <h2 className="text-4xl font-extrabold text-center mt-4">Your Saved Jobs</h2>

      {loading ? (
        <div className="w-full h-[50vh] flex flex-col justify-center items-center bg-white">
          <div className="custom-loader wrapper scale-[1.4] mb-6">
            <div className="circle"></div><div className="circle"></div><div className="circle"></div>
          </div>
          <p className="text-gray-700 text-xl font-semibold mb-1">Loading your saved jobs…</p>
          <p className="text-gray-500 text-base">Please wait while we fetch the jobs</p>
        </div>
      ) : (
        <>
          <Posts
            jobs={favorites}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onCardClick={(job) => setSelectedJob(job)}
            onFavoriteToggle={handleFavoriteToggle}   // <- key change
          />
          {selectedJob && (
            <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
          )}
        </>
      )}
    </div>
  );
}
