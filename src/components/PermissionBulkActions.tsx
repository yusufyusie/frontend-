import { FolderInput, Trash, X, CheckCircle2 } from 'lucide-react';

/**
 * Props for the PermissionBulkActions component
 */
interface PermissionBulkActionsProps {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onBulkDelete: () => void;
    onBulkMoveGroup: () => void;
}

/**
 * Contextual action bar for processing multiple permissions simultaneously
 * Appears when one or more registry entries are selected
 */
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
        <div className="sticky top-4 z-40 animate-slide-up">
            <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-2 sm:p-3 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Selection Statistics */}
                    <div className="flex items-center gap-4 px-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white tracking-tight">
                                    {selectedCount} Rule{selectedCount === 1 ? '' : 's'} Staged
                                </div>
                                {selectedCount < totalCount && (
                                    <button
                                        onClick={onSelectAll}
                                        className="text-[10px] font-bold text-primary hover:text-primary-400 uppercase tracking-widest transition-colors block text-left"
                                    >
                                        Select All Registry ({totalCount})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Available Batch Operations */}
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 px-1">
                        <button
                            onClick={onBulkMoveGroup}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest whitespace-nowrap"
                        >
                            <FolderInput className="w-3.5 h-3.5" />
                            <span>Migrate Group</span>
                        </button>
                        <button
                            onClick={onBulkDelete}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-900/50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest whitespace-nowrap"
                        >
                            <Trash className="w-3.5 h-3.5" />
                            <span>Withdraw</span>
                        </button>
                        <div className="w-px h-8 bg-gray-800 mx-1 hidden sm:block" />
                        <button
                            onClick={onDeselectAll}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="Clear Selection"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
