'use client';

import type { Permission } from '@/services/permissions.service';
import { PermissionGroupSection } from './PermissionGroupSection';

interface PermissionsGridProps {
    groupedPermissions: Record<string, Permission[]>;
    expandedGroups: Set<string>;
    onToggleGroup: (group: string) => void;
    selectedIds: Set<number>;
    onToggleSelect: (id: number) => void;
    onEditClick: (permission: Permission) => void;
    onDeleteClick: (permission: Permission) => void;
    onViewDetailsClick: (permission: Permission) => void;
}

export function PermissionsGrid({
    groupedPermissions,
    expandedGroups,
    onToggleGroup,
    selectedIds,
    onToggleSelect,
    onEditClick,
    onDeleteClick,
    onViewDetailsClick,
}: PermissionsGridProps) {
    const groupEntries = Object.entries(groupedPermissions);

    if (groupEntries.length === 0) {
        return (
            <div className="card text-center p-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500 text-lg">No permissions found matching your criteria</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {groupEntries.sort(([a], [b]) => a.localeCompare(b)).map(([group, perms]) => (
                <PermissionGroupSection
                    key={group}
                    groupName={group}
                    permissions={perms}
                    isExpanded={expandedGroups.has(group)}
                    onToggleExpand={onToggleGroup}
                    selectedIds={selectedIds}
                    onToggleSelect={onToggleSelect}
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
                    onViewDetailsClick={onViewDetailsClick}
                />
            ))}
        </div>
    );
}
