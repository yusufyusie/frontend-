'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import type { Permission, CreatePermissionData } from '@/services/permissions.service';

interface EditPermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: number, data: Partial<CreatePermissionData>) => Promise<void>;
    permission: Permission | null;
    existingGroups: string[];
}

export function EditPermissionModal({
    isOpen,
    onClose,
    onUpdate,
    permission,
    existingGroups,
}: EditPermissionModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        groupName: '',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // Update form data when permission changes
    useEffect(() => {
        if (permission) {
            setFormData({
                name: permission.name,
                groupName: permission.groupName,
                description: permission.description
            });
        }
    }, [permission]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!permission) return;

        try {
            setSubmitting(true);
            await onUpdate(permission.id, formData);
            onClose();
        } catch (error) {
            // Error is already handled in the hook
        } finally {
            setSubmitting(false);
        }
    };

    if (!permission) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Permission">
            <form onSubmit={handleSubmit}>
                <FormInput
                    label="Permission Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={submitting}
                />

                <FormInput
                    label="Group Name"
                    value={formData.groupName}
                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                    required
                    disabled={submitting}
                    list="edit-group-suggestions"
                />
                <datalist id="edit-group-suggestions">
                    {existingGroups.map(group => (
                        <option key={group} value={group} />
                    ))}
                </datalist>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
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
