import { Key, Trash, X, Lock, CheckCircle2 } from 'lucide-react';

/**
 * Props for the RoleBulkActions component
 */
interface RoleBulkActionsProps {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onBulkDelete: () => void;
    onBulkAssignPermissions: () => void;
}

/**
 * Contextual action bar for bulk role management
 * Appears when multiple security roles are selected for processing
 */
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
        <div className="sticky top-4 z-40 animate-slide-up">
            <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-2 sm:p-3 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Multi-Selection Context */}
                    <div className="flex items-center gap-4 px-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-lg shadow-secondary/20">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white tracking-tight">
                                    {selectedCount} Role{selectedCount === 1 ? '' : 's'} Selected
                                </div>
                                {selectedCount < totalCount && (
                                    <button
                                        onClick={onSelectAll}
                                        className="text-[10px] font-bold text-secondary-400 hover:text-secondary-300 uppercase tracking-widest transition-colors block text-left"
                                    >
                                        Select All Modifiable ({totalCount})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Batch Transaction Controls */}
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 px-1">
                        <button
                            onClick={onBulkAssignPermissions}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest whitespace-nowrap"
                        >
                            <Key className="w-3.5 h-3.5" />
                            <span>Batch Permissions</span>
                        </button>
                        <button
                            onClick={onBulkDelete}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-900/50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest whitespace-nowrap"
                        >
                            <Trash className="w-3.5 h-3.5" />
                            <span>Delete All</span>
                        </button>
                        <div className="w-px h-8 bg-gray-800 mx-1 hidden sm:block" />
                        <button
                            onClick={onDeselectAll}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="Discard Selection"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
