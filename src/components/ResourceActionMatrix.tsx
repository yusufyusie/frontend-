'use client';

import React, { useState, useMemo } from 'react';
import {
    PlusCircle,
    Eye,
    Edit,
    Trash2,
    Download,
    Circle,
    ChevronDown,
    ChevronRight,
    Box,
    Users,
    Shield,
    Key,
    LayoutGrid,
    Package,
    FileText,
    ShoppingCart,
    UserCircle,
    Info,
    Check
} from 'lucide-react';
import { Permission } from '@/services/permissions.service';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * Descriptor for a resource-action intersection in the security matrix
 */
interface ResourceAction {
    resource: string;
    actions: {
        [action: string]: Permission | null;
    };
    category?: string;
    icon?: string;
}

/**
 * Props for the ResourceActionMatrix component
 */
interface ResourceActionMatrixProps {
    permissions: Permission[];
    selectedPermissions: number[];
    onChange: (permissionIds: number[]) => void;
}

const STANDARD_ACTIONS = ['Create', 'View', 'Edit', 'Delete', 'Export'];

/**
 * Icon mapping for technical resource identifiers
 */
const RESOURCE_ICONS: { [key: string]: React.ElementType } = {
    'User': Users,
    'Role': Shield,
    'Permission': Key,
    'Menu': LayoutGrid,
    'Resource': Package,
    'Audit': FileText,
    'Product': ShoppingCart,
    'Invoice': FileText,
    'Customer': UserCircle,
};

/**
 * Matrix visualization for intersectional security rules
 * Provides a low-latency interface for cross-tabulating resources and operational actions.
 */
export function ResourceActionMatrix({ permissions, selectedPermissions, onChange }: ResourceActionMatrixProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']));

    // Construct a multi-dimensional map of the security registry
    const resourceMap = useMemo(() => {
        const map = new Map<string, ResourceAction>();

        permissions.forEach(perm => {
            const parts = perm.name.split('.');
            if (parts.length !== 2) return;

            const [resource, action] = parts;

            if (!map.has(resource)) {
                map.set(resource, {
                    resource,
                    actions: {},
                    category: perm.groupName,
                    icon: resource,
                });
            }

            const resourceData = map.get(resource)!;
            resourceData.actions[action] = perm;
        });

        return map;
    }, [permissions]);

    // Derive logical taxonomy for categorized matrix rows
    const categorizedResources = useMemo(() => {
        const categories = new Map<string, ResourceAction[]>();

        resourceMap.forEach((resource) => {
            const category = resource.category || 'Operational Baseline';
            if (!categories.has(category)) {
                categories.set(category, []);
            }
            categories.get(category)!.push(resource);
        });

        categories.forEach((resources) => {
            resources.sort((a, b) => a.resource.localeCompare(b.resource));
        });

        return categories;
    }, [resourceMap]);

    // Aggregate unique actions for matrix column headers
    const allActions = useMemo(() => {
        const actionsSet = new Set<string>();
        resourceMap.forEach(resource => {
            Object.keys(resource.actions).forEach(action => actionsSet.add(action));
        });

        return Array.from(actionsSet).sort((a, b) => {
            const aIndex = STANDARD_ACTIONS.indexOf(a);
            const bIndex = STANDARD_ACTIONS.indexOf(b);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a.localeCompare(b);
        });
    }, [resourceMap]);

    /**
     * Logic for individual rule selection
     */
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

    /**
     * Bulk row selection for specific resources
     */
    const toggleResourceRow = (resource: ResourceAction) => {
        const resourcePermissions = Object.values(resource.actions)
            .filter((p): p is Permission => p !== null);
        const resourcePermissionIds = resourcePermissions.map(p => p.id);
        const allSelected = resourcePermissionIds.every(id => selectedPermissions.includes(id));

        if (allSelected) {
            onChange(selectedPermissions.filter(id => !resourcePermissionIds.includes(id)));
        } else {
            const newIds = new Set([...selectedPermissions, ...resourcePermissionIds]);
            onChange(Array.from(newIds));
        }
    };

    /**
     * Bulk column selection for specific operational intents
     */
    const toggleActionColumn = (action: string) => {
        const actionPermissions: Permission[] = [];
        resourceMap.forEach(resource => {
            const perm = resource.actions[action];
            if (perm) actionPermissions.push(perm);
        });

        const actionPermissionIds = actionPermissions.map(p => p.id);
        const allSelected = actionPermissionIds.every(id => selectedPermissions.includes(id));

        if (allSelected) {
            onChange(selectedPermissions.filter(id => !actionPermissionIds.includes(id)));
        } else {
            const newIds = new Set([...selectedPermissions, ...actionPermissionIds]);
            onChange(Array.from(newIds));
        }
    };

    /**
     * Manage categorization expansion states
     */
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
        const iconMap: { [key: string]: React.ReactNode } = {
            'Create': <PlusCircle className="w-3.5 h-3.5" />,
            'View': <Eye className="w-3.5 h-3.5" />,
            'Edit': <Edit className="w-3.5 h-3.5" />,
            'Delete': <Trash2 className="w-3.5 h-3.5" />,
            'Export': <Download className="w-3.5 h-3.5" />,
        };
        return iconMap[action] || <Circle className="w-3.5 h-3.5" />;
    };

    const getActionColor = (action: string) => {
        const colorMap: { [key: string]: string } = {
            'Create': 'text-emerald-500',
            'View': 'text-primary',
            'Edit': 'text-amber-500',
            'Delete': 'text-red-500',
            'Export': 'text-cyan-500',
        };
        return colorMap[action] || 'text-gray-400';
    };

    const getResourceIcon = (resourceName: string) => {
        const IconComp = RESOURCE_ICONS[resourceName] || Box;
        return <IconComp className="w-4 h-4 text-white" />;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Standard Data Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-3 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 w-[300px]">
                                <div className="flex items-center gap-2">
                                    <Info className="w-3.5 h-3.5" />
                                    Resources
                                </div>
                            </th>
                            {allActions.map(action => (
                                <th key={action} className="py-3 px-2 text-center w-[100px]">
                                    <button
                                        onClick={() => toggleActionColumn(action)}
                                        className="group inline-flex flex-col items-center gap-1.5 focus:outline-none"
                                        title={`Toggle all ${action}`}
                                    >
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${getActionColor(action)}`}>{action}</span>
                                        <div className={`p-1.5 rounded-lg bg-gray-100 group-hover:bg-white group-hover:shadow-md border border-gray-200/50 group-hover:border-gray-300 transition-all active:scale-95`}>
                                            {React.cloneElement(getActionIcon(action) as React.ReactElement<any>, { strokeWidth: 3 })}
                                        </div>
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {Array.from(categorizedResources.entries()).map(([category, resources]) => (
                            <React.Fragment key={category}>
                                {/* Category Header Row */}
                                <tr className="bg-gray-50/50">
                                    <td colSpan={allActions.length + 1} className="py-2 px-4">
                                        <button
                                            onClick={() => toggleCategory(category)}
                                            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-700 hover:text-primary transition-colors focus:outline-none"
                                        >
                                            {expandedCategories.has(category) ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                            {category}
                                            <span className="text-gray-400 text-[9px] ml-1">({resources.length})</span>
                                        </button>
                                    </td>
                                </tr>

                                {/* Resource Rows */}
                                {expandedCategories.has(category) && resources.map((resource) => {
                                    const resourcePermissions = Object.values(resource.actions).filter((p): p is Permission => p !== null);
                                    const allSelected = resourcePermissions.length > 0 && resourcePermissions.every(p => selectedPermissions.includes(p.id));
                                    const someSelected = resourcePermissions.some(p => selectedPermissions.includes(p.id));

                                    return (
                                        <tr key={resource.resource} className="group hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 border-r border-dashed border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        checked={allSelected}
                                                        indeterminate={someSelected && !allSelected}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            toggleResourceRow(resource);
                                                        }}
                                                        className="w-4 h-4 rounded border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                    />
                                                    <div className="flex items-center gap-2.5 text-gray-700 group-hover:text-gray-900 transition-colors">
                                                        <div className="p-1.5 bg-gray-100 rounded-md text-gray-500 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                                            {getResourceIcon(resource.resource)}
                                                        </div>
                                                        <span className="text-sm font-semibold tracking-tight">{resource.resource}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            {allActions.map(action => {
                                                const permission = resource.actions[action];
                                                const isChecked = isPermissionSelected(permission);

                                                return (
                                                    <td key={action} className="p-1 text-center">
                                                        {permission ? (
                                                            <div className="flex justify-center">
                                                                <Checkbox
                                                                    checked={isChecked}
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        togglePermission(permission);
                                                                    }}
                                                                    className="w-4 h-4 rounded border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                                    title={permission.displayName}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-center opacity-10">
                                                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend Overlay */}
            <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Legend:</span>
                {[
                    { label: 'Create', color: 'bg-emerald-500', icon: PlusCircle },
                    { label: 'View', color: 'bg-primary', icon: Eye },
                    { label: 'Edit', color: 'bg-amber-500', icon: Edit },
                    { label: 'Delete', color: 'bg-red-500', icon: Trash2 },
                    { label: 'Export', color: 'bg-cyan-500', icon: Download }
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
