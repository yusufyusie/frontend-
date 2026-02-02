import { api } from '@/lib/api';

export interface LeasePayment {
    id: number;
    leaseId: number;
    month: string;
    exchangeRate: number;
    amountUsd: number;
    amountLocal: number;
    vatAmount?: number;
    interest?: number;
    penalty?: number;
    invoiceNo?: string;
    depositDate?: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED';
    remarks?: string;
    lease?: {
        id: number;
        contractNumber: string;
        tenant: {
            name: string;
        };
    };
}

export interface ExchangeRate {
    id: number;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    validFrom: string;
    validTo?: string;
    isActive: boolean;
}

class FinancialsService {
    private readonly endpoint = '/financials';

    async getLedger(leaseId?: number, year?: number) {
        return api.get<LeasePayment[]>(`${this.endpoint}/ledger`, {
            params: { leaseId, year }
        });
    }

    async updatePayment(id: number, data: Partial<LeasePayment>) {
        return api.patch<LeasePayment>(`${this.endpoint}/payments/${id}`, data);
    }

    async getExchangeRates() {
        return api.get<ExchangeRate[]>(`${this.endpoint}/exchange-rates`);
    }

    async createExchangeRate(data: Partial<ExchangeRate>) {
        return api.post<ExchangeRate>(`${this.endpoint}/exchange-rates`, data);
    }

    async generateSchedule(leaseId: number) {
        return api.post<any>(`${this.endpoint}/schedule/${leaseId}`);
    }

    async getAvailableYears() {
        return api.get<number[]>(`${this.endpoint}/years`);
    }

    async getSettings() {
        return api.get<any>(`${this.endpoint}/settings`);
    }
}

export const financialsService = new FinancialsService();
