'use client';

import { ShieldAlert } from 'lucide-react';
import type { Permission } from '@/services/permissions.service';
import { PermissionGroupSection } from './PermissionGroupSection';

/**
 * Props for the PermissionsGrid component
 */
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

/**
 * High-level organizational component for permission management
 * Orchestrates rendering of permission groups and manages empty states
 */
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
            <div className="col-span-full card border-dashed border-2 py-20 bg-gray-50/50 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <ShieldAlert className="w-8 h-8 text-gray-300" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">No Rules Match</h3>
                    <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                        We couldn't find any permissions matching your current taxonomy or search filters.
                    </p>
                </div>
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
