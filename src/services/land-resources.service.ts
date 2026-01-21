import { api } from '../lib/api';

export enum LocationLevel {
    ZONE = 'ZONE',
    BLOCK = 'BLOCK',
    BUILDING = 'BUILDING',
    PLOT = 'PLOT',
    ROOM = 'ROOM',
}

export interface LandResource {
    id: number | string;
    realId?: number;
    parentId?: number | null | string;
    type: string;
    code: string;
    name: string;
    nameEn: string;
    nameAm?: string;

    // Professional ITPC Attributes
    occupantName?: string;
    companyRegNumber?: string;
    contractArea?: number;
    areaVariance?: number;
    previousOccupantName?: string;

    // Common Metadata Lookups
    usageTypeId?: number | null;
    ownershipTypeId?: number | null;
    statusId?: number | null;

    // Building Specifics
    floors?: number;
    hasElevator?: boolean;
    hasParking?: boolean;
    yearBuilt?: number;

    // Plot/Room Specifics
    floorNumber?: number;
    area?: number;
    rentRate?: number;
    capacity?: number;

    metadata: any;
    createdAt?: string;
    updatedAt?: string;
    children?: LandResource[];

    // Relations/Joins
    usageType?: any;
    ownershipType?: any;
    status?: any;

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
