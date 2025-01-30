import React, { useEffect } from "react";
import Link from "next/link";

function Posts({ posts }) {
  useEffect(() => {
    console.log("Posts", posts);
  }, [posts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post, index) => (
        <Link key={post._id} href={`/jobs/${post._id}`} passHref>
          <div className="cursor-pointer max-w-[350px] w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 p-5 hover:shadow-lg transition flex flex-col h-[300px]">
            
            {/* Title */}
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {post.Title}
            </h5>

            {/* Company */}
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {post.Company}
            </p>

            {/* Job Location */}
            <p className="text-gray-600 dark:text-gray-400 truncate">
              📍 {post["Job Location"]}
            </p>

            {/* Salary */}
            <p className="text-green-600 font-bold">
              💰 {post.Salary || "Salary Not Disclosed"}
            </p>

            {/* Spacer to push the button to the bottom */}
            <div className="flex-grow"></div>

            {/* Apply Button */}
            <button className="mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800">
              View Details
            </button>

          </div>
        </Link>
      ))}
    </div>
  );
}

export default Posts;
