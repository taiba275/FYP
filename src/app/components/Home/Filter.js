import { useState } from 'react';

const FilterComponent = () => {
    const [category, setCategory] = useState('');
    const [type, setType] = useState('');
    const [country, setCountry] = useState('');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [isCountryOpen, setIsCountryOpen] = useState(false);

    const handleResetFilters = () => {
        setCategory('');
        setType('');
        setCountry('');
    };

    return (
        <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg m-8">
            {/* Dropdowns Container */}
            <div className="flex space-x-4 flex-grow">
                {/* Category Dropdown */}
                <div className="relative flex-2">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        onFocus={() => setIsCategoryOpen(true)}
                        onBlur={() => setIsCategoryOpen(false)}
                        className="block appearance-none w-full bg-white text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none"
                    >
                        <option value="">Category</option>
                        <option value="tech">Technology</option>
                        <option value="health">Health</option>
                        <option value="finance">Finance</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-700">
                        <svg
                            className={`fill-current h-4 w-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>

                {/* Type Dropdown */}
                <div className="relative flex-2">
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        onFocus={() => setIsTypeOpen(true)}
                        onBlur={() => setIsTypeOpen(false)}
                        className="block appearance-none w-full bg-white text-gray-700 py-2 px-4 rounded leading-tight focus:outline-none"
                    >
                        <option value="">Type</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="remote">Remote</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-700">
                        <svg
                            className={`fill-current h-4 w-4 transition-transform duration-200 ${isTypeOpen ? 'rotate-180' : ''}`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>

                {/* Country Dropdown */}
                <div className="relative flex-2">
                    <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        onFocus={() => setIsCountryOpen(true)}
                        onBlur={() => setIsCountryOpen(false)}
                        className="block appearance-none w-full bg-white text-gray-700 py-2 px-4 pr-9 rounded leading-tight focus:outline-none"
                    >
                        <option value="">Country</option>
                        <option value="usa">USA</option>
                        <option value="canada">Canada</option>
                        <option value="uk">UK</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-700">
                        <svg
                            className={`fill-current h-4 w-4 transition-transform duration-200 ${isCountryOpen ? 'rotate-180' : ''}`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Reset Filters Button */}
            <button
                onClick={handleResetFilters}
                className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
                Reset filters
            </button>
        </div>
    );
};

export default FilterComponent;
