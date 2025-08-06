'use client';

import React, { useState, useEffect } from 'react';

const FilterComponent = ({ onFilterChange, initialCategory = '' }) => {
  const [hovered, setHovered] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const [filters, setFilters] = useState({
    category: initialCategory,
    type: '',
    city: '',
    salaryOrder: '',
    experience: '',
    sortOrder: '',
  });

  const [filterOptions, setFilterOptions] = useState({
    extractedRoles: [],
    jobTypes: [],
    cities: [],
    experiences: [],
  });

  // ✅ Count active filters
  const appliedFiltersCount = Object.values(filters).filter(val => val !== '').length;

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch('/api/filters');
        const data = await res.json();
        setFilterOptions(data);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    if (initialCategory) {
      const updatedFilters = { ...filters, category: initialCategory };
      setFilters(updatedFilters);
      onFilterChange(updatedFilters);
    }
  }, [initialCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      category: '',
      type: '',
      city: '',
      salaryOrder: '',
      experience: '',
      sortOrder: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const renderDropdown = (label, name, options) => {
    const uniqueOptions = [...new Set(options)];

    return (
      <div
        className="relative"
        onMouseEnter={() => {
          if (hoverTimeout) clearTimeout(hoverTimeout);
          setHovered(name);
        }}
        onMouseLeave={() => {
          const timeout = setTimeout(() => setHovered(null), 250);
          setHoverTimeout(timeout);
        }}
      >
        {/* Dropdown Button */}
        <div className="p-2 bg-white rounded flex items-center justify-between cursor-pointer w-48 min-w-[12rem]">
          <span className="truncate">{filters[name] || label}</span>

          <div className="flex items-center space-x-2 ml-2">
            {/* ❌ Clear individual filter */}
            {filters[name] && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent dropdown from opening
                  handleChange({ target: { name, value: '' } });
                }}
                className="text-gray-400 hover:text-red-500 focus:outline-none"
                title={`Clear ${label}`}
              >
                ×
              </button>
            )}

            {/* ▼ Dropdown icon */}
            <svg
              className={`w-4 h-4 transition-transform ${hovered === name ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Dropdown Options */}
        {hovered === name && (
          <ul className="absolute z-50 bg-white border rounded shadow w-64 min-w-[16rem] mt-3 max-h-60 overflow-y-auto custom-scrollbar">
            {uniqueOptions.map(option => (
              <li
                key={option}
                onClick={() => {
                  handleChange({ target: { name, value: option } });
                  setHovered(null);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="flex text-black flex-wrap p-2 mx-8 bg-[#ededed] rounded-lg gap-4 z-10 items-center">
      {renderDropdown('Categories', 'category', filterOptions.extractedRoles || [])}
      {renderDropdown('Job Type', 'type', ['Permanent', 'Contract', 'Internship', 'Part Time'])}
      {renderDropdown('City', 'city', filterOptions.cities.filter(c => c.toLowerCase() !== 'city').map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()))}
      {renderDropdown('Sort Salary', 'salaryOrder', ['Ascending', 'Descending'])}
      {renderDropdown('Experience', 'experience', ['Not mentioned', '0', '1', '2', '3', '4'])}
      {renderDropdown('Sort by Date', 'sortOrder', ['Newest', 'Oldest'])}

      <div className="flex items-center gap-3 ml-auto">
        {appliedFiltersCount > 0 && (
          <div className="flex items-center justify-center py-0 px-2 rounded-full text-blue-500 text-xl font-bold">
            {appliedFiltersCount}
          </div>
        )}
        <button
          onClick={handleResetFilters}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default FilterComponent;
