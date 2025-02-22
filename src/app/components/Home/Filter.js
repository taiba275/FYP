"use client";
import React, { useState } from "react";

const FilterComponent = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    category: "",
    type: "",
    city: "",
    salaryOrder: "",
    experience: "",
    dateFrom: "",
    dateTo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      category: "",
      type: "",
      city: "",
      salaryOrder: "",
      experience: "",
      dateFrom: "",
      dateTo: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="flex text-black flex-wrap items-center justify-between p-2 bg-gray-100 rounded-lg m-8 gap-4">
      {/* Category Dropdown */}
      <div className="relative">
        <select name="category" value={filters.category} onChange={handleChange} className="p-2 rounded w-full">
          <option value="">Category</option>
          <option value="recruitment">Recruitment / Employment Firms</option>
          <option value="business">Business Development</option>
          <option value="travel">Travel/Tourism/Transportation</option>
          <option value="advertising">Advertising / PR</option>
        </select>
      </div>

      {/* Job Type Dropdown */}
      <div className="relative">
        <select name="type" value={filters.type} onChange={handleChange} className="p-2 rounded w-full">
          <option value="">Job Type</option>
          <option value="full-time">Full Time/Permanent</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
          <option value="part-time">Part Time</option>
        </select>
      </div>

      {/* City Dropdown */}
      <div className="relative">
        <select name="city" value={filters.city} onChange={handleChange} className="p-2 rounded w-full">
          <option value="">City</option>
          <option value="karachi">Karachi</option>
          <option value="lahore">Lahore</option>
          <option value="islamabad">Islamabad</option>
          <option value="quetta">Quetta</option>
        </select>
      </div>

      {/* Salary Order Dropdown */}
      <div className="relative">
        <select name="salaryOrder" value={filters.salaryOrder} onChange={handleChange} className="p-2 rounded w-full">
          <option value="">Sort Salary</option>
          <option value="ascending">Ascending</option>
          <option value="descending">Descending</option>
        </select>
      </div>

      {/* Experience Filter */}
      <div className="relative">
        <select name="experience" value={filters.experience} onChange={handleChange} className="p-2 rounded w-full">
          <option value="">Experience</option>
          <option value="fresh">Fresh</option>
          <option value="1-3 years">1 - 3 Years</option>
          <option value="3-5 years">3 - 5 Years</option>
          <option value="5+ years">5+ Years</option>
        </select>
      </div>

      {/* Date From */}
      <div className="relative">
        <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleChange} className="p-1.5 rounded w-full" placeholder="Date From" />
      </div>

      {/* Date To */}
      <div className="relative">
        <input type="date" name="dateTo" value={filters.dateTo} onChange={handleChange} className="p-1.5 rounded w-full" placeholder="Date To" />
      </div>

      {/* Reset Button */}
      <button
        onClick={handleResetFilters}
        className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default FilterComponent;
