'use client';

import { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { Permission } from '@/services/permissions.service';
import { permissionTemplatesService, PermissionTemplate } from '@/services/permission-templates.service';

interface PermissionTemplatesProps {
    permissions: Permission[];
    onApplyTemplate: (permissionIds: number[]) => void;
}

export function PermissionTemplates({ permissions, onApplyTemplate }: PermissionTemplatesProps) {
    const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<number | null>(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await permissionTemplatesService.getAll();
            setTemplates(data);
        } catch (error) {
            console.error('Failed to load permission templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (template: PermissionTemplate) => {
        try {
            setApplying(template.id);
            const permissionIds = await permissionTemplatesService.evaluate(template.id);
            onApplyTemplate(permissionIds);
        } catch (error) {
            console.error('Failed to apply template:', error);
        } finally {
            setApplying(null);
        }
    };

    const handleClearAll = () => {
        onApplyTemplate([]);
    };

    const getIcon = (iconName: string) => {
        const Icon = (Icons as any)[iconName];
        return Icon ? <Icon className="w-5 h-5" /> : <Icons.Shield className="w-5 h-5" />;
    };

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Loading templates...</div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
                <Icons.Zap className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Quick Templates</h3>
                <p className="text-sm text-gray-500">Apply pre-configured permission sets</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {templates.map((template) => (
                    <button
                        key={template.id}
                        onClick={() => handleApply(template)}
                        disabled={applying !== null}
                        className="relative group overflow-hidden rounded-xl border-2 border-gray-200 hover:border-purple-500 transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                    >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${template.color || 'from-gray-500 to-gray-600'} opacity-0 group-hover:opacity-10 transition-opacity`} />

                        {/* Content */}
                        <div className="relative p-4 flex flex-col items-center text-center gap-2">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${template.color || 'from-gray-500 to-gray-600'} shadow-lg group-hover:scale-110 transition-transform`}>
                                <div className="text-white">
                                    {getIcon(template.icon)}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm">
                                    {template.name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {template.description}
                                </p>
                            </div>

                            {applying === template.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                                </div>
                            )}
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </button>
                ))}

                {/* Clear All Option */}
                <button
                    onClick={handleClearAll}
                    className="relative group overflow-hidden rounded-xl border-2 border-gray-200 hover:border-red-500 transition-all duration-200 hover:shadow-lg"
                >
                    <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-4 flex flex-col items-center text-center gap-2">
                        <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-red-100 transition-colors">
                            <Icons.X className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm group-hover:text-red-700">
                                Clear All
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 group-hover:text-red-600">
                                Remove all permissions
                            </p>
                        </div>
                    </div>
                </button>
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
