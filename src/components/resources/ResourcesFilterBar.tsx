'use client';

interface ResourcesFilterBarProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    filterCategory: string;
    setFilterCategory: (value: string) => void;
    uniqueCategories: string[];
}

export function ResourcesFilterBar({
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    uniqueCategories,
}: ResourcesFilterBarProps) {
    return (
        <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search resources..."
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    />
                </div>

                {/* Category Filter */}
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                >
                    <option value="">All Categories</option>
                    {uniqueCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
