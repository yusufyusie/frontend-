'use client';

import { Download, Plus } from 'lucide-react';
import { PermissionGate } from '@/components/PermissionGate';

/**
 * Props for the PermissionsPageHeader component
 */
interface PermissionsPageHeaderProps {
    onCreateClick: () => void;
    onExportClick: () => void;
}

/**
 * Page header component for Permissions Management
 * Provides navigation context and primary administration actions
 */
export function PermissionsPageHeader({ onCreateClick, onExportClick }: PermissionsPageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary">Permissions Management</h1>
                <p className="text-gray-500 mt-1">Audit, define, and synchronize granular system access control rules.</p>
            </div>
            <PermissionGate permission="Permission.Create">
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <button
                        onClick={onExportClick}
                        className="btn btn-secondary flex items-center justify-center gap-2 flex-1 md:flex-none"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={onCreateClick}
                        className="btn btn-primary flex items-center justify-center gap-2 flex-1 md:flex-none"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Rule</span>
                    </button>
                </div>
            </PermissionGate>
        </div>
    );
}
