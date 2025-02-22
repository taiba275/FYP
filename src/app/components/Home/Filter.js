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

  const categories = {
    "Recruitment / Employment Firms": [
      "Recruitment Officer",
      "Talent Acquisition Specialist",
      "HR Executive",
      "HR Manager",
      "Recruitment Consultant",
    ],
    "Business Development": [
      "Business Development Executive",
      "Business Development Manager",
      "Sales Manager",
      "Regional Sales Head",
      "Account Manager",
    ],
    "Travel/Tourism/Transportation": [
      "Travel Consultant",
      "Tour Guide",
      "Transport Coordinator",
      "Travel Operations Manager",
      "Airport Ground Staff",
    ],
    "Advertising / PR": [
      "Public Relations Specialist",
      "Advertising Executive",
      "Media Planner",
      "Creative Director",
      "Social Media Manager",
    ],
    "BPO": [
      "Customer Service Representative",
      "Call Center Agent",
      "Technical Support Specialist",
      "Telemarketing Executive",
      "BPO Executive",
    ],
    "Hospitality": [
      "Hotel Manager",
      "Front Desk Officer",
      "Concierge",
      "Housekeeping Manager",
      "Event Coordinator",
    ],
    "Banking/Financial Services": [
      "Bank Teller",
      "Relationship Manager",
      "Financial Analyst",
      "Investment Banker",
      "Credit Risk Officer",
    ],
    "Food & Beverages": [
      "Chef",
      "Restaurant Manager",
      "Bartender",
      "Food & Beverage Assistant",
      "Catering Coordinator",
    ],
    "Importers / Distributors/Exporters": [
      "Import/Export Manager",
      "Logistics Coordinator",
      "Supply Chain Officer",
      "Warehouse Manager",
      "Customs Officer",
    ],
    "Call Center": [
      "Call Center Representative",
      "Call Center Supervisor",
      "Inbound Call Specialist",
      "Outbound Call Specialist",
      "Customer Support Agent",
    ],
    "Manufacturing": [
      "Production Supervisor",
      "Manufacturing Engineer",
      "Quality Assurance Officer",
      "Operations Manager",
      "Factory Worker",
    ],
    "Education/Training": [
      "Teacher",
      "Lecturer",
      "Training Manager",
      "Curriculum Developer",
      "Instructional Designer",
    ],
    "NGO/Social Services": [
      "Program Coordinator",
      "Social Worker",
      "NGO Manager",
      "Community Outreach Officer",
      "Humanitarian Aid Worker",
    ],
    "Construction / Cement / Metals": [
      "Civil Engineer",
      "Construction Manager",
      "Site Supervisor",
      "Project Engineer",
      "Safety Officer",
    ],
    "Information Technology": [
      "Software Engineer",
      "Web Developer",
      "System Analyst",
      "Database Administrator",
      "Network Engineer",
    ],
    "Electronics": [
      "Electronics Technician",
      "Electronics Engineer",
      "Product Designer",
      "Quality Control Inspector",
      "Maintenance Technician",
    ],
    "Chemicals": [
      "Chemical Engineer",
      "Laboratory Technician",
      "Chemical Sales Executive",
      "Process Engineer",
      "Environmental Specialist",
    ],
    "Mining / Petroleum": [
      "Mining Engineer",
      "Petroleum Geologist",
      "Drilling Engineer",
      "Oil Rig Worker",
      "Exploration Manager",
    ],
    "Real Estate/Property": [
      "Real Estate Agent",
      "Property Manager",
      "Real Estate Developer",
      "Real Estate Investment Analyst",
      "Construction Project Manager",
    ],
    "E-Commerce / E-Business": [
      "E-Commerce Manager",
      "Digital Marketing Specialist",
      "SEO Specialist",
      "Content Writer",
      "E-Commerce Analyst",
    ],
    "Health & Fitness": [
      "Fitness Trainer",
      "Nutritionist",
      "Health Coach",
      "Personal Trainer",
      "Wellness Consultant",
    ],
    "Telecommunication / ISP": [
      "Telecom Technician",
      "Network Administrator",
      "Telecom Sales Executive",
      "ISP Support Specialist",
      "Field Engineer",
    ],
    "Artificial Intelligence (AI)": [
      "AI Researcher",
      "AI Developer",
      "Machine Learning Engineer",
      "Data Scientist",
      "AI Solutions Architect",
    ],
    "Law Firms/Legal": [
      "Legal Advisor",
      "Paralegal",
      "Lawyer",
      "Legal Assistant",
      "Compliance Officer",
    ],
    "Retail": [
      "Retail Store Manager",
      "Sales Assistant",
      "Retail Buyer",
      "Visual Merchandiser",
      "Store Supervisor",
    ],
    "Textiles / Garments": [
      "Textile Designer",
      "Fashion Designer",
      "Garment Technologist",
      "Production Planner",
      "Fabric Engineer",
    ],
    "Packaging": [
      "Packaging Engineer",
      "Packaging Designer",
      "Production Assistant",
      "Packager",
      "Logistics Coordinator",
    ],
    "Arts / Entertainment": [
      "Actor",
      "Musician",
      "Artist",
      "Film Director",
      "Producer",
    ],
    "Pharmaceuticals / Clinical Research": [
      "Clinical Research Associate",
      "Pharmacist",
      "Medical Research Scientist",
      "Pharmaceutical Sales Representative",
      "Regulatory Affairs Specialist",
    ],
    "Aviation": [
      "Pilot",
      "Flight Attendant",
      "Aviation Engineer",
      "Ground Staff",
      "Air Traffic Controller",
    ],
    "Power / Energy": [
      "Electrical Engineer",
      "Energy Consultant",
      "Power Plant Operator",
      "Renewable Energy Engineer",
      "Energy Auditor",
    ],
    "Health & Fitness": [
      "Health Coach",
      "Personal Trainer",
      "Yoga Instructor",
      "Sports Therapist",
      "Fitness Consultant",
    ],
  };

  return (
    <div className="flex text-black flex-wrap items-center justify-between p-2 bg-gray-100 rounded-lg m-8 gap-4">
      {/* Category Dropdown */}
      <div className="relative">
        {/* <label className="block text-gray-700 text-sm font-bold mb-2">Category</label> */}
        <select name="category" value={filters.category} onChange={handleChange} className="p-2  rounded">
          <option value="">Categories</option>
          {Object.keys(categories).map((category) => (
            <option key={category} value={category.toLowerCase()}>
              {category}
            </option>
          ))}
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
        {/* <label className="block text-gray-700 text-sm font-bold mb-2">Experience</label> */}
        <select
          name="experience"
          value={filters.experience}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">Experience</option>
          <option value="Not mentioned">Not mentioned</option>
          <option value="0">Fresh</option>
          <option value="1">1 Year</option>
          <option value="2">2 Years</option>
          <option value="3">3 Years</option>
          <option value="4">4+ Years</option>
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
