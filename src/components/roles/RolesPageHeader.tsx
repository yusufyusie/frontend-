'use client';

import { Download, Plus } from 'lucide-react';
import { PermissionGate } from '@/components/PermissionGate';

/**
 * Props for the RolesPageHeader component
 */
interface RolesPageHeaderProps {
    onCreateClick: () => void;
    onExportClick: () => void;
}

/**
 * Page header component for Roles Management
 * Handles primary actions like creating new roles and exporting data
 */
export function RolesPageHeader({ onCreateClick, onExportClick }: RolesPageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary">Roles Management</h1>
                <p className="text-gray-500 mt-1">Configure system security roles and manage hierarchical access control.</p>
            </div>
            <PermissionGate permission="Role.Create">
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
                        <span>Create Role</span>
                    </button>
                </div>
            </PermissionGate>
        </div>
    );
}
