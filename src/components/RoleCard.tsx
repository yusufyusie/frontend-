import React from 'react';
import { Role } from '@/services/roles.service';

interface RoleCardProps {
    role: Role;
    isSelected: boolean;
    onSelect: (id: number) => void;
    onEdit: () => void;
    onDelete: () => void;
    onAssignPermissions: () => void;
    onAssignMenus: () => void;
}

export function RoleCard({
    role,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    onAssignPermissions,
    onAssignMenus,
}: RoleCardProps) {
    const userCount = role._count?.userRoles || 0;
    const permissionCount = role._count?.rolePermissions || 0;

    return (
        <div
            className={`
                card-gradient relative hover-lift transition-all duration-200
                ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
            `}
        >
            {/* Selection Checkbox */}
            <div className="absolute top-4 right-4 z-10">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(role.id)}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    disabled={role.isSystem}
                />
            </div>

            {/* Icon with Dynamic Color */}
            <div className="flex items-start justify-between mb-3">
                <div
                    className="p-3 rounded-xl shadow-md bg-primary"
                >
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                {role.isSystem && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                        System
                    </span>
                )}
            </div>

            {/* Role Info */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{role.name}</h3>
            <p className="text-gray-600 mb-4 min-h-[48px] line-clamp-2">{role.description}</p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>{userCount} {userCount === 1 ? 'user' : 'users'}</span>
                </div>
                <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>{permissionCount} {permissionCount === 1 ? 'permission' : 'permissions'}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                    onClick={onAssignPermissions}
                    className="flex-1 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors font-medium text-sm"
                >
                    Permissions
                </button>
                <button
                    onClick={onAssignMenus}
                    className="flex-1 px-4 py-2 bg-secondary-50 text-secondary-700 rounded-lg hover:bg-secondary-100 transition-colors font-medium text-sm"
                >
                    Menus
                </button>
                <button
                    onClick={onEdit}
                    className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
                >
                    Edit
                </button>
                {!role.isSystem && (
                    <button
                        onClick={onDelete}
                        className="px-4 py-2 bg-error-50 text-error-700 rounded-lg hover:bg-error-100 transition-colors font-medium text-sm"
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
}
