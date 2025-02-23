import React from 'react';

function Hero() {
    return (
        <div className="relative text-center p-14 bg-white flex flex-col items-center">
            {/* Main Heading */}
            <div className="relative">
                <h1 className="text-6xl md:text-9xl font-extrabold text-black leading-tight inline-block">
                    THE JOBS<br/> BOARD
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
                Latest Vacancies in Web Design <br /> and UX/UI Design
            </p>

            {/* Job Opportunities Count */}
            <div className="absolute bottom-0 left-10 text-sm md:text-base text-gray-700">
                <strong className="text-black">509</strong> job opportunities waiting.
            </div>

            {/* Sidebar Promotion Box */}
            <div className="absolute right-5 top-40 bg-white shadow-lg rounded-lg p-4 text-black max-w-xs">
                <p>Unlock premium job listings with exclusive member benefits. Get your first posting free!</p>
            </div>

            {/* Additional Information */}
            <div className="absolute bottom-0 right-10 text-sm text-gray-700">
                Find Your Dream Job in Web, UI/UX, and Frontend Development... <a href="#" className="text-blue-500">Read more</a>
            </div>
        </div>
    );
}

export default Hero;

