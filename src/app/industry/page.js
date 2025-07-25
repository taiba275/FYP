'use client';

import React, { useEffect, useState } from 'react';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const IndustryPage = () => {
  const [industryMap, setIndustryMap] = useState({});

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const res = await fetch('/api/industries');
        const data = await res.json();

        if (data.industries) {
          const grouped = {};

          data.industries.forEach((industry) => {
            const firstLetter = industry[0].toUpperCase();
            if (!grouped[firstLetter]) grouped[firstLetter] = [];
            grouped[firstLetter].push(industry);
          });

          // Sort each group alphabetically
          Object.keys(grouped).forEach((key) => {
            grouped[key].sort((a, b) => a.localeCompare(b));
          });

          setIndustryMap(grouped);
        }
      } catch (err) {
        console.error('Failed to fetch industry data:', err);
      }
    };

    fetchIndustries();
  }, []);

  return (
    <div className="px-4 py-10 max-w-screen-xl mx-auto text-gray-800">
      {/* A-Z Header */}
      <div className="mb-6 p-4 border rounded bg-gray-100 flex flex-wrap justify-center gap-2">
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#${letter}`}
            className="px-3 py-1 rounded font-medium text-gray-700 hover:text-blue-600"
          >
            {letter}
          </a>
        ))}
      </div>

      {/* Industry Sections */}
      {letters.map((letter) => (
        industryMap[letter] && industryMap[letter].length > 0 && (
          <div key={letter} id={letter} className="mb-10">
            <h2 className="text-2xl font-bold mb-4 border-b pb-1">{letter}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {industryMap[letter].map((title, idx) => (
                <a
                  key={idx}
                  href={`/?category=${encodeURIComponent(title)}`}
                  className="block text-sm hover:text-blue-600 transition"
                >
                  {title}
                </a>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default IndustryPage;
