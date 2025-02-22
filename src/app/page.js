import React from "react";
// import Link from "next/link";
import Hero from "./components/Home/Hero";
import Posts from "./components/Home/Posts";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center mt-9">
        <Hero />
        <Posts />
        {/* <Posts /> */}
        {/* <div className="mt-4">
          <Link href="/all-jobs">
            <button className="px-8 py-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200">
              Show All Jobs
            </button>
          </Link>
        </div> */}
    </div>
  );
}
