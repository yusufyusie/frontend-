import { api } from '@/lib/api';

export interface FinanceFilter {
    startDate?: string;
    endDate?: string;
    fiscalYear?: number;
    tenantId?: number;
    zoneId?: number;
    buildingId?: number;
    status?: 'PAID' | 'PENDING' | 'OVERDUE' | 'WAIVED';
    industry?: string;
}

export interface KPISummary {
    totalCollectionsUsd: number;
    totalCollectionsEtb: number;
    collectionRate: number;
    activeLeaseCount: number;
    pendingAmountUsd: number;
    pendingAmountEtb: number;
    overdueAmountUsd: number;
    overdueAmountEtb: number;
    currentExchangeRate: number;
    monthlyGrowthRate: number;
}

export interface RevenueTrend {
    month: string;
    year: number;
    amountUsd: number;
    amountEtb: number;
    exchangeRate: number;
    paidCount: number;
    pendingCount: number;
    overdueCount: number;
}

export interface PaymentStatusBreakdown {
    status: string;
    count: number;
    amountUsd: number;
    amountEtb: number;
    percentage: number;
}

export interface MonthlyPayment {
    month: string;
    monthIndex: number;
    status: string;
    amountUsd: number;
    amountEtb: number;
    vatAmount?: number;
    penalty?: number;
    interest?: number;
    invoiceNo?: string;
    depositDate?: Date;
    dueDate?: Date;
    daysOverdue?: number;
}

export interface TenantPaymentSummary {
    tenantId: number;
    tenantName: string;
    companyRegNumber: string;
    industry: string;
    sector: string;
    spaceM2: number;
    rateUsd: number;
    exchangeRate: number;
    monthlyPayments: MonthlyPayment[];
    annualTotalUsd: number;
    annualTotalEtb: number;
    paidMonths: number;
    pendingMonths: number;
    overdueMonths: number;
}

export interface RevenueByIndustry {
    industry: string;
    totalUsd: number;
    totalEtb: number;
    tenantCount: number;
    percentage: number;
}

export interface RevenueByZone {
    zoneId: number;
    zoneName: string;
    totalUsd: number;
    totalEtb: number;
    tenantCount: number;
    buildingCount: number;
}

export interface RevenueByBuilding {
    buildingId: number;
    buildingName: string;
    zoneName: string;
    totalUsd: number;
    totalEtb: number;
    tenantCount: number;
}

export interface PaymentTracker {
    leaseId: number;
    tenantName: string;
    contractNumber: string;
    invoiceNo?: string;
    status: string;
    amountUsd: number;
    amountEtb: number;
    vatAmount?: number;
    penalty?: number;
    interest?: number;
    gracePeriod?: number;
    lastPaymentDate?: Date;
    dueDate?: Date;
    daysOverdue?: number;
    outstandingBalanceUsd: number;
    outstandingBalanceEtb: number;
}

export interface ExchangeRateSensitivity {
    currentRate: number;
    simulatedRate: number;
    monthlyImpactEtb: number;
    annualImpactEtb: number;
    affectedLeaseCount: number;
    percentageChange: number;
}

export interface DataCenterAgreement {
    tenantId: number;
    companyName: string;
    spaceM2: number;
    priceUsd: number;
    durationYears: number;
    agreementStartDate: Date;
    agreementEndDate: Date;
    advancePaymentUsd: number;
    totalAgreementValueUsd: number;
    status: string;
    monthsElapsed: number;
    monthsRemaining: number;
}

export interface LeaseDistribution {
    name: string;
    value: number;
}

export interface RevenueSource {
    name: string;
    value: number;
}

export interface PortfolioHealth {
    name: string;
    value: number;
    fullMark: number;
}

class FinanceReportsService {
    private buildQueryString(filter: FinanceFilter): string {
        const params = new URLSearchParams();
        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });
        return params.toString();
    }

    async getFinanceSummary(filter: FinanceFilter = {}): Promise<{ data: KPISummary }> {
        const query = this.buildQueryString(filter);
        const response = await api.get(`/reports/finance/summary?${query}`);
        return { data: response.data };
    }

    async getRevenueTrends(filter: FinanceFilter = {}, months: number = 12): Promise<{ data: RevenueTrend[] }> {
        const query = this.buildQueryString({ ...filter, months } as any);
        const response = await api.get(`/reports/finance/revenue-trends?${query}`);
        return { data: response.data };
    }

    async getPaymentStatusBreakdown(filter: FinanceFilter = {}): Promise<{ data: PaymentStatusBreakdown[] }> {
        const query = this.buildQueryString(filter);
        const response = await api.get(`/reports/finance/payment-status?${query}`);
        return { data: response.data };
    }

    async getTenantPaymentSummaries(filter: FinanceFilter = {}): Promise<{ data: TenantPaymentSummary[] }> {
        const query = this.buildQueryString(filter);
        const response = await api.get(`/reports/finance/tenant-summaries?${query}`);
        return { data: response.data };
    }

    async getRevenueByIndustry(filter: FinanceFilter = {}): Promise<{ data: RevenueByIndustry[] }> {
        const query = this.buildQueryString(filter);
        const response = await api.get(`/reports/finance/revenue-by-industry?${query}`);
        return { data: response.data };
    }

    async getRevenueByZone(filter: FinanceFilter = {}): Promise<{ data: RevenueByZone[] }> {
        const query = this.buildQueryString(filter);
        const response = await api.get(`/reports/finance/revenue-by-zone?${query}`);
        return { data: response.data };
    }

    async getRevenueByBuilding(filter: FinanceFilter = {}): Promise<{ data: RevenueByBuilding[] }> {
        const query = this.buildQueryString(filter);
        const response = await api.get(`/reports/finance/revenue-by-building?${query}`);
        return { data: response.data };
    }

    async getPaymentTracker(filter: FinanceFilter = {}): Promise<{ data: PaymentTracker[] }> {
        const query = this.buildQueryString(filter);
        const response = await api.get(`/reports/finance/payment-tracker?${query}`);
        return { data: response.data };
    }

    async simulateExchangeRate(simulatedRate: number, filter: FinanceFilter = {}): Promise<{ data: ExchangeRateSensitivity }> {
        const query = this.buildQueryString({ ...filter, simulatedRate } as any);
        const response = await api.get(`/reports/finance/exchange-rate-sensitivity?${query}`);
        return { data: response.data };
    }

    async getDataCenterAgreements(filter: FinanceFilter = {}): Promise<{ data: DataCenterAgreement[] }> {
        const query = this.buildQueryString(filter);
        const response = await api.get(`/reports/finance/datacenter-agreements?${query}`);
        return { data: response.data };
    }

    async getLeaseDistribution(filter: FinanceFilter = {}): Promise<{ data: LeaseDistribution[] }> {
        const query = this.buildQueryString(filter);
        const response = await api.get(`/reports/finance/lease-distribution?${query}`);
        return { data: response.data };
    }

    async getRevenueSources(filter: FinanceFilter = {}): Promise<{ data: RevenueSource[] }> {
        const query = this.buildQueryString(filter);
        const response = await api.get(`/reports/finance/revenue-sources?${query}`);
        return { data: response.data };
    }

    async getPortfolioHealth(filter: FinanceFilter = {}): Promise<{ data: PortfolioHealth[] }> {
        const query = this.buildQueryString(filter);
        const response = await api.get(`/reports/finance/portfolio-health?${query}`);
        return { data: response.data };
    }
}

export const financeReportsService = new FinanceReportsService();
export default financeReportsService;
