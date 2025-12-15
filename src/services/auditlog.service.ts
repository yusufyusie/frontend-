import { api } from '@/lib/api';

export interface AuditLog {
    id: number;
    userId?: number;
    user?: {
        id: number;
        username: string;
        email: string;
        firstName?: string;
        lastName?: string;
    };
    action: string;
    resource?: string;
    resourceId?: string;
    details?: any;
    result?: string;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
}

export interface ActionDistribution {
    action: string;
    count: number;
    percentage: number;
}

export interface HourlyDistribution {
    hour: number;
    count: number;
}

export interface AuditLogStats {
    totalLogs: number;
    successCount: number;
    deniedCount: number;
    errorCount: number;
    uniqueUsers: number;
    actionsByType: ActionDistribution[];
    logsByHour: HourlyDistribution[];
}

export interface AuditLogFilter {
    userId?: number;
    action?: string;
    resource?: string;
    result?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

class AuditLogService {
    async getAll(filter: AuditLogFilter = {}): Promise<{
        data: AuditLog[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const response = await api.get('/audit-logs', { params: filter });
        return response.data;
    }

    async getById(id: number): Promise<AuditLog> {
        const response = await api.get(`/audit-logs/${id}`);
        return response.data;
    }

    async getStats(filter?: AuditLogFilter): Promise<AuditLogStats> {
        const response = await api.get('/audit-logs/stats', { params: filter });
        return response.data;
    }

    async getByUser(userId: number, page = 1, limit = 10): Promise<{
        data: AuditLog[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const response = await api.get(`/audit-logs/user/${userId}`, {
            params: { page, limit },
        });
        return response.data;
    }
}

export const auditLogService = new AuditLogService();
