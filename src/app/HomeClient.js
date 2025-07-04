"use client";

import React, { useState, useEffect } from "react";
import Hero from "./components/Home/Hero";
import Posts from "./components/Home/Posts";
import ScrollToTop from "./components/Home/ScrollToTop";
import Filter from "./components/Home/Filter";
import Header from "./components/Header";
import './globals.css';

export default function HomeClient({ initialJobs, initialCategory = "" }) {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
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

  // Reset page when filters/searchTerm change
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

        if (page === 1) {
          setJobs(data);
        } else {
          const existingIds = new Set(jobs.map((job) => job._id));
          const newJobs = data.filter((job) => !existingIds.has(job._id));
          setJobs((prev) => [...prev, ...newJobs]);
        }

        setHasMore(data.length === 20);
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
      <Header onSearch={setSearchTerm} /> 
      <Filter onFilterChange={setFilters} initialCategory={initialCategory} />
      <Hero setViewMode={setViewMode} />

      {loading && page === 1 ? (
        <div className="w-full h-[50vh] flex flex-col justify-center items-center color-blue bg-white">
          <div className="custom-loader wrapper scale-[1.4] mb-6">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
          </div>
          <p className="text-gray-700 text-xl font-semibold mb-1">Loading Jobs list for You…</p>
          <p className="text-gray-500 text-base">Please wait while we fetch the perfect matches</p>
        </div>
      ) : (
        <Posts jobs={jobs} viewMode={viewMode} />
      )}

      {hasMore && !loading && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="block mx-auto mt-6 px-6 py-4 bg-blue-500 text-white font-bold text-xl rounded hover:bg-blue-600"
        >
          Load More
        </button>
      )}
      <ScrollToTop />
    </div>
  );
}
