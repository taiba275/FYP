import React from "react";
import { FaThLarge, FaList } from "react-icons/fa"; // Import icons

function Hero({ setViewMode }) {
    return (
        <div className="relative text-center p-14 bg-white flex flex-col items-center">
            {/* Main Heading */}
            <div className="relative">
                <h1 className="text-6xl md:text-9xl font-extrabold text-black leading-tight inline-block">
                    THE JOBS<br /> BOARD
                </h1>
                {/* Hiring Badge */}
                <img 
                    src="./Images/hiring.png" 
                    alt="hiring icon" 
                    className="absolute right-10 bottom-0 flex items-center ml-1 w-16 h-13" 
                />
            </div>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-gray-600 mt-4">
                Find your dream job in Pakistan <br />
            </p>

            {/* Additional Information + View Mode Icons */}
            <div className="absolute bottom-0 right-10 flex items-center space-x-3 text-sm text-gray-700">
                {/* <p>Find Your Dream Job in Web, UI/UX, and Frontend Development... <a href="#" className="text-blue-500">Read more</a></p> */}

                {/* View Mode Toggle Icons */}
                <button 
                    onClick={() => setViewMode('list')} 
                    className="bg-gray-200 hover:bg-gray-400 p-1 rounded transition"
                    title="List View"
                >
                    <FaList className="w-4 h-4 text-gray-700" /> {/* ⬅️ Smaller Icon */}
                </button>
                <button 
                    onClick={() => setViewMode('grid')} 
                    className="bg-gray-200 hover:bg-gray-400 p-1 rounded transition"
                    title="Grid View"
                >
                    <FaThLarge className="w-4 h-4 text-gray-700" /> {/* ⬅️ Smaller Icon */}
                </button>
            </div>

            {/* Job Opportunities Count */}
            <div className="absolute bottom-0 left-10 text-sm md:text-base text-gray-700">
                <strong className="text-black">6549</strong> job opportunities waiting.
            </div>

            {/* Sidebar Promotion Box */}
            <div className="absolute right-5 top-40 bg-white shadow-lg rounded-lg p-4 text-black max-w-xs">
                <p>Unlock premium job listings with exclusive member benefits. Get your first posting free!</p>
            </div>
        </div>
    );
}

export default Hero;
