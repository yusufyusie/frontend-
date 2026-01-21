'use client';

import { useState, useMemo, ReactNode } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit, Trash2, Search as SearchIcon } from 'lucide-react';
import { Badge, Text } from '@mantine/core';

export interface TreeNode {
    id: number;
    label: string;
    icon?: ReactNode;
    badge?: { text: string; color: string };
    children?: TreeNode[];
    meta?: Record<string, any>;
}

interface AdvancedTreeGridProps {
    data: TreeNode[];
    onEdit?: (node: TreeNode) => void;
    onDelete?: (node: TreeNode) => void;
    onAddChild?: (node: TreeNode) => void;
    searchable?: boolean;
    initialExpandLevel?: number;
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
}

export function AdvancedTreeGrid({
    data,
    onEdit,
    onDelete,
    onAddChild,
    searchable = true,
    initialExpandLevel = 1,
    searchTerm: externalSearchTerm,
    onSearchChange
}: AdvancedTreeGridProps) {
    const [internalSearchTerm, setInternalSearchTerm] = useState('');
    const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    // Auto-expand initial levels
    useMemo(() => {
        const autoExpand = (nodes: TreeNode[], level: number = 0) => {
            nodes.forEach(node => {
                if (level < initialExpandLevel) {
                    setExpandedIds(prev => new Set(prev).add(node.id));
                    if (node.children) {
                        autoExpand(node.children, level + 1);
                    }
                }
            });
        };
        autoExpand(data);
    }, [data, initialExpandLevel]);

    const filterTree = (nodes: TreeNode[]): TreeNode[] => {
        if (!searchTerm) return nodes;
        return nodes.reduce((acc, node) => {
            const matches = node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (node.meta?.occupantName?.toLowerCase().includes(searchTerm.toLowerCase()));
            const filteredChildren = node.children ? filterTree(node.children) : [];
            if (matches || filteredChildren.length > 0) {
                acc.push({
                    ...node,
                    children: filteredChildren.length > 0 ? filteredChildren : node.children
                });
                if (filteredChildren.length > 0) {
                    setExpandedIds(prev => new Set(prev).add(node.id));
                }
            }
            return acc;
        }, [] as TreeNode[]);
    };

    const filteredData = useMemo(() => filterTree(data), [data, searchTerm]);

    const toggleExpand = (nodeId: number) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) newSet.delete(nodeId);
            else newSet.add(nodeId);
            return newSet;
        });
    };

    const renderNode = (node: TreeNode, level: number = 0) => {
        const isExpanded = expandedIds.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const meta = node.meta || {};

        return (
            <div key={node.id} className="border-b border-gray-50 last:border-0">
                <div
                    className="group flex items-center hover:bg-gray-50/80 transition-all text-xs"
                >
                    {/* Name Column */}
                    <div className="flex items-center gap-2 py-3 px-4 w-[350px] flex-shrink-0" style={{ paddingLeft: `${level * 24 + 16}px` }}>
                        {hasChildren ? (
                            <button onClick={() => toggleExpand(node.id)} className="p-1 hover:bg-gray-200 rounded text-gray-400">
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                        ) : <div className="w-6" />}

                        <div className="text-primary/70">{node.icon}</div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-gray-800 truncate">{node.label}</span>
                            {(meta.usageType || meta.ownershipType) && (
                                <div className="flex gap-2 mt-0.5">
                                    {meta.usageType && (
                                        <Text size="10px" c="dimmed" fw={700} className="bg-gray-100 px-1.5 rounded uppercase tracking-tighter">
                                            {meta.usageType}
                                        </Text>
                                    )}
                                    {meta.ownershipType && (
                                        <Text size="10px" c="dimmed" fw={700} className="bg-blue-50 text-blue-600 px-1.5 rounded uppercase tracking-tighter">
                                            {meta.ownershipType}
                                        </Text>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Occupant Column */}
                    <div className="px-4 py-3 w-[200px] flex-shrink-0 border-l border-gray-50">
                        {meta.occupantName === 'v' ? (
                            <span className="text-gray-400 italic font-medium">v (Vacant)</span>
                        ) : (
                            <span className="font-semibold text-teal-700">{meta.occupantName || '-'}</span>
                        )}
                    </div>

                    {/* Actual Area Column */}
                    <div className="px-4 py-3 w-[150px] flex-shrink-0 border-l border-gray-50 text-right font-mono">
                        {meta.areaM2 ? Number(meta.areaM2).toLocaleString() : '-'} <span className="text-[10px] text-gray-400">m²</span>
                    </div>

                    {/* Contract Area Column */}
                    <div className="px-4 py-3 w-[150px] flex-shrink-0 border-l border-gray-50 text-right font-mono">
                        {meta.contractAreaM2 ? Number(meta.contractAreaM2).toLocaleString() : '0'} <span className="text-[10px] text-gray-400">m²</span>
                    </div>

                    {/* Variance Column */}
                    <div className="px-4 py-3 w-[150px] flex-shrink-0 border-l border-gray-50 text-right font-bold">
                        <span className={meta.areaVarianceM2 > 0 ? 'text-blue-600' : 'text-gray-900'}>
                            {meta.areaVarianceM2 ? Number(meta.areaVarianceM2).toLocaleString() : '0'}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-1">Δ</span>
                    </div>

                    {/* Status Column */}
                    <div className="px-4 py-3 w-[120px] flex-shrink-0 border-l border-gray-50">
                        {meta.occupancyStatus && (
                            <Badge variant="dot" color={meta.occupancyStatus === 'Occupied' ? 'teal' : 'gray'} size="sm">
                                {meta.occupancyStatus}
                            </Badge>
                        )}
                    </div>

                    {/* Actions Column */}
                    <div className="px-4 py-3 w-[150px] flex-shrink-0 flex justify-end gap-2 border-l border-gray-50 bg-gray-50/20">
                        {onAddChild && (
                            <button
                                onClick={() => onAddChild(node)}
                                className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-all border border-teal-100 shadow-sm active:scale-90"
                                title="Add Child"
                            >
                                <Plus size={16} strokeWidth={2.5} />
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={() => onEdit(node)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-blue-100 shadow-sm active:scale-90"
                                title="Edit"
                            >
                                <Edit size={16} strokeWidth={2.5} />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(node)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-rose-100 shadow-sm active:scale-90"
                                title="Delete"
                            >
                                <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div className="bg-gray-50/30">
                        {node.children!.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">

            {/* Scrollable Container */}
            <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[1270px]">
                    {/* Grid Header */}
                    <div className="flex bg-gray-100/50 border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500 py-3">
                        <div className="px-4 w-[350px] flex-shrink-0">Spatial Resource Hierarchy</div>
                        <div className="px-4 w-[200px] flex-shrink-0 border-l border-gray-200/50">Occupant Name</div>
                        <div className="px-4 w-[150px] flex-shrink-0 border-l border-gray-200/50 text-right">Actual Area</div>
                        <div className="px-4 w-[150px] flex-shrink-0 border-l border-gray-200/50 text-right">Contract Area</div>
                        <div className="px-4 w-[150px] flex-shrink-0 border-l border-gray-200/50 text-right">Variance Δ</div>
                        <div className="px-4 w-[120px] flex-shrink-0 border-l border-gray-200/50">Status</div>
                        <div className="px-4 w-[150px] flex-shrink-0 border-l border-gray-200/50 text-right text-teal-800 font-bold">Actions</div>
                    </div>

                    {/* Grid Body */}
                    <div>
                        {filteredData.length > 0 ? (
                            filteredData.map(node => renderNode(node))
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                <SearchIcon size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-bold">No results found</p>
                                <p className="text-[10px] mt-1">Try adjusting your search criteria</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
