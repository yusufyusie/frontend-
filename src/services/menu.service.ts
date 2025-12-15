import { api } from '@/lib/api';

export interface MenuItem {
    id: number;
    name: string;
    path?: string;
    icon?: string;
    order: number;
    isActive: boolean;
    level: number;
    parentId?: number;
    permissionId?: number;
    description?: string;
    badge?: string;
    badgeColor?: string;
    isExternal?: boolean;
    children?: MenuItem[];
    permission?: {
        id: number;
        name: string;
        groupName: string;
        description?: string;
    };
    parent?: {
        id: number;
        name: string;
    };
    _count?: {
        children: number;
    };
}

export interface MenuStats {
    totalMenus: number;
    activeMenus: number;
    inactiveMenus: number;
    rootMenus: number;
    maxHierarchyDepth: number;
    menusWithPermissions: number;
    menusWithBadges: number;
    menusByLevel: LevelDistribution[];
}

export interface LevelDistribution {
    level: number;
    count: number;
    percentage: number;
}

class MenuService {
    /**
     * Get menu for current user (permission-filtered)
     */
    async getUserMenu(): Promise<MenuItem[]> {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await api.get(`/menu/user?_t=${timestamp}`);
        return response.data;
    }

    /**
     * Get full menu tree (admin only)
     */
    async getMenuTree(): Promise<MenuItem[]> {
        const response = await api.get('/menu');
        return response.data;
    }

    /**
     * Get all menus in flat structure (admin only)
     */
    async getAllMenusFlat(): Promise<MenuItem[]> {
        const response = await api.get('/menu/flat');
        return response.data;
    }

    /**
     * Get menu for specific user
     */
    async getMenuForUser(userId: number): Promise<MenuItem[]> {
        const response = await api.get(`/menu/user/${userId}`);
        return response.data;
    }

    /**
     * Get menus assigned to a role
     */
    async getMenusByRole(roleId: number): Promise<MenuItem[]> {
        const response = await api.get(`/menu/role/${roleId}`);
        return response.data;
    }

    /**
     * Assign menus to a role
     */
    async assignMenusToRole(roleId: number, menuIds: number[]): Promise<void> {
        await api.post(`/menu/role/${roleId}/assign`, { menuIds });
    }

    /**
     * Remove menu from role
     */
    async removeMenuFromRole(roleId: number, menuId: number): Promise<void> {
        await api.delete(`/menu/role/${roleId}/menu/${menuId}`);
    }

    /**
     * Get single menu item
     */
    async getMenuItem(id: number): Promise<MenuItem> {
        const response = await api.get(`/menu/${id}`);
        return response.data;
    }

    /**
     * Create menu item (admin only)
     */
    async createMenuItem(data: Partial<MenuItem>): Promise<MenuItem> {
        const response = await api.post('/menu', data);
        return response.data;
    }

    /**
     * Update menu item (admin only)
     */
    async updateMenuItem(id: number, data: Partial<MenuItem>): Promise<MenuItem> {
        const response = await api.patch(`/menu/${id}`, data);
        return response.data;
    }

    /**
     * Bulk update menu items (admin only)
     */
    async bulkUpdateMenuItems(updates: Array<{ id: number; data: Partial<MenuItem> }>): Promise<void> {
        await api.patch('/menu/bulk/update', updates);
    }

    /**
     * Delete menu item (admin only)
     */
    async deleteMenuItem(id: number): Promise<void> {
        await api.delete(`/menu/${id}`);
    }

    /**
     * Reorder menu items (admin only)
     */
    async reorderMenuItems(items: Array<{ id: number; order: number }>): Promise<void> {
        await api.post('/menu/reorder', items);
    }

    /**
     * Get menu statistics
     */
    async getStats(): Promise<MenuStats> {
        const response = await api.get('/menu/stats/overview');
        return response.data;
    }

    /**
     * Get available icon names
     */
    async getAvailableIcons(): Promise<string[]> {
        const response = await api.get('/menu/icons/list');
        return response.data;
    }

    /**
     * Bulk delete menu items
     */
    async bulkDelete(ids: number[]): Promise<{ message: string; deletedCount: number }> {
        const response = await api.post('/menu/bulk/delete', { ids });
        return response.data;
    }

    /**
     * Bulk toggle menu status
     */
    async bulkToggleStatus(ids: number[], isActive: boolean): Promise<{ message: string; updatedCount: number }> {
        const response = await api.post('/menu/bulk/toggle-status', { ids, isActive });
        return response.data;
    }

    /**
     * Export menus to JSON
     */
    async exportMenus(): Promise<any> {
        const response = await api.get('/menu/export/all');
        return response.data;
    }

    /**
     * Import menus from JSON
     */
    async importMenus(data: any): Promise<{ created: number; updated: number; skipped: number; errors: any[] }> {
        const response = await api.post('/menu/import/data', data);
        return response.data;
    }
}

export const menuService = new MenuService();
