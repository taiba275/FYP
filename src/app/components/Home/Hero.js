import React from 'react'

function Hero() {
    return (
        <div className="flex flex-col items-center justify-center mt-[70px] mb-[150px]">
            <h1 className="text-[150px] font-extrabold text-black text-center leading-none relative w-[60%]">
                THE JOBS BOARD
                <span className="flex justify-center text-center text-[24px] block text-black font-normal leading-none mx-60 mt-4">
                    Latest Vacancies in Your Desired Field and Expertise
                </span>
                <img
                    src="./Images/hiring.png"
                    alt="hiring emoji"
                    className="absolute bottom-[80px] left-[690px] w-14 h-14"
                />
                {/* <span className="text-[21px] absolute m-[100] block text-black font-normal leading-none mx-60 mt-4">24 job opportunities waiting.</span> */}
            </h1>
        </div>
    )
}

export default Hero
