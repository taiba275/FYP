import React, { useEffect } from "react";

function Posts({ posts }) {
  useEffect(() => {
    console.log("Posts", posts);
  }, [posts]);
  return (
    <div>
      {posts.map((post, index) => (
        <div
          key={index}
          className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mb-4"
        >
          <img
            className="rounded-t-lg w-full h-[180px] object-cover"
            src={post.image || "@public/Images/A.jpeg"}
            alt={post.title}
          />
          <div className="p-5">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {post.title}
            </h5>
            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
              {post.description}
            </p>
            <a
              href={post.link}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Read more
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Posts;
