'use client';

import { Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import type { CreatePermissionData } from '@/services/permissions.service';

/**
 * Props for the CreatePermissionModal component
 */
interface CreatePermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: CreatePermissionData) => Promise<void>;
    existingGroups: string[];
}

/**
 * Administrative interface for registering new security rules
 * Supports taxonomy-based grouping and business documentation requirements
 */
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

    // Synchronize form state on modal visibility changes
    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', groupName: '', description: '' });
            setErrors({});
        }
    }, [isOpen]);

    /**
     * Data integrity validation logic
     */
    const validate = () => {
        const newErrors: Partial<CreatePermissionData> = {};
        if (!formData.name) newErrors.name = 'System identifier is required';
        if (!formData.groupName) newErrors.groupName = 'Asset group assignment is required';
        if (!formData.description) newErrors.description = 'Business rationale is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Persistence logic for new rule registry
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);
            await onCreate(formData);
            onClose();
        } catch (error) {
            // Failure states managed via service notification layer
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Register Security Rule"
            description="Define a new granular access control point for the target resource."
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <FormInput
                    label="System Identifier (Resource.Action)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    placeholder="e.g., Financials.GenerateReport"
                    required
                    disabled={submitting}
                />

                <FormInput
                    label="Logical Asset Group"
                    value={formData.groupName}
                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                    error={errors.groupName}
                    placeholder="e.g., Finance, HR, Inventory"
                    required
                    disabled={submitting}
                    list="group-suggestions"
                />
                <datalist id="group-suggestions">
                    {existingGroups.map(group => (
                        <option key={group} value={group} />
                    ))}
                </datalist>

                <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest text-primary">
                        Business Purpose <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detail the exact resource access and capabilities this rule authorizes..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm text-gray-700 bg-gray-50/30"
                        disabled={submitting}
                    />
                    {errors.description && (
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight ml-1">{errors.description}</p>
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
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                <span>Register Rule</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
