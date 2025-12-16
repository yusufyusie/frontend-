'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import { MultiSelect } from '@/components/MultiSelect';
import * as Icons from 'lucide-react';
import type { Resource, CreateResourceData } from '@/services/resource.service';

const availableIcons = [
    'Package', 'FileText', 'Users', 'ShoppingCart', 'DollarSign',
    'Calendar', 'Mail', 'Phone', 'Archive', 'Briefcase',
    'Database', 'Server', 'Shield', 'Settings', 'Tool', 'Zap'
];

const availableActions = ['View', 'Create', 'Update', 'Delete', 'Export', 'Import', 'Approve', 'Reject'];

interface ResourceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateResourceData) => Promise<void>;
    mode: 'create' | 'edit';
    resource?: Resource;
}

export function ResourceFormModal({
    isOpen,
    onClose,
    onSubmit,
    mode,
    resource,
}: ResourceFormModalProps) {
    const [formData, setFormData] = useState<CreateResourceData>({
        name: '',
        displayName: '',
        description: '',
        category: '',
        iconName: 'Package',
        actions: [],
        isActive: true,
    });
    const [submitting, setSubmitting] = useState(false);

    // Initialize form with resource data when editing
    useEffect(() => {
        if (mode === 'edit' && resource) {
            setFormData({
                name: resource.name,
                displayName: resource.displayName,
                description: resource.description || '',
                category: resource.category || '',
                iconName: resource.iconName || 'Package',
                actions: resource.actions,
                isActive: resource.isActive,
            });
        } else if (mode === 'create') {
            setFormData({
                name: '',
                displayName: '',
                description: '',
                category: '',
                iconName: 'Package',
                actions: [],
                isActive: true,
            });
        }
    }, [mode, resource, isOpen]);

    const getIconComponent = (iconName: string) => {
        const IconComponent = (Icons as any)[iconName];
        return IconComponent ? <IconComponent className="w-6 h-6" /> : <Icons.Package className="w-6 h-6" />;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            await onSubmit(formData);
            onClose();
        } catch (error) {
            // Error handled in hook
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'Create Resource' : 'Edit Resource'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                    label="Resource Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Invoice, Product, Order"
                    required
                    disabled={submitting}
                />

                <FormInput
                    label="Display Name"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="e.g., Invoices, Products, Orders"
                    required
                    disabled={submitting}
                />

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe this resource..."
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                        disabled={submitting}
                    />
                </div>

                <FormInput
                    label="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Financial, Inventory, Sales"
                    disabled={submitting}
                />

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icon
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                        {availableIcons.map((icon) => (
                            <button
                                key={icon}
                                type="button"
                                onClick={() => setFormData({ ...formData, iconName: icon })}
                                className={`p-3 rounded-lg border-2 transition-all ${formData.iconName === icon
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                disabled={submitting}
                            >
                                {getIconComponent(icon)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Actions
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {availableActions.map((action) => (
                            <label
                                key={action}
                                className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={(formData.actions || []).includes(action)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFormData({
                                                ...formData,
                                                actions: [...(formData.actions || []), action],
                                            });
                                        } else {
                                            setFormData({
                                                ...formData,
                                                actions: (formData.actions || []).filter((a) => a !== action),
                                            });
                                        }
                                    }}
                                    className="w-4 h-4 rounded"
                                    disabled={submitting}
                                />
                                <span className="text-sm">{action}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 rounded"
                        disabled={submitting}
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Active
                    </label>
                </div>

                <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                    >
                        {submitting
                            ? mode === 'create'
                                ? 'Creating...'
                                : 'Saving...'
                            : mode === 'create'
                                ? 'Create Resource'
                                : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
