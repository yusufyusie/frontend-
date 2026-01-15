import { api } from '../lib/api';

export enum LandResourceType {
    ZONE = 'ZONE',
    BLOCK = 'BLOCK',
    PLOT = 'PLOT',
}

export interface LandResource {
    id: number;
    parentId?: number | null;
    type: LandResourceType;
    code: string;
    nameEn: string;
    nameAm: string;
    areaM2?: number;
    metadata: any;
    children?: LandResource[];
    _count?: {
        children: number;
        buildings: number;
    };
}

class LandResourcesService {
    private baseUrl = '/land-resources';

    async getAll(params?: any) {
        return api.get<LandResource[]>(this.baseUrl, { params });
    }

    async getTree() {
        return api.get<LandResource[]>(`${this.baseUrl}/tree`);
    }

    async getOne(id: number) {
        return api.get<LandResource>(`${this.baseUrl}/${id}`);
    }

    async create(data: Partial<LandResource>) {
        return api.post<LandResource>(this.baseUrl, data);
    }

    async update(id: number, data: Partial<LandResource>) {
        return api.patch<LandResource>(`${this.baseUrl}/${id}`, data);
    }

    async delete(id: number) {
        return api.delete(`${this.baseUrl}/${id}`);
    }
}

export const landResourcesService = new LandResourcesService();
