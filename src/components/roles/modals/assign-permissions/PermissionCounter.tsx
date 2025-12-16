'use client';

interface PermissionCounterProps {
    selectedCount: number;
    totalCount: number;
    hasChanges: boolean;
}

export function PermissionCounter({ selectedCount, totalCount, hasChanges }: PermissionCounterProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="text-sm">
                <span className="text-gray-600">Selected:</span>
                <span className="font-bold text-purple-600 ml-2">{selectedCount}</span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-gray-600">{totalCount}</span>
            </div>
            {hasChanges && (
                <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Unsaved Changes
                </div>
            )}
        </div>
    );
}
