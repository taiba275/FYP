'use client';

import React, { useRef, useEffect, useState } from 'react';

export default function Resume({ onClose }) {
  const modalRef = useRef(null);
  const [file, setFile] = useState(null);

  // Close modal on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }

    function handleEsc(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-md shadow-lg w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-center mb-4">
          Upload your resume to get recommendations
        </h2>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="block w-full mb-2 border rounded-md px-4 py-2"
        />
        <p className="text-sm text-gray-500 text-center mb-2">
          Accepted formats: <span className="font-medium">.pdf, .doc, .docx</span>
        </p>

        <p className="text-sm text-center text-gray-700">
          No resume available?{" "}
          <a
            href="/recommendationForm"
            className="text-blue-600 hover:underline font-medium"
          >
            Enter details
          </a>
        </p>
      </div>
    </div>
  );
}
