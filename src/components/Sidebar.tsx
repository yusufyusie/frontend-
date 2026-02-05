'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { menuService, MenuItem } from '@/services/menu.service';
import { useAccessStore } from '@/store/access.store';
import * as Icons from 'lucide-react';
import { ChevronDown, ChevronRight, Menu as MenuIcon, ExternalLink } from 'lucide-react';

interface SidebarProps {
    isOpen?: boolean;
    isCollapsed?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen = true, isCollapsed = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useAccessStore();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set());
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        loadMenus();

        // Listen for menu assignment changes
        const handleMenuUpdate = () => {

            loadMenus();
        };

        window.addEventListener('menuAssignmentChanged', handleMenuUpdate);

        return () => {
            window.removeEventListener('menuAssignmentChanged', handleMenuUpdate);
        };
    }, []);

    const loadMenus = async () => {
        try {
            setLoading(true);
            setError(null);


            const menus = await menuService.getUserMenu();


            if (menus && menus.length > 0) {
                setMenuItems(menus);
                // Removed auto-expansion of menus

            } else {

                setMenuItems([]);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load menus');
            setMenuItems([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleMenu = (menuId: number) => {
        const newExpanded = new Set(expandedMenus);
        if (newExpanded.has(menuId)) {
            newExpanded.delete(menuId);
        } else {
            newExpanded.add(menuId);
        }
        setExpandedMenus(newExpanded);
    };

    const isActive = (path: string | null): boolean => {
        if (!path) return false;
        // Exact match for dashboard and other pages to prevent always active
        if (path === '/admin' || path === '/admin/') {
            return pathname === '/admin' || pathname === '/admin/';
        }
        return pathname === path;
    };

    const hasActiveChild = (item: MenuItem): boolean => {
        if (item.children && item.children.length > 0) {
            return item.children.some(child =>
                isActive(child.path ?? null) || hasActiveChild(child)
            );
        }
        return false;
    };

    const renderMenuItem = (item: MenuItem, depth: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedMenus.has(item.id);
        const isActiveItem = isActive(item.path ?? null);
        const hasActivePath = hasActiveChild(item);
        const Icon = item.icon ? (Icons as any)[item.icon] : null;

        // Check if sidebar is effectively expanded (either not collapsed or hovered)
        const isEffectivelyExpanded = !isCollapsed || isHovered;

        // Parent item with children
        if (hasChildren) {
            return (
                <div
                    key={item.id}
                    className={depth > 0 ? 'ml-4' : 'mb-1'}
                >
                    <button
                        onClick={() => toggleMenu(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${hasActivePath
                            ? 'bg-accent/10 text-white shadow-sm'
                            : 'text-white/80 hover:bg-accent/20 hover:text-white'
                            }`}
                        aria-expanded={isExpanded}
                        aria-label={`${item.name} menu`}
                    >
                        {Icon && <Icon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />}
                        {isEffectivelyExpanded && (
                            <>
                                <span className="flex-1 text-left font-medium truncate text-sm">{item.name}</span>
                                {item.badge && (
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex-shrink-0 ${item.badgeColor === 'red' ? 'bg-error' :
                                        item.badgeColor === 'green' ? 'bg-success' :
                                            item.badgeColor === 'blue' ? 'bg-info' :
                                                'bg-accent'
                                        } text-white shadow-sm`} aria-label={item.badge}>
                                        {item.badge}
                                    </span>
                                )}
                                <ChevronDown
                                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                    aria-hidden="true"
                                />
                            </>
                        )}
                    </button>

                    {/* Submenu with smooth animation */}
                    {isEffectivelyExpanded && (
                        <div
                            className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
                            role="menu"
                        >
                            <div className="space-y-1 pl-4 border-l-2 border-accent/20 ml-6">
                                {item.children?.map(child => renderMenuItem(child, depth + 1))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Regular menu item
        return (
            <Link
                key={item.id}
                href={item.path || '#'}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative mb-1 ${isActiveItem
                    ? 'bg-secondary text-white shadow-xl shadow-secondary/40 scale-[1.02] ring-2 ring-accent/30'
                    : hasActivePath
                        ? 'bg-accent/10 text-white'
                        : 'text-white/80 hover:bg-accent/20 hover:text-white hover:translate-x-1'
                    } ${depth > 0 ? 'ml-4' : ''} ${isCollapsed && !isHovered ? 'justify-center' : ''}`}
                aria-current={isActiveItem ? 'page' : undefined}
                role="menuitem"
                title={!isEffectivelyExpanded ? item.name : undefined}
            >
                {/* Active indicator */}
                {isActiveItem && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-accent rounded-r-full shadow-lg shadow-accent/50" aria-hidden="true" />
                )}

                {Icon ? (
                    <Icon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                ) : (
                    <MenuIcon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                )}

                {isEffectivelyExpanded && (
                    <>
                        <span className="flex-1 font-medium truncate text-sm">{item.name}</span>

                        {item.badge && (
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex-shrink-0 ${item.badgeColor === 'red' ? 'bg-error' :
                                item.badgeColor === 'green' ? 'bg-success' :
                                    item.badgeColor === 'blue' ? 'bg-info' :
                                        'bg-accent'
                                } text-white shadow-sm`} aria-label={item.badge}>
                                {item.badge}
                            </span>
                        )}

                        {item.isExternal && (
                            <ExternalLink className="w-4 h-4 opacity-50" aria-label="Opens in new tab" />
                        )}
                    </>
                )}
            </Link>
        );

        // Regular menu item
        return null; // Handled by the simplified logic above
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && onClose && (
                <button
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                    aria-label="Close sidebar"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-16 bottom-0 bg-primary text-white shadow-2xl border-r border-primary-700 z-40 transition-all duration-300 overflow-x-hidden ${isCollapsed && !isHovered ? 'w-20' : 'w-72'
                    } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                onMouseEnter={() => isCollapsed && setIsHovered(true)}
                onMouseLeave={() => isCollapsed && setIsHovered(false)}
                role="navigation"
                aria-label="Main navigation"
            >
                <nav className={`h-full px-3 pt-3 pb-24 overflow-y-auto overflow-x-hidden scrollbar-custom ${isCollapsed && !isHovered ? 'scrollbar-none' : ''}`} role="menu">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3" role="status">
                            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                            <span className="text-sm text-white/60">Loading menu...</span>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-center" role="alert">
                            <p className="text-sm text-error">{error}</p>
                        </div>
                    ) : menuItems.length === 0 ? (
                        <div className="p-4 text-center text-white/60 text-sm">
                            No menu items available
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {menuItems.map(item => renderMenuItem(item, 0))}
                        </div>
                    )}
                </nav>

                {/* Compact Footer - Branding Only */}
                {(!isCollapsed || isHovered) && (
                    <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-primary-700 bg-primary-700/50 backdrop-blur-sm">
                        <div className="text-center">
                            <div className="text-xs font-semibold text-accent mb-0.5">Ethiopian IT Park</div>
                            <div className="text-[10px] text-white/40">Tenant Management System</div>
                        </div>
                    </div>
                )}

                {/* Collapsed footer - Just a dot indicator */}
                {isCollapsed && !isHovered && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                        <div className="w-2 h-2 rounded-full bg-accent shadow-lg shadow-accent/50" aria-hidden="true" />
                    </div>
                )}
            </aside>
        </>
    );
}

export default Sidebar;
