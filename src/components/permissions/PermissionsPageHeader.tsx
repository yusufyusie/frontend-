'use client';

import { PermissionGate } from '@/components/PermissionGate';

interface PermissionsPageHeaderProps {
    onCreateClick: () => void;
    onExportClick: () => void;
}

export function PermissionsPageHeader({ onCreateClick, onExportClick }: PermissionsPageHeaderProps) {
    return (
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-4xl font-bold text-gradient">Permissions Management</h1>
                <p className="text-gray-600 mt-2">Define and organize system permissions dynamically</p>
            </div>
            <PermissionGate permission="Permission.Create">
                <div className="flex gap-2">
                    <button
                        onClick={onExportClick}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                    <button
                        onClick={onCreateClick}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Permission
                    </button>
                </div>
            </PermissionGate>
        </div>
    );
}
