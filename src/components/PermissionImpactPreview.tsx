'use client';

import { useMemo } from 'react';
import { Permission } from '@/services/permissions.service';
import { Modal } from './Modal';
import * as Icons from 'lucide-react';

interface PermissionImpactPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    roleName: string;
    permissions: Permission[];
    originalPermissionIds: number[];
    newPermissionIds: number[];
    affectedUsersCount?: number;
}

export function PermissionImpactPreview({
    isOpen,
    onClose,
    onConfirm,
    roleName,
    permissions,
    originalPermissionIds,
    newPermissionIds,
    affectedUsersCount = 0,
}: PermissionImpactPreviewProps) {
    const changes = useMemo(() => {
        const original = new Set(originalPermissionIds);
        const updated = new Set(newPermissionIds);

        const added = permissions.filter(p => updated.has(p.id) && !original.has(p.id));
        const removed = permissions.filter(p => original.has(p.id) && !updated.has(p.id));
        const unchanged = originalPermissionIds.filter(id => updated.has(id)).length;

        // Group by category
        const groupByCategory = (perms: Permission[]) => {
            const grouped = new Map<string, Permission[]>();
            perms.forEach(p => {
                const group = p.groupName || 'Other';
                if (!grouped.has(group)) grouped.set(group, []);
                grouped.get(group)!.push(p);
            });
            return grouped;
        };

        return {
            added: groupByCategory(added),
            removed: groupByCategory(removed),
            unchanged,
            totalChanges: added.length + removed.length,
        };
    }, [permissions, originalPermissionIds, newPermissionIds]);

    const getImpactLevel = () => {
        if (changes.totalChanges === 0) return { level: 'none', color: 'gray', message: 'No changes detected' };
        if (changes.totalChanges <= 3) return { level: 'low', color: 'green', message: 'Minor changes' };
        if (changes.totalChanges <= 10) return { level: 'medium', color: 'yellow', message: 'Moderate changes' };
        return { level: 'high', color: 'red', message: 'Significant changes' };
    };

    const impact = getImpactLevel();

    const renderPermissionGroup = (grouped: Map<string, Permission[]>, type: 'added' | 'removed') => {
        if (grouped.size === 0) return null;

        const bgColor = type === 'added' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
        const iconColor = type === 'added' ? 'text-green-600' : 'text-red-600';
        const icon = type === 'added' ? <Icons.PlusCircle className="w-5 h-5" /> : <Icons.MinusCircle className="w-5 h-5" />;

        return (
            <div className="space-y-3">
                {Array.from(grouped.entries()).map(([category, perms]) => (
                    <div key={category} className={`p-3 rounded-lg border ${bgColor}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className={iconColor}>{icon}</div>
                            <span className="font-semibold text-gray-800">{category}</span>
                            <span className="text-xs text-gray-500">({perms.length})</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-7">
                            {perms.map(p => (
                                <div key={p.id} className="flex items-center gap-2 text-sm">
                                    <Icons.Check className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-700">{p.displayName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Confirm Permission Changes for "${roleName}"`}
            size="lg"
        >
            <div className="space-y-6">
                {/* Impact Level Indicator */}
                <div className={`p-4 rounded-lg border-2 ${impact.color === 'green' ? 'bg-green-50 border-green-300' :
                        impact.color === 'yellow' ? 'bg-yellow-50 border-yellow-300' :
                            impact.color === 'red' ? 'bg-red-50 border-red-300' :
                                'bg-gray-50 border-gray-300'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${impact.color === 'green' ? 'bg-green-600' :
                                impact.color === 'yellow' ? 'bg-yellow-600' :
                                    impact.color === 'red' ? 'bg-red-600' :
                                        'bg-gray-600'
                            }`}>
                            {impact.color === 'red' ? (
                                <Icons.AlertTriangle className="w-5 h-5 text-white" />
                            ) : (
                                <Icons.Info className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <div>
                            <h4 className={`font-semibold ${impact.color === 'green' ? 'text-green-900' :
                                    impact.color === 'yellow' ? 'text-yellow-900' :
                                        impact.color === 'red' ? 'text-red-900' :
                                            'text-gray-900'
                                }`}>
                                {impact.message}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                                {changes.totalChanges} total changes • {affectedUsersCount} users affected
                            </p>
                        </div>
                    </div>
                </div>

                {/* Changes Summary */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Icons.PlusCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Adding</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            {Array.from(changes.added.values()).reduce((sum, perms) => sum + perms.length, 0)}
                        </p>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Icons.MinusCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-gray-700">Removing</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">
                            {Array.from(changes.removed.values()).reduce((sum, perms) => sum + perms.length, 0)}
                        </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Icons.Check className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Unchanged</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{changes.unchanged}</p>
                    </div>
                </div>

                {/* Detailed Changes */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {/* Added Permissions */}
                    {changes.added.size > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Icons.PlusCircle className="w-5 h-5 text-green-600" />
                                New Permissions
                            </h4>
                            {renderPermissionGroup(changes.added, 'added')}
                        </div>
                    )}

                    {/* Removed Permissions */}
                    {changes.removed.size > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Icons.MinusCircle className="w-5 h-5 text-red-600" />
                                Removed Permissions
                            </h4>
                            {renderPermissionGroup(changes.removed, 'removed')}
                        </div>
                    )}

                    {/* No Changes */}
                    {changes.totalChanges === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <Icons.AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p>No permission changes detected</p>
                        </div>
                    )}
                </div>

                {/* Warning for significant changes */}
                {impact.color === 'red' && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <Icons.AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-900">
                            <strong>Warning:</strong> This is a significant change affecting {affectedUsersCount} users.
                            Please review the changes carefully before confirming.
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={changes.totalChanges === 0}
                        className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${changes.totalChanges === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Icons.Check className="w-4 h-4" />
                            Confirm Changes
                        </div>
                    </button>
                </div>
            </div>
        </Modal>
    );
}
