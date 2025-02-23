"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import FilterComponent from "./Filter";

export default function Posts({ initialJobs = [], viewMode = 'grid' }) {
  const [allPosts, setAllPosts] = useState(initialJobs);
  const [filteredPosts, setFilteredPosts] = useState(initialJobs);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    type: "",
    city: "",
    salaryOrder: "",
    experience: "",
    dateFrom: "",
    dateTo: "",
  });
  const [jobsToShow, setJobsToShow] = useState(20);

  useEffect(() => {
    if (initialJobs.length === 0) {
      async function fetchPosts() {
        setIsLoading(true);
        try {
          const response = await fetch("/api/posts");
          if (!response.ok) throw new Error("Failed to fetch posts");
          const data = await response.json();
          setAllPosts(data);
          setFilteredPosts(data);
        } catch (error) {
          console.error("Error fetching posts:", error);
        } finally {
          setIsLoading(false);
        }
      }
      fetchPosts();
    }
  }, [initialJobs.length]);

  // Apply filters
  useEffect(() => {
    let filtered = allPosts;
    if (filters.category) {
      filtered = filtered.filter((post) => post.Industry.toLowerCase().includes(filters.category.toLowerCase()));
    }
    if (filters.type) {
      filtered = filtered.filter((post) => post["Job Type"].toLowerCase().includes(filters.type.toLowerCase()));
    }
    if (filters.city) {
      filtered = filtered.filter((post) => post.City.toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.experience) {
      filtered = filtered.filter((post) => post.Experience.toLowerCase().includes(filters.experience.toLowerCase()));
    }
    if (filters.dateFrom) {
      filtered = filtered.filter((post) => new Date(post["Posting Date"]) >= new Date(filters.dateFrom));
    }
    if (filters.salaryOrder === "ascending") {
      filtered = filtered.sort((a, b) => parseInt(a.Salary.replace(/\D/g, "")) - parseInt(b.Salary.replace(/\D/g, "")));
    } else if (filters.salaryOrder === "descending") {
      filtered = filtered.sort((a, b) => parseInt(b.Salary.replace(/\D/g, "")) - parseInt(a.Salary.replace(/\D/g, "")));
    }
    setFilteredPosts(filtered);
  }, [filters, allPosts]);

  // Load More Jobs
  const loadMoreJobs = () => {
    setJobsToShow(jobsToShow + 20);
    setJobsToShow(jobsToShow + 20);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-9">
      <FilterComponent onFilterChange={setFilters} />
      <div className={`w-full px-4 md:px-8 ${
        viewMode === 'list' 
          ? 'flex flex-col gap-4' 
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      }`}>
        {filteredPosts.slice(0, jobsToShow).map((post) => (
          <Link key={post._id} href={`/jobs/${post._id}`} passHref>
            <div className={`cursor-pointer bg-white rounded-lg shadow-md p-5 border border-gray-200 
              hover:shadow-xl transition-transform hover:-translate-y-1 flex flex-col h-auto overflow-hidden
              ${viewMode === 'list' ? 'w-full' : ''}`}>
              <div className="flex justify-between items-center mb-3">
                <h5 className="text-lg font-semibold text-gray-900 truncate w-4/5">{post.Company}</h5>
                {post.Remote && (
                  <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md">REMOTE</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{post.Title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3 overflow-hidden">{post.Description}</p>
              <div className="flex flex-col text-sm text-gray-500 mb-3">
                <p className="truncate">
                  <span className="font-semibold">📍 Area:</span> {post.Area || "Not mentioned"}
                </p>
                <p className="truncate">
                  <span className="font-semibold">🌆 City:</span> {post.City}
                </p>
                <p className={`font-bold ${post.Salary ? "text-green-500" : "text-yellow-500"}`}>
                  <span className="font-semibold">💰 Salary:</span> {post.Salary || "Not Disclosed"}
                </p>
              </div>
              <button className="w-full bg-gray-900 text-white py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition">
                View Details
              </button>
            </div>
          </Link>
        ))}
      </div>

      {filteredPosts.length > jobsToShow && (
        <button onClick={loadMoreJobs} className="mt-6 px-6 py-4 bg-blue-500 text-white font-bold text-xl rounded hover:bg-blue-600">
          Show More
        </button>
      )}
    </div>
  );
}
