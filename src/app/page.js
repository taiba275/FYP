import React from "react";
import Hero from "./components/Home/Hero";
import Posts from "./components/Home/Posts";
import ScrollToTop from "./components/Home/ScrollToTop";
// Import dynamically and disable server-side rendering
// import dynamic from 'next/dynamic';

// const ScrollToTop = dynamic(() => import('../../components/Home/ScrollToTop'), {
//   ssr: false  // Ensures the component is only rendered on the client side
// });


export default function Page() {
  return (
    <div>
        <Hero />
        <Posts />
        <ScrollToTop />
    </div>
  );
}
