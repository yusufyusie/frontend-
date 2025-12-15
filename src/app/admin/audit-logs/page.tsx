'use client';

import { useState, useEffect } from 'react';
import { auditLogService, AuditLog, AuditLogStats, AuditLogFilter } from '@/services/auditlog.service';
import { DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from '@/components/Toast';
import { PermissionGate } from '@/components/PermissionGate';
import * as Icons from 'lucide-react';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [stats, setStats] = useState<AuditLogStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<AuditLogFilter>({ page: 1, limit: 10 });
    const [totalPages, setTotalPages] = useState(1);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    useEffect(() => {
        // Wait a bit for permissions to load to avoid race condition
        const timer = setTimeout(() => {
            fetchData();
        }, 100);
        return () => clearTimeout(timer);
    }, [filter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Stats endpoint doesn't need pagination params
            const { page, limit, ...statsFilter } = filter;
            const [logsData, statsData] = await Promise.all([
                auditLogService.getAll(filter),
                auditLogService.getStats(statsFilter),
            ]);
            setLogs(logsData.data);
            setTotalPages(logsData.totalPages);
            setStats(statsData);
        } catch (error: any) {
            toast.error('Failed to load audit logs: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getResultBadge = (result?: string) => {
        const styles = {
            SUCCESS: 'bg-green-100 text-green-700',
            DENIED: 'bg-red-100 text-red-700',
            ERROR: 'bg-orange-100 text-orange-700',
        };
        return styles[result as keyof typeof styles] || 'bg-gray-100 text-gray-700';
    };

    const columns = [
        {
            key: 'timestamp',
            header: 'Timestamp',
            sortable: true,
            render: (log: AuditLog) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900">
                        {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleTimeString()}
                    </div>
                </div>
            ),
        },
        {
            key: 'user',
            header: 'User',
            render: (log: AuditLog) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                        {log.user ? log.user.username[0].toUpperCase() : '?'}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {log.user?.username || 'System'}
                        </div>
                        {log.user?.email && (
                            <div className="text-xs text-gray-500">{log.user.email}</div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: 'action',
            header: 'Action',
            sortable: true,
            render: (log: AuditLog) => (
                <div className="flex items-center gap-2">
                    <Icons.Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900">{log.action}</span>
                </div>
            ),
        },
        {
            key: 'resource',
            header: 'Resource',
            render: (log: AuditLog) => (
                log.resource ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                        {log.resource}
                    </span>
                ) : (
                    <span className="text-sm text-gray-400">-</span>
                )
            ),
        },
        {
            key: 'result',
            header: 'Result',
            sortable: true,
            render: (log: AuditLog) => (
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${getResultBadge(log.result)}`}>
                    {log.result || 'N/A'}
                </span>
            ),
        },
        {
            key: 'ipAddress',
            header: 'IP Address',
            render: (log: AuditLog) => (
                <span className="text-sm text-gray-700 font-mono">{log.ipAddress || '-'}</span>
            ),
        },
        {
            key: 'details',
            header: 'Details',
            render: (log: AuditLog) => (
                <button
                    onClick={() => {
                        setSelectedLog(log);
                        setDetailsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                    View Details
                </button>
            ),
        },
    ];

    if (loading && !logs.length) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const successRate = stats ? Math.round((stats.successCount / stats.totalLogs) * 100) : 0;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-4xl font-bold text-gradient">Audit Logs</h1>
                <p className="text-gray-600 mt-2">Monitor system activity and security events</p>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                                <Icons.Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalLogs}</p>
                                <p className="text-sm text-gray-600">Total Logs</p>
                            </div>
                        </div>
                    </div>
                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl shadow-lg">
                                <Icons.CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{successRate}%</p>
                                <p className="text-sm text-gray-600">Success Rate</p>
                            </div>
                        </div>
                    </div>
                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg">
                                <Icons.XCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.deniedCount}</p>
                                <p className="text-sm text-gray-600">Access Denied</p>
                            </div>
                        </div>
                    </div>
                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                                <Icons.Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.uniqueUsers}</p>
                                <p className="text-sm text-gray-600">Unique Users</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <input
                        type="text"
                        placeholder="Search action..."
                        value={filter.action || ''}
                        onChange={(e) => setFilter({ ...filter, action: e.target.value, page: 1 })}
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500"
                    />
                    <select
                        value={filter.result || ''}
                        onChange={(e) => setFilter({ ...filter, result: e.target.value, page: 1 })}
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500"
                    >
                        <option value="">All Results</option>
                        <option value="SUCCESS">Success</option>
                        <option value="DENIED">Denied</option>
                        <option value="ERROR">Error</option>
                    </select>
                    <input
                        type="date"
                        value={filter.startDate || ''}
                        onChange={(e) => setFilter({ ...filter, startDate: e.target.value, page: 1 })}
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500"
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        value={filter.endDate || ''}
                        onChange={(e) => setFilter({ ...filter, endDate: e.target.value, page: 1 })}
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500"
                        placeholder="End Date"
                    />
                    <button
                        onClick={() => setFilter({ page: 1, limit: 10 })}
                        className="btn btn-secondary"
                    >
                        <Icons.RefreshCw className="w-4 h-4 mr-2" /> Reset
                    </button>
                </div>
            </div>

            <DataTable
                data={logs}
                columns={columns}
                pageSize={filter.limit || 10}
                currentPage={filter.page}
                totalPages={totalPages}
                onPageChange={(page) => setFilter({ ...filter, page })}
            />

            {selectedLog && (
                <Modal
                    isOpen={detailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    title="Audit Log Details"
                    size="lg"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Timestamp</label>
                                <p className="text-gray-900">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">User</label>
                                <p className="text-gray-900">{selectedLog.user?.username || 'System'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Action</label>
                                <p className="text-gray-900">{selectedLog.action}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Result</label>
                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${getResultBadge(selectedLog.result)}`}>
                                    {selectedLog.result || 'N/A'}
                                </span>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">IP Address</label>
                                <p className="text-gray-900 font-mono">{selectedLog.ipAddress || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Resource</label>
                                <p className="text-gray-900">{selectedLog.resource || '-'}</p>
                            </div>
                        </div>
                        {selectedLog.reason && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Reason</label>
                                <p className="text-gray-900">{selectedLog.reason}</p>
                            </div>
                        )}
                        {selectedLog.details && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">Details</label>
                                <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-sm overflow-auto max-h-64">
                                    {JSON.stringify(selectedLog.details, null, 2)}
                                </pre>
                            </div>
                        )}
                        {selectedLog.userAgent && (
                            <div>
                                <label className="text-sm font-medium text-gray-500">User Agent</label>
                                <p className="text-gray-900 text-sm font-mono">{selectedLog.userAgent}</p>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
