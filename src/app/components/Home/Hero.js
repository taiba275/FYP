"use client";

import React from "react";
import '@lottiefiles/lottie-player';

const HiringLottie = () => (
    <lottie-player
        src="https://assets.awwwards.com/assets/redesign/images/lottie/wired-flat-hiring.json"
        background="transparent"
        speed="1"
        loop
        autoplay
        style={{
            width: '80px',
            height: '80px',
            position: 'absolute',
            bottom: '-0.3rem',
            left: 'calc(100% - 8.1rem)',
            zIndex: 10,
        }}
    />
);

function Hero({ showTop = true }) {
    return (
        <div
            className={`relative text-center bg-white flex flex-col items-center transition-all duration-500 ease-in-out ${showTop ? "pt-24 pb-24" : "h-0 overflow-hidden"
                }`}
        >
            {showTop && (
                <div className="relative px-4">
                    <h1 className="text-9xl md:text-9xl font-black text-black leading-tight inline-block relative tracking-tight">
                        THE JOBS
                        <br />
                        BOARD
                        <HiringLottie />
                    </h1>
                    <p className="text-4xl md:text-xl text-black mt-6 tracking-tight">
                        Discover the latest job opportunities across Pakistan<br />
                        and take the next step in your career.
                    </p>
                </div>
            )}
        </div>
    );
}

export default Hero;
