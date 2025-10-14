import React from 'react';

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddVideoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, onAddVideoClick }) => {
    return (
        <header className="p-4 md:p-6 lg:p-8 sticky top-0 bg-gray-900 z-10">
            <div className="flex items-center gap-4">
                <div className="relative flex-grow">
                    <input 
                        type="search" 
                        placeholder="Search references by source or classification..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>
                <button
                    onClick={onAddVideoClick}
                    className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-2 px-6 rounded-md transition-colors duration-300 whitespace-nowrap"
                >
                    Add Video
                </button>
            </div>
        </header>
    );
};
