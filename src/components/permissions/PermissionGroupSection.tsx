'use client';

import type { Permission } from '@/services/permissions.service';
import { PermissionCard } from '@/components/PermissionCard';

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
        <div className="card overflow-hidden">
            {/* Group Header */}
            <button
                onClick={() => onToggleExpand(groupName)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div
                        className="p-3 rounded-xl shadow-md bg-primary"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </div>
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-gray-900">{groupName}</h2>
                        <p className="text-sm text-gray-600 mt-0.5">{permissions.length} permission{permissions.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <svg
                    className={`w-6 h-6 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Permissions Grid */}
            {isExpanded && (
                <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
