import { api } from '@/lib/api';

export interface Permission {
    id: number;
    name: string;
    groupName: string;
    description: string;
    createdAt: string;
}

export interface CreatePermissionData {
    name: string;
    groupName: string;
    description: string;
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
    }
};
