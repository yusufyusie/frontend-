'use client';

import type { RoleSortOption } from '@/hooks/roles/useRoleFilters';

interface RolesFilterBarProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    sortBy: RoleSortOption;
    setSortBy: (value: RoleSortOption) => void;
}

export function RolesFilterBar({
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
}: RolesFilterBarProps) {
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
                        placeholder="Search roles by name or description..."
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    />
                </div>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as RoleSortOption)}
                    className="px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                >
                    <option value="name">Sort by Name</option>
                    <option value="users">Sort by Users</option>
                    <option value="permissions">Sort by Permissions</option>
                </select>
            </div>
        </div>
    );
}
