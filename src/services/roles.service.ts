import { api } from '@/lib/api';

export interface Role {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    _count?: { userRoles: number; rolePermissions: number };
    permissions?: { id: number; name: string }[];
}

export interface CreateRoleData {
    name: string;
    description: string;
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

    async assignPermissions(roleId: number, permissionIds: number[]): Promise<void> {
        await api.post(`/roles/${roleId}/permissions`, { permissionIds });
    }
};
