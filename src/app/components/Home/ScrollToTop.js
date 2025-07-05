"use client";
import React, { useState, useEffect } from 'react';

function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        isVisible && (
            <div 
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    left: '30px',
                    cursor: 'pointer',
                    background: '#111',
                    color: '#fff',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                    zIndex: 9999,
                    transition: 'opacity 0.3s ease-in-out'
                }}
                onClick={scrollToTop}
                aria-label="Scroll to top"
            >
                {/* SVG Up Arrow */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="white"
                    strokeWidth={2.5}
                    width="26"
                    height="26"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
            </div>
        )
    );
}

export default ScrollToTop;
