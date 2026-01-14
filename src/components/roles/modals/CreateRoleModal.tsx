'use client';

import { Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import type { CreateRoleData } from '@/services/roles.service';

/**
 * Props for the CreateRoleModal component
 */
interface CreateRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: CreateRoleData) => Promise<void>;
}

/**
 * Administrative interface for initializing new security roles
 * Orchestrates the creation of role descriptors and associated metadata
 */
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

    // Synchronize form state on visibility toggle
    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', description: '' });
            setErrors({});
        }
    }, [isOpen]);

    /**
     * Validate form inputs against business rules
     */
    const validate = () => {
        const newErrors: Partial<CreateRoleData> = {};
        if (!formData.name) newErrors.name = 'Role identifier is required';
        if (!formData.description) newErrors.description = 'Business intent description is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Persist new role descriptor to the registry
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);
            await onCreate(formData);
            onClose();
        } catch (error) {
            // Error states managed via centralized notification layer
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Initialize Security Role"
            description="Define a new administrative or operational descriptor"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <FormInput
                    label="Role Identifier"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    placeholder="e.g., SYSTEM_ADMIN, SECURITY_MANAGER"
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
                        placeholder="Define the scope and responsibilities of this descriptor..."
                        rows={3}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none text-sm text-gray-700 bg-gray-50/30 ${errors.description
                                ? 'border-red-100 focus:border-red-200 focus:ring-red-50'
                                : 'border-gray-100 focus:border-primary/20 focus:ring-4 focus:ring-primary/5'
                            }`}
                        disabled={submitting}
                    />
                    {errors.description && (
                        <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.description}</p>
                    )}
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
                                <span>Initializing...</span>
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                <span>Create Role Descriptor</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
