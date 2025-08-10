'use client';

import React, { useState, useEffect } from 'react';

const FilterComponent = ({
  onFilterChange,
  initialCategory = '',
  categorySource = 'role', // 👈 new prop
}) => {
  const [hovered, setHovered] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  // ✅ include the four facet fields locally so we never drop them
  const [filters, setFilters] = useState({
    category: initialCategory,
    type: '',
    city: '',
    salaryOrder: '',
    experience: '',
    sortOrder: '',
    industry: '',
    function: '',
    company: '',
    role: '',
  });

  const [filterOptions, setFilterOptions] = useState({
    extractedRoles: [],
    industries: [],
    functions: [],
    companies: [],
    jobTypes: [],
    cities: [],
    experiences: [],
  });

  const appliedFiltersCount = Object.values(filters).filter(val => (val ?? '') !== '').length;

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch('/api/filters');
        const data = await res.json();
        setFilterOptions({
          extractedRoles: data.extractedRoles || [],
          industries: data.industries || [],
          functions: data.functions || [],
          companies: data.companies || [],
          jobTypes: data.jobTypes || [],
          cities: (data.cities || []),
          experiences: ['Not mentioned', '0', '1', '2', '3', '4'],
        });
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    fetchFilters();
  }, []);

  // Seed initialCategory into the correct facet based on categorySource
  useEffect(() => {
    if (!initialCategory) return;

    const next = { ...filters, category: initialCategory };

    // clear all facets first
    next.industry = '';
    next.function = '';
    next.company = '';
    next.role = '';

    if (categorySource === 'industry') next.industry = initialCategory;
    else if (categorySource === 'function') next.function = initialCategory;
    else if (categorySource === 'company') next.company = initialCategory;
    else next.role = initialCategory; // default: role

    setFilters(next);
    onFilterChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategory, categorySource]);

  const pushChange = (partial) => {
    const next = { ...filters, ...partial };
    setFilters(next);
    onFilterChange(next);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'category') {
      // when user picks a "Category", map it to the active facet
      const next = { ...filters, category: value };

      // clear all facets then set the active one
      next.industry = '';
      next.function = '';
      next.company = '';
      next.role = '';

      if (categorySource === 'industry') next.industry = value;
      else if (categorySource === 'function') next.function = value;
      else if (categorySource === 'company') next.company = value;
      else next.role = value; // default role

      pushChange(next);
      return;
    }

    pushChange({ [name]: value });
  };

  const handleResetFilters = () => {
    const resetFilters = {
      category: '',
      type: '',
      city: '',
      salaryOrder: '',
      experience: '',
      sortOrder: '',
      industry: '',
      function: '',
      company: '',
      role: '',
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
        <div className="p-2 bg-white rounded flex items-center justify-between cursor-pointer w-48 min-w-[12rem]">
          <span className="truncate">{filters[name] || label}</span>

          <div className="flex items-center space-x-2 ml-2">
            {filters[name] && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleChange({ target: { name, value: '' } });
                }}
                className="text-gray-400 hover:text-red-500 focus:outline-none"
                title={`Clear ${label}`}
              >
                ×
              </button>
            )}

            <svg
              className={`w-4 h-4 transition-transform ${hovered === name ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

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

  // Pick correct list for the “Categories” dropdown based on the active source
  const categoryOptions =
    categorySource === 'industry'
      ? (filterOptions.industries || [])
      : categorySource === 'function'
      ? (filterOptions.functions || [])
      : categorySource === 'company'
      ? (filterOptions.companies || [])
      : (filterOptions.extractedRoles || []); // default role

  return (
    <div className="flex text-black flex-wrap p-2 mx-8 bg-[#ededed] rounded-lg gap-4 z-10 items-center">
      {renderDropdown('Categories', 'category', categoryOptions)}
      {renderDropdown('Job Type', 'type', ['Permanent', 'Contract', 'Internship', 'Part Time'])}
      {renderDropdown(
        'City',
        'city',
        (filterOptions.cities || [])
          .filter(c => c.toLowerCase() !== 'city')
          .map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase())
      )}
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
