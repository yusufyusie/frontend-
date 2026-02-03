import { api } from '../lib/api';

export interface TenantContact {
    id: number;
    tenantId: number;
    firstName: string;
    lastName: string;
    position?: string;
    email: string;
    phone?: string;
    isPrimary: boolean;
}

export interface Tenant {
    id: number;
    name: string;
    companyRegNumber: string;
    tinNumber?: string;
    businessCategoryId?: number; // Legacy
    industryId?: number; // New: Top-level classification
    sectorId?: number; // New: Sub-classification
    statusId?: number;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    regionId?: number;
    cityId?: number;
    metadata?: any;
    createdAt?: string;
    updatedAt?: string;
    contacts?: TenantContact[];
    documents?: any[];
    leases?: any[];
    inquiries?: any[];
    status?: any;
    businessCategory?: any; // Legacy
    industry?: any; // New
    sector?: any; // New
    _count?: {
        contacts: number;
        documents: number;
        leases?: number;
        inquiries?: number;
    };
}

class TenantsService {
    private readonly endpoint = '/tenants';

    async getAll(params?: any) {
        return api.get<Tenant[]>(this.endpoint, { params });
    }

    async getOne(id: number) {
        return api.get<Tenant>(`${this.endpoint}/${id}`);
    }

    async create(data: Partial<Tenant>) {
        return api.post<Tenant>(this.endpoint, data);
    }

    async update(id: number, data: Partial<Tenant>) {
        return api.patch<Tenant>(`${this.endpoint}/${id}`, data);
    }

    async delete(id: number) {
        return api.delete(`${this.endpoint}/${id}`);
    }

    // Contacts
    async addContact(tenantId: number, data: Partial<TenantContact>) {
        return api.post<TenantContact>(`${this.endpoint}/${tenantId}/contacts`, data);
    }

    async getContacts(tenantId: number) {
        return api.get<TenantContact[]>(`${this.endpoint}/${tenantId}/contacts`);
    }

    async deleteContact(contactId: number) {
        return api.delete(`${this.endpoint}/contacts/${contactId}`);
    }

    // Documents
    async addDocument(tenantId: number, data: any) {
        return api.post(`${this.endpoint}/${tenantId}/documents`, data);
    }

    async getDocuments(tenantId: number) {
        return api.get(`${this.endpoint}/${tenantId}/documents`);
    }

    async deleteDocument(documentId: number) {
        return api.delete(`${this.endpoint}/documents/${documentId}`);
    }
}

export const tenantsService = new TenantsService();
