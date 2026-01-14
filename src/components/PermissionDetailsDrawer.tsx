'use client';

import React from 'react';
import {
    Shield,
    X,
    Info,
    Key,
    Tag,
    Folder,
    FileText,
    Clock,
    BarChart,
    Users,
    TrendingUp,
    AlertTriangle,
    Code,
    Layers,
    ArrowRight
} from 'lucide-react';
import { Permission } from '@/services/permissions.service';

/**
 * Props for the PermissionDetailsDrawer component
 */
interface PermissionDetailsDrawerProps {
    permission: Permission | null;
    isOpen: boolean;
    onClose: () => void;
    roles?: { id: number; name: string }[];
}

/**
 * Comprehensive Inspector for Security Registry entries
 * Displays technical metadata, role assignment graph, and usage telemetry
 */
export function PermissionDetailsDrawer({ permission, isOpen, onClose, roles = [] }: PermissionDetailsDrawerProps) {
    if (!permission) return null;

    const usageCount = permission._count?.rolePermissions || 0;

    return (
        <>
            {/* Modal Occlusion Backdrop */}
            <div
                className={`fixed inset-0 bg-gray-950/60 backdrop-blur-md z-[60] transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Inspector Interface */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[540px] bg-white shadow-3xl z-[70] transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="h-full flex flex-col relative overflow-hidden">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

                    {/* Integrated Inspector Header */}
                    <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl shadow-inner">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Access Rule Inspector</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/5 rounded-md">
                                        Registry Entry
                                    </span>
                                    <span className="text-xs font-bold text-gray-400">ID: #{permission.id}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 hover:rotate-90 text-gray-400 hover:text-gray-900"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Operational Telemetry & Documentation */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-custom">

                        {/* Section: Technical Taxonomy */}
                        <div className="space-y-5">
                            <SectionHeader icon={<Info />} title="Technical Taxonomy" />
                            <div className="grid grid-cols-1 gap-4">
                                <InfoItem
                                    label="System Identifier"
                                    value={permission.name}
                                    icon={<Key className="w-4 h-4" />}
                                />
                                <InfoItem
                                    label="Display Descriptor"
                                    value={permission.displayName}
                                    icon={<Tag className="w-4 h-4" />}
                                />
                                <InfoItem
                                    label="Logical Asset Group"
                                    value={permission.groupName}
                                    icon={<Folder className="w-4 h-4" />}
                                />
                                {permission.description && (
                                    <InfoItem
                                        label="Business Rationale"
                                        value={permission.description}
                                        icon={<FileText className="w-4 h-4" />}
                                        multiline
                                    />
                                )}
                                <InfoItem
                                    label="Record Initialization"
                                    value={new Date(permission.createdAt).toLocaleString('en-US', {
                                        dateStyle: 'long',
                                        timeStyle: 'short'
                                    })}
                                    icon={<Clock className="w-4 h-4" />}
                                />
                            </div>
                        </div>

                        {/* Section: Usage Telemetry */}
                        <div className="space-y-5">
                            <SectionHeader icon={<BarChart />} title="Usage Telemetry" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-gradient-to-br from-primary/5 to-white rounded-3xl border border-primary/10 transition-transform hover:scale-[1.02]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Users className="w-4 h-4 text-primary" />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Assigned Roles</span>
                                    </div>
                                    <p className="text-4xl font-black text-primary tracking-tight">{usageCount}</p>
                                </div>

                                <div className={`p-6 rounded-3xl border transition-transform hover:scale-[1.02] ${usageCount > 0
                                        ? 'bg-gradient-to-br from-green-50 to-white border-green-100'
                                        : 'bg-gradient-to-br from-amber-50 to-white border-amber-100'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp className={`w-4 h-4 ${usageCount > 0 ? 'text-green-600' : 'text-amber-600'}`} />
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Deployment Status</span>
                                    </div>
                                    <p className={`text-xl font-black tracking-tight ${usageCount > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                                        {usageCount > 0 ? 'ACTIVE' : 'ORPHANED'}
                                    </p>
                                </div>
                            </div>

                            {usageCount === 0 && (
                                <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100 animate-pulse">
                                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">Optimization Notice</p>
                                        <p className="text-sm text-amber-800 leading-relaxed font-medium">
                                            This access rule is currently orphaned and not consumed by any active security policies. Consider decommissioning if no longer required.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section: Role Assignment Context */}
                        {roles.length > 0 && (
                            <div className="space-y-5">
                                <SectionHeader icon={<Layers />} title={`Assigned to ${roles.length} Secure Role${roles.length !== 1 ? 's' : ''}`} />
                                <div className="grid grid-cols-1 gap-2">
                                    {roles.map((role) => (
                                        <div
                                            key={role.id}
                                            className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-white rounded-2xl border border-transparent hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:bg-primary transition-colors">
                                                    <Users className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm tracking-tight">{role.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descriptor ID: #{role.id}</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section: RAW Registry Data */}
                        <div className="space-y-5">
                            <SectionHeader icon={<Code />} title="Registry JSON Data" />
                            <div className="relative group">
                                <div className="absolute top-4 right-4 text-[10px] font-black text-gray-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                    Technical View
                                </div>
                                <div className="p-6 bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
                                    <div className="space-y-3 font-mono text-[11px] leading-relaxed">
                                        <div className="flex gap-4">
                                            <span className="text-gray-500 select-none">RULE_ID</span>
                                            <span className="text-green-400 font-bold">{permission.id}</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="text-gray-500 select-none">IDENTIFIER</span>
                                            <span className="text-primary-400 font-bold">"{permission.name}"</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="text-gray-500 select-none">TAXONOMY</span>
                                            <span className="text-amber-400 font-bold">"{permission.groupName}"</span>
                                        </div>
                                        {permission._count && (
                                            <div className="flex gap-4 border-t border-gray-800 pt-3 mt-3">
                                                <span className="text-gray-500 select-none">CONSUMERS</span>
                                                <span className="text-purple-400 font-bold">{permission._count.rolePermissions} active roles</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="p-8 border-t border-gray-100 bg-white sticky bottom-0 z-10">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Current Inspector Targeting</p>
                                <p className="text-xs font-bold text-gray-900">v1.2 // Security Rule {permission.id}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="btn btn-primary px-8 py-3 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
                            >
                                Close Inspector
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/**
 * Reusable Section Header for Drawer content blocks
 */
function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
    return (
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-3 border-b border-gray-50 pb-2">
            <span className="text-primary">{icon}</span>
            {title}
        </h3>
    );
}

/**
 * Enhanced Information indicator with consistent iconography
 */
function InfoItem({
    label,
    value,
    icon,
    multiline = false
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    multiline?: boolean;
}) {
    return (
        <div className="group p-5 bg-white hover:bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all duration-300">
            <div className="flex items-start gap-4">
                <div className="p-2.5 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                    {icon}
                </div>
                <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block leading-none">{label}</span>
                    <p className={`font-bold text-gray-900 tracking-tight leading-relaxed ${multiline ? 'text-xs' : 'text-sm'}`}>
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}
