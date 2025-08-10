"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Posts from "@/app/components/Home/Posts";

export default function RoleJobsPage() {
  const { role } = useParams();
  const decodedRole = decodeURIComponent(role || "");
  const router = useRouter();
  const sp = useSearchParams();

  const limit = 20;
  const pageFromUrl = Number(sp.get("page") || 1);
  const [page, setPage] = useState(pageFromUrl);

  useEffect(() => {
    const p = Number(sp.get("page") || 1);
    if (p !== page) setPage(p);
  }, [sp]);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/posts?role=${encodeURIComponent(decodedRole)}&page=${page}&limit=${limit}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        setJobs(data.jobs || []);
        setTotalCount(data.total || 0);
        setTotalPages(Math.max(1, Math.ceil((data.total || 0) / limit)));
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
        setJobs([]);
        setTotalCount(null);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [decodedRole, page]);

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage === page) return;
    router.push(`/jobs-by-role/${encodeURIComponent(decodedRole)}?page=${newPage}`);
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h1 className="text-black text-2xl font-bold mb-4 text-center w-full">
        Jobs for: {decodedRole}
      </h1>

      {loading ? (
        <div className="w-full h-[50vh] flex flex-col justify-center items-center bg-white">
          <div className="custom-loader wrapper scale-[1.4] mb-6">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
          </div>
          <p className="text-gray-700 text-xl font-semibold mb-1">
            Loading Jobs list for You…
          </p>
          <p className="text-gray-500 text-base">
            Please wait while we fetch the perfect matches
          </p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="w-full h-[50vh] flex flex-col justify-center items-center bg-white">
          <p className="text-gray-800 text-xl font-semibold mb-2">
            No matching jobs found
          </p>
          <p className="text-gray-500 text-base">
            Try adjusting your filters or search keywords
          </p>
        </div>
      ) : (
        <>
          <Posts
            jobs={jobs}
            viewMode={viewMode}
            setViewMode={setViewMode}
            totalsOverride={
              totalCount != null ? (
                <>
                  <strong className="font-bold">
                    {Number(totalCount).toLocaleString()}
                  </strong>{" "}
                  job opportunities waiting.
                </>
              ) : null
            }
          />

          {/* Pagination */}
          {jobs.length > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-2 flex-wrap">
              {page > 1 && (
                <button
                  onClick={() => goToPage(page - 1)}
                  className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  ← Prev
                </button>
              )}

              <button
                onClick={() => goToPage(1)}
                className={`px-3 py-2 rounded font-medium ${
                  page === 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                1
              </button>

              {page > 3 && <span className="px-2 text-gray-500">...</span>}

              {Array.from({ length: 3 }, (_, i) => page - 1 + i)
                .filter((pg) => pg > 1 && pg < totalPages)
                .map((pg) => (
                  <button
                    key={pg}
                    onClick={() => goToPage(pg)}
                    className={`px-3 py-2 rounded font-medium ${
                      pg === page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    {pg}
                  </button>
                ))}

              {page < totalPages - 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}

              {totalPages > 1 && page !== totalPages && (
                <button
                  onClick={() => goToPage(totalPages)}
                  className={`px-3 py-2 rounded font-medium ${
                    page === totalPages
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {totalPages}
                </button>
              )}

              {page < totalPages && (
                <button
                  onClick={() => goToPage(page + 1)}
                  className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Next →
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
