'use client';

import { PermissionGate } from '@/components/PermissionGate';
import { Plus } from 'lucide-react';

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
                    className="px-6 py-2 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl transition-all border border-teal-100 shadow-md active:scale-95 flex items-center gap-2 font-bold"
                    style={{ color: '#0C7C92', borderColor: '#0C7C9220' }}
                >
                    <Plus className="w-5 h-5" strokeWidth={3} />
                    Add Resource
                </button>
            </PermissionGate>
        </div>
    );
}
