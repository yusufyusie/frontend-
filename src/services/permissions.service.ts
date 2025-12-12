import { api } from '@/lib/api';

export interface Permission {
    id: number;
    name: string;
    displayName: string;
    groupName: string;
    description: string;
    createdAt: string;
    _count?: {
        rolePermissions: number;
    };
}

export interface CreatePermissionData {
    name: string;
    groupName: string;
    description: string;
}

export interface PermissionStats {
    totalPermissions: number;
    totalGroups: number;
    groupStats: GroupStats[];
    recentlyCreated: number;
    mostUsedPermissions: PermissionUsage[];
}

export interface GroupStats {
    groupName: string;
    count: number;
    percentage: number;
}

export interface PermissionUsage {
    id: number;
    name: string;
    groupName: string;
    usageCount: number;
}

export interface PermissionGroup {
    name: string;
    count: number;
}

export const permissionsService = {
    async getAll(): Promise<Permission[]> {
        const response = await api.get('/permissions');
        return response.data;
    },

    async getOne(id: number): Promise<Permission> {
        const response = await api.get(`/permissions/${id}`);
        return response.data;
    },

    async create(data: CreatePermissionData): Promise<Permission> {
        const response = await api.post('/permissions', data);
        return response.data;
    },

    async update(id: number, data: Partial<CreatePermissionData>): Promise<Permission> {
        const response = await api.patch(`/permissions/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/permissions/${id}`);
    },

    async getStats(): Promise<PermissionStats> {
        const response = await api.get('/permissions/stats/overview');
        return response.data;
    },

    async getGroups(): Promise<PermissionGroup[]> {
        const response = await api.get('/permissions/groups/list');
        return response.data;
    },

    async bulkDelete(ids: number[]): Promise<{ message: string; deletedCount: number }> {
        const response = await api.post('/permissions/bulk/delete', { ids });
        return response.data;
    },

    async bulkUpdateGroup(ids: number[], groupName: string): Promise<{ message: string; updatedCount: number }> {
        const response = await api.patch('/permissions/bulk/update-group', { ids, groupName });
        return response.data;
    },

    async exportPermissions(): Promise<any> {
        const response = await api.get('/permissions/export/all');
        return response.data;
    },

    async importPermissions(data: any): Promise<{ created: number; updated: number; skipped: number; errors: any[] }> {
        const response = await api.post('/permissions/import/data', data);
        return response.data;
    },
};
