'use client';

import { Search, Filter, SortAsc } from 'lucide-react';
import type { SortOption } from '@/hooks/permissions/usePermissionFilters';

/**
 * Props for the PermissionsFilterBar component
 */
interface PermissionsFilterBarProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    selectedGroup: string;
    setSelectedGroup: (value: string) => void;
    sortBy: SortOption;
    setSortBy: (value: SortOption) => void;
    uniqueGroups: string[];
}

/**
 * Filtering and sorting interface for permissions
 * Allows granular searching across name, group, and business description
 */
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
        <div className="card p-0 overflow-hidden shadow-sm flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
            {/* Contextual Search Input */}
            <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search permissions by name, description, or asset group..."
                    className="w-full pl-12 pr-4 py-4 border-none outline-none focus:ring-0 transition-all text-sm font-medium text-gray-700 bg-transparent"
                />
            </div>

            <div className="flex divide-x divide-gray-100 bg-gray-50/20">
                {/* Taxonomy Filter */}
                <div className="flex-1 lg:w-48 relative flex items-center px-4">
                    <Filter className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="w-full py-4 bg-transparent border-none outline-none focus:ring-0 text-xs font-bold text-gray-500 uppercase tracking-widest cursor-pointer"
                    >
                        <option value="all">Every Group</option>
                        {uniqueGroups.map(group => (
                            <option key={group} value={group}>{group}</option>
                        ))}
                    </select>
                </div>

                {/* Ordering Selector */}
                <div className="flex-1 lg:w-48 relative flex items-center px-4">
                    <SortAsc className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="w-full py-4 bg-transparent border-none outline-none focus:ring-0 text-xs font-bold text-gray-500 uppercase tracking-widest cursor-pointer"
                    >
                        <option value="name">Alphanumeric</option>
                        <option value="usage">Impact (Usage)</option>
                        <option value="date">Registry Date</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
