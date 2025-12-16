import { api } from '@/lib/api';

export interface Resource {
    id: number;
    name: string;
    displayName: string;
    description?: string;
    category?: string;
    icon?: string;
    iconName?: string;
    actions: string[];
    isActive: boolean;
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        actions: number;
        permissions: number;
        menus: number;
    };
}

export interface CreateResourceData {
    name: string;
    displayName: string;
    description?: string;
    category?: string;
    iconName?: string;
    actions: string[];
    isActive: boolean;
}


export interface ResourceAction {
    id: number;
    resourceId: number;
    name: string;
    displayName: string;
    description?: string;
    isStandard: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CategoryDistribution {
    category: string;
    count: number;
    percentage: number;
}

export interface ResourceStats {
    totalResources: number;
    activeResources: number;
    inactiveResources: number;
    systemResources: number;
    totalActions: number;
    resourcesByCategory: CategoryDistribution[];
}

class ResourceService {
    async getAll(): Promise<Resource[]> {
        const response = await api.get('/resources');
        return response.data;
    }

    async getById(id: number): Promise<Resource> {
        const response = await api.get(`/resources/${id}`);
        return response.data;
    }

    async create(data: CreateResourceData): Promise<Resource> {
        const response = await api.post('/resources', data);
        return response.data;
    }

    async update(id: number, data: Partial<CreateResourceData>): Promise<Resource> {
        const response = await api.patch(`/resources/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await api.delete(`/resources/${id}`);
    }

    async getStats(): Promise<ResourceStats> {
        const response = await api.get('/resources/stats/overview');
        return response.data;
    }

    async bulkDelete(ids: number[]): Promise<{ message: string; deleted: number }> {
        const response = await api.post('/resources/bulk/delete', { ids });
        return response.data;
    }

    async bulkToggleStatus(ids: number[], isActive: boolean): Promise<{ message: string; updated: number }> {
        const response = await api.post('/resources/bulk/toggle-status', { ids, isActive });
        return response.data;
    }

    async getActions(resourceId: number): Promise<ResourceAction[]> {
        const response = await api.get(`/resources/${resourceId}/actions`);
        return response.data;
    }

    async createAction(resourceId: number, data: Partial<ResourceAction>): Promise<ResourceAction> {
        const response = await api.post(`/resources/${resourceId}/actions`, data);
        return response.data;
    }

    async deleteAction(actionId: number): Promise<void> {
        await api.delete(`/resources/actions/${actionId}`);
    }
}

export const resourceService = new ResourceService();
