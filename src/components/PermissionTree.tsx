'use client';

import React, { useState, useMemo } from 'react';
import {
    ChevronRight,
    Check,
    X,
    Filter,
    Layers,
    ShieldCheck,
    CheckCircle2,
    RotateCcw
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * Registry Entry Descriptor
 */
interface Permission {
    id: number;
    name: string;
    groupName: string;
    description: string;
}

/**
 * Hierarchical Taxonomy Node
 */
interface PermissionGroup {
    name: string;
    permissions: Permission[];
    children?: PermissionGroup[];
}

/**
 * Props for the PermissionTree component
 */
interface PermissionTreeProps {
    permissions: Permission[];
    selectedIds: number[];
    onChange: (selectedIds: number[]) => void;
    searchTerm?: string;
}

/**
 * Hierarchical visualization and management of security registries
 * Provides a structured navigation tree for multi-level permission assignment.
 */
export function PermissionTree({ permissions, selectedIds, onChange, searchTerm = '' }: PermissionTreeProps) {
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // Generate logical taxonomy from raw flat registry
    const groupedPermissions = useMemo(() => {
        const filtered = searchTerm
            ? permissions.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.groupName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : permissions;

        const groups: Record<string, Permission[]> = {};
        filtered.forEach(perm => {
            const group = perm.groupName || 'Operational Baseline';
            if (!groups[group]) groups[group] = [];
            groups[group].push(perm);
        });

        return groups;
    }, [permissions, searchTerm]);

    /**
     * Manage hierarchical expansion states
     */
    const toggleGroup = (group: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(group)) {
            newExpanded.delete(group);
        } else {
            newExpanded.add(group);
        }
        setExpandedGroups(newExpanded);
    };

    /**
     * Perform global selection logic
     */
    const selectAll = () => {
        onChange(permissions.map(p => p.id));
    };

    /**
     * Purge staged selection
     */
    const clearAll = () => {
        onChange([]);
    };

    /**
     * Orchestrate individual registry entry selection
     */
    const togglePermission = (id: number) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(sid => sid !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    /**
     * Orchestrate bulk operational group selection logic
     */
    const toggleGroupPermissions = (groupPerms: Permission[]) => {
        const groupIds = groupPerms.map(p => p.id);
        const allSelected = groupIds.every(id => selectedIds.includes(id));

        if (allSelected) {
            onChange(selectedIds.filter(id => !groupIds.includes(id)));
        } else {
            const newIds = new Set([...selectedIds, ...groupIds]);
            onChange(Array.from(newIds));
        }
    };

    const totalSelected = selectedIds.length;
    const totalPermissions = permissions.length;

    return (
        <div className="space-y-6">
            {/* Contextual Action Surface */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 gap-4">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 ring-4 ring-primary/10">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div className="space-y-0.5 text-center sm:text-left">
                        <p className="text-2xl font-black text-gray-900 leading-none">
                            {totalSelected} <span className="text-gray-400 font-medium">/ {totalPermissions}</span>
                        </p>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Selected Permissions</p>
                    </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={selectAll}
                        className="flex-1 sm:flex-initial px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 hover:bg-primary hover:text-white rounded-xl transition-all duration-300 border border-gray-100 hover:border-primary flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Select All
                    </button>
                    <button
                        onClick={clearAll}
                        className="flex-1 sm:flex-initial px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-300 border border-gray-100 hover:border-red-200 flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                    </button>
                </div>
            </div>

            {/* Tree View */}
            <div className="space-y-3">
                {Object.entries(groupedPermissions).sort(([a], [b]) => a.localeCompare(b)).map(([group, perms]) => {
                    const isExpanded = expandedGroups.has(group) || searchTerm !== '';
                    const groupIds = perms.map(p => p.id);
                    const selectedInGroup = groupIds.filter(id => selectedIds.includes(id)).length;
                    const allSelected = selectedInGroup === groupIds.length;
                    const someSelected = selectedInGroup > 0 && selectedInGroup < groupIds.length;

                    return (
                        <div key={group} className="border border-gray-100 rounded-[1.5rem] overflow-hidden bg-white hover:border-primary/20 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5">
                            {/* Group Header */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50/50 hover:bg-gray-50 transition-all">
                                <button
                                    onClick={() => toggleGroup(group)}
                                    className="p-2 bg-white rounded-xl shadow-sm hover:bg-primary/5 hover:text-primary transition-all group"
                                >
                                    <ChevronRight
                                        className={`w-4 h-4 text-gray-400 transition-all duration-500 ${isExpanded ? 'rotate-90 text-primary' : 'group-hover:translate-x-0.5'}`}
                                    />
                                </button>

                                <div
                                    onClick={() => toggleGroupPermissions(perms)}
                                    className="flex items-center gap-4 flex-1 cursor-pointer"
                                >
                                    <Checkbox
                                        checked={allSelected}
                                        indeterminate={someSelected && !allSelected}
                                        onChange={() => toggleGroupPermissions(perms)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-5 h-5 rounded-lg border-2 border-gray-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-gray-900 tracking-tight">{group}</span>
                                            <div className="px-2 py-0.5 bg-white border border-gray-100 rounded-md">
                                                <span className={`text-[10px] font-black ${allSelected ? 'text-primary' : someSelected ? 'text-primary' : 'text-gray-400'}`}>
                                                    {selectedInGroup} <span className="opacity-40">OF</span> {groupIds.length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Permissions Grid */}
                            {isExpanded && (
                                <div className="p-3 pl-14 sm:pl-16 space-y-2 bg-white animate-in slide-in-from-top-2 duration-300">
                                    {perms.map(perm => {
                                        const isSelected = selectedIds.includes(perm.id);
                                        return (
                                            <div
                                                key={perm.id}
                                                onClick={() => togglePermission(perm.id)}
                                                className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer border relative overflow-hidden group ${isSelected
                                                    ? 'bg-primary/5 border-primary/10'
                                                    : 'bg-transparent border-transparent hover:bg-gray-50/80 hover:border-gray-100'
                                                    }`}
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => togglePermission(perm.id)}
                                                    className="w-5 h-5 rounded-lg border-2 border-gray-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                                <div className="flex-1 min-w-0 space-y-0.5">
                                                    <div className={`text-sm font-black tracking-tight transition-colors ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                                                        {perm.name}
                                                    </div>
                                                    <div className="text-[11px] font-medium text-gray-400 leading-relaxed block truncate max-w-md">
                                                        {perm.description}
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in duration-500">
                                                        <Check className="w-4 h-4 text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {Object.keys(groupedPermissions).length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm ring-8 ring-gray-50">
                        <Filter className="w-10 h-10 text-gray-200" />
                    </div>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No permissions found</p>
                </div>
            )}
        </div>
    );
}
