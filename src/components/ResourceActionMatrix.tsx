'use client';

import { useState, useMemo } from 'react';
import { Permission } from '@/services/permissions.service';
import * as Icons from 'lucide-react';

interface ResourceAction {
    resource: string;
    actions: {
        [action: string]: Permission | null;
    };
    category?: string;
    icon?: string;
}

interface ResourceActionMatrixProps {
    permissions: Permission[];
    selectedPermissions: number[];
    onChange: (permissionIds: number[]) => void;
}

const STANDARD_ACTIONS = ['Create', 'View', 'Edit', 'Delete', 'Export'];

const RESOURCE_ICONS: { [key: string]: string } = {
    'User': 'Users',
    'Role': 'Shield',
    'Permission': 'Key',
    'Menu': 'LayoutGrid',
    'Resource': 'Package',
    'Audit': 'FileText',
    'Product': 'ShoppingCart',
    'Invoice': 'FileText',
    'Customer': 'UserCircle',
};

export function ResourceActionMatrix({ permissions, selectedPermissions, onChange }: ResourceActionMatrixProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));

    // Group permissions by resource
    const resourceMap = useMemo(() => {
        const map = new Map<string, ResourceAction>();

        permissions.forEach(perm => {
            // Extract resource and action from permission name (e.g., "User.Create" -> resource: "User", action: "Create")
            const parts = perm.name.split('.');
            if (parts.length !== 2) return;

            const [resource, action] = parts;

            if (!map.has(resource)) {
                map.set(resource, {
                    resource,
                    actions: {},
                    category: perm.groupName,
                    icon: RESOURCE_ICONS[resource] || 'Box',
                });
            }

            const resourceData = map.get(resource)!;
            resourceData.actions[action] = perm;
        });

        return map;
    }, [permissions]);

    // Group resources by category
    const categorizedResources = useMemo(() => {
        const categories = new Map<string, ResourceAction[]>();

        resourceMap.forEach((resource) => {
            const category = resource.category || 'Other';
            if (!categories.has(category)) {
                categories.set(category, []);
            }
            categories.get(category)!.push(resource);
        });

        // Sort resources within each category
        categories.forEach((resources) => {
            resources.sort((a, b) => a.resource.localeCompare(b.resource));
        });

        return categories;
    }, [resourceMap]);

    // Get all unique actions across all resources
    const allActions = useMemo(() => {
        const actionsSet = new Set<string>();
        resourceMap.forEach(resource => {
            Object.keys(resource.actions).forEach(action => actionsSet.add(action));
        });

        // Sort by standard actions first, then alphabetically
        return Array.from(actionsSet).sort((a, b) => {
            const aIndex = STANDARD_ACTIONS.indexOf(a);
            const bIndex = STANDARD_ACTIONS.indexOf(b);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a.localeCompare(b);
        });
    }, [resourceMap]);

    const isPermissionSelected = (permission: Permission | null) => {
        return permission ? selectedPermissions.includes(permission.id) : false;
    };

    const togglePermission = (permission: Permission | null) => {
        if (!permission) return;

        const isSelected = selectedPermissions.includes(permission.id);
        if (isSelected) {
            onChange(selectedPermissions.filter(id => id !== permission.id));
        } else {
            onChange([...selectedPermissions, permission.id]);
        }
    };

    const toggleResourceRow = (resource: ResourceAction) => {
        const resourcePermissions = Object.values(resource.actions)
            .filter((p): p is Permission => p !== null);
        const resourcePermissionIds = resourcePermissions.map(p => p.id);
        const allSelected = resourcePermissionIds.every(id => selectedPermissions.includes(id));

        if (allSelected) {
            // Deselect all
            onChange(selectedPermissions.filter(id => !resourcePermissionIds.includes(id)));
        } else {
            // Select all
            const newIds = new Set([...selectedPermissions, ...resourcePermissionIds]);
            onChange(Array.from(newIds));
        }
    };

    const toggleActionColumn = (action: string) => {
        const actionPermissions: Permission[] = [];
        resourceMap.forEach(resource => {
            const perm = resource.actions[action];
            if (perm) actionPermissions.push(perm);
        });

        const actionPermissionIds = actionPermissions.map(p => p.id);
        const allSelected = actionPermissionIds.every(id => selectedPermissions.includes(id));

        if (allSelected) {
            // Deselect all
            onChange(selectedPermissions.filter(id => !actionPermissionIds.includes(id)));
        } else {
            // Select all
            const newIds = new Set([...selectedPermissions, ...actionPermissionIds]);
            onChange(Array.from(newIds));
        }
    };

    const toggleCategory = (category: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    };

    const getActionIcon = (action: string) => {
        const iconMap: { [key: string]: JSX.Element } = {
            'Create': <Icons.PlusCircle className="w-4 h-4" />,
            'View': <Icons.Eye className="w-4 h-4" />,
            'Edit': <Icons.Edit className="w-4 h-4" />,
            'Delete': <Icons.Trash2 className="w-4 h-4" />,
            'Export': <Icons.Download className="w-4 h-4" />,
        };
        return iconMap[action] || <Icons.Circle className="w-4 h-4" />;
    };

    const getActionColor = (action: string) => {
        const colorMap: { [key: string]: string } = {
            'Create': 'text-green-600',
            'View': 'text-blue-600',
            'Edit': 'text-yellow-600',
            'Delete': 'text-red-600',
            'Export': 'text-purple-600',
        };
        return colorMap[action] || 'text-gray-600';
    };

    return (
        <div className="space-y-4">
            {/* Column Headers */}
            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `200px repeat(${allActions.length}, 100px)` }}>
                        <div className="font-semibold text-gray-700 px-4 py-2">Resource</div>
                        {allActions.map(action => (
                            <button
                                key={action}
                                onClick={() => toggleActionColumn(action)}
                                className="flex flex-col items-center justify-center px-2 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                                title={`Toggle all ${action} permissions`}
                            >
                                <span className={`${getActionColor(action)} group-hover:scale-110 transition-transform`}>
                                    {getActionIcon(action)}
                                </span>
                                <span className="text-xs font-medium text-gray-700 mt-1">{action}</span>
                            </button>
                        ))}
                    </div>

                    {/* Resources grouped by category */}
                    {Array.from(categorizedResources.entries()).map(([category, resources]) => {
                        const isExpanded = expandedCategories.has(category);

                        return (
                            <div key={category} className="mb-4">
                                {/* Category Header */}
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="w-full flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg mb-2 hover:from-gray-100 hover:to-gray-200 transition-colors"
                                >
                                    {isExpanded ? (
                                        <Icons.ChevronDown className="w-4 h-4 text-gray-600" />
                                    ) : (
                                        <Icons.ChevronRight className="w-4 h-4 text-gray-600" />
                                    )}
                                    <span className="font-semibold text-gray-800">{category}</span>
                                    <span className="text-xs text-gray-500">({resources.length} resources)</span>
                                </button>

                                {/* Resources in category */}
                                {isExpanded && (
                                    <div className="space-y-1">
                                        {resources.map(resource => {
                                            const IconComponent = (Icons as any)[resource.icon || 'Box'] || Icons.Box;
                                            const resourcePermissions = Object.values(resource.actions).filter((p): p is Permission => p !== null);
                                            const allSelected = resourcePermissions.length > 0 && resourcePermissions.every(p => selectedPermissions.includes(p.id));
                                            const someSelected = resourcePermissions.some(p => selectedPermissions.includes(p.id));

                                            return (
                                                <div
                                                    key={resource.resource}
                                                    className="grid gap-2 items-center group hover:bg-gray-50 rounded-lg transition-colors"
                                                    style={{ gridTemplateColumns: `200px repeat(${allActions.length}, 100px)` }}
                                                >
                                                    {/* Resource Name */}
                                                    <button
                                                        onClick={() => toggleResourceRow(resource)}
                                                        className="flex items-center gap-2 px-4 py-3 text-left"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={allSelected}
                                                            ref={input => {
                                                                if (input) {
                                                                    input.indeterminate = someSelected && !allSelected;
                                                                }
                                                            }}
                                                            onChange={() => { }}
                                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                                        />
                                                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                                                            <IconComponent className="w-4 h-4 text-white" />
                                                        </div>
                                                        <span className="font-medium text-gray-900">{resource.resource}</span>
                                                    </button>

                                                    {/* Action Checkboxes */}
                                                    {allActions.map(action => {
                                                        const permission = resource.actions[action];
                                                        const isChecked = isPermissionSelected(permission);

                                                        return (
                                                            <div key={action} className="flex items-center justify-center px-2 py-3">
                                                                {permission ? (
                                                                    <label className="flex items-center cursor-pointer group/checkbox">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            onChange={() => togglePermission(permission)}
                                                                            className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer transition-transform group-hover/checkbox:scale-110"
                                                                            title={permission.displayName}
                                                                        />
                                                                    </label>
                                                                ) : (
                                                                    <div className="w-5 h-5 border border-gray-200 rounded bg-gray-50" title="Not available" />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-lg text-sm">
                <span className="font-medium text-gray-700">Legend:</span>
                <div className="flex items-center gap-2">
                    <Icons.PlusCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">Create</span>
                </div>
                <div className="flex items-center gap-2">
                    <Icons.Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600">View</span>
                </div>
                <div className="flex items-center gap-2">
                    <Icons.Edit className="w-4 h-4 text-yellow-600" />
                    <span className="text-gray-600">Edit</span>
                </div>
                <div className="flex items-center gap-2">
                    <Icons.Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-gray-600">Delete</span>
                </div>
                <div className="flex items-center gap-2">
                    <Icons.Download className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-600">Export</span>
                </div>
            </div>
        </div>
    );
}
