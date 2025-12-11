import { api } from '@/lib/api';

export interface User {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    roles?: {
        id: number;
        name: string;
        description?: string;
        permissions?: {
            id: number;
            name: string;
            description?: string;
            groupName?: string;
        }[];
    }[];
    claims?: { id: number; claimType: string; claimValue: string }[];
}

export interface CreateUserData {
    username: string;
    email: string;
    password: string;
}

export interface UpdateUserData {
    username?: string;
    email?: string;
    isActive?: boolean;
}

export const usersService = {
    async getAll(): Promise<User[]> {
        const response = await api.get('/users');
        return response.data;
    },

    async getOne(id: number): Promise<User> {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    async create(data: CreateUserData): Promise<User> {
        const response = await api.post('/users', data);
        return response.data;
    },

    async update(id: number, data: UpdateUserData): Promise<User> {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/users/${id}`);
    },

    async assignRoles(userId: number, roleIds: number[]): Promise<void> {
        await api.post(`/users/${userId}/roles`, { roleIds });
    },

    async addClaim(userId: number, claimType: string, claimValue: string): Promise<void> {
        await api.post(`/users/${userId}/claims`, { claimType, claimValue });
    },

    async removeClaim(userId: number, claimId: number): Promise<void> {
        await api.delete(`/users/${userId}/claims/${claimId}`);
    }
};
