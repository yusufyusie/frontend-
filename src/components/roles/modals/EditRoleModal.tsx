'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import type { Role, CreateRoleData } from '@/services/roles.service';

interface EditRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: number, data: Partial<CreateRoleData>) => Promise<void>;
    role: Role | null;
}

export function EditRoleModal({
    isOpen,
    onClose,
    onUpdate,
    role,
}: EditRoleModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Update form data when role changes
    useEffect(() => {
        if (role) {
            setFormData({
                name: role.name,
                description: role.description
            });
        }
    }, [role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;

        try {
            setSubmitting(true);
            await onUpdate(role.id, formData);
            onClose();
        } catch (error) {
            // Error is already handled in the hook
        } finally {
            setSubmitting(false);
        }
    };

    if (!role) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Role">
            <form onSubmit={handleSubmit}>
                <FormInput
                    label="Role Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                        disabled={submitting}
                    />
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
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
