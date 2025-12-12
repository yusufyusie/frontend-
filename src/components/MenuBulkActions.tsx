import React from 'react';
import * as Icons from 'lucide-react';

interface MenuBulkActionsProps {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onBulkDelete: () => void;
    onBulkToggleStatus: (isActive: boolean) => void;
}

export function MenuBulkActions({
    selectedCount,
    totalCount,
    onSelectAll,
    onDeselectAll,
    onBulkDelete,
    onBulkToggleStatus,
}: MenuBulkActionsProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="card mb-4">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-semibold text-sm">
                            {selectedCount}
                        </div>
                        <span className="font-medium text-gray-900">
                            {selectedCount} {selectedCount === 1 ? 'menu' : 'menus'} selected
                        </span>
                    </div>

                    {selectedCount < totalCount && (
                        <button
                            onClick={onSelectAll}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                        >
                            Select all {totalCount}
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onBulkToggleStatus(true)}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <Icons.Check className="w-4 h-4" />
                        Activate
                    </button>
                    <button
                        onClick={() => onBulkToggleStatus(false)}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <Icons.X className="w-4 h-4" />
                        Deactivate
                    </button>
                    <button
                        onClick={onBulkDelete}
                        className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                    >
                        <Icons.Trash2 className="w-4 h-4" />
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
