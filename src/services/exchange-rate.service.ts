import { api } from '../lib/api';

export interface ExchangeRate {
    id: number;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    validFrom: string;
    validTo?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

class ExchangeRateService {
    private baseUrl = '/exchange-rates';

    /**
     * Get all exchange rates
     */
    async getAll(params?: { fromCurrency?: string; toCurrency?: string; isActive?: boolean }) {
        return api.get<ExchangeRate[]>(this.baseUrl, { params });
    }

    /**
     * Get current active exchange rate
     * Default: USD to ETB
     */
    async getCurrent(fromCurrency: string = 'USD', toCurrency: string = 'ETB') {
        const response = await api.get<{ rate: number; validFrom: string }>(
            `${this.baseUrl}/current`,
            { params: { fromCurrency, toCurrency } }
        );
        return response.data;
    }

    /**
     * Get exchange rate at a specific date (for historical contracts)
     */
    async getAtDate(fromCurrency: string, toCurrency: string, date: string) {
        const response = await api.get<{ rate: number; validFrom: string }>(
            `${this.baseUrl}/at/${date}`,
            { params: { fromCurrency, toCurrency } }
        );
        return response.data;
    }

    /**
     * Get exchange rate for a specific ID
     */
    async getOne(id: number) {
        return api.get<ExchangeRate>(`${this.baseUrl}/${id}`);
    }

    /**
     * Create a new exchange rate
     */
    async create(data: {
        fromCurrency: string;
        toCurrency: string;
        rate: number;
        validFrom: string;
        validTo?: string;
        isActive?: boolean;
    }) {
        return api.post<ExchangeRate>(this.baseUrl, data);
    }

    /**
     * Update an exchange rate
     */
    async update(id: number, data: Partial<ExchangeRate>) {
        return api.patch<ExchangeRate>(`${this.baseUrl}/${id}`, data);
    }

    /**
     * Delete an exchange rate
     */
    async delete(id: number) {
        return api.delete(`${this.baseUrl}/${id}`);
    }
}

export const exchangeRateService = new ExchangeRateService();
