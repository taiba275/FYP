"use client";

import React, { useState, useEffect } from "react";
import Hero from "./components/Home/Hero";
import Posts from "./components/Home/Posts";
import ScrollToTop from "./components/Home/ScrollToTop";
import Filter from "./components/Home/Filter";
import SearchBar from "./components/Home/SearchBar";

export default function HomeClient({ initialJobs }) {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
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

  // Reset page to 1 when filters or searchTerm change
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
          setJobs((prev) => [...prev, ...data]);
        }

        // If fewer than 20 results, no more to load
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
      <Hero setViewMode={setViewMode} />
      <SearchBar onSearch={setSearchTerm} />
      <Filter onFilterChange={setFilters} />
      {loading && page === 1 ? (
        <p>Loading jobs...</p>
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
