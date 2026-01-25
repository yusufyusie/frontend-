import { api } from '@/lib/api';
import { Tenant } from './tenants.service';

export interface InquiryOption {
    id: number;
    inquiryId: number;
    landResourceId?: number;
    plotId?: number;
    roomId?: number;
    isInterested: boolean;
    adminNote?: string;
    landResource?: any;
    plot?: any;
    room?: any;
    createdAt: string;
}

export interface Inquiry {
    id: number;
    tenantId: number;
    propertyTypeId?: number;
    minArea?: number;
    maxArea?: number;
    minBaseRent?: number;
    maxBaseRent?: number;
    preferredMoveIn?: string;
    furnitureStatusId?: number;
    officeSpreadId?: number;
    leaseTermMonths?: number;
    note?: string;
    status: string; // NEW, ANALYZING, OPTIONS_SENT, INTERESTED, EXECUTED, CLOSED
    metadata: any;
    createdAt: string;
    tenant?: Tenant;
    propertyType?: any;
    furnitureStatus?: any;
    officeSpread?: any;
    options?: InquiryOption[];
    _count?: {
        options: number;
    };
}

class InquiriesService {
    private readonly endpoint = '/inquiries';

    async getAll() {
        return api.get<Inquiry[]>(this.endpoint);
    }

    async getOne(id: number) {
        return api.get<Inquiry>(`${this.endpoint}/${id}`);
    }

    async create(data: Partial<Inquiry>) {
        return api.post<Inquiry>(this.endpoint, data);
    }

    async updateStatus(id: number, status: string) {
        return api.patch<Inquiry>(`${this.endpoint}/${id}/status`, { status });
    }

    async addOption(inquiryId: number, data: any) {
        return api.post<InquiryOption>(`${this.endpoint}/${inquiryId}/options`, data);
    }

    async markInterested(optionId: number, isInterested: boolean) {
        return api.patch<any>(`${this.endpoint}/options/${optionId}/interest`, { isInterested });
    }
}

export const inquiriesService = new InquiriesService();
