// app/jobs-by-role/[role]/page.js  (adjust path if yours is different)
"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Posts from "@/app/components/Home/Posts";

export default function RoleJobsPage() {
  const { role } = useParams();
  const router = useRouter();
  const sp = useSearchParams();

  const decodedRole = decodeURIComponent(role || "");
  const limit = 20;

  // derive page from URL so back/forward + sharing work
  const pageFromUrl = Number(sp.get("page") || 1);
  const [page, setPage] = useState(pageFromUrl);

  // keep local state in sync with URL
  useEffect(() => {
    const p = Number(sp.get("page") || 1);
    if (p !== page) setPage(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  // simple cache (optional but safe)
  const cacheRef = useRef({});

  useEffect(() => {
    const controller = new AbortController();

    async function fetchJobs() {
      try {
        setLoading(true);

        // serve from cache if we have it
        const key = `${decodedRole}|${page}`;
        if (cacheRef.current[key]) {
          const { jobs, total } = cacheRef.current[key];
          setJobs(jobs);
          setTotalCount(total);
          setTotalPages(Math.max(1, Math.ceil(total / limit)));
          setLoading(false);
          return;
        }

        const res = await fetch(
          `/api/jobs-by-role?role=${encodeURIComponent(decodedRole)}&page=${page}&limit=${limit}`,
          { cache: "no-store", signal: controller.signal }
        );
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();

        const jobsArr = Array.isArray(data.jobs) ? data.jobs : [];
        const total = Number(data.total || 0);

        cacheRef.current[key] = { jobs: jobsArr, total };

        setJobs(jobsArr);
        setTotalCount(total);
        setTotalPages(Math.max(1, Math.ceil(total / limit)));
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch jobs:", err);
          setJobs([]);
          setTotalCount(null);
          setTotalPages(1);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
    return () => controller.abort();
  }, [decodedRole, page]);

  // update URL (this triggers the effect above)
  const goToPage = (newPage) => {
    if (newPage < 1 || newPage === page) return;
    router.push(`/jobs-by-role/${encodeURIComponent(decodedRole)}?page=${newPage}&limit=${limit}`);
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h1 className="text-black text-2xl font-bold mb-4 text-center w-full">
        Jobs for: {decodedRole}
      </h1>

      {loading && page === 1 ? (
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

          {/* SAME UI as your HomeClient pagination */}
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
