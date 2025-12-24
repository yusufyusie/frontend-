import React from 'react';
import { Permission } from '@/services/permissions.service';

interface RoleBulkActionsProps {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onBulkDelete: () => void;
    onBulkAssignPermissions: () => void;
}

export function RoleBulkActions({
    selectedCount,
    totalCount,
    onSelectAll,
    onDeselectAll,
    onBulkDelete,
    onBulkAssignPermissions,
}: RoleBulkActionsProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="card mb-4">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary-500 text-white flex items-center justify-center font-semibold text-sm">
                            {selectedCount}
                        </div>
                        <span className="font-medium text-gray-900">
                            {selectedCount} {selectedCount === 1 ? 'role' : 'roles'} selected
                        </span>
                    </div>

                    {selectedCount < totalCount && (
                        <button
                            onClick={onSelectAll}
                            className="text-sm text-secondary-600 hover:text-secondary-700 font-medium transition-colors"
                        >
                            Select all {totalCount}
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onBulkAssignPermissions}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Assign Permissions
                    </button>
                    <button
                        onClick={onBulkDelete}
                        className="btn bg-error-600 hover:bg-error-700 text-white flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Selected
                    </button>
                    <button
                        onClick={onDeselectAll}
                        className="btn btn-secondary"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
}
