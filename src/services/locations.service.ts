import { api } from '@/lib/api';

export interface LocationOption {
    id: number;
    realId?: number;
    type: string;
    code: string;
    name: string;
    description?: string;
    isActive?: boolean;
    children?: any[];
}

class LocationsService {
    private baseUrl = '/locations';

    /**
     * Get unified location hierarchy tree
     */
    async getTree() {
        return api.get<any[]>(`${this.baseUrl}/tree`);
    }

    /**
     * Create a new location (Zone, Block, etc)
     */
    async create(data: any) {
        return api.post(this.baseUrl, data);
    }

    /**
     * Delete a location by type and ID
     */
    async delete(type: string, id: number) {
        return api.delete(`${this.baseUrl}/${type}/${id}`);
    }

    /**
     * Get all zones
     */
    async getZones(): Promise<LocationOption[]> {
        const response = await api.get(`${this.baseUrl}/zones`);
        return response.data;
    }

    /**
     * Get blocks, optionally filtered by zone
     */
    async getBlocks(zoneId?: number): Promise<LocationOption[]> {
        const params = zoneId ? { zoneId } : {};
        const response = await api.get(`${this.baseUrl}/blocks`, { params });
        return response.data;
    }

    /**
     * Get buildings, optionally filtered by block
     */
    async getBuildings(blockId?: number): Promise<LocationOption[]> {
        const params = blockId ? { blockId } : {};
        const response = await api.get(`${this.baseUrl}/buildings`, { params });
        return response.data;
    }

    /**
     * Get plots/units, optionally filtered by building
     */
    async getPlots(buildingId?: number): Promise<LocationOption[]> {
        const params = buildingId ? { buildingId } : {};
        const response = await api.get(`${this.baseUrl}/plots`, { params });
        return response.data;
    }

    /**
     * Get rooms, optionally filtered by plot
     */
    async getRooms(plotId?: number): Promise<LocationOption[]> {
        const params = plotId ? { plotId } : {};
        const response = await api.get(`${this.baseUrl}/rooms`, { params });
        return response.data;
    }
}

export const locationsService = new LocationsService();
