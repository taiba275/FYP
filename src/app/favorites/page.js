// "use client";
// import { useEffect, useState } from "react";
// import JobDetailsModal from "../components/JobDetailsModal";

// export default function FavoritesPage() {
//   const [favorites, setFavorites] = useState([]);
//   const [selectedJob, setSelectedJob] = useState(null);

//   useEffect(() => {
//     fetch("/api/user/favorites", { credentials: "include" })
//       .then(res => res.json())
//       .then(data => setFavorites(data.favorites || []));
//   }, []);

//   return (
//     <div className="p-6 max-w-5xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Saved Jobs</h1>
//       {favorites.length === 0 ? (
//         <p className="text-gray-600">You haven't added any jobs to favorites yet.</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {favorites.map(job => (
//             <div
//               key={job._id}
//               className="bg-white p-5 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition"
//               onClick={() => setSelectedJob(job)}
//             >
//               <h3 className="text-xl font-bold text-gray-800 mb-2">{job.Title}</h3>
//               <p className="text-sm text-gray-600 mb-1">{job.Company}</p>
//               <p className="text-sm text-gray-600">{job.City}</p>
//             </div>
//           ))}
//         </div>
//       )}
//       {selectedJob && (
//         <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import JobDetailsModal from "../components/JobDetailsModal";
import Posts from "../components/Home/Posts";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch("/api/user/favorites", {
          credentials: "include",
        });
        const data = await res.json();
        setFavorites(data.favorites || []);
      } catch (err) {
        console.error("Error fetching favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <div>
      <h2 className="text-4xl font-extrabold text-center mt-4">Your Saved Jobs</h2>

      {loading ? (
        <div className="w-full h-[50vh] flex flex-col justify-center items-center bg-white">
          <div className="custom-loader wrapper scale-[1.4] mb-6">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
          </div>
          <p className="text-gray-700 text-xl font-semibold mb-1">
            Loading your saved jobs…
          </p>
          <p className="text-gray-500 text-base">
            Please wait while we fetch the jobs
          </p>
        </div>
      ) : (
        <>
          <Posts
            jobs={favorites}
            viewMode={viewMode}
            onCardClick={(job) => setSelectedJob(job)}
            onFavoriteToggle={() => fetchFavorites()} // trigger re-fetch on (un)favorite
          />

          {selectedJob && (
            <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
          )}
        </>
      )}
    </div>
  );
}
