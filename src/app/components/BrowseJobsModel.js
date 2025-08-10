"use client";
import React, { useEffect, useRef, useState } from "react";

export default function IndustryModal({ onClose }) {
    const [facets, setFacets] = useState({
        industry: [],
        functionalArea: [],
        company: [],
        role: [],
    });

    const panelRef = useRef(null);

    // ✅ Hardcoded mock data for testing/design
    useEffect(() => {
        setFacets({
            industry: [
                { label: "Healthcare", value: "Healthcare", count: 22 },
                { label: "Technology", value: "Technology", count: 45 },
                { label: "Finance", value: "Finance", count: 18 },
                { label: "Education", value: "Education", count: 30 },
                { label: "Hospitality", value: "Hospitality", count: 15 },
            ],
            functionalArea: [
                { label: "Software Engineering", value: "Software Engineering", count: 64 },
                { label: "Data Science", value: "Data Science", count: 25 },
                { label: "Marketing", value: "Marketing", count: 33 },
                { label: "Human Resources", value: "Human Resources", count: 20 },
                { label: "Project Management", value: "Project Management", count: 28 },
            ],
            company: [
                { label: "Systems Limited", value: "Systems Limited", count: 12 },
                { label: "Foodpanda", value: "Foodpanda", count: 8 },
                { label: "Daraz", value: "Daraz", count: 6 },
                { label: "Careem", value: "Careem", count: 9 },
                { label: "UBL", value: "UBL", count: 4 },
            ],
            role: [
                { label: "Business Analyst", value: "Business Analyst", count: 14 },
                { label: "Frontend Developer", value: "Frontend Developer", count: 21 },
                { label: "Backend Developer", value: "Backend Developer", count: 17 },
                { label: "UI/UX Designer", value: "UI/UX Designer", count: 13 },
                { label: "QA Engineer", value: "QA Engineer", count: 10 },
            ],
        });
    }, []);

    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = "hidden";
        function onEsc(e) {
            if (e.key === "Escape") onClose();
        }
        function onDown(e) {
            if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
        }
        document.addEventListener("keydown", onEsc);
        document.addEventListener("mousedown", onDown);
        return () => {
            document.removeEventListener("keydown", onEsc);
            document.removeEventListener("mousedown", onDown);
            document.body.style.overflow = originalStyle;
        };
    }, [onClose]);

    return (
        <div
            className="text-black fixed inset-0 z-[9999] flex"
            aria-modal="true"
            role="dialog"
            aria-labelledby="browse-jobs-title"
        >
            <div
                ref={panelRef}
                className="
          bg-[#ededed] rounded-lg w-full
          max-h-[90vh] overflow-y-auto
          mx-4 sm:mx-6 lg:mx-8
          mt-6 sm:mt-8 lg:mt-16
          mb-20 lg:mb-28
          p-4 sm:p-5 lg:p-6
        "
            >
                {/* Title */}
                <div className="mb-4 sm:mb-5 lg:mb-6 border-b pb-2 sm:pb-3">
                    <h2 id="browse-jobs-title" className="text-xl sm:text-2xl font-bold">
                        Browse Jobs in Pakistan
                    </h2>
                </div>

                {/* Columns */}
                <div
                    className="
            grid gap-5 sm:gap-6
            grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
          "
                >
                    {Object.entries({
                        industry: "By Industry",
                        functionalArea: "By Function",
                        company: "By Company",
                        role: "By Role",
                    }).map(([key, title]) =>
                        facets[key]?.length ? (
                            <section key={key} className="min-w-0">
                                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                                    {title}
                                </h3>

                                <ul className="space-y-1 max-h-72 overflow-y-auto pr-1">
                                    {facets[key].map((opt, i) => {
                                        const label = opt.label ?? String(opt);
                                        const value = opt.value ?? label;
                                        const count =
                                            typeof opt.count === "number" ? opt.count : null;

                                        return (
                                            <li key={`${key}-${value}-${i}`}>
                                                <a
                                                    href={`/?${key}=${encodeURIComponent(value)}`}
                                                    onClick={() => onClose()}
                                                    className="
                            group flex items-center justify-between
                            rounded-lg px-3 py-1.5 text-[15px]
                            hover:bg-white hover:shadow-sm transition
                            focus:outline-none focus:ring-2 focus:ring-black/10
                          "
                                                >
                                                    <span className="truncate">{label}</span>
                                                    {count !== null && (
                                                        <span
                                                            className="
                                ml-2 shrink-0 rounded-lg border border-gray-200
                                bg-gray-100 group-hover:bg-white
                                px-2 text-xs text-gray-700
                              "
                                                        >
                                                            {count}
                                                        </span>
                                                    )}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        ) : null
                    )}
                </div>
            </div>
        </div>
    );
}
