'use client';

import { Search, Filter } from 'lucide-react';
import type { RoleSortOption } from '@/hooks/roles/useRoleFilters';

/**
 * Props for the RolesFilterBar component
 */
interface RolesFilterBarProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    sortBy: RoleSortOption;
    setSortBy: (value: RoleSortOption) => void;
}

/**
 * Filter and search interface for the roles management page
 * Provides a unified way to drill down into the roles dataset
 */
export function RolesFilterBar({
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
}: RolesFilterBarProps) {
    return (
        <div className="card p-0 overflow-hidden shadow-sm flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Contextual Search Input */}
            <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search roles by name, UID, or business description..."
                    className="w-full pl-12 pr-4 py-4 border-none outline-none focus:ring-0 transition-all text-sm font-medium text-gray-700 bg-transparent"
                />
            </div>

            {/* Structured Sorting Selector */}
            <div className="md:w-64 relative flex items-center px-4 bg-gray-50/30">
                <Filter className="w-4 h-4 text-gray-400 mr-2" />
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as RoleSortOption)}
                    className="w-full py-4 bg-transparent border-none outline-none focus:ring-0 text-xs font-bold text-gray-500 uppercase tracking-widest cursor-pointer"
                >
                    <option value="name">Alpha (A-Z)</option>
                    <option value="users">Most Active Users</option>
                    <option value="permissions">Permission Density</option>
                </select>
            </div>
        </div>
    );
}
