import React from 'react';
import { MenuItem } from '@/services/menu.service';
import { getGradientStyle } from '@/utils/color-generator';
import * as Icons from 'lucide-react';

interface MenuCardProps {
    menu: MenuItem;
    isSelected: boolean;
    onSelect: (id: number) => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function MenuCard({
    menu,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
}: MenuCardProps) {
    const Icon = menu.icon ? (Icons as any)[menu.icon] : null;
    const childrenCount = menu._count?.children || 0;

    // Generate dynamic color for level badge
    const levelStyle = getGradientStyle(`Level-${menu.level}`);

    return (
        <div
            className={`
                card-gradient relative hover-lift transition-all duration-200
                ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
            `}
        >
            {/* Selection Checkbox */}
            <div className="absolute top-4 right-4 z-10">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(menu.id)}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
            </div>

            {/* Icon with Dynamic Color */}
            <div className="flex items-start justify-between mb-3">
                <div
                    className="p-3 rounded-xl shadow-md"
                    style={levelStyle}
                >
                    {Icon ? (
                        <Icon className="w-6 h-6 text-white" />
                    ) : (
                        <Icons.Menu className="w-6 h-6 text-white" />
                    )}
                </div>
                {menu.badge && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${menu.badgeColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                            menu.badgeColor === 'green' ? 'bg-green-100 text-green-800' :
                                menu.badgeColor === 'red' ? 'bg-red-100 text-red-800' :
                                    menu.badgeColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                        }`}>
                        {menu.badge}
                    </span>
                )}
            </div>

            {/* Menu Info */}
            <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{menu.name}</h3>
                {menu.parent && (
                    <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
                )}
            </div>

            {menu.path && (
                <p className="text-sm text-gray-500 mb-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{menu.path}</code>
                </p>
            )}

            {menu.description && (
                <p className="text-gray-600 mb-3 text-sm line-clamp-2">{menu.description}</p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm">
                <div
                    className="px-3 py-1 rounded-full font-medium shadow-sm"
                    style={levelStyle}
                >
                    <span className="text-white">Level {menu.level}</span>
                </div>
                {menu.parent && (
                    <div className="flex items-center gap-1 text-gray-600">
                        <Icons.Folder className="w-4 h-4" />
                        <span>{menu.parent.name}</span>
                    </div>
                )}
                {childrenCount > 0 && (
                    <div className="flex items-center gap-1 text-gray-600">
                        <Icons.List className="w-4 h-4" />
                        <span>{childrenCount} {childrenCount === 1 ? 'child' : 'children'}</span>
                    </div>
                )}
            </div>

            {/* Status */}
            <div className="mb-4">
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${menu.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                    {menu.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                    onClick={onEdit}
                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                    <Icons.Edit className="w-4 h-4" />
                    Edit
                </button>
                <button
                    onClick={onDelete}
                    className="flex-1 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                    <Icons.Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </div>
        </div>
    );
}
