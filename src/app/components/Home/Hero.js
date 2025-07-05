"use client";

import React from "react";

function Hero({ showTop = true }) {
    return (
        <div
            className={`relative text-center bg-white flex flex-col items-center transition-all duration-500 ease-in-out ${showTop ? "pt-24 pb-24" : "h-0 overflow-hidden"
                }`}
        >

            {showTop && (
                <div className="relative">
                    <h1 className="text-6xl md:text-9xl font-extrabold text-black leading-tight inline-block">
                        THE JOBS<br /> BOARD
                    </h1>
                    <img
                        src="./Images/hiring.png"
                        alt="hiring icon"
                        className="absolute right-10 bottom-0 flex items-center ml-0 mb-16 w-16 h-13"
                    />
                    <p className="text-2xl text-blue-500 mt-2">
                        Explore top job opportunities across Pakistan and land the role<br /> you’ve been waiting for.                    
                    </p>
                </div>
            )}
        </div>
    );
}

export default Hero;
