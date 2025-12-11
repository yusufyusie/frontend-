'use client';

import React from 'react';
import { DynamicSelect, SelectOption } from './DynamicSelect';
import { Shield } from 'lucide-react';

export interface Role {
    id: number;
    name: string;
    description?: string;
    _count?: {
        rolePermissions?: number;
        userRoles?: number;
    };
}

interface RoleSelectProps {
    roles: Role[];
    value: number[];
    onChange: (roleIds: number[]) => void;
    label?: string;
    placeholder?: string;
    multiple?: boolean;
    disabled?: boolean;
    error?: string;
    showPermissionCount?: boolean;
}

export function RoleSelect({
    roles,
    value,
    onChange,
    label = 'Roles',
    placeholder = 'Select roles...',
    multiple = true,
    disabled = false,
    error,
    showPermissionCount = true,
}: RoleSelectProps) {
    const options: SelectOption[] = roles.map(role => ({
        value: role.id,
        label: role.name,
        description: showPermissionCount
            ? `${role.description || ''} ${role._count?.rolePermissions ? `• ${role._count.rolePermissions} permissions` : ''}`.trim()
            : role.description,
    }));

    return (
        <div className="space-y-2">
            <DynamicSelect
                options={options}
                value={value}
                onChange={(selected) => onChange(selected as number[])}
                label={label}
                placeholder={placeholder}
                multiple={multiple}
                disabled={disabled}
                error={error}
                searchable={true}
            />

            {value.length > 0 && showPermissionCount && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>
                        {value.length} {value.length === 1 ? 'role' : 'roles'} selected
                    </span>
                </div>
            )}
        </div>
    );
}
