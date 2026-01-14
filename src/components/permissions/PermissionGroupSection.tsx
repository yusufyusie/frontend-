'use client';

import { Folder, ChevronDown } from 'lucide-react';
import type { Permission } from '@/services/permissions.service';
import { PermissionCard } from '@/components/PermissionCard';

/**
 * Props for the PermissionGroupSection component
 */
interface PermissionGroupSectionProps {
    groupName: string;
    permissions: Permission[];
    isExpanded: boolean;
    onToggleExpand: (group: string) => void;
    selectedIds: Set<number>;
    onToggleSelect: (id: number) => void;
    onEditClick: (permission: Permission) => void;
    onDeleteClick: (permission: Permission) => void;
    onViewDetailsClick: (permission: Permission) => void;
}

/**
 * Categorized section of permissions sharing the same logical group
 * Supports collapsible interface for managing large numbers of rules
 */
export function PermissionGroupSection({
    groupName,
    permissions,
    isExpanded,
    onToggleExpand,
    selectedIds,
    onToggleSelect,
    onEditClick,
    onDeleteClick,
    onViewDetailsClick,
}: PermissionGroupSectionProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
            {/* Contextual Group Registry Header */}
            <button
                onClick={() => onToggleExpand(groupName)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors group"
            >
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform duration-300">
                        <Folder className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{groupName}</h2>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Registry: {permissions.length} Rule{permissions.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
                <div className={`p-2 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600 transition-all ${isExpanded ? 'rotate-180 bg-gray-100 text-gray-900' : ''}`}>
                    <ChevronDown className="w-5 h-5 transition-transform duration-300" />
                </div>
            </button>

            {/* Granular Permission Ledger */}
            {isExpanded && (
                <div className="border-t border-gray-50 p-6 bg-gray-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {permissions.map((perm) => (
                            <PermissionCard
                                key={perm.id}
                                permission={perm}
                                isSelected={selectedIds.has(perm.id)}
                                onSelect={onToggleSelect}
                                onEdit={() => onEditClick(perm)}
                                onDelete={() => onDeleteClick(perm)}
                                onViewDetails={() => onViewDetailsClick(perm)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
