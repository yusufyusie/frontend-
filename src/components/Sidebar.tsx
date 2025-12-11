'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { menuService, MenuItem } from '@/services/menu.service';
import * as Icons from 'lucide-react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarProps {
    isOpen?: boolean;
    isCollapsed?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen = true, isCollapsed = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set());

    useEffect(() => {
        loadMenus();

        // Auto-refresh menus every 5 seconds to catch changes
        const interval = setInterval(() => {
            loadMenus();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const loadMenus = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('[Sidebar] Fetching menus from API...');
            const menus = await menuService.getUserMenu();
            console.log('[Sidebar] Received menus:', menus);

            if (menus && menus.length > 0) {
                setMenuItems(menus);
                const parentIds = menus.filter(m => m.children && m.children.length > 0).map(m => m.id);
                setExpandedMenus(new Set(parentIds));
                console.log('[Sidebar] Menus loaded successfully:', menus.length, 'items');
            } else {
                console.warn('[Sidebar] No menus returned from API');
                setError('No menus available for your role');
            }
        } catch (error: any) {
            console.error('[Sidebar] Error loading menus:', error);
            setError(error.message || 'Failed to load menus');
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (iconName?: string) => {
        if (!iconName) return null;
        const Icon = (Icons as any)[iconName];
        return Icon ? <Icon className="w-5 h-5 flex-shrink-0" /> : null;
    };

    const toggleExpand = (menuId: number) => {
        const newExpanded = new Set(expandedMenus);
        if (newExpanded.has(menuId)) {
            newExpanded.delete(menuId);
        } else {
            newExpanded.add(menuId);
        }
        setExpandedMenus(newExpanded);
    };

    // Get all clickable menu items (flatten hierarchy for collapsed view)
    const getAllClickableItems = (items: MenuItem[]): MenuItem[] => {
        const result: MenuItem[] = [];
        const traverse = (item: MenuItem) => {
            if (item.path) {
                result.push(item);
            }
            if (item.children) {
                item.children.forEach(traverse);
            }
        };
        items.forEach(traverse);
        return result;
    };

    const renderCollapsedItem = (item: MenuItem) => {
        const isActive = pathname === item.path;

        return (
            <Link
                key={item.id}
                href={item.path || '#'}
                className={`flex items-center justify-center p-3 rounded-lg transition-all group relative ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }`}
                title={item.name}
            >
                {getIcon(item.icon)}
                {item.badge && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
            </Link>
        );
    };

    const renderMenuItem = (item: MenuItem, depth: number = 0): JSX.Element => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedMenus.has(item.id);
        const isActive = pathname === item.path;
        const hasActivePath = item.path && pathname.startsWith(item.path);

        // Parent menu without path
        if (hasChildren && !item.path) {
            return (
                <div key={item.id} className="mb-1">
                    <button
                        onClick={() => toggleExpand(item.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-gray-400 hover:bg-gray-800/50 hover:text-white group"
                        type="button"
                    >
                        <div className="flex-shrink-0 text-gray-500">{getIcon(item.icon)}</div>
                        <span className="flex-1 font-medium text-left text-xs uppercase tracking-wider">{item.name}</span>
                        {item.badge && (
                            <span className={`px-2 py-0.5 text-xs rounded flex-shrink-0 ${item.badgeColor === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                                item.badgeColor === 'green' ? 'bg-green-500/20 text-green-400' :
                                    item.badgeColor === 'red' ? 'bg-red-500/20 text-red-400' :
                                        'bg-gray-500/20 text-gray-400'
                                }`}>
                                {item.badge}
                            </span>
                        )}
                        <div className="flex-shrink-0">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                    </button>

                    {isExpanded && hasChildren && (
                        <div className="mt-1 ml-1 space-y-0.5">
                            {item.children!.map(child => renderMenuItem(child, depth + 1))}
                        </div>
                    )}
                </div>
            );
        }

        // Menu item with path - NO onClose callback to prevent auto-collapse
        return (
            <div key={item.id}>
                <Link
                    href={item.path || '#'}
                    target={item.isExternal ? '_blank' : undefined}
                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                        : hasActivePath
                            ? 'bg-gray-800/50 text-white'
                            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                        } ${depth > 0 ? 'ml-6' : ''}`}
                >
                    <div className="flex-shrink-0">{getIcon(item.icon)}</div>
                    <span className="flex-1 font-medium text-sm">{item.name}</span>
                    {item.badge && (
                        <span className={`px-2 py-0.5 text-xs rounded flex-shrink-0 ${isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                                item.badgeColor === 'green' ? 'bg-green-500/20 text-green-400' :
                                    item.badgeColor === 'red' ? 'bg-red-500/20 text-red-400' :
                                        'bg-gray-500/20 text-gray-400'
                            }`}>
                            {item.badge}
                        </span>
                    )}
                    {item.isExternal && <Icons.ExternalLink className="w-4 h-4 flex-shrink-0" />}
                </Link>
            </div>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && onClose && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={onClose} />
            )}

            {/* Sidebar */}
            <aside className={`fixed left-0 top-16 bottom-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white shadow-2xl border-r border-gray-800 z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'
                } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                <nav className="h-full p-4 overflow-y-auto custom-scrollbar pb-20">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4">
                            <Icons.AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                            <p className="text-sm text-red-400 text-center mb-4">{error}</p>
                            <button
                                onClick={loadMenus}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                <Icons.RefreshCw className="w-4 h-4 inline mr-2" />
                                Retry
                            </button>
                        </div>
                    ) : menuItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4">
                            <Icons.MenuIcon className="w-12 h-12 text-gray-600 mb-4" />
                            <p className="text-sm text-gray-400 text-center">No menus available</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {isCollapsed
                                ? getAllClickableItems(menuItems).map(renderCollapsedItem)
                                : menuItems.map(item => renderMenuItem(item))
                            }
                        </div>
                    )}
                </nav>

                {/* Footer */}
                {!isCollapsed && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                        <div className="text-xs text-gray-400 text-center">
                            <div className="font-semibold">Access Control v1.0</div>
                            <div>Dynamic RBAC</div>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
