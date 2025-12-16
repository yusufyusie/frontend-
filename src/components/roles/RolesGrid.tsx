'use client';

import type { Role } from '@/services/roles.service';
import { RoleCard } from '@/components/RoleCard';

interface RolesGridProps {
    roles: Role[];
    selectedIds: Set<number>;
    onToggleSelect: (id: number) => void;
    onEditClick: (role: Role) => void;
    onDeleteClick: (role: Role) => void;
    onAssignPermissionsClick: (role: Role) => void;
    onAssignMenusClick: (role: Role) => void;
}

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
            <div className="col-span-full card text-center p-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500 text-lg">No roles found matching your criteria</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
