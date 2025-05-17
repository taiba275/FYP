import React, { useState, useEffect } from "react";

export default function SearchBar({ onSearch }) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(inputValue);
    }, 300); // debounce delay 300ms

    return () => clearTimeout(handler);
  }, [inputValue, onSearch]);

  return (
     <div className="mb-4 flex justify-center relative max-w-md mx-auto mt-6">
      <input
        type="text"
        placeholder="Search jobs..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full p-2 text-black border text-xl border-black rounded focus:outline-none focus:ring-1 focus:ring-black cursor-text"
      />
      {inputValue && (
        <button
          onClick={() => setInputValue("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black font-bold text-xl cursor-pointer select-none"
          type="button"
        >
          ×
        </button>
      )}
    </div>
  );
}
