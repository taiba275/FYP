"use client";

import React, { useEffect, useState } from "react";
import Posts from "../components/Home/Posts";
import FilterComponent from "../components/Home/Filter";

export default function Page() {
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    type: "",
    city: "",
    salaryOrder: "",
    experience: "",
    dateFrom: "",
    dateTo: "",
  });
  const [jobsToShow, setJobsToShow] = useState(20); // Initially show 20 jobs

  useEffect(() => {
    async function fetchPosts() {
      console.log("Fetching posts...");
      try {
        const response = await fetch("/api/posts");
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        setAllPosts(data);
        setFilteredPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }
    fetchPosts();
  }, []);

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
      filtered = filtered.filter((post) => post["Job Location"].toLowerCase().includes(filters.city.toLowerCase()));
    }

    if (filters.experience) {
      filtered = filtered.filter((post) => post.Experience.toLowerCase().includes(filters.experience.toLowerCase()));
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((post) => new Date(post["Posting Date"]) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter((post) => new Date(post["Posting Date"]) <= new Date(filters.dateTo));
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
    setJobsToShow(jobsToShow + 20); // Increase the number of jobs displayed by 20
  };

  return (
    <div className="flex flex-col items-center justify-center mt-9">
      <h1 className="text-3xl text-black font-bold mb-6">All Job Posts</h1>
      <FilterComponent onFilterChange={setFilters} />
      <Posts posts={filteredPosts.slice(0, jobsToShow)} /> {/* Display only the first 'jobsToShow' jobs */}
      {filteredPosts.length > jobsToShow && (
        <button
          onClick={loadMoreJobs}
          className="mt-16 px-6 py-4 bg-blue-500 text-white font-bold text-xl rounded hover:bg-blue-600"
        >
          Show More
        </button>
      )}
    </div>
  );
}
