import React from 'react';

function Hero() {
    return (
        <div className="relative text-center p-4">
            <h1 className="text-6xl md:text-9xl font-extrabold text-black leading-none relative">
                THE JOBS BOARD
                <span className="text-sm md:text-lg block text-black font-normal leading-none mt-4 mx-auto max-w-xl">
                    Latest Vacancies in Your Desired Field and Expertise
                </span>
                <img
                    src="./Images/hiring.png"
                    alt="hiring emoji"
                    className="absolute bottom-0 md:bottom-20 left-1/2 transform -translate-x-1/2 md:left-auto md:translate-x-0 md:left-3/4 w-14 h-14"
                />
                {/* Optionally uncomment to use:
                <span className="text-xs md:text-base absolute m-[100] block text-black font-normal leading-none mx-auto mt-4">24 job opportunities waiting.</span>
                */}
            </h1>
        </div>
    );
}

export default Hero
