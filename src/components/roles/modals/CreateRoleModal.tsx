'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import type { CreateRoleData } from '@/services/roles.service';

interface CreateRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: CreateRoleData) => Promise<void>;
}

export function CreateRoleModal({
    isOpen,
    onClose,
    onCreate,
}: CreateRoleModalProps) {
    const [formData, setFormData] = useState<CreateRoleData>({
        name: '',
        description: ''
    });
    const [errors, setErrors] = useState<Partial<CreateRoleData>>({});
    const [submitting, setSubmitting] = useState(false);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', description: '' });
            setErrors({});
        }
    }, [isOpen]);

    const validate = () => {
        const newErrors: Partial<CreateRoleData> = {};
        if (!formData.name) newErrors.name = 'Name is required';
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
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Role">
            <form onSubmit={handleSubmit}>
                <FormInput
                    label="Role Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    placeholder="e.g., Manager, Editor, Viewer"
                    required
                    disabled={submitting}
                />

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-error-500">*</span>
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the purpose of this role..."
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 outline-none"
                        disabled={submitting}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-error-600">{errors.description}</p>
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
                        {submitting ? 'Creating...' : 'Create Role'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
