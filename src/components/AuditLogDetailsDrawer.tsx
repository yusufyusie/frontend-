'use client';

import { AuditLog } from '@/services/auditlog.service';
import * as Icons from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';

interface AuditLogDetailsDrawerProps {
    log: AuditLog | null;
    isOpen: boolean;
    onClose: () => void;
}

export function AuditLogDetailsDrawer({ log, isOpen, onClose }: AuditLogDetailsDrawerProps) {
    if (!log) return null;

    const getResultColor = (result?: string) => {
        switch (result?.toUpperCase()) {
            case 'SUCCESS': return 'text-teal-700 bg-teal-50 border-teal-100 shadow-sm';
            case 'DENIED': return 'text-rose-700 bg-rose-50 border-rose-100 shadow-sm';
            case 'ERROR': return 'text-orange-700 bg-orange-50 border-orange-100 shadow-sm';
            default: return 'text-gray-600 bg-gray-50 border-gray-100 shadow-sm';
        }
    };

    const getActionIcon = (action: string) => {
        const lowerAction = action.toLowerCase();
        const iconProps = { className: "w-5 h-5", strokeWidth: 2.5 };

        if (lowerAction.includes('login')) return <Icons.LogIn {...iconProps} />;
        if (lowerAction.includes('logout')) return <Icons.LogOut {...iconProps} />;
        if (lowerAction.includes('create')) return <Icons.PlusCircle {...iconProps} />;
        if (lowerAction.includes('update') || lowerAction.includes('edit')) return <Icons.Edit {...iconProps} />;
        if (lowerAction.includes('delete')) return <Icons.Trash2 {...iconProps} />;
        if (lowerAction.includes('view') || lowerAction.includes('read')) return <Icons.Eye {...iconProps} />;
        if (lowerAction.includes('permission')) return <Icons.Shield {...iconProps} />;
        return <Icons.Activity {...iconProps} />;
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 transition-opacity backdrop-blur-[2px]"
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
                    <div className="bg-primary p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-2xl"></div>

                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl text-white">
                                    {getActionIcon(log.action)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">Audit Record</h2>
                                    <p className="text-white/70 text-sm font-medium">
                                        Observed {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-xl transition-all border border-transparent hover:border-white/30 active:scale-90"
                            >
                                <Icons.X className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Status Section */}
                        <div className="space-y-3">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Execution Result</div>
                            <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border ${getResultColor(log.result)}`}>
                                <div className="p-1 rounded-lg bg-white/50 border border-current/10">
                                    {log.result === 'SUCCESS' && <Icons.CheckCircle className="w-4 h-4" strokeWidth={3} />}
                                    {log.result === 'DENIED' && <Icons.XCircle className="w-4 h-4" strokeWidth={3} />}
                                    {log.result === 'ERROR' && <Icons.AlertCircle className="w-4 h-4" strokeWidth={3} />}
                                </div>
                                <span className="font-black uppercase tracking-wider text-sm">{log.result || 'Unknown'}</span>
                            </div>
                        </div>

                        {/* Event Information */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Icons.Info className="w-5 h-5 text-primary" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Event Specification</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem label="Action Verb" value={log.action} icon={<Icons.Zap />} />
                                {log.resource && <InfoItem label="Resource Type" value={log.resource} icon={<Icons.Package />} />}
                                {log.resourceId && <InfoItem label="System ID" value={log.resourceId} icon={<Icons.Hash />} />}
                                <InfoItem
                                    label="Event Timestamp"
                                    value={new Date(log.createdAt).toLocaleString('en-US', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    })}
                                    icon={<Icons.Clock />}
                                />
                            </div>
                        </div>

                        {/* User Information */}
                        {log.user && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Icons.User className="w-5 h-5 text-primary" strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Actor Context</h3>
                                </div>

                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all">
                                    <div className="absolute top-0 right-0 p-2 opacity-5">
                                        <Icons.User className="w-24 h-24" />
                                    </div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-primary font-black text-xl shadow-sm">
                                            {log.user.username?.[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 text-lg leading-none mb-1">
                                                {log.user.firstName} {log.user.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500 font-medium">{log.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-200/50 text-xs relative z-10">
                                        <div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Username</span>
                                            <span className="font-black text-gray-700">{log.user.username}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Authority ID</span>
                                            <span className="font-black text-gray-700">#{log.user.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Technical Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Icons.Server className="w-5 h-5 text-primary" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Access Vectors</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {log.ipAddress && (
                                    <InfoItem
                                        label="Source IP Address"
                                        value={log.ipAddress}
                                        icon={<Icons.Globe />}
                                        copyable
                                    />
                                )}
                                {log.userAgent && (
                                    <InfoItem
                                        label="Agent Signature"
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
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Icons.FileText className="w-5 h-5 text-primary" strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Structured Metadata</h3>
                                </div>

                                <div className="bg-gray-950 rounded-2xl p-5 border border-gray-800 shadow-xl overflow-x-auto group">
                                    <pre className="text-xs text-teal-400 font-mono leading-relaxed group-hover:text-teal-300 transition-colors">
                                        {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Reason (if failed) */}
                        {log.reason && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-rose-50 rounded-lg">
                                        <Icons.AlertTriangle className="w-5 h-5 text-rose-600" strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-lg font-black text-rose-900 uppercase tracking-tight">Incident Root Cause</h3>
                                </div>

                                <div className="p-5 bg-rose-50/50 border border-rose-100 rounded-2xl shadow-sm">
                                    <p className="text-rose-900 font-medium leading-relaxed">{log.reason}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"></div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trace ID: #{log.id}</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-sm shadow-md hover:shadow-lg active:scale-95 transition-all"
                            >
                                Acknowledge & Close
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
        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="text-gray-400 group-hover:text-primary transition-colors">
                            {icon && React.cloneElement(icon as any, { size: 14, strokeWidth: 3 })}
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-500 transition-colors">{label}</span>
                    </div>
                    <p className={`font-black text-gray-900 tracking-tight ${multiline ? 'text-xs break-all leading-relaxed' : 'truncate'}`}>
                        {value}
                    </p>
                </div>
                {copyable && (
                    <button
                        onClick={handleCopy}
                        className={`p-2 rounded-xl border transition-all active:scale-90 ${copied ? 'bg-teal-50 border-teal-100 text-teal-600' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'
                            }`}
                        title="Copy to clipboard"
                    >
                        {copied ? (
                            <Icons.Check className="w-4 h-4" strokeWidth={3} />
                        ) : (
                            <Icons.Copy className="w-4 h-4" strokeWidth={2.5} />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

// End of file
