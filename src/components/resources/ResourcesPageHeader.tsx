'use client';

import { PermissionGate } from '@/components/PermissionGate';

interface ResourcesPageHeaderProps {
    onCreateClick: () => void;
}

export function ResourcesPageHeader({ onCreateClick }: ResourcesPageHeaderProps) {
    return (
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-4xl font-bold text-gradient">Resources Management</h1>
                <p className="text-gray-600 mt-2">Manage framework-level business entities and their actions</p>
            </div>
            <PermissionGate permission="Resource.Create">
                <button
                    onClick={onCreateClick}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Resource
                </button>
            </PermissionGate>
        </div>
    );
}
