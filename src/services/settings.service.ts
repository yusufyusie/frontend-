import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Configuration {
    id: number;
    key: string;
    value: any;
    type: 'string' | 'number' | 'boolean' | 'json';
    category: string;
    description?: string;
    isEditable: boolean;
}

export interface FeatureFlag {
    id: number;
    key: string;
    name: string;
    description?: string;
    enabled: boolean;
    category?: string;
}

class SettingsService {
    private getAuthHeader() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        return { Authorization: `Bearer ${token}` };
    }

    async getConfigurations(category?: string): Promise<Configuration[]> {
        const response = await axios.get(`${API_URL}/configuration`, {
            params: { category },
            headers: this.getAuthHeader(),
        });
        return response.data;
    }

    async updateConfiguration(key: string, value: any): Promise<Configuration> {
        const response = await axios.put(`${API_URL}/configuration/${key}`, { value }, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }

    async getFeatureFlags(): Promise<FeatureFlag[]> {
        const response = await axios.get(`${API_URL}/feature-flags`, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }

    async toggleFeatureFlag(id: number, enabled: boolean): Promise<FeatureFlag> {
        const response = await axios.patch(`${API_URL}/feature-flags/${id}`, { enabled }, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }

    async getSecurityPolicies() {
        const response = await axios.get(`${API_URL}/security-policies`, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }

    async updateSecurityPolicy(id: number, data: any) {
        const response = await axios.put(`${API_URL}/security-policies/${id}`, data, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }

    async getUICustomizations() {
        const response = await axios.get(`${API_URL}/ui-customizations`, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }

    async updateUICustomization(key: string, value: any) {
        const response = await axios.put(`${API_URL}/ui-customizations/${key}`, { value }, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }

    async getPolicies() {
        const response = await axios.get(`${API_URL}/access-control/policies`, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }

    async updatePolicy(id: number, data: any) {
        const response = await axios.patch(`${API_URL}/access-control/policies/${id}`, data, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }
}

export const settingsService = new SettingsService();
