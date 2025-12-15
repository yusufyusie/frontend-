'use client';

import { useMemo } from 'react';
import { Permission } from '@/services/permissions.service';
import * as Icons from 'lucide-react';

interface PermissionTemplate {
    id: string;
    name: string;
    description: string;
    icon: JSX.Element;
    color: string;
    apply: (permissions: Permission[]) => number[];
}

interface PermissionTemplatesProps {
    permissions: Permission[];
    onApplyTemplate: (permissionIds: number[]) => void;
}

export function PermissionTemplates({ permissions, onApplyTemplate }: PermissionTemplatesProps) {
    const templates: PermissionTemplate[] = useMemo(() => [
        {
            id: 'read-only',
            name: 'Read-Only User',
            description: 'View access to all resources',
            icon: <Icons.Eye className="w-5 h-5" />,
            color: 'from-blue-500 to-cyan-500',
            apply: (perms) => perms
                .filter(p => p.name.endsWith('.View'))
                .map(p => p.id),
        },
        {
            id: 'content-editor',
            name: 'Content Editor',
            description: 'Create, view, and edit content',
            icon: <Icons.Edit className="w-5 h-5" />,
            color: 'from-yellow-500 to-orange-500',
            apply: (perms) => perms
                .filter(p => {
                    const [resource, action] = p.name.split('.');
                    return ['View', 'Create', 'Edit'].includes(action) &&
                        !['User', 'Role', 'Permission'].includes(resource);
                })
                .map(p => p.id),
        },
        {
            id: 'manager',
            name: 'Manager',
            description: 'Full access except system config',
            icon: <Icons.Briefcase className="w-5 h-5" />,
            color: 'from-green-500 to-teal-500',
            apply: (perms) => perms
                .filter(p => {
                    const [resource] = p.name.split('.');
                    return !['Permission', 'Role'].includes(resource);
                })
                .map(p => p.id),
        },
        {
            id: 'admin',
            name: 'Administrator',
            description: 'Complete system access',
            icon: <Icons.Crown className="w-5 h-5" />,
            color: 'from-purple-500 to-pink-500',
            apply: (perms) => perms.map(p => p.id),
        },
        {
            id: 'analyst',
            name: 'Analyst',
            description: 'View and export permissions',
            icon: <Icons.BarChart className="w-5 h-5" />,
            color: 'from-indigo-500 to-blue-500',
            apply: (perms) => perms
                .filter(p => {
                    const action = p.name.split('.')[1];
                    return ['View', 'Export'].includes(action);
                })
                .map(p => p.id),
        },
        {
            id: 'none',
            name: 'Clear All',
            description: 'Remove all permissions',
            icon: <Icons.X className="w-5 h-5" />,
            color: 'from-gray-500 to-gray-600',
            apply: () => [],
        },
    ], []);

    const getTemplateStats = (template: PermissionTemplate) => {
        const permissionIds = template.apply(permissions);
        return permissionIds.length;
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
                <Icons.Zap className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Quick Templates</h3>
                <p className="text-sm text-gray-500">Apply pre-configured permission sets</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {templates.map((template) => {
                    const count = getTemplateStats(template);

                    return (
                        <button
                            key={template.id}
                            onClick={() => onApplyTemplate(template.apply(permissions))}
                            className="relative group overflow-hidden rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-all duration-200 hover:shadow-lg"
                        >
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                            {/* Content */}
                            <div className="relative p-4 flex flex-col items-center text-center gap-2">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${template.color} shadow-lg group-hover:scale-110 transition-transform`}>
                                    <div className="text-white">
                                        {template.icon}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">
                                        {template.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {template.description}
                                    </p>
                                </div>

                                {/* Permission Count Badge */}
                                <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                                    {count} {count === 1 ? 'permission' : 'permissions'}
                                </div>
                            </div>

                            {/* Hover Effect */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                        </button>
                    );
                })}
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Icons.Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                    <strong>Tip:</strong> Templates provide a quick starting point. You can always fine-tune permissions after applying a template.
                </div>
            </div>
        </div>
    );
}
