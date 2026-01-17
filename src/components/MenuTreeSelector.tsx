'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Check, Minus, Search, Filter, X } from 'lucide-react';
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
                    className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200 group relative
                        ${readonly ? 'cursor-default' : 'cursor-pointer hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-transparent hover:border-primary-100'}
                        ${depth === 0 ? 'bg-white mb-1.5 border border-gray-100 shadow-sm hover:shadow-md' : 'hover:pl-5'}
                    `}
                    style={{ paddingLeft: `${depth > 0 ? depth * 24 + 16 : 16}px` }}
                >
                    {/* Decorative Gradient Line for depth > 0 */}
                    {depth > 0 && (
                        <div
                            className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-primary-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ left: `${(depth * 24)}px` }}
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
                                className={`text-gray-400 hover:text-primary-600 transition-all duration-200 p-1 rounded-md hover:bg-primary-100
                                    ${isExpanded ? 'rotate-90 text-primary-600 bg-primary-50' : ''}
                                `}
                                type="button"
                            >
                                <ChevronRight className="w-3.5 h-3.5 transition-transform" />
                            </button>
                        ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />
                        )}
                    </div>

                    {/* Checkbox */}
                    <button
                        onClick={() => toggleMenu(item)}
                        disabled={readonly}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 flex-shrink-0 relative z-10 border-2
                            ${checkboxState === 'checked'
                                ? 'bg-gradient-to-br from-primary-600 to-primary-700 border-primary-600 text-white shadow-md shadow-primary-500/30 scale-110'
                                : checkboxState === 'indeterminate'
                                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-500 text-white shadow-md shadow-primary-500/20'
                                    : 'border-gray-300 hover:border-primary-500 bg-white hover:bg-primary-50'
                            } ${readonly ? 'opacity-60 cursor-not-allowed' : 'hover:scale-110'}`}
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
                            <div className={`p-2 rounded-lg flex-shrink-0 transition-all duration-200 ${depth === 0
                                    ? 'bg-gradient-to-br from-primary-100 to-primary-50 text-primary-700 shadow-sm group-hover:shadow-md group-hover:scale-110'
                                    : 'bg-gray-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-600'
                                }`}>
                                {getIcon(item.icon)}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0">
                            <span className={`text-sm font-semibold truncate ${depth === 0 ? 'text-gray-900' : 'text-gray-700'
                                } ${checkboxState === 'checked' ? 'text-primary-700' : ''}`}>
                                {item.name}
                            </span>
                            {item.path && (
                                <span className="text-[10px] text-gray-400 font-mono truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.path}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Level Badge */}
                    {depth > 0 && (
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="px-2 py-0.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 text-[10px] font-bold rounded-full border border-gray-200">
                                L{item.level}
                            </span>
                        </div>
                    )}
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div className="relative mt-1">
                        {item.children!.map(child => renderTreeNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4 p-4">
            {/* Modern Search and Bulk Actions Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-primary-600 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search menus by name..."
                        className="w-full pl-11 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-medium placeholder:text-gray-400 transition-all duration-200 bg-white hover:border-gray-300"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    {searchQuery && (
                        <div className="absolute -bottom-6 left-0 text-xs text-primary-600 font-medium">
                            Found {filteredTree.length} {filteredTree.length === 1 ? 'menu' : 'menus'}
                        </div>
                    )}
                </div>
                {!readonly && (
                    <div className="flex gap-2">
                        <button
                            onClick={selectAll}
                            className="px-4 py-2.5 text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all duration-200 border border-primary-200 hover:border-primary-300 active:scale-95"
                            type="button"
                        >
                            Select All
                        </button>
                        <button
                            onClick={deselectAll}
                            className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 active:scale-95"
                            type="button"
                        >
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {/* Tree - NO max-height or overflow, parent Modal handles scrolling */}
            <div className="mt-6">
                {filteredTree.length > 0 ? (
                    <div className="space-y-1">
                        {filteredTree.map(item => renderTreeNode(item))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                            <Filter className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                            {searchQuery ? 'No menus found' : 'No menus available'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {searchQuery ? 'Try adjusting your search terms' : 'There are no menus to display'}
                        </p>
                    </div>
                )}
            </div>

            {/* Selection Summary - Floating Badge */}
            <div className="sticky bottom-0 left-0 right-0 mt-4 pt-4 border-t border-gray-200 bg-gradient-to-t from-white via-white to-transparent">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        <span className="font-bold text-primary-700 text-lg">{selectedIds.length}</span>
                        <span className="text-gray-500 mx-1">/</span>
                        <span className="font-semibold text-gray-700">{menus.length}</span>
                        <span className="ml-1.5">menus selected</span>
                    </div>
                    <div className="px-3 py-1.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-bold rounded-full shadow-md shadow-primary-500/30">
                        {Math.round((selectedIds.length / Math.max(menus.length, 1)) * 100)}%
                    </div>
                </div>
            </div>
        </div>
    );
}
