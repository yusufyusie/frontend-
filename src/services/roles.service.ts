import { api } from '@/lib/api';

export interface Role {
    id: number;
    name: string;
    description: string;
    isSystem: boolean;
    parentId: number | null;
    parent?: { id: number; name: string } | null;
    children?: { id: number; name: string }[];
    permissions?: Permission[];
    createdAt: string;
    updatedAt: string;
    _count?: {
        userRoles: number;
        rolePermissions: number;
    };
}

export interface Permission {
    id: number;
    name: string;
}

export interface CreateRoleData {
    name: string;
    description: string;
    parentId?: number;
}

export interface RoleStats {
    totalRoles: number;
    totalUsers: number;
    systemRoles: number;
    customRoles: number;
    averagePermissions: number;
    hierarchyDepth: number;
    mostUsedRoles: RoleUsage[];
    roleDistribution: RoleDistribution[];
}

export interface RoleUsage {
    id: number;
    name: string;
    description: string;
    userCount: number;
    permissionCount: number;
}

export interface RoleDistribution {
    name: string;
    userCount: number;
    percentage: number;
}

export const rolesService = {
    async getAll(): Promise<Role[]> {
        const response = await api.get('/roles');
        return response.data;
    },

    async getOne(id: number): Promise<Role> {
        const response = await api.get(`/roles/${id}`);
        return response.data;
    },

    async create(data: CreateRoleData): Promise<Role> {
        const response = await api.post('/roles', data);
        return response.data;
    },

    async update(id: number, data: Partial<CreateRoleData>): Promise<Role> {
        const response = await api.patch(`/roles/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/roles/${id}`);
    },

    async assignPermissions(roleId: number, permissionIds: number[]): Promise<Role> {
        const response = await api.post(`/roles/${roleId}/permissions`, { permissionIds });
        return response.data;
    },

    async getStats(): Promise<RoleStats> {
        const response = await api.get('/roles/stats/overview');
        return response.data;
    },

    async bulkDelete(ids: number[]): Promise<{ message: string; deletedCount: number }> {
        const response = await api.post('/roles/bulk/delete', { ids });
        return response.data;
    },

    async bulkAssignPermissions(roleIds: number[], permissionIds: number[]): Promise<{ message: string; updatedCount: number }> {
        const response = await api.post('/roles/bulk/assign-permissions', { roleIds, permissionIds });
        return response.data;
    },

    async exportRoles(): Promise<any> {
        const response = await api.get('/roles/export/all');
        return response.data;
    },

    async importRoles(data: any): Promise<{ created: number; updated: number; skipped: number; errors: any[] }> {
        const response = await api.post('/roles/import/data', data);
        return response.data;
    },
};
