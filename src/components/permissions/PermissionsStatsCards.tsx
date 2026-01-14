'use client';

import { Key, Folder, Clock, CheckCircle } from 'lucide-react';
import type { PermissionStats } from '@/services/permissions.service';

/**
 * Props for the PermissionsStatsCards component
 */
interface PermissionsStatsCardsProps {
    stats: PermissionStats | null;
    selectedCount: number;
}

/**
 * Permissions statistics visualization component
 * Displays key metrics regarding the rule engine and grouping
 */
export function PermissionsStatsCards({ stats, selectedCount }: PermissionsStatsCardsProps) {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Rules Metric */}
            <div className="card border-none bg-white p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Key className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 leading-tight">{stats.totalPermissions}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Verified Rules</div>
                    </div>
                </div>
            </div>

            {/* Logical Groups Metric */}
            <div className="card border-none bg-white p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                        <Folder className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 leading-tight">{stats.totalGroups}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Asset Groups</div>
                    </div>
                </div>
            </div>

            {/* Recent Velocity Metric */}
            <div className="card border-none bg-white p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 leading-tight">{stats.recentlyCreated}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">New This Week</div>
                    </div>
                </div>
            </div>

            {/* Selection Counter */}
            <div className="card border-none bg-white p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 leading-tight">{selectedCount}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Rules Selected</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
