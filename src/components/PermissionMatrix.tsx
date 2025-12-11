'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Check, Minus } from 'lucide-react';

export interface Permission {
    id: number;
    name: string;
    groupName: string;
    description?: string;
}

interface PermissionGroup {
    name: string;
    permissions: Permission[];
}

interface PermissionMatrixProps {
    permissions: Permission[];
    selectedPermissions: number[];
    onChange: (permissionIds: number[]) => void;
    disabled?: boolean;
}

export function PermissionMatrix({
    permissions,
    selectedPermissions,
    onChange,
    disabled = false,
}: PermissionMatrixProps) {
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // Group permissions by groupName
    const permissionGroups: PermissionGroup[] = permissions.reduce((groups, permission) => {
        const groupIndex = groups.findIndex((g) => g.name === permission.groupName);
        if (groupIndex >= 0) {
            groups[groupIndex].permissions.push(permission);
        } else {
            groups.push({
                name: permission.groupName,
                permissions: [permission],
            });
        }
        return groups;
    }, [] as PermissionGroup[]);

    // Auto-expand all groups on mount
    useEffect(() => {
        setExpandedGroups(new Set(permissionGroups.map((g) => g.name)));
    }, []);

    const toggleGroup = (groupName: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupName)) {
            newExpanded.delete(groupName);
        } else {
            newExpanded.add(groupName);
        }
        setExpandedGroups(newExpanded);
    };

    const isGroupExpanded = (groupName: string) => expandedGroups.has(groupName);

    const togglePermission = (permissionId: number) => {
        if (disabled) return;

        const newSelected = selectedPermissions.includes(permissionId)
            ? selectedPermissions.filter((id) => id !== permissionId)
            : [...selectedPermissions, permissionId];

        onChange(newSelected);
    };

    const toggleGroupPermissions = (group: PermissionGroup) => {
        if (disabled) return;

        const groupPermissionIds = group.permissions.map((p) => p.id);
        const allSelected = groupPermissionIds.every((id) => selectedPermissions.includes(id));

        let newSelected: number[];
        if (allSelected) {
            // Deselect all in group
            newSelected = selectedPermissions.filter((id) => !groupPermissionIds.includes(id));
        } else {
            // Select all in group
            const toAdd = groupPermissionIds.filter((id) => !selectedPermissions.includes(id));
            newSelected = [...selectedPermissions, ...toAdd];
        }

        onChange(newSelected);
    };

    const getGroupCheckState = (group: PermissionGroup): 'all' | 'some' | 'none' => {
        const groupPermissionIds = group.permissions.map((p) => p.id);
        const selectedCount = groupPermissionIds.filter((id) => selectedPermissions.includes(id)).length;

        if (selectedCount === 0) return 'none';
        if (selectedCount === groupPermissionIds.length) return 'all';
        return 'some';
    };

    const selectAll = () => {
        if (disabled) return;
        onChange(permissions.map((p) => p.id));
    };

    const deselectAll = () => {
        if (disabled) return;
        onChange([]);
    };

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            {/* Header with Select All/Deselect All */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={selectAll}
                            disabled={disabled}
                            className="btn-sm btn-secondary"
                        >
                            Select All
                        </button>
                        <button
                            onClick={deselectAll}
                            disabled={disabled}
                            className="btn-sm btn-ghost"
                        >
                            Deselect All
                        </button>
                    </div>
                </div>
            </div>

            {/* Permission Tree */}
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                {permissionGroups.map((group) => {
                    const checkState = getGroupCheckState(group);
                    const isExpanded = isGroupExpanded(group.name);

                    return (
                        <div key={group.name} className="border-b border-gray-100 last:border-b-0">
                            {/* Group Header */}
                            <div
                                className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                                    }`}
                            >
                                {/* Expand/Collapse Icon */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleGroup(group.name);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="w-5 h-5" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5" />
                                    )}
                                </button>

                                {/* Group Checkbox */}
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleGroupPermissions(group);
                                    }}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${checkState === 'all'
                                        ? 'bg-blue-600 border-blue-600'
                                        : checkState === 'some'
                                            ? 'bg-blue-200 border-blue-400'
                                            : 'border-gray-300 hover:border-blue-400'
                                        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    {checkState === 'all' && <Check className="w-4 h-4 text-white" />}
                                    {checkState === 'some' && <Minus className="w-4 h-4 text-blue-700" />}
                                </div>

                                {/* Group Name */}
                                <span className="font-semibold text-gray-900">{group.name}</span>

                                {/* Permission Count Badge */}
                                <span className="badge badge-sm badge-secondary ml-auto">
                                    {group.permissions.length} permissions
                                </span>
                            </div>

                            {/* Group Permissions */}
                            {isExpanded && (
                                <div className="bg-gray-50/50">
                                    {group.permissions.map((permission) => {
                                        const isSelected = selectedPermissions.includes(permission.id);

                                        return (
                                            <div
                                                key={permission.id}
                                                onClick={() => togglePermission(permission.id)}
                                                className={`flex items-center gap-3 px-4 py-3 pl-14 hover:bg-white transition-colors ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                                                    }`}
                                            >
                                                {/* Permission Checkbox */}
                                                <div
                                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${isSelected
                                                        ? 'bg-blue-600 border-blue-600'
                                                        : 'border-gray-300 hover:border-blue-400'
                                                        }`}
                                                >
                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                </div>

                                                {/* Permission Name */}
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                                                    {permission.description && (
                                                        <p className="text-xs text-gray-500 mt-0.5">{permission.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer with count */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">{selectedPermissions.length}</span> of{' '}
                    <span className="font-semibold">{permissions.length}</span> permissions selected
                </p>
            </div>
        </div>
    );
}
