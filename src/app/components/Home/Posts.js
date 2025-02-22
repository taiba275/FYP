// import React, { useEffect } from "react";
// import Link from "next/link";

// function Posts({ posts }) {
//   useEffect(() => {
//     console.log("Posts", posts);
//   }, [posts]);

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {posts.map((post, index) => (
//         <Link key={post._id} href={`/jobs/${post._id}`} passHref>
//           <div className="cursor-pointer max-w-[350px] w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 p-5 hover:shadow-lg transition flex flex-col h-[300px]">
            
//             {/* Title */}
//             <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
//               {post.Title}
//             </h5>

//             {/* Company */}
//             <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
//               {post.Company}
//             </p>

//             {/* Job Location */}
//             <p className="text-gray-600 dark:text-gray-400 truncate">
//               📍 {post["Job Location"]}
//             </p>

//             {/* Salary */}
//             <p className="text-green-600 font-bold">
//               💰 {post.Salary || "Salary Not Disclosed"}
//             </p>

//             {/* Spacer to push the button to the bottom */}
//             <div className="flex-grow"></div>

//             {/* Apply Button */}
//             <button className="mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800">
//               View Details
//             </button>

//           </div>
//         </Link>
//       ))}
//     </div>
//   );
// }

// export default Posts;

import React, { useEffect } from "react";
import Link from "next/link";

function Posts({ posts }) {
  useEffect(() => {
    console.log("Posts", posts);
  }, [posts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4 md:px-8">
      {posts.map((post, index) => (
        <Link key={post._id} href={`/jobs/${post._id}`} passHref>
          <div className="cursor-pointer w-full bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-xl transition-transform hover:-translate-y-1 flex flex-col h-auto overflow-hidden">
            {/* Company & Remote Badge */}
            <div className="flex justify-between items-center mb-3">
              <h5 className="text-lg font-semibold text-gray-900 truncate w-4/5">{post.Company}</h5>
              {post.Remote && (
                <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md">
                  REMOTE
                </span>
              )}
            </div>

            {/* Job Title */}
            <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{post.Title}</h3>

            {/* Job Description (Short Preview) */}
            <p className="text-sm text-gray-600 line-clamp-2 mb-3 overflow-hidden">
              {post.Description}
            </p>

            {/* Location & Salary */}
            <div className="flex flex-col text-sm text-gray-500 mb-3">
              <p className="truncate">
                <span className="font-semibold">📍 Location:</span> {post["Job Location"]}
              </p>
              <p className={`font-bold ${post.Salary ? "text-green-500" : "text-yellow-500"}`}>
                <span className="font-semibold">💰 Salary:</span> {post.Salary || "Not Disclosed"}
              </p>
            </div>

            {/* Date Posted */}
            <div className="text-xs text-gray-400 mb-4">{post.PostedDate}</div>

            {/* View Details Button */}
            <button className="w-full bg-gray-900 text-white py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition">
              View Details
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default Posts;
