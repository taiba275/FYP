"use client";
import { useEffect, useState } from "react";
import JobDetailsModal from "../components/JobDetailsModal";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetch("/api/user/favorites", { credentials: "include" })
      .then(res => res.json())
      .then(data => setFavorites(data.favorites || []));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Saved Jobs</h1>
      {favorites.length === 0 ? (
        <p className="text-gray-600">You haven't added any jobs to favorites yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(job => (
            <div
              key={job._id}
              className="bg-white p-5 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedJob(job)}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">{job.Title}</h3>
              <p className="text-sm text-gray-600 mb-1">{job.Company}</p>
              <p className="text-sm text-gray-600">{job.City}</p>
            </div>
          ))}
        </div>
      )}
      {selectedJob && (
        <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
