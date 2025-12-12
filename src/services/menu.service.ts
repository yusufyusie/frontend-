import { api } from '@/lib/api';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
    private getAuthHeaders() {
        // Check both possible token keys
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        if (!token) {
            console.warn('No authentication token found');
        }
        return {
            headers: {
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        };
    }

    /**
     * Get menu for current user (permission-filtered)
     */
    async getUserMenu(): Promise<MenuItem[]> {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await axios.get(`${API_URL}/menu/user?_t=${timestamp}`, this.getAuthHeaders());
        return response.data;
    }

    /**
     * Get full menu tree (admin only)
     */
    async getMenuTree(): Promise<MenuItem[]> {
        const response = await axios.get(`${API_URL}/menu`, this.getAuthHeaders());
        return response.data;
    }

    /**
     * Get all menus in flat structure (admin only)
     */
    async getAllMenusFlat(): Promise<MenuItem[]> {
        const response = await axios.get(`${API_URL}/menu/flat`, this.getAuthHeaders());
        return response.data;
    }

    /**
     * Get menu for specific user
     */
    async getMenuForUser(userId: number): Promise<MenuItem[]> {
        const response = await axios.get(`${API_URL}/menu/user/${userId}`, this.getAuthHeaders());
        return response.data;
    }

    /**
     * Get menus assigned to a role
     */
    async getMenusByRole(roleId: number): Promise<MenuItem[]> {
        const response = await axios.get(`${API_URL}/menu/role/${roleId}`, this.getAuthHeaders());
        return response.data;
    }

    /**
     * Assign menus to a role
     */
    async assignMenusToRole(roleId: number, menuIds: number[]): Promise<void> {
        await axios.post(`${API_URL}/menu/role/${roleId}/assign`, { menuIds }, this.getAuthHeaders());
    }

    /**
     * Remove menu from role
     */
    async removeMenuFromRole(roleId: number, menuId: number): Promise<void> {
        await axios.delete(`${API_URL}/menu/role/${roleId}/menu/${menuId}`, this.getAuthHeaders());
    }

    /**
     * Get single menu item
     */
    async getMenuItem(id: number): Promise<MenuItem> {
        const response = await axios.get(`${API_URL}/menu/${id}`, this.getAuthHeaders());
        return response.data;
    }

    /**
     * Create menu item (admin only)
     */
    async createMenuItem(data: Partial<MenuItem>): Promise<MenuItem> {
        const response = await axios.post(`${API_URL}/menu`, data, this.getAuthHeaders());
        return response.data;
    }

    /**
     * Update menu item (admin only)
     */
    async updateMenuItem(id: number, data: Partial<MenuItem>): Promise<MenuItem> {
        const response = await axios.patch(`${API_URL}/menu/${id}`, data, this.getAuthHeaders());
        return response.data;
    }

    /**
     * Bulk update menu items (admin only)
     */
    async bulkUpdateMenuItems(updates: Array<{ id: number; data: Partial<MenuItem> }>): Promise<void> {
        await axios.patch(`${API_URL}/menu/bulk/update`, updates, this.getAuthHeaders());
    }

    /**
     * Delete menu item (admin only)
     */
    async deleteMenuItem(id: number): Promise<void> {
        await axios.delete(`${API_URL}/menu/${id}`, this.getAuthHeaders());
    }

    /**
     * Reorder menu items (admin only)
     */
    async reorderMenuItems(items: Array<{ id: number; order: number }>): Promise<void> {
        await axios.post(`${API_URL}/menu/reorder`, items, this.getAuthHeaders());
    }

    /**
     * Get menu statistics
     */
    async getStats(): Promise<MenuStats> {
        const response = await axios.get(`${API_URL}/menu/stats/overview`, this.getAuthHeaders());
        return response.data;
    }

    /**
     * Get available icon names
     */
    async getAvailableIcons(): Promise<string[]> {
        const response = await axios.get(`${API_URL}/menu/icons/list`, this.getAuthHeaders());
        return response.data;
    }

    /**
     * Bulk delete menu items
     */
    async bulkDelete(ids: number[]): Promise<{ message: string; deletedCount: number }> {
        const response = await axios.post(`${API_URL}/menu/bulk/delete`, { ids }, this.getAuthHeaders());
        return response.data;
    }

    /**
     * Bulk toggle menu status
     */
    async bulkToggleStatus(ids: number[], isActive: boolean): Promise<{ message: string; updatedCount: number }> {
        const response = await axios.post(`${API_URL}/menu/bulk/toggle-status`, { ids, isActive }, this.getAuthHeaders());
        return response.data;
    }

    /**
     * Export menus to JSON
     */
    async exportMenus(): Promise<any> {
        const response = await axios.get(`${API_URL}/menu/export/all`, this.getAuthHeaders());
        return response.data;
    }

    /**
     * Import menus from JSON
     */
    async importMenus(data: any): Promise<{ created: number; updated: number; skipped: number; errors: any[] }> {
        const response = await axios.post(`${API_URL}/menu/import/data`, data, this.getAuthHeaders());
        return response.data;
    }
}

export const menuService = new MenuService();
