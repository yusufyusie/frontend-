'use client';

import { FolderInput, X, MoveRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';

/**
 * Props for the MoveGroupModal component
 */
interface MoveGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMoveGroup: (groupName: string) => Promise<void>;
    selectedCount: number;
    existingGroups: string[];
}

/**
 * Administrative tool for bulk re-assignment of permissions to logical groups
 * Orchestrates taxonomy migration for selected registry entries
 */
export function MoveGroupModal({
    isOpen,
    onClose,
    onMoveGroup,
    selectedCount,
    existingGroups,
}: MoveGroupModalProps) {
    const [groupName, setGroupName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Synchronize form state on visibility toggle
    useEffect(() => {
        if (!isOpen) {
            setGroupName('');
        }
    }, [isOpen]);

    /**
     * Persist taxonomy migration
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupName) return;

        try {
            setSubmitting(true);
            await onMoveGroup(groupName);
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
            title="Update Taxonomy"
            description={`Migrating ${selectedCount} registry entry${selectedCount !== 1 ? 'ies' : ''}`}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <FolderInput className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs font-medium text-gray-600 leading-relaxed uppercase tracking-wide">
                        You are re-assigning <span className="text-primary font-bold">{selectedCount}</span> staged rule{selectedCount !== 1 ? 's' : ''} to a new logical asset group.
                    </p>
                </div>

                <FormInput
                    label="Target Logical Group"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter or select target group..."
                    list="existing-groups-taxonomy"
                    required
                    disabled={submitting}
                />
                <datalist id="existing-groups-taxonomy">
                    {existingGroups.map(group => (
                        <option key={group} value={group} />
                    ))}
                </datalist>

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
                        disabled={!groupName || submitting}
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Migrating...</span>
                            </>
                        ) : (
                            <>
                                <MoveRight className="w-4 h-4" />
                                <span>Execute Migration</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
