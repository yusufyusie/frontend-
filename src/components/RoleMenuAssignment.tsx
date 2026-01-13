'use client';

import React, { useState, useEffect } from 'react';
import { MenuTreeSelector } from './MenuTreeSelector';
import { menuService, MenuItem } from '@/services/menu.service';
import { LoadingSpinner } from './LoadingSpinner';
import { Check, X, AlertCircle } from 'lucide-react';

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
            console.error('Error loading menus:', err);
            setError(err.response?.data?.message || 'Failed to load menus');
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
            }, 1000);
        } catch (err: any) {
            console.error('Error assigning menus:', err);
            setError(err.response?.data?.message || 'Failed to assign menus');
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Menu Assignment</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Assign menus to the <span className="font-medium">{roleName}</span> role
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-error-50 border border-error-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0" />
                    <p className="text-sm text-error-700">{error}</p>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="flex items-center gap-3 p-4 bg-success-50 border border-success-200 rounded-lg">
                    <Check className="w-5 h-5 text-success-600 flex-shrink-0" />
                    <p className="text-sm text-success-700">Menus assigned successfully!</p>
                </div>
            )}

            {/* Menu Tree Selector */}
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg">
                <MenuTreeSelector
                    menus={allMenus}
                    selectedIds={selectedMenuIds}
                    onChange={setSelectedMenuIds}
                />
            </div>

            {/* Action Buttons - Always visible at bottom */}
            {hasChanges && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 bg-white sticky bottom-0">
                    <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-4 h-4 inline mr-1" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || selectedMenuIds.length === 0}
                        className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <LoadingSpinner />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
