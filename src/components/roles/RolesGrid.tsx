'use client';

import { ShieldAlert } from 'lucide-react';
import type { Role } from '@/services/roles.service';
import { RoleCard } from '@/components/RoleCard';

/**
 * Props for the RolesGrid component
 */
interface RolesGridProps {
    roles: Role[];
    selectedIds: Set<number>;
    onToggleSelect: (id: number) => void;
    onEditClick: (role: Role) => void;
    onDeleteClick: (role: Role) => void;
    onAssignPermissionsClick: (role: Role) => void;
    onAssignMenusClick: (role: Role) => void;
}

/**
 * Responsive grid container for displaying role cards
 * Manages empty states and passes user interactions to individual cards
 */
export function RolesGrid({
    roles,
    selectedIds,
    onToggleSelect,
    onEditClick,
    onDeleteClick,
    onAssignPermissionsClick,
    onAssignMenusClick,
}: RolesGridProps) {
    if (roles.length === 0) {
        return (
            <div className="col-span-full card border-dashed border-2 py-20 bg-gray-50/50 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <ShieldAlert className="w-8 h-8 text-gray-300" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">No Records Found</h3>
                    <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                        Your current search filters didn't match any security roles in the directory.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {roles.map((role) => (
                <RoleCard
                    key={role.id}
                    role={role}
                    isSelected={selectedIds.has(role.id)}
                    onSelect={onToggleSelect}
                    onEdit={() => onEditClick(role)}
                    onDelete={() => onDeleteClick(role)}
                    onAssignPermissions={() => onAssignPermissionsClick(role)}
                    onAssignMenus={() => onAssignMenusClick(role)}
                />
            ))}
        </div>
    );
}
