import { api } from '../lib/api';

export interface SystemConfig {
    id: number;
    key: string;
    value: any; // Parsed value (number, boolean, string, json, date)
    rawValue: string; // Original string value
    dataType: string;
    category: string;
    description?: string;
    isActive: boolean;
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SystemConfigUpdate {
    value?: string;
    dataType?: string;
    category?: string;
    description?: string;
    isActive?: boolean;
}

class SystemConfigService {
    private baseUrl = '/system-config';

    /**
     * Get all system configurations
     */
    async getAll(params?: { category?: string; isActive?: boolean; search?: string }) {
        return api.get<SystemConfig[]>(this.baseUrl, { params });
    }

    /**
     * Get all configuration categories
     */
    async getCategories() {
        return api.get<string[]>(`${this.baseUrl}/categories`);
    }

    /**
     * Get all configs in a category as key-value object
     * Example: getByCategory('fiscal') => { startMonth: 7, yearFormat: "GC", currentYear: 2025 }
     */
    async getByCategory(category: string) {
        return api.get<Record<string, any>>(`${this.baseUrl}/categories/${category}`);
    }

    /**
     * Get a single config by key
     * Example: get('fiscal.startMonth') => { key: "fiscal.startMonth", value: 7, ... }
     */
    async get(key: string) {
        return api.get<{ key: string; value: any; dataType: string; category: string; description?: string }>(
            `${this.baseUrl}/${key}`
        );
    }

    /**
     * Update a config value
     */
    async update(key: string, data: SystemConfigUpdate) {
        return api.patch<SystemConfig>(`${this.baseUrl}/${key}`, data);
    }

    /**
     * Bulk update multiple configs
     */
    async bulkUpdate(updates: Array<{ key: string; value: any }>, updatedBy?: number) {
        return api.post<SystemConfig[]>(`${this.baseUrl}/bulk-update`, { updates, updatedBy });
    }

    /**
     * Create a new config
     */
    async create(data: {
        key: string;
        value: string;
        dataType: string;
        category: string;
        description?: string;
        isActive?: boolean;
        isSystem?: boolean;
    }) {
        return api.post<SystemConfig>(this.baseUrl, data);
    }

    /**
     * Delete a config (non-system only)
     */
    async delete(key: string) {
        return api.delete(`${this.baseUrl}/${key}`);
    }
}

export const systemConfigService = new SystemConfigService();
