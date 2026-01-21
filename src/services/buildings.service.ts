import { api } from '../lib/api';

export interface Building {
    id: number;
    blockId: number;
    code: string;
    name: string;
    description?: string;
    floors: number;
    hasElevator: boolean;
    hasParking: boolean;
    yearBuilt?: number;
    buildingClassId?: number;
    isActive: boolean;
    metadata: any;
    createdAt?: string;
    updatedAt?: string;
    plots?: Plot[];
}

export interface Plot {
    id: number;
    buildingId: number;
    code: string;
    name: string;
    area: number;
    floorNumber?: number;
    isActive: boolean;
    metadata: any;
    createdAt?: string;
    updatedAt?: string;
    rooms?: Room[];
    building?: Building;
}

export interface Floor {
    id: number;
    buildingId: number;
    code: string;
    nameEn: string;
    nameAm?: string;
    floorNumber: number;
    createdAt?: string;
    updatedAt?: string;
    rooms?: Room[];
    building?: Building;
}

export interface Room {
    id: number;
    plotId: number;
    code: string;
    area: number;
    roomTypeId?: number;
    roomStatusId?: number;
    isActive: boolean;
    metadata: any;
    createdAt?: string;
    updatedAt?: string;
    roomType?: any;
    roomStatus?: any;
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

    // Plots (Units)
    async addPlot(buildingId: number, data: any) {
        return api.post<Plot>(`${this.baseUrl}/${buildingId}/plots`, data);
    }

    async getPlots(buildingId: number) {
        return api.get<Plot[]>(`${this.baseUrl}/${buildingId}/plots`);
    }

    async deletePlot(plotId: number) {
        return api.delete(`${this.baseUrl}/plots/${plotId}`);
    }

    // Rooms (under Plots)
    async addRoom(plotId: number, data: any) {
        return api.post<Room>(`${this.baseUrl}/plots/${plotId}/rooms`, data);
    }

    async getRooms(plotId: number) {
        return api.get<Room[]>(`${this.baseUrl}/plots/${plotId}/rooms`);
    }

    async deleteRoom(roomId: number) {
        return api.delete(`${this.baseUrl}/rooms/${roomId}`);
    }
}

export const buildingsService = new BuildingsService();
