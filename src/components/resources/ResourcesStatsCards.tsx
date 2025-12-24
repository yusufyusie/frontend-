'use client';

import type { ResourceStats } from '@/services/resource.service';

interface ResourcesStatsCardsProps {
    stats: ResourceStats | null;
    selectedCount: number;
}

export function ResourcesStatsCards({ stats, selectedCount }: ResourcesStatsCardsProps) {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Resources */}
            <div className="card relative overflow-hidden">
                <div className="relative flex items-center gap-3">
                    <div className="p-3 bg-secondary rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalResources}</p>
                        <p className="text-sm text-gray-600">Total Resources</p>
                    </div>
                </div>
            </div>

            {/* Active Resources */}
            <div className="card relative overflow-hidden">
                <div className="relative flex items-center gap-3">
                    <div className="p-3 bg-success rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-900">{stats.activeResources}</p>
                        <p className="text-sm text-gray-600">Active</p>
                    </div>
                </div>
            </div>

            {/* Total Actions */}
            <div className="card relative overflow-hidden">
                <div className="relative flex items-center gap-3">
                    <div className="p-3 bg-primary rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalActions}</p>
                        <p className="text-sm text-gray-600">Total Actions</p>
                    </div>
                </div>
            </div>

            {/* Selected Items */}
            <div className="card relative overflow-hidden">
                <div className="relative flex items-center gap-3">
                    <div className="p-3 bg-accent-700 rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-gray-900">{selectedCount}</p>
                        <p className="text-sm text-gray-600">Selected</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
