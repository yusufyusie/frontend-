'use client';

import { Shield, Users, Key, CheckCircle } from 'lucide-react';
import type { RoleStats } from '@/services/roles.service';

/**
 * Props for the RolesStatsCards component
 */
interface RolesStatsCardsProps {
    stats: RoleStats | null;
    selectedCount: number;
}

/**
 * Roles statistics visualization component
 * Displays high-level metrics about roles, users, and permissions
 */
export function RolesStatsCards({ stats, selectedCount }: RolesStatsCardsProps) {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Roles Metric */}
            <div className="card border-none bg-white p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 leading-tight">{stats.totalRoles}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Total System Roles</div>
                    </div>
                </div>
            </div>

            {/* Total Users Metric */}
            <div className="card border-none bg-white p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 leading-tight">{stats.totalUsers}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Assigned Users</div>
                    </div>
                </div>
            </div>

            {/* Average Permissions Metric */}
            <div className="card border-none bg-white p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                        <Key className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 leading-tight">{stats.averagePermissions}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Avg Permissions</div>
                    </div>
                </div>
            </div>

            {/* Selected Items Counter */}
            <div className="card border-none bg-white p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 leading-tight">{selectedCount}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Items Selected</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
