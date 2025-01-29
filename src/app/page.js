"use client";

import { useState, useEffect } from "react";
import Hero from "./components/Home/Hero";
import Posts from "./components/Home/Posts";

export default function HomePage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Fetch posts from the API
    async function fetchPosts() {
      try {
        const response = await fetch("/api/posts");
        const data = await response.json();
        setPosts(data); // Update state with fetched posts
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center mt-9">
      <div className="w-[70%] md:w-[50%] lg:w-[55%]">
        <Hero />
        {posts.length > 0 ? <Posts posts={posts} /> : <p>Loading...</p>}
      </div>
    </div>
  );
}
