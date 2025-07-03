'use client';

import React, { useState, useEffect } from 'react';

const FilterComponent = ({ onFilterChange, initialCategory = '' }) => {
  const [hovered, setHovered] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [filters, setFilters] = useState({
    category: initialCategory,
    type: "",
    city: "",
    salaryOrder: "",
    experience: "",
    sortOrder: "",
  });


  const [filterOptions, setFilterOptions] = useState({
    industries: [],
    jobTypes: [],
    cities: [],
    experiences: [],
  });

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

  const appliedFiltersCount = Object.values(filters).filter(val => val !== '').length;

  return (
    <div className="flex text-black flex-wrap p-2 bg-[#ededed] rounded-lg m-8 gap-4 items-center">

      {/* CATEGORY */}
      <div
        className="relative flex-shrink-0"
        onMouseEnter={() => {
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
          }
          setHovered('category');
        }}

        onMouseLeave={() => {
          const timeout = setTimeout(() => {
            setHovered(null);
          }, 150); // Adjust delay as needed (ms)
          setHoverTimeout(timeout);
        }}

      >
        <div className="p-2 bg-white rounded flex items-center justify-between cursor-pointer w-64 min-w-[16rem]">
          {filters.category || 'Categories'}
          <svg
            className={`w-4 h-4 ml-2 transition-transform ${hovered === 'category' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {hovered === 'category' && (
          <ul className="absolute z-10 bg-white border rounded shadow w-64 min-w-[16rem] mt-1 max-h-60 overflow-y-auto">
            <li
              onClick={() => {
                handleChange({ target: { name: 'category', value: '' } });
                setHovered(null);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              Categories
            </li>
            {filterOptions.industries
              .filter((industry) => industry.trim().toLowerCase() !== 'categories')
              .map((industry) => (
                <li
                  key={industry}
                  onClick={() => {
                    handleChange({ target: { name: 'category', value: industry } });
                    setHovered(null);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {industry}
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* JOB TYPE */}
      <div
        className="relative"
        onMouseEnter={() => {
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
          }
          setHovered('type');
        }}

        onMouseLeave={() => {
          const timeout = setTimeout(() => {
            setHovered(null);
          }, 150); // Adjust delay as needed (ms)
          setHoverTimeout(timeout);
        }}

      >
        <div className="p-2 bg-white rounded flex items-center justify-between cursor-pointer w-40">
          {filters.type || 'Job Type'}
          <svg className={`w-4 h-4 ml-2 transition-transform ${hovered === 'type' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {hovered === 'type' && (
          <ul className="absolute z-10 bg-white border rounded shadow w-40 mt-1">
            {['Permanent', 'Contract', 'Internship', 'Part Time'].map((type) => (
              <li key={type} onClick={() => { handleChange({ target: { name: 'type', value: type } }); setHovered(null); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                {type || 'Job Type'}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* CITY */}
      <div
        className="relative"
        onMouseEnter={() => {
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
          }
          setHovered('city');
        }}

        onMouseLeave={() => {
          const timeout = setTimeout(() => {
            setHovered(null);
          }, 150); // Adjust delay as needed (ms)
          setHoverTimeout(timeout);
        }}
      >
        <div className="p-2 bg-white rounded flex items-center justify-between cursor-pointer w-40">
          {filters.city || 'City'}
          <svg
            className={`w-4 h-4 ml-2 transition-transform ${hovered === 'city' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {hovered === 'city' && (
          <ul className="absolute z-10 bg-white border rounded shadow w-40 mt-1 max-h-60 overflow-y-auto">
            <li
              onClick={() => {
                handleChange({ target: { name: 'city', value: '' } });
                setHovered(null);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              City
            </li>
            {filterOptions.cities
              .filter((city) => city !== 'city')
              .map((city) => (
                <li
                  key={city}
                  onClick={() => {
                    handleChange({ target: { name: 'city', value: city } });
                    setHovered(null);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {city}
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* SORT SALARY */}
      <div
        className="relative"
        onMouseEnter={() => {
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
          }
          setHovered('salary');
        }}

        onMouseLeave={() => {
          const timeout = setTimeout(() => {
            setHovered(null);
          }, 150);
          setHoverTimeout(timeout);
        }}
      >
        <div className="p-2 bg-white rounded flex items-center justify-between cursor-pointer w-40">
          {filters.salaryOrder || 'Sort Salary'}
          <svg className={`w-4 h-4 ml-2 transition-transform ${hovered === 'salary' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {hovered === 'salary' && (
          <ul className="absolute z-10 bg-white border rounded shadow w-40 mt-1">
            {['Ascending', 'Descending'].map((order) => (
              <li key={order} onClick={() => { handleChange({ target: { name: 'salaryOrder', value: order } }); setHovered(null); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                {order || 'Sort Salary'}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* EXPERIENCE */}
      <div
        className="relative"
        onMouseEnter={() => {
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
          }
          setHovered('experience');
        }}

        onMouseLeave={() => {
          const timeout = setTimeout(() => {
            setHovered(null);
          }, 150); // Adjust delay as needed (ms)
          setHoverTimeout(timeout);
        }}

      >
        <div className="p-2 bg-white rounded flex items-center justify-between cursor-pointer w-40">
          {filters.experience || 'Experience'}
          <svg className={`w-4 h-4 ml-2 transition-transform ${hovered === 'experience' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {hovered === 'experience' && (
          <ul className="absolute z-10 bg-white border rounded shadow w-40 mt-1">
            {['Not mentioned', '0', '1', '2', '3', '4'].map((exp) => (
              <li key={exp} onClick={() => { handleChange({ target: { name: 'experience', value: exp } }); setHovered(null); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                {exp === '' ? 'Experience' : exp === '0' ? 'Fresh' : exp === '4' ? '4+ Years' : exp === 'Not mentioned' ? 'Not mentioned' : `${exp} Year${exp === '1' ? '' : 's'}`}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* SORT BY DATE */}
      <div
        className="relative"
        onMouseEnter={() => {
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
          }
          setHovered('date');
        }}

        onMouseLeave={() => {
          const timeout = setTimeout(() => {
            setHovered(null);
          }, 150); // Adjust delay as needed (ms)
          setHoverTimeout(timeout);
        }}
      >
        <div className="p-2 bg-white rounded flex items-center justify-between cursor-pointer w-40">
          {filters.sortOrder || 'Sort by Date'}
          <svg className={`w-4 h-4 ml-2 transition-transform ${hovered === 'date' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {hovered === 'date' && (
          <ul className="absolute z-10 bg-white border rounded shadow w-40 mt-1">
            {['Newest', 'Oldest'].map((sort) => (
              <li key={sort} onClick={() => { handleChange({ target: { name: 'sortOrder', value: sort } }); setHovered(null); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                {sort || 'Sort by Date'}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Applied Filters Counter */}
      <div className="flex items-center gap-3 ml-auto">
        <div className="flex items-center justify-center w-8 h-9 rounded-full bg-white text-blue-500 font-bold">
          {appliedFiltersCount}
        </div>
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
