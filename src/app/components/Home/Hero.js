import React from 'react'

function Hero() {
    return (
        <div className="relative text-center">
            <br></br>
            <br></br>
            <br></br>
            <h1 className="text-[150px] font-extrabold text-black leading-none relative">
                THE JOBS BOARD
                <span className="text-[24px] block text-black font-normal leading-none mx-60 mt-4">
                    Latest Vacancies in Your Desired Field and Expertise
                </span>
                <img
                    src="./Images/hiring.png"
                    alt="hiring emoji"
                    className="absolute bottom-[80px] left-[650px] w-14 h-14"
                />
                {/* <span className="text-[21px] absolute m-[100] block text-black font-normal leading-none mx-60 mt-4">24 job opportunities waiting.</span> */}
            </h1>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
        </div>
    )
}

export default Hero
