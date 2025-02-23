"use client";
import React, { useState } from "react";
import Hero from "./components/Home/Hero";
import Posts from "./components/Home/Posts";
import ScrollToTop from "./components/Home/ScrollToTop";

export default function Page() {
  const [viewMode, setViewMode] = useState('list'); // Default to list

  return (
    <div>
        <Hero setViewMode={setViewMode} />
        <Posts viewMode={viewMode} />
        <ScrollToTop />
    </div>
  );
}
