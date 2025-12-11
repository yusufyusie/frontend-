'use client';

import { useState, useMemo } from 'react';

interface Permission {
    id: number;
    name: string;
    groupName: string;
    description: string;
}

interface PermissionGroup {
    name: string;
    permissions: Permission[];
    children?: PermissionGroup[];
}

interface PermissionTreeProps {
    permissions: Permission[];
    selectedIds: number[];
    onChange: (selectedIds: number[]) => void;
    searchTerm?: string;
}

export function PermissionTree({ permissions, selectedIds, onChange, searchTerm = '' }: PermissionTreeProps) {
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // Group permissions hierarchically
    const groupedPermissions = useMemo(() => {
        const filtered = searchTerm
            ? permissions.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.groupName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : permissions;

        const groups: Record<string, Permission[]> = {};
        filtered.forEach(perm => {
            const group = perm.groupName || 'Other';
            if (!groups[group]) groups[group] = [];
            groups[group].push(perm);
        });

        return groups;
    }, [permissions, searchTerm]);

    const toggleGroup = (group: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(group)) {
            newExpanded.delete(group);
        } else {
            newExpanded.add(group);
        }
        setExpandedGroups(newExpanded);
    };

    const selectAll = () => {
        onChange(permissions.map(p => p.id));
    };

    const clearAll = () => {
        onChange([]);
    };

    const togglePermission = (id: number) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(sid => sid !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const toggleGroupPermissions = (groupPerms: Permission[]) => {
        const groupIds = groupPerms.map(p => p.id);
        const allSelected = groupIds.every(id => selectedIds.includes(id));

        if (allSelected) {
            // Deselect all in group
            onChange(selectedIds.filter(id => !groupIds.includes(id)));
        } else {
            // Select all in group
            const newIds = [...selectedIds];
            groupIds.forEach(id => {
                if (!newIds.includes(id)) {
                    newIds.push(id);
                }
            });
            onChange(newIds);
        }
    };

    const totalSelected = selectedIds.length;
    const totalPermissions = permissions.length;

    return (
        <div className="space-y-4">
            {/* Header with actions */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-4">
                    <div className="text-sm font-semibold text-gray-700">
                        <span className="text-2xl font-bold text-blue-600">{totalSelected}</span>
                        <span className="text-gray-500"> of {totalPermissions} selected</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={selectAll}
                        className="px-4 py-2 text-sm bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                        Select All
                    </button>
                    <button
                        onClick={clearAll}
                        className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {/* Permission Tree */}
            <div className="space-y-2">
                {Object.entries(groupedPermissions).sort(([a], [b]) => a.localeCompare(b)).map(([group, perms]) => {
                    const isExpanded = expandedGroups.has(group) || searchTerm !== '';
                    const groupIds = perms.map(p => p.id);
                    const selectedInGroup = groupIds.filter(id => selectedIds.includes(id)).length;
                    const allSelected = selectedInGroup === groupIds.length;
                    const someSelected = selectedInGroup > 0 && selectedInGroup < groupIds.length;

                    return (
                        <div key={group} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                            {/* Group Header */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <button
                                    onClick={() => toggleGroup(group)}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                >
                                    <svg
                                        className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>

                                <div
                                    onClick={() => toggleGroupPermissions(perms)}
                                    className="flex items-center gap-3 flex-1 cursor-pointer"
                                >
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={() => { }}
                                            className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        />
                                        {someSelected && !allSelected && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-2.5 h-0.5 bg-blue-600 rounded"></div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">{group}</span>
                                            <span className={`text-sm ${allSelected ? 'text-green-600 font-semibold' : someSelected ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                                                ({selectedInGroup}/{groupIds.length})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Group Permissions */}
                            {isExpanded && (
                                <div className="p-3 pl-12 space-y-2 bg-white">
                                    {perms.map(perm => (
                                        <div
                                            key={perm.id}
                                            onClick={() => togglePermission(perm.id)}
                                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(perm.id)}
                                                onChange={() => { }}
                                                className="mt-0.5 w-4 h-4 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 group-hover:text-blue-700">
                                                    {perm.name}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-0.5">
                                                    {perm.description}
                                                </div>
                                            </div>
                                            {selectedIds.includes(perm.id) && (
                                                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {Object.keys(groupedPermissions).length === 0 && (
                <div className="text-center p-8 text-gray-500">
                    No permissions found
                </div>
            )}
        </div>
    );
}
