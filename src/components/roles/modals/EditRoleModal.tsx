'use client';

import { Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import type { Role, CreateRoleData } from '@/services/roles.service';

/**
 * Props for the EditRoleModal component
 */
interface EditRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: number, data: Partial<CreateRoleData>) => Promise<void>;
    role: Role | null;
}

/**
 * Administrative interface for modifying existing security roles
 * Allows reconfiguration of role identifiers and business metadata
 */
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

    // Synchronize local state with selected descriptor
    useEffect(() => {
        if (role) {
            setFormData({
                name: role.name,
                description: role.description
            });
        }
    }, [role]);

    /**
     * Persist modifications to the registry
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;

        try {
            setSubmitting(true);
            await onUpdate(role.id, formData);
            onClose();
        } catch (error) {
            // Error states managed via centralized notification layer
        } finally {
            setSubmitting(false);
        }
    };

    if (!role) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Modify Security Role"
            description={`Updating Descriptor ID: ${role.id}`}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <FormInput
                    label="Role Identifier"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={submitting}
                />

                <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest text-primary">
                        Business Purpose Descriptor
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detail the scope and responsibilities of this descriptor..."
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
