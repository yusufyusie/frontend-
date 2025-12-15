'use client';

import { AuditLog } from '@/services/auditlog.service';
import * as Icons from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AuditLogDetailsDrawerProps {
    log: AuditLog | null;
    isOpen: boolean;
    onClose: () => void;
}

export function AuditLogDetailsDrawer({ log, isOpen, onClose }: AuditLogDetailsDrawerProps) {
    if (!log) return null;

    const getResultColor = (result?: string) => {
        switch (result?.toUpperCase()) {
            case 'SUCCESS': return 'text-green-600 bg-green-50 border-green-200';
            case 'DENIED': return 'text-red-600 bg-red-50 border-red-200';
            case 'ERROR': return 'text-orange-600 bg-orange-50 border-orange-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getActionIcon = (action: string) => {
        const lowerAction = action.toLowerCase();
        if (lowerAction.includes('login')) return <Icons.LogIn className="w-5 h-5" />;
        if (lowerAction.includes('logout')) return <Icons.LogOut className="w-5 h-5" />;
        if (lowerAction.includes('create')) return <Icons.PlusCircle className="w-5 h-5" />;
        if (lowerAction.includes('update') || lowerAction.includes('edit')) return <Icons.Edit className="w-5 h-5" />;
        if (lowerAction.includes('delete')) return <Icons.Trash2 className="w-5 h-5" />;
        if (lowerAction.includes('view') || lowerAction.includes('read')) return <Icons.Eye className="w-5 h-5" />;
        if (lowerAction.includes('permission')) return <Icons.Shield className="w-5 h-5" />;
        return <Icons.Activity className="w-5 h-5" />;
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-600 rounded-lg">
                                {getActionIcon(log.action)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Audit Log Details</h2>
                                <p className="text-sm text-gray-500">
                                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                            <Icons.X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getResultColor(log.result)}`}>
                            {log.result === 'SUCCESS' && <Icons.CheckCircle className="w-4 h-4" />}
                            {log.result === 'DENIED' && <Icons.XCircle className="w-4 h-4" />}
                            {log.result === 'ERROR' && <Icons.AlertCircle className="w-4 h-4" />}
                            <span className="font-semibold">{log.result || 'Unknown'}</span>
                        </div>

                        {/* Event Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Icons.Info className="w-5 h-5 text-purple-600" />
                                Event Information
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                <InfoItem label="Action" value={log.action} icon={<Icons.Zap />} />
                                {log.resource && <InfoItem label="Resource" value={log.resource} icon={<Icons.Package />} />}
                                {log.resourceId && <InfoItem label="Resource ID" value={log.resourceId} icon={<Icons.Hash />} />}
                                <InfoItem
                                    label="Timestamp"
                                    value={new Date(log.createdAt).toLocaleString('en-US', {
                                        dateStyle: 'full',
                                        timeStyle: 'long'
                                    })}
                                    icon={<Icons.Clock />}
                                />
                            </div>
                        </div>

                        {/* User Information */}
                        {log.user && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Icons.User className="w-5 h-5 text-purple-600" />
                                    User Information
                                </h3>

                                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                                            {log.user.firstName?.[0]}{log.user.lastName?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {log.user.firstName} {log.user.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600">{log.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-500">Username:</span>
                                            <span className="ml-1 font-medium">{log.user.username}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">User ID:</span>
                                            <span className="ml-1 font-medium">#{log.user.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Technical Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Icons.Server className="w-5 h-5 text-purple-600" />
                                Technical Details
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                {log.ipAddress && (
                                    <InfoItem
                                        label="IP Address"
                                        value={log.ipAddress}
                                        icon={<Icons.Globe />}
                                        copyable
                                    />
                                )}
                                {log.userAgent && (
                                    <InfoItem
                                        label="User Agent"
                                        value={log.userAgent}
                                        icon={<Icons.Monitor />}
                                        multiline
                                    />
                                )}
                            </div>
                        </div>

                        {/* Additional Details */}
                        {log.details && Object.keys(log.details).length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Icons.FileText className="w-5 h-5 text-purple-600" />
                                    Additional Details
                                </h3>

                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                    <pre className="text-sm text-green-400 font-mono">
                                        {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Reason (if failed) */}
                        {log.reason && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Icons.AlertTriangle className="w-5 h-5 text-orange-600" />
                                    Failure Reason
                                </h3>

                                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                    <p className="text-gray-900">{log.reason}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t bg-gray-50">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Log ID: #{log.id}</span>
                            <button
                                onClick={onClose}
                                className="btn btn-primary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Helper component for info items
function InfoItem({
    label,
    value,
    icon,
    copyable = false,
    multiline = false
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    copyable?: boolean;
    multiline?: boolean;
}) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="text-purple-600">{icon}</div>
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    <p className={`text-gray-900 ${multiline ? 'text-xs break-all' : ''}`}>
                        {value}
                    </p>
                </div>
                {copyable && (
                    <button
                        onClick={handleCopy}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy to clipboard"
                    >
                        {copied ? (
                            <Icons.Check className="w-4 h-4 text-green-600" />
                        ) : (
                            <Icons.Copy className="w-4 h-4 text-gray-600" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

// Add React import for useState
import React from 'react';
