import { api } from '@/lib/api';

export interface Lease {
    id: number;
    tenantId: number;
    landResourceId?: number;
    roomId?: number;
    contractNumber: string;
    contractArea: number;
    actualArea: number;
    startDate: string;
    endDate?: string;
    statusId?: number;
    constructionStatusId?: number;
}

export const leasesService = {
    create: (data: Partial<Lease>) => api.post('/leases', data),
    getAll: (params?: any) => api.get('/leases', { params }),
    getSummary: () => api.get('/leases/summary/occupancy'),
};
