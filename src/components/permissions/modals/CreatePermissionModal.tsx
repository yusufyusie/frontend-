'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import type { CreatePermissionData } from '@/services/permissions.service';

interface CreatePermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: CreatePermissionData) => Promise<void>;
    existingGroups: string[];
}

export function CreatePermissionModal({
    isOpen,
    onClose,
    onCreate,
    existingGroups,
}: CreatePermissionModalProps) {
    const [formData, setFormData] = useState<CreatePermissionData>({
        name: '',
        groupName: '',
        description: ''
    });
    const [errors, setErrors] = useState<Partial<CreatePermissionData>>({});
    const [submitting, setSubmitting] = useState(false);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', groupName: '', description: '' });
            setErrors({});
        }
    }, [isOpen]);

    const validate = () => {
        const newErrors: Partial<CreatePermissionData> = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.groupName) newErrors.groupName = 'Group is required';
        if (!formData.description) newErrors.description = 'Description is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);
            await onCreate(formData);
            onClose();
        } catch (error) {
            // Error is already handled in the hook
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Permission">
            <form onSubmit={handleSubmit}>
                <FormInput
                    label="Permission Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    placeholder="e.g., Report.Generate, Invoice.View"
                    required
                    disabled={submitting}
                />

                <FormInput
                    label="Group Name"
                    value={formData.groupName}
                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                    error={errors.groupName}
                    placeholder="e.g., Report, Invoice, User"
                    required
                    disabled={submitting}
                    list="group-suggestions"
                />
                <datalist id="group-suggestions">
                    {existingGroups.map(group => (
                        <option key={group} value={group} />
                    ))}
                </datalist>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe what this permission allows..."
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                        disabled={submitting}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                </div>

                <div className="flex gap-3 justify-end mt-6">
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
                        {submitting ? 'Creating...' : 'Create Permission'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
