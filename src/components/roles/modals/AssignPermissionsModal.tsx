'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { PermissionMatrix } from '@/components/PermissionMatrix';
import { ResourceActionMatrix } from '@/components/ResourceActionMatrix';
import { PermissionTemplates } from '@/components/PermissionTemplates';
import { PermissionImpactPreview } from '@/components/PermissionImpactPreview';

// Sub-components
import { ViewModeToggle } from './assign-permissions/ViewModeToggle';
import { PermissionCounter } from './assign-permissions/PermissionCounter';
import { AssignmentFooter } from './assign-permissions/AssignmentFooter';

// Hooks
import { usePermissionAssignment } from '@/hooks/roles/usePermissionAssignment';

import type { Role } from '@/services/roles.service';
import type { Permission } from '@/services/permissions.service';

interface AssignPermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (roleId: number, permissionIds: number[]) => Promise<void>;
    role: Role | null;
    permissions: Permission[];
}

export function AssignPermissionsModal({
    isOpen,
    onClose,
    onAssign,
    role,
    permissions,
}: AssignPermissionsModalProps) {
    const [submitting, setSubmitting] = useState(false);

    // Use the permission assignment hook
    const assignment = usePermissionAssignment(role?.permissions, permissions);

    if (!role) return null;

    const handlePreviewChanges = () => {
        assignment.setShowImpactPreview(true);
    };

    const handleConfirmChanges = async () => {
        try {
            setSubmitting(true);
            await onAssign(role.id, assignment.selectedPermissionIds);
            assignment.setShowImpactPreview(false);
            onClose();
        } catch (error) {
            // Error handled in hook
        } finally {
            setSubmitting(false);
        }
    };

    // Get affected users count
    const affectedUsersCount = role._count?.userRoles || 0;

    // Footer content
    const footerContent = (
        <AssignmentFooter
            hasChanges={assignment.hasChanges}
            onReset={assignment.resetChanges}
            onPreview={handlePreviewChanges}
            submitting={submitting}
        />
    );

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={`Assign Permissions: ${role.name}`}
                size="xl"
                footer={footerContent}
            >
                <div className="space-y-6">
                    {/* Header with View Toggle and Actions */}
                    <div className="flex items-center justify-between pb-4 border-b">
                        <div className="flex items-center gap-4">
                            {/* View Mode Toggle */}
                            <ViewModeToggle
                                viewMode={assignment.viewMode}
                                onViewModeChange={assignment.setViewMode}
                            />

                            {/* Templates Toggle */}
                            <button
                                onClick={() => assignment.setShowTemplates(!assignment.showTemplates)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${assignment.showTemplates
                                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    {assignment.showTemplates ? 'Hide Templates' : 'Show Templates'}
                                </div>
                            </button>
                        </div>

                        {/* Permission Counter */}
                        <PermissionCounter
                            selectedCount={assignment.selectedPermissionIds.length}
                            totalCount={permissions.length}
                            hasChanges={assignment.hasChanges}
                        />
                    </div>

                    {/* Permission Templates */}
                    {assignment.showTemplates && (
                        <div className="animate-fade-in">
                            <PermissionTemplates
                                permissions={permissions}
                                onApplyTemplate={assignment.applyTemplate}
                            />
                        </div>
                    )}

                    {/* Permission Selection (Matrix or List) */}
                    <div className="border-t pt-6">
                        {assignment.viewMode === 'matrix' ? (
                            <ResourceActionMatrix
                                permissions={permissions}
                                selectedPermissions={assignment.selectedPermissionIds}
                                onChange={assignment.setSelectedPermissionIds}
                            />
                        ) : (
                            <PermissionMatrix
                                permissions={permissions}
                                selectedPermissions={assignment.selectedPermissionIds}
                                onChange={assignment.setSelectedPermissionIds}
                                disabled={submitting}
                            />
                        )}
                    </div>
                </div>
            </Modal>

            {/* Impact Preview Modal */}
            <PermissionImpactPreview
                isOpen={assignment.showImpactPreview}
                onClose={() => assignment.setShowImpactPreview(false)}
                onConfirm={handleConfirmChanges}
                roleName={role.name}
                permissions={permissions}
                originalPermissionIds={assignment.selectedPermissionIds.filter(id =>
                    !assignment.addedPermissions.includes(id)
                )}
                newPermissionIds={assignment.selectedPermissionIds}
                affectedUsersCount={affectedUsersCount}
            />
        </>
    );
}
