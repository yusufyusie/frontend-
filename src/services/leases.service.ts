import { api } from '../lib/api';

export interface Lease {
    id: number;
    tenantId: number;
    landResourceId?: number;
    plotId?: number;
    roomId?: number;
    contractNumber: string;
    contractArea: number;
    actualArea: number;
    baseRent: number;
    currency: string;
    billingCycle: string;
    advancePayment?: number;
    securityDeposit?: number;
    paymentStatus: string;
    lastBilledAt?: string;
    startDate: string;
    endDate?: string;
    statusId?: number;
    constructionStatusId?: number;
    contractUrl?: string;
    activeTermVersion: number;
    metadata?: any;
    createdAt?: string;
    updatedAt?: string;
    tenant?: any;
    status?: any;
}

class LeasesService {
    private readonly endpoint = '/leases';

    async getAll(params?: any) {
        return api.get<Lease[]>(this.endpoint, { params });
    }

    async getOne(id: number) {
        return api.get<Lease>(`${this.endpoint}/${id}`);
    }

    async create(data: any) {
        return api.post<Lease>(this.endpoint, data);
    }

    async update(id: number, data: any) {
        return api.patch<Lease>(`${this.endpoint}/${id}`, data);
    }

    async delete(id: number) {
        return api.delete(`${this.endpoint}/${id}`);
    }

    async getByTenant(tenantId: number) {
        return api.get<Lease[]>(`${this.endpoint}/tenant/${tenantId}`);
    }

    async getByUnit(unitType: 'PLOT' | 'ROOM', unitId: number) {
        return api.get<Lease[]>(`${this.endpoint}/unit/${unitType}/${unitId}`);
    }

    async getSummary() {
        return api.get<any>(`${this.endpoint}/summary/occupancy`);
    }
}

export const leasesService = new LeasesService();
