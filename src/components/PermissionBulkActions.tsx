import React from 'react';

interface PermissionBulkActionsProps {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onBulkDelete: () => void;
    onBulkMoveGroup: () => void;
}

export function PermissionBulkActions({
    selectedCount,
    totalCount,
    onSelectAll,
    onDeselectAll,
    onBulkDelete,
    onBulkMoveGroup,
}: PermissionBulkActionsProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="card mb-4">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-sm">
                            {selectedCount}
                        </div>
                        <span className="font-medium text-gray-900">
                            {selectedCount} {selectedCount === 1 ? 'permission' : 'permissions'} selected
                        </span>
                    </div>

                    {selectedCount < totalCount && (
                        <button
                            onClick={onSelectAll}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        >
                            Select all {totalCount}
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onBulkMoveGroup}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        Move to Group
                    </button>
                    <button
                        onClick={onBulkDelete}
                        className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
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
