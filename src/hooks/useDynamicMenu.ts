'use client';

import { useState, useEffect } from 'react';
import { menuService, MenuItem } from '@/services/menu.service';

interface UseDynamicMenuReturn {
    menu: MenuItem[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage dynamic menu for current user
 * Automatically filters menu based on user's permissions
 */
export function useDynamicMenu(): UseDynamicMenuReturn {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMenu = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await menuService.getUserMenu();
            setMenu(data);
        } catch (err: any) {
            console.error('Failed to load menu:', err);
            setError(err.message || 'Failed to load menu');
            setMenu([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    return {
        menu,
        loading,
        error,
        refetch: fetchMenu,
    };
}

/**
 * Hook to get full menu tree (admin only)
 */
export function useMenuTree(): UseDynamicMenuReturn {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMenu = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await menuService.getMenuTree();
            setMenu(data);
        } catch (err: any) {
            console.error('Failed to load menu tree:', err);
            setError(err.message || 'Failed to load menu tree');
            setMenu([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    return {
        menu,
        loading,
        error,
        refetch: fetchMenu,
    };
}
