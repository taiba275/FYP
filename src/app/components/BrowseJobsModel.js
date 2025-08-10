// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import Link from "next/link";

// export default function IndustryModal({ onClose }) {
//     const panelRef = useRef(null);

//     const [facets, setFacets] = useState({
//         industries: [],
//         functions: [],
//         companies: [],
//         roles: [],
//     });
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     // Fetch live facets
//     useEffect(() => {
//         setLoading(true);
//         fetch("/api/browse/facets", { cache: "no-store" })
//             .then((r) => r.json())
//             .then((data) => {
//                 if (!data?.success) throw new Error(data?.message || "Failed to load facets");
//                 setFacets(
//                     data.facets || { industries: [], functions: [], companies: [], roles: [] }
//                 );
//             })
//             .catch((e) => setError(e.message || "Failed to load facets"))
//             .finally(() => setLoading(false));
//     }, []);

//     // Modal behavior
//     useEffect(() => {
//         const originalStyle = window.getComputedStyle(document.body).overflow;
//         document.body.style.overflow = "hidden";
//         const onEsc = (e) => e.key === "Escape" && onClose?.();
//         const onDown = (e) => {
//             if (panelRef.current && !panelRef.current.contains(e.target)) onClose?.();
//         };
//         document.addEventListener("keydown", onEsc);
//         document.addEventListener("mousedown", onDown);
//         return () => {
//             document.removeEventListener("keydown", onEsc);
//             document.removeEventListener("mousedown", onDown);
//             document.body.style.overflow = originalStyle;
//         };
//     }, [onClose]);

//     // Tabs & mapping (matches your design labels)
//     const TABS = [
//         { key: "industry", label: "By Industry" },
//         { key: "functionalArea", label: "By Function" },
//         { key: "company", label: "By Company" },
//         { key: "role", label: "By Role" },
//     ];
//     const [activeTab, setActiveTab] = useState("industry");

//     // Map tab -> data from API
//     const DATA = useMemo(() => {
//         return {
//             industry: (facets.industries || []).map((x) => ({ label: x.value, count: x.count })),
//             functionalArea: (facets.functions || []).map((x) => ({ label: x.value, count: x.count })),
//             company: (facets.companies || []).map((x) => ({ label: x.value, count: x.count })),
//             role: (facets.roles || []).map((x) => ({ label: x.value, count: x.count })),
//         };
//     }, [facets]);

//     // For “Show more …” link – goes to your browse routes (optional)
//     const linkFor = (key) => {
//         switch (key) {
//             case "industry":
//                 return "/industry/";
//             case "functionalArea":
//                 return "/browse/function/__all__";
//             case "company":
//                 return "/browse/company/__all__";
//             case "role":
//                 return "/browse/role/__all__";
//             default:
//                 return "#";
//         }
//     };

//     // Build per-item href to your browse pages
//     const facetToRoute = {
//         industry: "industry",
//         functionalArea: "function",
//         company: "company",
//         role: "role",
//     };

//     const tabLabel = (key) => ([
//         { key: "industry", label: "By Industry" },
//         { key: "functionalArea", label: "By Function" },
//         { key: "company", label: "By Company" },
//         { key: "role", label: "By Role" },
//     ].find(t => t.key === key)?.label || "");


//     const paramName = (key) => (key === "functionalArea" ? "function" : key);
//     const VISIBLE_LIMIT = 36;

//     return (
//         <div
//             role="tabpanel"
//             id={`panel-${activeTab}`}
//             aria-labelledby={`tab-${activeTab}`}
//             className="min-w-0"
//         >
//             <div
//                 className="text-black fixed inset-0 z-[9999] flex"
//                 aria-modal="true"
//                 role="dialog"
//                 aria-labelledby="browse-jobs-title"
//             >
//                 <div
//                     ref={panelRef}
//                     className="
//           bg-[#ededed] rounded-lg w-full
//           max-h[90vh] max-h-[73vh] overflow-y-auto
//           mx-4 sm:mx-6 lg:mx-8
//           mt-6 sm:mt-8 lg:mt-16
//           mb-20 lg:mb-28
//           p-4 sm:p-5 lg:p-6
//         "
//                 >
//                     {/* Title */}
//                     <div className="mb-2 sm:mb-2.5 lg:mb-3 pb-1.5">
//                         <h2 id="browse-jobs-title" className="text-xl sm:text-2xl font-bold">
//                             Browse Jobs in Pakistan
//                         </h2>
//                     </div>

//                     {/* Tabs (hover to switch) */}
//                     <div className="mb-3">
//                         {/* Segmented container to visually separate tabs from content */}
//                         <div
//                             role="tablist"
//                             aria-label="Browse Tabs"
//                             className="inline-flex w-full rounded-lg border bg-[#ededed] p-1 shadow-sm"
//                         >
//                             {TABS.map((t) => {
//                                 const isActive = activeTab === t.key;
//                                 return (
//                                     <button
//                                         key={t.key}
//                                         role="tab"
//                                         aria-selected={isActive}
//                                         aria-controls={`panel-${t.key}`}
//                                         id={`tab-${t.key}`}
//                                         type="button"
//                                         onMouseEnter={() => setActiveTab(t.key)}
//                                         onFocus={() => setActiveTab(t.key)}
//                                         onClick={() => setActiveTab(t.key)}
//                                         className={[
//                                             "flex-1 text-center rounded-lg px-3 py-2 text-sm sm:text-base font-semibold outline-none",
//                                             "transition-all duration-200",
//                                             isActive
//                                                 ? "bg-white text-black"
//                                                 : "text-gray-700 hover:bg-gray-100"
//                                         ].join(" ")}
//                                     >
//                                         {t.label}
//                                     </button>
//                                 );
//                             })}
//                         </div>
//                     </div>

//                     {/* Content header band for context + separation */}
//                     <div className="mt-2 mb-2">
//                         <div className="flex items-center justify-between">
//                             <h3 className="text-sm sm:text-base font-medium text-gray-700">
//                                Jobs listed <span className="font-bold">{tabLabel(activeTab)}</span> 
//                             </h3>
//                         </div>
//                         <div className="h-px bg-gray-300/70 mt-2" />
//                     </div>

//                     {/* Loading / Error */}
//                     {loading && <div className="text-sm text-gray-600">Loading…</div>}
//                     {error && !loading && <div className="text-sm text-red-600">Error: {error}</div>}

//                     {/* Tab content (fills the modal body) */}
//                     {!loading && !error && (
//                         <div className="min-w-0">
//                             <div
//                                 className="
//     grid gap-1 sm:gap-0.5
//     grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
//   "
//                             >
//                                 {(() => {
//                                     const items = DATA[activeTab] || [];
//                                     const labelShort =
//                                         (TABS.find((t) => t.key === activeTab)?.label || "").replace("By ", "");
//                                     const hasMore = items.length > VISIBLE_LIMIT;
//                                     // we reserve the last slot for the “Show more …” row if needed
//                                     const sliceCount = hasMore ? VISIBLE_LIMIT - 1 : VISIBLE_LIMIT;
//                                     const visible = items.slice(0, sliceCount);

//                                     return (
//                                         <>
//                                             {visible.map(({ label, count }, i) => {
//                                                 const value = String(label);
//                                                 const href = `/browse/${facetToRoute[activeTab]}/${encodeURIComponent(value)}`;
//                                                 return (
//                                                     <Link
//                                                         key={`${activeTab}-${i}-${value}`}
//                                                         href={href}
//                                                         onClick={() => onClose?.()}
//                                                         className="
//                 group flex items-center justify-between
//                 rounded-lg px-2.5 py-1.5 text-[15px]
//                 hover:bg-white hover:shadow-sm transition
//                 focus:outline-none focus:ring-2 focus:ring-black/10
//               "
//                                                         title={value}
//                                                     >
//                                                         <span className="truncate">{value}</span>
//                                                         <span
//                                                             className="
//                   ml-2 shrink-0 rounded-lg border border-gray-200
//                   bg-gray-100 group-hover:bg-white
//                   px-1.5 text-[11px] text-gray-700
//                 "
//                                                         >
//                                                             {count}
//                                                         </span>
//                                                     </Link>
//                                                 );
//                                             })}

//                                             {/* last cell becomes the “Show more …” row */}
//                                             {hasMore && (
//                                                 <Link
//                                                     href={linkFor(activeTab)}
//                                                     onClick={() => onClose?.()}
//                                                     className="
//               group flex items-center justify-between
//               rounded-lg px-2.5 py-1.5 text-[15px]
//               bg-white hover:bg-gray-100 border hover:shadow-sm transition
//               focus:outline-none focus:ring-2 focus:ring-black/10
//             "
//                                                     title={`Show more ${labelShort}`}
//                                                 >
//                                                     <span className="truncate font-medium">Show more {labelShort}</span>
//                                                 </Link>
//                                             )}
//                                         </>
//                                     );
//                                 })()}
//                             </div>

//                             {/* Show more */}
//                             {/* {DATA[activeTab] && DATA[activeTab].length > VISIBLE_LIMIT && (
//                                 <div className="flex justify-end mt-4">
//                                     <Link
//                                         href={linkFor(activeTab)}
//                                         onClick={() => onClose?.()}
//                                         className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-white hover:bg-gray-100"
//                                     >
//                                         Show more{" "}
//                                         {TABS.find((t) => t.key === activeTab)?.label.replace("By ", "")}
//                                     </Link>
//                                 </div>
//                             )} */}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
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
        setFacets(data.facets || { industries: [], functions: [], companies: [], roles: [] });
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

  // “Show more …” (kept to your existing pages)
  // “Show more …” → new A–Z list pages
const linkFor = (key) => {
  switch (key) {
    case "industry":
      return "/industry";
    case "functionalArea":
      return "/function";
    case "company":
      return "/company";
    case "role":
      return "/role";
    default:
      return "#";
  }
};


  // Build per-item homepage href with query param
  const facetToHomeParam = {
    industry: "industry",
    functionalArea: "function",
    company: "company",
    role: "role",
  };

  const tabLabel = (key) =>
    (
      [
        { key: "industry", label: "By Industry" },
        { key: "functionalArea", label: "By Function" },
        { key: "company", label: "By Company" },
        { key: "role", label: "By Role" },
      ].find((t) => t.key === key) || {}
    ).label || "";

  const VISIBLE_LIMIT = 36;

  return (
    <div
      role="tabpanel"
      id={`panel-${activeTab}`}
      aria-labelledby={`tab-${activeTab}`}
      className="min-w-0"
    >
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
            max-h-[73vh] overflow-y-auto
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

          {/* Tabs */}
          <div className="mb-3">
            <div
              role="tablist"
              aria-label="Browse Tabs"
              className="inline-flex w-full rounded-lg border bg-[#ededed] p-1 shadow-sm"
            >
              {TABS.map((t) => {
                const isActive = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${t.key}`}
                    id={`tab-${t.key}`}
                    type="button"
                    onMouseEnter={() => setActiveTab(t.key)}
                    onFocus={() => setActiveTab(t.key)}
                    onClick={() => setActiveTab(t.key)}
                    className={[
                      "flex-1 text-center rounded-lg px-3 py-2 text-sm sm:text-base font-semibold outline-none",
                      "transition-all duration-200",
                      isActive ? "bg-white text-black" : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content header band for context + separation */}
          <div className="mt-2 mb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-medium text-gray-700">
                Jobs listed <span className="font-bold">{tabLabel(activeTab)}</span>
              </h3>
            </div>
            <div className="h-px bg-gray-300/70 mt-2" />
          </div>

          {/* Loading / Error */}
          {loading && <div className="text-sm text-gray-600">Loading…</div>}
          {error && !loading && <div className="text-sm text-red-600">Error: {error}</div>}

          {/* Tab content */}
          {!loading && !error && (
            <div className="min-w-0">
              <div
                className="
                  grid gap-1 sm:gap-0.5
                  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                "
              >
                {(() => {
                  const items = DATA[activeTab] || [];
                  const labelShort =
                    (TABS.find((t) => t.key === activeTab)?.label || "").replace("By ", "");
                  const hasMore = items.length > VISIBLE_LIMIT;
                  const sliceCount = hasMore ? VISIBLE_LIMIT - 1 : VISIBLE_LIMIT;
                  const visible = items.slice(0, sliceCount);

                  return (
                    <>
                      {visible.map(({ label, count }, i) => {
                        const value = String(label);
                        const qp = facetToHomeParam[activeTab]; // industry | function | company | role
                        // const href = `/?${qp}=${encodeURIComponent(value)}&page=1`;
                        const href = `/?${qp}=${encodeURIComponent(value)}&page=1&clear=1`;
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

                      {/* last cell becomes the “Show more …” row */}
                      {hasMore && (
                        <Link
                          href={linkFor(activeTab)}
                          onClick={() => onClose?.()}
                          className="
                            group flex items-center justify-between
                            rounded-lg px-2.5 py-1.5 text-[15px]
                            bg-white hover:bg-gray-100 border hover:shadow-sm transition
                            focus:outline-none focus:ring-2 focus:ring-black/10
                          "
                          title={`Show more ${labelShort}`}
                        >
                          <span className="truncate font-medium">Show more {labelShort}</span>
                        </Link>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
