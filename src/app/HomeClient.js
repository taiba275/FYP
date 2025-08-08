"use client";

import React, { useState, useEffect } from "react";
import Hero from "./components/Home/Hero";
import Posts from "./components/Home/Posts";
import ScrollToTop from "./components/Home/ScrollToTop";
import Filter from "./components/Home/Filter";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModel";
import { useAuth } from "./context/AuthContext";
import { useUI } from "./context/UIContext";
import ChatbotWidget from "./components/ChatbotWidget";
import "./globals.css";

export default function HomeClient({ initialJobs, initialCategory = "" }) {
  const [viewMode, setViewMode] = useState("grid");

  const {
    searchTerm,
    setSearchTerm,
    showLoginModal,
    showSignupModal,
    setShowLoginModal,
    setShowSignupModal,
  } = useUI();

  const [filters, setFilters] = useState({
    category: initialCategory,
    type: "",
    city: "",
    salaryOrder: "",
    experience: "",
    dateFrom: "",
  });

  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState(initialJobs || []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useAuth();

  const isDefaultFilters = Object.values(filters).every((value) => value === "");
  const isSearchEmpty = searchTerm.trim() === "";
  const showHeroTop = isDefaultFilters && isSearchEmpty;

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters]);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      const query = new URLSearchParams();

      if (searchTerm) query.append("search", searchTerm);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query.append(key, value);
      });
      query.append("limit", 20);
      query.append("page", page);
      try {
        const res = await fetch(`/api/posts?${query.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();

        setJobs(data.jobs);
        setTotalPages(Math.ceil(data.total / 20));
        setHasMore(data.jobs.length < data.total);

      } catch (error) {
        console.error(error);
        if (page === 1) setJobs([]);
        setHasMore(false);
      }
      setLoading(false);
    }

    fetchJobs();
  }, [searchTerm, filters, page]);

  return (
    <div>
      <Filter onFilterChange={setFilters} initialCategory={initialCategory} />
      <Hero setViewMode={setViewMode} showTop={showHeroTop} />
      <div className={`transition-all duration-500 ease-in-out ${showHeroTop ? "mt-12" : "mt-4"}`}>
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
          <Posts jobs={jobs} viewMode={viewMode} setViewMode={setViewMode} />
        )}

        {jobs.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 gap-2 flex-wrap">
            {/* Show current, 2 before, 2 after */}
            {page > 1 && (
              <button
                onClick={() => setPage((prev) => prev - 1)}
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                ← Prev
              </button>
            )}

            {/* Always show first page */}
            <button
              onClick={() => setPage(1)}
              className={`px-3 py-2 rounded font-medium ${page === 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
            >
              1
            </button>

            {/* Ellipsis after first page */}
            {page > 3 && <span className="px-2 text-gray-500">...</span>}

            {/* Dynamic middle pages */}
            {Array.from({ length: 3 }, (_, i) => page - 1 + i)
              .filter((pg) => pg > 1 && pg < totalPages)
              .map((pg) => (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`px-3 py-2 rounded font-medium ${pg === page ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                >
                  {pg}
                </button>
              ))}
            {/* Ellipsis before last page */}
            {page < totalPages - 2 && <span className="px-2 text-gray-500">...</span>}

            {/* Always show last page (if not already visible) */}
            {totalPages > 1 && page !== totalPages && (
              <button
                onClick={() => setPage(totalPages)}
                className={`px-3 py-2 rounded font-medium ${page === totalPages ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
              >
                {totalPages}
              </button>
            )}

            {/* Next button */}
            {page < totalPages && (
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Next →
              </button>
            )}
          </div>
        )}
      </div>
      <ScrollToTop />
      <ChatbotWidget />
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showSignupModal && <SignupModal onClose={() => setShowSignupModal(false)} />}
    </div>
  );
}
