'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown, Check, Minus, Search } from 'lucide-react';
import * as Icons from 'lucide-react';

interface MenuTreeItem {
    id: number;
    name: string;
    path?: string;
    icon?: string;
    level: number;
    parentId?: number;
    children?: MenuTreeItem[];
}

interface MenuTreeSelectorProps {
    menus: MenuTreeItem[];
    selectedIds: number[];
    onChange: (selectedIds: number[]) => void;
    readonly?: boolean;
}

export function MenuTreeSelector({ menus, selectedIds, onChange, readonly = false }: MenuTreeSelectorProps) {
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    // Build tree structure
    const menuTree = useMemo(() => {
        const buildTree = (items: MenuTreeItem[], parentId: number | null = null): MenuTreeItem[] => {
            return items
                .filter(item => item.parentId === parentId)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.id),
                }))
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        };
        return buildTree(menus);
    }, [menus]);

    // Auto-expand all parent menus on mount
    useEffect(() => {
        const getAllParentIds = (items: MenuTreeItem[]): number[] => {
            return items.flatMap(item => {
                const ids: number[] = [];
                if (item.children && item.children.length > 0) {
                    ids.push(item.id);
                    ids.push(...getAllParentIds(item.children));
                }
                return ids;
            });
        };

        const parentIds = getAllParentIds(menuTree);
        setExpandedIds(new Set(parentIds));
    }, [menuTree]);

    // Filter tree by search query
    const filteredTree = useMemo(() => {
        if (!searchQuery) return menuTree;

        const filterTree = (items: MenuTreeItem[]): MenuTreeItem[] => {
            return items.reduce((acc: MenuTreeItem[], item) => {
                const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
                const filteredChildren = item.children ? filterTree(item.children) : [];

                if (matchesSearch || filteredChildren.length > 0) {
                    acc.push({
                        ...item,
                        children: filteredChildren,
                    });
                }

                return acc;
            }, []);
        };

        return filterTree(menuTree);
    }, [menuTree, searchQuery]);

    // Auto-expand when searching
    useEffect(() => {
        if (searchQuery) {
            const getAllDescendantIds = (items: MenuTreeItem[]): number[] => {
                return items.flatMap(item => [
                    item.id,
                    ...(item.children ? getAllDescendantIds(item.children) : []),
                ]);
            };
            setExpandedIds(new Set(getAllDescendantIds(filteredTree)));
        }
    }, [searchQuery, filteredTree]);

    const getIcon = (iconName?: string) => {
        if (!iconName) return null;
        const Icon = (Icons as any)[iconName];
        return Icon ? <Icon className="w-4 h-4" /> : null;
    };

    // Get checkbox state for a menu item
    const getCheckboxState = (item: MenuTreeItem): 'checked' | 'indeterminate' | 'unchecked' => {
        const getAllDescendantIds = (menu: MenuTreeItem): number[] => {
            const ids = [menu.id];
            if (menu.children) {
                menu.children.forEach(child => {
                    ids.push(...getAllDescendantIds(child));
                });
            }
            return ids;
        };

        const descendantIds = getAllDescendantIds(item);
        const selectedCount = descendantIds.filter(id => selectedIds.includes(id)).length;

        if (selectedCount === 0) return 'unchecked';
        if (selectedCount === descendantIds.length) return 'checked';
        return 'indeterminate';
    };

    // Toggle menu selection
    const toggleMenu = (item: MenuTreeItem) => {
        if (readonly) return;

        const getAllDescendantIds = (menu: MenuTreeItem): number[] => {
            const ids = [menu.id];
            if (menu.children) {
                menu.children.forEach(child => {
                    ids.push(...getAllDescendantIds(child));
                });
            }
            return ids;
        };

        const descendantIds = getAllDescendantIds(item);
        const checkboxState = getCheckboxState(item);

        let newSelectedIds: number[];

        if (checkboxState === 'checked') {
            // Uncheck all descendants
            newSelectedIds = selectedIds.filter(id => !descendantIds.includes(id));
        } else {
            // Check all descendants
            newSelectedIds = Array.from(new Set([...selectedIds, ...descendantIds]));
        }

        onChange(newSelectedIds);
    };

    // Toggle expand/collapse
    const toggleExpand = (id: number) => {
        const newExpandedIds = new Set(expandedIds);
        if (newExpandedIds.has(id)) {
            newExpandedIds.delete(id);
        } else {
            newExpandedIds.add(id);
        }
        setExpandedIds(newExpandedIds);
    };

    // Select all / Deselect all
    const selectAll = () => {
        const allIds = menus.map(m => m.id);
        onChange(allIds);
    };

    const deselectAll = () => {
        onChange([]);
    };

    // Render tree node
    const renderTreeNode = (item: MenuTreeItem, depth: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedIds.has(item.id);
        const checkboxState = getCheckboxState(item);

        return (
            <div key={item.id}>
                <div
                    className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'
                        }`}
                    style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
                >
                    {/* Expand/Collapse Icon */}
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {hasChildren ? (
                            <button
                                onClick={() => toggleExpand(item.id)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                                type="button"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </button>
                        ) : (
                            <div className="w-4 h-4" />
                        )}
                    </div>

                    {/* Checkbox */}
                    <button
                        onClick={() => toggleMenu(item)}
                        disabled={readonly}
                        className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all flex-shrink-0 ${checkboxState === 'checked'
                            ? 'bg-blue-600 border-blue-600'
                            : checkboxState === 'indeterminate'
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-300 hover:border-blue-500'
                            } ${readonly ? 'opacity-60 cursor-not-allowed' : ''}`}
                        type="button"
                    >
                        {checkboxState === 'checked' && (
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        )}
                        {checkboxState === 'indeterminate' && (
                            <Minus className="w-3 h-3 text-white" strokeWidth={3} />
                        )}
                    </button>

                    {/* Icon */}
                    {item.icon && (
                        <div className="text-gray-600 flex-shrink-0">
                            {getIcon(item.icon)}
                        </div>
                    )}

                    {/* Name */}
                    <div className="flex-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        {item.path && (
                            <span className="text-xs text-gray-500">({item.path})</span>
                        )}
                    </div>

                    {/* Level Badge */}
                    <div className="flex-shrink-0">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            L{item.level}
                        </span>
                    </div>
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div className="border-l-2 border-gray-200 ml-4">
                        {item.children!.map(child => renderTreeNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Search and Bulk Actions */}
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search menus..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>
                {!readonly && (
                    <div className="flex gap-2">
                        <button
                            onClick={selectAll}
                            className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            type="button"
                        >
                            Select All
                        </button>
                        <button
                            onClick={deselectAll}
                            className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            type="button"
                        >
                            Deselect All
                        </button>
                    </div>
                )}
            </div>

            {/* Tree */}
            <div className="border border-gray-200 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                {filteredTree.length > 0 ? (
                    <div className="space-y-1">
                        {filteredTree.map(item => renderTreeNode(item))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        {searchQuery ? 'No menus found matching your search' : 'No menus available'}
                    </div>
                )}
            </div>

            {/* Selection Summary */}
            <div className="text-sm text-gray-600">
                <span className="font-medium">{selectedIds.length}</span> of{' '}
                <span className="font-medium">{menus.length}</span> menus selected
            </div>
        </div>
    );
}
