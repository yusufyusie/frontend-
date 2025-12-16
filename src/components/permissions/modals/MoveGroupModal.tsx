'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';

interface MoveGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMoveGroup: (groupName: string) => Promise<void>;
    selectedCount: number;
    existingGroups: string[];
}

export function MoveGroupModal({
    isOpen,
    onClose,
    onMoveGroup,
    selectedCount,
    existingGroups,
}: MoveGroupModalProps) {
    const [groupName, setGroupName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setGroupName('');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupName) return;

        try {
            setSubmitting(true);
            await onMoveGroup(groupName);
            onClose();
        } catch (error) {
            // Error is already handled in the hook
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Move to Group"
        >
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <p className="text-gray-600 mb-4">
                        Move {selectedCount} selected permission(s) to a new group:
                    </p>
                    <FormInput
                        label="Group Name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Enter group name..."
                        list="existing-groups"
                        required
                        disabled={submitting}
                    />
                    <datalist id="existing-groups">
                        {existingGroups.map(group => (
                            <option key={group} value={group} />
                        ))}
                    </datalist>
                </div>
                <div className="flex gap-3 justify-end">
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
                        disabled={!groupName || submitting}
                    >
                        {submitting ? 'Moving...' : 'Move'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
