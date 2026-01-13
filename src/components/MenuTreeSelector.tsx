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
            <div key={item.id} className="relative">
                <div
                    className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 group relative
                        ${readonly ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50/80 hover:shadow-sm'}
                        ${depth === 0 ? 'bg-white mb-1' : ''}
                    `}
                    style={{ paddingLeft: `${depth > 0 ? depth * 24 + 12 : 12}px` }}
                >
                    {/* Vertical Guide Line */}
                    {depth > 0 && (
                        <div
                            className="absolute left-0 top-0 bottom-0 border-l border-gray-100"
                            style={{ left: `${(depth * 24) - 8}px` }}
                        />
                    )}

                    {/* Expand/Collapse Button */}
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 relative z-10">
                        {hasChildren ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(item.id);
                                }}
                                className={`text-gray-400 hover:text-primary-600 transition-colors p-0.5 rounded-md hover:bg-primary-50
                                    ${isExpanded ? 'transform rotate-90 text-primary-500' : ''}
                                `}
                                type="button"
                            >
                                <ChevronRight className="w-4 h-4 transition-transform" />
                            </button>
                        ) : (
                            <div className="w-1 h-1 rounded-full bg-gray-200" />
                        )}
                    </div>

                    {/* Checkbox */}
                    <button
                        onClick={() => toggleMenu(item)}
                        disabled={readonly}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 flex-shrink-0 relative z-10 shadow-sm
                            ${checkboxState === 'checked'
                                ? 'bg-primary-600 border-primary-600 text-white shadow-primary/20'
                                : checkboxState === 'indeterminate'
                                    ? 'bg-primary-600 border-primary-600 text-white'
                                    : 'border-2 border-gray-300 hover:border-primary-500 bg-white'
                            } ${readonly ? 'opacity-60 cursor-not-allowed' : ''}`}
                        type="button"
                    >
                        {checkboxState === 'checked' && (
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        )}
                        {checkboxState === 'indeterminate' && (
                            <Minus className="w-3.5 h-3.5" strokeWidth={3} />
                        )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                        {item.icon && (
                            <div className={`p-1.5 rounded-md flex-shrink-0 ${depth === 0 ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-500'}`}>
                                {getIcon(item.icon)}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0">
                            <span className={`text-sm font-medium truncate ${depth === 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                {item.name}
                            </span>
                            {item.path && (
                                <span className="text-[10px] text-gray-400 font-mono truncate hidden group-hover:block transition-all">
                                    {item.path}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Level Badge - Only show for deeper levels or specific cases */}
                    {depth > 0 && (
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase tracking-wider">
                                L{item.level}
                            </span>
                        </div>
                    )}
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div className="relative">
                        {item.children!.map(child => renderTreeNode(child, depth + 1))}
                    </div>
                )}
            </div >
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
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                </div>
                {!readonly && (
                    <div className="flex gap-2">
                        <button
                            onClick={selectAll}
                            className="px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
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
