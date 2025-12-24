'use client';

import { Permission } from '@/services/permissions.service';
import * as Icons from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PermissionDetailsDrawerProps {
    permission: Permission | null;
    isOpen: boolean;
    onClose: () => void;
    roles?: { id: number; name: string }[];
}

export function PermissionDetailsDrawer({ permission, isOpen, onClose, roles = [] }: PermissionDetailsDrawerProps) {
    if (!permission) return null;

    const usageCount = permission._count?.rolePermissions || 0;

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
                    <div className="flex items-center justify-between p-6 border-b bg-secondary to-pink-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-secondary rounded-lg">
                                <Icons.Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Permission Details</h2>
                                <p className="text-sm text-gray-500">{permission.displayName}</p>
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
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Icons.Info className="w-5 h-5 text-secondary-600" />
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                <InfoItem label="Permission Name" value={permission.name} icon={<Icons.Key />} />
                                <InfoItem label="Display Name" value={permission.displayName} icon={<Icons.Tag />} />
                                <InfoItem label="Group" value={permission.groupName} icon={<Icons.Folder />} />
                                {permission.description && (
                                    <InfoItem label="Description" value={permission.description} icon={<Icons.FileText />} multiline />
                                )}
                                <InfoItem
                                    label="Created At"
                                    value={new Date(permission.createdAt).toLocaleString('en-US', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    })}
                                    icon={<Icons.Clock />}
                                />
                            </div>
                        </div>

                        {/* Usage Statistics */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Icons.BarChart className="w-5 h-5 text-secondary-600" />
                                Usage Statistics
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-primary-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icons.Users className="w-5 h-5 text-primary-600" />
                                        <span className="text-sm font-medium text-gray-700">Roles Using</span>
                                    </div>
                                    <p className="text-3xl font-bold text-primary-600">{usageCount}</p>
                                </div>

                                <div className="p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border border-success-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icons.TrendingUp className="w-5 h-5 text-success-600" />
                                        <span className="text-sm font-medium text-gray-700">Status</span>
                                    </div>
                                    <p className="text-lg font-semibold text-success-600">
                                        {usageCount > 0 ? 'Active' : 'Unused'}
                                    </p>
                                </div>
                            </div>

                            {usageCount === 0 && (
                                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <Icons.AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-yellow-900">
                                        <strong>Notice:</strong> This permission is not currently assigned to any roles.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Assigned Roles */}
                        {roles.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Icons.Shield className="w-5 h-5 text-secondary-600" />
                                    Assigned to Roles ({roles.length})
                                </h3>

                                <div className="space-y-2">
                                    {roles.map((role) => (
                                        <div
                                            key={role.id}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-secondary-300 transition-colors"
                                        >
                                            <div className="p-2 bg-secondary rounded-lg">
                                                <Icons.Users className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{role.name}</p>
                                                <p className="text-xs text-gray-500">Role ID: #{role.id}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Permission Breakdown */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Icons.Code className="w-5 h-5 text-secondary-600" />
                                Technical Details
                            </h3>

                            <div className="p-4 bg-gray-900 rounded-lg">
                                <div className="space-y-2 font-mono text-sm">
                                    <div className="flex">
                                        <span className="text-gray-400 w-24">ID:</span>
                                        <span className="text-success-400">{permission.id}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-400 w-24">Name:</span>
                                        <span className="text-primary-400">"{permission.name}"</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-400 w-24">Group:</span>
                                        <span className="text-yellow-400">"{permission.groupName}"</span>
                                    </div>
                                    {permission._count && (
                                        <div className="flex">
                                            <span className="text-gray-400 w-24">Usage:</span>
                                            <span className="text-secondary-400">{permission._count.rolePermissions} roles</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t bg-gray-50">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Permission ID: #{permission.id}</span>
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
    multiline = false
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    multiline?: boolean;
}) {
    return (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-2">
                <div className="text-secondary-600 mt-0.5">{icon}</div>
                <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 block mb-1">{label}</span>
                    <p className={`text-gray-900 ${multiline ? 'text-sm' : ''}`}>
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
