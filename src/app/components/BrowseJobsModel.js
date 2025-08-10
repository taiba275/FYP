// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import Link from "next/link";

// export default function IndustryModal({ onClose }) {
//   const [facets, setFacets] = useState({
//     industry: [],
//     functionalArea: [],
//     company: [],
//     role: [],
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const panelRef = useRef(null);

//   // 🔌 Load live facets from /api/browse/facets and map to this component's keys
//   useEffect(() => {
//     setLoading(true);
//     fetch("/api/browse/facets", { cache: "no-store" })
//       .then((r) => r.json())
//       .then((data) => {
//         if (!data?.success) throw new Error(data?.message || "Failed to load facets");
//         const f = data.facets || { industries: [], functions: [], companies: [], roles: [] };

//         setFacets({
//           industry: (f.industries || []).map((x) => ({
//             label: x.value,
//             value: x.value,
//             count: x.count,
//           })),
//           functionalArea: (f.functions || []).map((x) => ({
//             label: x.value,
//             value: x.value,
//             count: x.count,
//           })),
//           company: (f.companies || []).map((x) => ({
//             label: x.value,
//             value: x.value,
//             count: x.count,
//           })),
//           role: (f.roles || []).map((x) => ({
//             label: x.value,
//             value: x.value,
//             count: x.count,
//           })),
//         });
//       })
//       .catch((e) => setError(e.message || "Failed to load facets"))
//       .finally(() => setLoading(false));
//   }, []);

//   // 🧯 Modal behavior (same as your commented code)
//   useEffect(() => {
//     const originalStyle = window.getComputedStyle(document.body).overflow;
//     document.body.style.overflow = "hidden";
//     function onEsc(e) {
//       if (e.key === "Escape") onClose?.();
//     }
//     function onDown(e) {
//       if (panelRef.current && !panelRef.current.contains(e.target)) onClose?.();
//     }
//     document.addEventListener("keydown", onEsc);
//     document.addEventListener("mousedown", onDown);
//     return () => {
//       document.removeEventListener("keydown", onEsc);
//       document.removeEventListener("mousedown", onDown);
//       document.body.style.overflow = originalStyle;
//     };
//   }, [onClose]);

//   // Map your section key -> route facet
//   const facetToRoute = {
//     industry: "industry",
//     functionalArea: "function",
//     company: "company",
//     role: "role",
//   };

//   return (
//     <div
//       className="text-black fixed inset-0 z-[9999] flex"
//       aria-modal="true"
//       role="dialog"
//       aria-labelledby="browse-jobs-title"
//     >
//       <div
//         ref={panelRef}
//         className="
//           bg-[#ededed] rounded-lg w-full
//           max-h-[90vh] overflow-y-auto
//           mx-4 sm:mx-6 lg:mx-8
//           mt-6 sm:mt-8 lg:mt-16
//           mb-20 lg:mb-28
//           p-4 sm:p-5 lg:p-6
//         "
//       >
//         {/* Title */}
//         <div className="mb-4 sm:mb-5 lg:mb-6 border-b pb-2 sm:pb-3">
//           <h2 id="browse-jobs-title" className="text-xl sm:text-2xl font-bold">
//             Browse Jobs in Pakistan
//           </h2>
//         </div>

//         {/* Loading / Error */}
//         {loading && <div className="text-sm text-gray-600">Loading…</div>}
//         {error && !loading && (
//           <div className="text-sm text-red-600">Error: {error}</div>
//         )}

//         {/* Columns */}
//         {!loading && !error && (
//           <div
//             className="
//               grid gap-5 sm:gap-6
//               grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
//             "
//           >
//             {Object.entries({
//               industry: "By Industry",
//               functionalArea: "By Function",
//               company: "By Company",
//               role: "By Role",
//             }).map(([key, title]) =>
//               facets[key]?.length ? (
//                 <section key={key} className="min-w-0">
//                   <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
//                     {title}
//                   </h3>

//                   <ul className="space-y-1 max-h-72 overflow-y-auto pr-1">
//                     {facets[key].map((opt, i) => {
//                       const label = opt.label ?? String(opt);
//                       const value = opt.value ?? label;
//                       const count =
//                         typeof opt.count === "number" ? opt.count : null;

//                       // 🔗 Route to your dynamic pages instead of query params
//                       const href = `/browse/${facetToRoute[key]}/${encodeURIComponent(
//                         value
//                       )}`;

//                       return (
//                         <li key={`${key}-${value}-${i}`}>
//                           <Link
//                             href={href}
//                             onClick={() => onClose?.()}
//                             className="
//                               group flex items-center justify-between
//                               rounded-lg px-3 py-1.5 text-[15px]
//                               hover:bg-white hover:shadow-sm transition
//                               focus:outline-none focus:ring-2 focus:ring-black/10
//                             "
//                           >
//                             <span className="truncate">{label}</span>
//                             {count !== null && (
//                               <span
//                                 className="
//                                   ml-2 shrink-0 rounded-lg border border-gray-200
//                                   bg-gray-100 group-hover:bg-white
//                                   px-2 text-xs text-gray-700
//                                 "
//                               >
//                                 {count}
//                               </span>
//                             )}
//                           </Link>
//                         </li>
//                       );
//                     })}
//                   </ul>
//                 </section>
//               ) : null
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

export default function IndustryModal({ onClose }) {
  const panelRef = useRef(null);

  const [facets, setFacets] = useState({
    industries: [],
    functions: [],
    companies: [],
    roles: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch live facets
  useEffect(() => {
    setLoading(true);
    fetch("/api/browse/facets", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.success) throw new Error(data?.message || "Failed to load facets");
        setFacets(
          data.facets || { industries: [], functions: [], companies: [], roles: [] }
        );
      })
      .catch((e) => setError(e.message || "Failed to load facets"))
      .finally(() => setLoading(false));
  }, []);

  // Modal behavior
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    const onDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("keydown", onEsc);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.removeEventListener("mousedown", onDown);
      document.body.style.overflow = originalStyle;
    };
  }, [onClose]);

  // Tabs & mapping (matches your design labels)
  const TABS = [
    { key: "industry", label: "By Industry" },
    { key: "functionalArea", label: "By Function" },
    { key: "company", label: "By Company" },
    { key: "role", label: "By Role" },
  ];
  const [activeTab, setActiveTab] = useState("industry");

  // Map tab -> data from API
  const DATA = useMemo(() => {
    return {
      industry: (facets.industries || []).map((x) => ({ label: x.value, count: x.count })),
      functionalArea: (facets.functions || []).map((x) => ({ label: x.value, count: x.count })),
      company: (facets.companies || []).map((x) => ({ label: x.value, count: x.count })),
      role: (facets.roles || []).map((x) => ({ label: x.value, count: x.count })),
    };
  }, [facets]);

  // For “Show more …” link – goes to your browse routes (optional)
  const linkFor = (key) => {
    switch (key) {
      case "industry":
        return "/industry/";
      case "functionalArea":
        return "/browse/function/__all__";
      case "company":
        return "/browse/company/__all__";
      case "role":
        return "/browse/role/__all__";
      default:
        return "#";
    }
  };

  // Build per-item href to your browse pages
  const facetToRoute = {
    industry: "industry",
    functionalArea: "function",
    company: "company",
    role: "role",
  };

  const paramName = (key) => (key === "functionalArea" ? "function" : key);
  const VISIBLE_LIMIT = 36;

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
          max-h[90vh] max-h-[90vh] overflow-y-auto
          mx-4 sm:mx-6 lg:mx-8
          mt-6 sm:mt-8 lg:mt-16
          mb-20 lg:mb-28
          p-4 sm:p-5 lg:p-6
        "
      >
        {/* Title */}
        <div className="mb-2 sm:mb-2.5 lg:mb-3 pb-1.5">
          <h2 id="browse-jobs-title" className="text-xl sm:text-2xl font-bold">
            Browse Jobs in Pakistan
          </h2>
        </div>

        {/* Tabs (hover to switch) */}
        <div className="mb-2">
          <div className="flex">
            {TABS.map((t) => {
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onMouseEnter={() => setActiveTab(t.key)}
                  onFocus={() => setActiveTab(t.key)}
                  onClick={() => setActiveTab(t.key)}
                  className={`relative flex-1 text-center py-3 text-base sm:text-lg font-semibold outline-none
                    transition-colors duration-200
                    ${isActive ? "text-black" : "text-gray-600 hover:text-black"}`}
                >
                  {t.label}
                  <span
                    className={`absolute left-0 -bottom-px h-[2px] w-full rounded-full
                      transition-all duration-200
                      ${isActive ? "bg-black opacity-100" : "bg-transparent opacity-0"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading / Error */}
        {loading && <div className="text-sm text-gray-600">Loading…</div>}
        {error && !loading && <div className="text-sm text-red-600">Error: {error}</div>}

        {/* Tab content (fills the modal body) */}
        {!loading && !error && (
          <div className="min-w-0">
            <div
              className="
                grid gap-1 sm:gap-0.5
                grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
              "
            >
              {(DATA[activeTab] || [])
                .slice(0, VISIBLE_LIMIT)
                .map(({ label, count }, i) => {
                  const value = String(label);
                  const href = `/browse/${facetToRoute[activeTab]}/${encodeURIComponent(value)}`;
                  return (
                    <Link
                      key={`${activeTab}-${i}-${value}`}
                      href={href}
                      onClick={() => onClose?.()}
                      className="
                        group flex items-center justify-between
                        rounded-lg px-2.5 py-1.5 text-[15px]
                        hover:bg-white hover:shadow-sm transition
                        focus:outline-none focus:ring-2 focus:ring-black/10
                      "
                      title={value}
                    >
                      <span className="truncate">{value}</span>
                      <span
                        className="
                          ml-2 shrink-0 rounded-lg border border-gray-200
                          bg-gray-100 group-hover:bg-white
                          px-1.5 text-[11px] text-gray-700
                        "
                      >
                        {count}
                      </span>
                    </Link>
                  );
                })}
            </div>

            {/* Show more */}
            {DATA[activeTab] && DATA[activeTab].length > VISIBLE_LIMIT && (
              <div className="flex justify-end mt-4">
                <Link
                  href={linkFor(activeTab)}
                  onClick={() => onClose?.()}
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-white hover:bg-gray-100"
                >
                  Show more{" "}
                  {TABS.find((t) => t.key === activeTab)?.label.replace("By ", "")}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
