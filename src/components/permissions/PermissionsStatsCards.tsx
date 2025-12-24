'use client';

import type { PermissionStats } from '@/services/permissions.service';

interface PermissionsStatsCardsProps {
    stats: PermissionStats | null;
    selectedCount: number;
}

export function PermissionsStatsCards({ stats, selectedCount }: PermissionsStatsCardsProps) {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Permissions */}
            <div className="card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32  rounded-full -mr-16 -mt-16" />
                <div className="relative flex items-center gap-3">
                    <div className="p-3 bg-primary rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalPermissions}</p>
                        <p className="text-sm text-gray-600">Total Permissions</p>
                    </div>
                </div>
            </div>

            {/* Permission Groups */}
            <div className="card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32  rounded-full -mr-16 -mt-16" />
                <div className="relative flex items-center gap-3">
                    <div className="p-3 bg-secondary rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalGroups}</p>
                        <p className="text-sm text-gray-600">Permission Groups</p>
                    </div>
                </div>
            </div>

            {/* Recently Created */}
            <div className="card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32  rounded-full -mr-16 -mt-16" />
                <div className="relative flex items-center gap-3">
                    <div className="p-3 bg-accent rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-900">{stats.recentlyCreated}</p>
                        <p className="text-sm text-gray-600">Added This Week</p>
                    </div>
                </div>
            </div>

            {/* Selected Items */}
            <div className="card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32  rounded-full -mr-16 -mt-16" />
                <div className="relative flex items-center gap-3">
                    <div className="p-3 bg-accent-700 rounded-xl shadow-lg">
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
