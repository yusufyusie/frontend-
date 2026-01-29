import { api } from '@/lib/api';

export enum LocationLevel {
    ZONE = 'ZONE',
    BLOCK = 'BLOCK',
    PLOT = 'PLOT',
    BUILDING = 'BUILDING',
    FLOOR = 'FLOOR',
    ROOM = 'ROOM'
}

export interface LocationOption {
    id: number;
    realId?: number;
    type: string;
    code: string;
    name: string;
    description?: string;
    area?: number;
    floorNumber?: number;
    isActive?: boolean;
    gpsLat?: number;
    gpsLng?: number;
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
     * Get buildings, optionally filtered by plot or search query
     */
    async getBuildings(params?: { plotId?: number; search?: string }): Promise<LocationOption[]> {
        const response = await api.get(`${this.baseUrl}/buildings`, { params });
        return response.data;
    }

    /**
     * Get plots/units, optionally filtered by block
     */
    async getPlots(blockId?: number): Promise<LocationOption[]> {
        const params = blockId ? { blockId } : {};
        const response = await api.get(`${this.baseUrl}/plots`, { params });
        return response.data;
    }

    /**
     * Get individual resource details by type and ID
     */
    async getOne(type: string, id: number) {
        const t = type.toLowerCase();
        // Backend now supports /locations/zones/:id, /locations/rooms/:id etc.
        const endpoint = t === 'zone' ? 'zones' :
            t === 'block' ? 'blocks' :
                t === 'plot' ? 'plots' :
                    t === 'building' ? 'buildings' :
                        t === 'room' ? 'rooms' : 'unknown';

        return api.get<any>(`${this.baseUrl}/${endpoint}/${id}`);
    }

    /**
     * Get rooms, optionally filtered by floor
     */
    async getRooms(floorId?: number): Promise<LocationOption[]> {
        const params = floorId ? { floorId } : {};
        const response = await api.get(`${this.baseUrl}/rooms`, { params });
        return response.data;
    }
}

export const locationsService = new LocationsService();
