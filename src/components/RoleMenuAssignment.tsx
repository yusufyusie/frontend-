'use client';

import React, { useState, useEffect } from 'react';
import { MenuTreeSelector } from './MenuTreeSelector';
import { menuService, MenuItem } from '@/services/menu.service';
import { LoadingSpinner } from './LoadingSpinner';
import { toast } from '@/components/Toast';
import { Check, X, AlertCircle, CheckCircle, Layers, TrendingUp, ChevronRight } from 'lucide-react';

interface RoleMenuAssignmentProps {
    roleId: number;
    roleName: string;
}

export function RoleMenuAssignment({ roleId, roleName }: RoleMenuAssignmentProps) {
    const [allMenus, setAllMenus] = useState<MenuItem[]>([]);
    const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);
    const [initialMenuIds, setInitialMenuIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Load menus on mount
    useEffect(() => {
        loadMenus();
    }, [roleId]);

    const loadMenus = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load all menus and assigned menus for this role
            const [allMenusData, assignedMenus] = await Promise.all([
                menuService.getAllMenusFlat(),
                menuService.getMenusByRole(roleId),
            ]);

            setAllMenus(allMenusData);
            const assignedIds = assignedMenus.map(m => m.id);
            setSelectedMenuIds(assignedIds);
            setInitialMenuIds(assignedIds);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load menus');
            toast.error('Menu synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (selectedMenuIds.length === 0) {
            setError('Please select at least one menu');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            await menuService.assignMenusToRole(roleId, selectedMenuIds);

            setInitialMenuIds(selectedMenuIds);
            setSuccess(true);

            // Reload page to refresh sidebar
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to assign menus');
            toast.error('Assignment update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setSelectedMenuIds(initialMenuIds);
        setError(null);
        setSuccess(false);
    };

    const hasChanges = JSON.stringify(selectedMenuIds.sort()) !== JSON.stringify(initialMenuIds.sort());
    const selectionPercentage = allMenus.length > 0 ? Math.round((selectedMenuIds.length / allMenus.length) * 100) : 0;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                        <Layers className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping" />
                </div>
                <p className="text-sm font-medium text-gray-600">Loading menus...</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Modern Header Card with Role Badge */}
            <div className="bg-gradient-to-br from-primary-50 via-white to-primary-50/30 rounded-2xl p-5 border border-primary-100/50 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-600">Assigning menus to</span>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-md shadow-primary-500/20">
                                <Layers className="w-4 h-4 text-white" />
                                <span className="font-bold text-white text-sm">{roleName}</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Select the menus that users with this role can access
                        </p>
                    </div>

                    {/* Selection Statistics */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                                {selectedMenuIds.length}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                                of {allMenus.length}
                            </div>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600">Selection Progress</span>
                        <span className="text-xs font-bold text-primary-600">{selectionPercentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-full transition-all duration-500 ease-out shadow-sm"
                            style={{ width: `${selectionPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200 rounded-xl shadow-sm animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-red-900">Error</p>
                        <p className="text-sm text-red-700 mt-0.5">{error}</p>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-emerald-50/50 border border-emerald-200 rounded-xl shadow-sm animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-emerald-900">Success!</p>
                        <p className="text-sm text-emerald-700 mt-0.5">Menus assigned successfully. Refreshing...</p>
                    </div>
                </div>
            )}

            {/* Menu Tree Selector - NO nested scroll container */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <MenuTreeSelector
                    menus={allMenus}
                    selectedIds={selectedMenuIds}
                    onChange={setSelectedMenuIds}
                />
            </div>

            {/* Action Buttons - Conditional Footer */}
            {hasChanges && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-gray-200 animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Cancel Changes
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || selectedMenuIds.length === 0}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
                    >
                        {saving ? (
                            <>
                                <LoadingSpinner />
                                <span>Saving Changes...</span>
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Save Changes</span>
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* No Changes State */}
            {!hasChanges && !success && (
                <div className="text-center py-3">
                    <p className="text-sm text-gray-500 font-medium">
                        Make changes to enable save button
                    </p>
                </div>
            )}
        </div>
    );
}
