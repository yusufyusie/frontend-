'use client';

import type { SortOption } from '@/hooks/permissions/usePermissionFilters';

interface PermissionsFilterBarProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    selectedGroup: string;
    setSelectedGroup: (value: string) => void;
    sortBy: SortOption;
    setSortBy: (value: SortOption) => void;
    uniqueGroups: string[];
}

export function PermissionsFilterBar({
    searchTerm,
    setSearchTerm,
    selectedGroup,
    setSelectedGroup,
    sortBy,
    setSortBy,
    uniqueGroups,
}: PermissionsFilterBarProps) {
    return (
        <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative col-span-2">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search permissions by name, description, or group..."
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    />
                </div>

                {/* Group Filter */}
                <div className="flex gap-2">
                    <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    >
                        <option value="all">All Groups</option>
                        {uniqueGroups.map(group => (
                            <option key={group} value={group}>{group}</option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="usage">Sort by Usage</option>
                        <option value="date">Sort by Date</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
