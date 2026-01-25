import { api } from '@/lib/api';

export interface Country {
    id: number;
    name: string;
    code?: string;
    isActive: boolean;
}

export interface Region {
    id: number;
    countryId: number;
    name: string;
    code?: string;
    isActive: boolean;
    country?: Country;
}

export interface City {
    id: number;
    regionId: number;
    name: string;
    isActive: boolean;
    region?: Region;
}

class GeoService {
    private baseUrl = '/geo';

    // Countries
    async getCountries() {
        return api.get<Country[]>(`${this.baseUrl}/countries`);
    }

    async createCountry(data: Partial<Country>) {
        return api.post<Country>(`${this.baseUrl}/countries`, data);
    }

    // Regions
    async getRegions(countryId?: number) {
        const params = countryId ? { countryId } : {};
        return api.get<Region[]>(`${this.baseUrl}/regions`, { params });
    }

    async createRegion(data: Partial<Region>) {
        return api.post<Region>(`${this.baseUrl}/regions`, data);
    }

    // Cities
    async getCities(regionId?: number) {
        const params = regionId ? { regionId } : {};
        return api.get<City[]>(`${this.baseUrl}/cities`, { params });
    }

    async createCity(data: Partial<City>) {
        return api.post<City>(`${this.baseUrl}/cities`, data);
    }
}

export const geoService = new GeoService();
