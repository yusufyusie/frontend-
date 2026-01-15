import { api } from '../lib/api';

export interface Building {
    id: number;
    plotId: number;
    code: string;
    nameEn: string;
    // nameAm removed
    buildingTypeId?: number;
    constructionStatusId?: number;
    totalFloors: number;
    basementFloors: number;
    metadata: any;
    floors?: Floor[];
}

export interface Floor {
    id: number;
    buildingId: number;
    code: string;
    nameEn: string;
    // nameAm removed
    floorNumber: number;
    rooms?: Room[];
    _count?: { rooms: number };
}

export interface Room {
    id: number;
    floorId: number;
    code: string;
    nameEn: string;
    areaM2: number;
    statusId?: number;
}

class BuildingsService {
    private baseUrl = '/buildings';

    async getAll(params?: any) {
        return api.get<Building[]>(this.baseUrl, { params });
    }

    async getOne(id: number) {
        return api.get<Building>(`${this.baseUrl}/${id}`);
    }

    async create(data: Partial<Building>) {
        return api.post<Building>(this.baseUrl, data);
    }

    async delete(id: number) {
        return api.delete(`${this.baseUrl}/${id}`);
    }

    // Floors
    async addFloor(buildingId: number, data: any) {
        return api.post<Floor>(`${this.baseUrl}/${buildingId}/floors`, data);
    }

    async getFloors(buildingId: number) {
        return api.get<Floor[]>(`${this.baseUrl}/${buildingId}/floors`);
    }

    async deleteFloor(floorId: number) {
        return api.delete(`${this.baseUrl}/floors/${floorId}`);
    }

    // Rooms
    async addRoom(floorId: number, data: any) {
        return api.post<Room>(`${this.baseUrl}/floors/${floorId}/rooms`, data);
    }

    async getRooms(floorId: number) {
        return api.get<Room[]>(`${this.baseUrl}/floors/${floorId}/rooms`);
    }

    async deleteRoom(roomId: number) {
        return api.delete(`${this.baseUrl}/rooms/${roomId}`);
    }
}

export const buildingsService = new BuildingsService();
