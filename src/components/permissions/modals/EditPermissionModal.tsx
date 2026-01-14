'use client';

import { Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import type { Permission, CreatePermissionData } from '@/services/permissions.service';

/**
 * Props for the EditPermissionModal component
 */
interface EditPermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: number, data: Partial<CreatePermissionData>) => Promise<void>;
    permission: Permission | null;
    existingGroups: string[];
}

/**
 * Administrative interface for modifying existing security rules
 * Allows reconfiguration of system identifiers and business metadata
 */
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

    // Synchronize local state with selected registry entry
    useEffect(() => {
        if (permission) {
            setFormData({
                name: permission.name,
                groupName: permission.groupName,
                description: permission.description
            });
        }
    }, [permission]);

    /**
     * Persist modifications to the registry
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!permission) return;

        try {
            setSubmitting(true);
            await onUpdate(permission.id, formData);
            onClose();
        } catch (error) {
            // Error states managed via centralized notification layer
        } finally {
            setSubmitting(false);
        }
    };

    if (!permission) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Modify Security Rule"
            description={`Updating Registry ID: ${permission.id}`}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <FormInput
                    label="System Identifier (Resource.Action)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={submitting}
                />

                <FormInput
                    label="Logical Asset Group"
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

                <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest text-primary">
                        Business Purpose
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detail the exact resource access and capabilities..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-gray-700 bg-gray-50/30"
                        disabled={submitting}
                    />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary flex items-center gap-2"
                        disabled={submitting}
                    >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary flex items-center gap-2"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
