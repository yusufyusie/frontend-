import React from 'react';
import { Permission } from '@/services/permissions.service';
import { getGradientStyle } from '@/utils/color-generator';

interface PermissionCardProps {
    permission: Permission;
    isSelected: boolean;
    onSelect: (id: number) => void;
    onEdit: () => void;
    onDelete: () => void;
    onViewDetails: () => void;
}

export function PermissionCard({
    permission,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    onViewDetails,
}: PermissionCardProps) {
    const usageCount = permission._count?.rolePermissions || 0;

    return (
        <div
            className={`
                relative p-4 border-2 rounded-xl transition-all duration-200
                hover:shadow-lg hover:-translate-y-0.5
                ${isSelected
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-200'
                }
            `}
        >
            {/* Selection Checkbox */}
            <div className="absolute top-3 left-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(permission.id)}
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
            </div>

            {/* Group Badge */}
            <div className="flex justify-between items-start mb-3 ml-8">
                <div
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                    style={getGradientStyle(permission.groupName)}
                >
                    {permission.groupName}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1">
                    <button
                        onClick={onEdit}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                        title="Edit"
                    >
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={onViewDetails}
                        className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors group"
                        title="View Details"
                    >
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Delete"
                    >
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Permission Info */}
            <div className="ml-8">
                <h3 className="font-bold text-gray-900 mb-1 text-lg">{permission.displayName || permission.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{permission.description}</p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                        {permission.name}
                    </code>

                    {usageCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span>{usageCount} {usageCount === 1 ? 'role' : 'roles'}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
