'use client';

import { useState, useMemo, ReactNode } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit, Trash2, Search } from 'lucide-react';
import { Badge } from '@mantine/core';

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
    onExpand?: (node: TreeNode) => void;
    onEdit?: (node: TreeNode) => void;
    onDelete?: (node: TreeNode) => void;
    onAddChild?: (node: TreeNode) => void;
    searchable?: boolean;
    initialExpandLevel?: number;
}

export function AdvancedTreeGrid({
    data,
    onExpand,
    onEdit,
    onDelete,
    onAddChild,
    searchable = true,
    initialExpandLevel = 1
}: AdvancedTreeGridProps) {
    const [searchTerm, setSearchTerm] = useState('');
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

    // Filter tree based on search
    const filterTree = (nodes: TreeNode[]): TreeNode[] => {
        if (!searchTerm) return nodes;

        return nodes.reduce((acc, node) => {
            const matches = node.label.toLowerCase().includes(searchTerm.toLowerCase());
            const filteredChildren = node.children ? filterTree(node.children) : [];

            if (matches || filteredChildren.length > 0) {
                acc.push({
                    ...node,
                    children: filteredChildren.length > 0 ? filteredChildren : node.children
                });
                // Auto-expand nodes that match search
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
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    };

    const renderNode = (node: TreeNode, level: number = 0) => {
        const isExpanded = expandedIds.has(node.id);
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div key={node.id}>
                <div
                    className="group flex items-center gap-2 py-2.5 px-3 hover:bg-primary-50 rounded-lg transition-all border border-transparent hover:border-primary-100"
                    style={{ paddingLeft: `${level * 24 + 12}px` }}
                >
                    {/* Expand/Collapse Button */}
                    {hasChildren ? (
                        <button
                            onClick={() => toggleExpand(node.id)}
                            className="p-1 hover:bg-primary-100 rounded transition-all flex-shrink-0"
                        >
                            {isExpanded ? (
                                <ChevronDown size={16} className="text-primary" />
                            ) : (
                                <ChevronRight size={16} className="text-gray-400" />
                            )}
                        </button>
                    ) : (
                        <div className="w-6" /> // Spacer for alignment
                    )}

                    {/* Icon */}
                    {node.icon && (
                        <div className="flex-shrink-0 text-primary">
                            {node.icon}
                        </div>
                    )}

                    {/* Label */}
                    <span className="flex-1 font-semibold text-gray-900 text-sm">
                        {node.label}
                    </span>

                    {/* Badge */}
                    {node.badge && (
                        <Badge variant="light" color={node.badge.color} size="sm">
                            {node.badge.text}
                        </Badge>
                    )}

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onAddChild && hasChildren && (
                            <button
                                onClick={() => onAddChild(node)}
                                className="p-1.5 text-gray-400 hover:text-success hover:bg-success-50 rounded-lg transition-all"
                                title="Add Child"
                            >
                                <Plus size={14} />
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={() => onEdit(node)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Edit"
                            >
                                <Edit size={14} />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(node)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Render Children */}
                {hasChildren && isExpanded && (
                    <div className="border-l-2 border-gray-100 ml-4">
                        {node.children!.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            {searchable && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search hierarchy..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                    />
                </div>
            )}

            {/* Tree Structure */}
            <div className="space-y-1">
                {filteredData.length > 0 ? (
                    filteredData.map(node => renderNode(node))
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <Search size={48} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No items match your search</p>
                    </div>
                )}
            </div>
        </div>
    );
}
