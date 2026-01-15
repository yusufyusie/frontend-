import { api } from '../lib/api';

export interface SystemLookup {
    id: number;
    parentId?: number | null;
    lookupCategory: string;
    lookupCode: string;
    lookupValue: {
        en: string;
        am: string;
        [key: string]: string;
    };
    level: number;
    displayOrder: number;
    metadata: any;
    isSystem: boolean;
    isActive: boolean;
    children?: SystemLookup[];
}

class LookupsService {
    private baseUrl = '/lookups';

    async getAll(params?: any) {
        return api.get<SystemLookup[]>(this.baseUrl, { params });
    }

    async getByCategory(category: string) {
        return api.get<SystemLookup[]>(`${this.baseUrl}/category/${category}`);
    }

    async getTree(category: string) {
        return api.get<SystemLookup[]>(`${this.baseUrl}/tree/${category}`);
    }

    async getOne(id: number) {
        return api.get<SystemLookup>(`${this.baseUrl}/${id}`);
    }

    async create(data: Partial<SystemLookup>) {
        return api.post<SystemLookup>(this.baseUrl, data);
    }

    async update(id: number, data: Partial<SystemLookup>) {
        return api.patch<SystemLookup>(`${this.baseUrl}/${id}`, data);
    }

    async delete(id: number) {
        return api.delete(`${this.baseUrl}/${id}`);
    }
}

export const lookupsService = new LookupsService();
