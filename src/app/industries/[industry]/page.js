// // app/industries/[industry]/page.js
// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useSearchParams, useRouter } from 'next/navigation';
// import Posts from '@/app/components/Home/Posts';

// export default function IndustryJobsPage() {
//   const { industry } = useParams();
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const page = Number(searchParams.get('page') || 1);
//   const limit = Number(searchParams.get('limit') || 20);
//   const industryParam = decodeURIComponent(industry || '');

//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [total, setTotal] = useState(0);

//   useEffect(() => {
//     setLoading(true);
//     fetch(`/api/industries/${encodeURIComponent(industryParam)}?page=${page}&limit=${limit}`, {
//       cache: 'no-store',
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         setJobs(data.jobs || []);
//         setTotal(data.total || 0);
//       })
//       .catch((err) => console.error('Failed to fetch jobs:', err))
//       .finally(() => setLoading(false));
//   }, [industryParam, page, limit]);

//   const totalPages = Math.ceil(total / limit);

//   const goToPage = (newPage) => {
//     router.push(`/industries/${encodeURIComponent(industryParam)}?page=${newPage}&limit=${limit}`);
//   };

//   return (
//     <div className="px-4 py-10 max-w-screen-xl mx-auto text-gray-800">
//       <h1 className="text-2xl font-bold mb-6">
//         Showing {total} jobs for “{industryParam}” Industry
//       </h1>

//       {loading ? (
//         <div className="w-full h-[40vh] flex items-center justify-center">Loading…</div>
//       ) : (
//         <>
//           <Posts jobs={jobs} viewMode="grid" showTotals={false} />

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex justify-center items-center gap-4 mt-8">
//               <button
//                 onClick={() => goToPage(page - 1)}
//                 disabled={page <= 1}
//                 className={`px-4 py-2 rounded border ${
//                   page <= 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-gray-100'
//                 }`}
//               >
//                 Prev
//               </button>

//               <span className="text-gray-700">
//                 Page {page} of {totalPages}
//               </span>

//               <button
//                 onClick={() => goToPage(page + 1)}
//                 disabled={page >= totalPages}
//                 className={`px-4 py-2 rounded border ${
//                   page >= totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-gray-100'
//                 }`}
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// app/industries/[industry]/page.js
import { redirect } from "next/navigation";

export default function IndustryRedirect({ params, searchParams }) {
  const industry = decodeURIComponent(params.industry || "");
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const limit = searchParams?.limit ? Number(searchParams.limit) : 20;

  const qs = new URLSearchParams({
    industry,
    page: String(page || 1),
    limit: String(limit || 20),
    clear: "1",
  });

  redirect(`/?${qs.toString()}`);
}
