'use client';

import type { RoleStats } from '@/services/roles.service';

interface RolesStatsCardsProps {
    stats: RoleStats | null;
    selectedCount: number;
}

export function RolesStatsCards({ stats, selectedCount }: RolesStatsCardsProps) {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Roles */}
            <div className="card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                <div className="relative flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalRoles}</p>
                        <p className="text-sm text-gray-600">Total Roles</p>
                    </div>
                </div>
            </div>

            {/* Total Users */}
            <div className="card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                <div className="relative flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-accent-500 to-accent-700 rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                        <p className="text-sm text-gray-600">Total Users</p>
                    </div>
                </div>
            </div>

            {/* Average Permissions */}
            <div className="card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                <div className="relative flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-900">{stats.averagePermissions}</p>
                        <p className="text-sm text-gray-600">Avg Permissions</p>
                    </div>
                </div>
            </div>

            {/* Selected Items */}
            <div className="card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                <div className="relative flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-accent-400 to-primary-600 rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-900">{selectedCount}</p>
                        <p className="text-sm text-gray-600">Selected Items</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
