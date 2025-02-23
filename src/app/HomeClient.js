"use client";

import { useState } from "react";
import Hero from "./components/Home/Hero";
import Posts from "./components/Home/Posts";
import ScrollToTop from "./components/Home/ScrollToTop";

export default function HomeClient({ initialJobs }) {
  const [viewMode, setViewMode] = useState('grid');
  
  return (
    <div>
      <Hero setViewMode={setViewMode} />
      <Posts initialJobs={initialJobs} viewMode={viewMode} />
      <ScrollToTop />
    </div>
  );
} 