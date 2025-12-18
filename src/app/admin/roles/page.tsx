'use client';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { RoleBulkActions } from '@/components/RoleBulkActions';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Modal } from '@/components/Modal';
import { RoleMenuAssignment } from '@/components/RoleMenuAssignment';

// Custom Hooks
import { useRoles } from '@/hooks/roles/useRoles';
import { useRoleFilters } from '@/hooks/roles/useRoleFilters';
import { useMultiSelect } from '@/hooks/shared/useMultiSelect';
import { useModalState } from '@/hooks/shared/useModalState';

// Page Components
import { RolesPageHeader } from '@/components/roles/RolesPageHeader';
import { RolesStatsCards } from '@/components/roles/RolesStatsCards';
import { RolesFilterBar } from '@/components/roles/RolesFilterBar';
import { RolesGrid } from '@/components/roles/RolesGrid';

// Modals
import { CreateRoleModal } from '@/components/roles/modals/CreateRoleModal';
import { EditRoleModal } from '@/components/roles/modals/EditRoleModal';
import { AssignPermissionsModal } from '@/components/roles/modals/AssignPermissionsModal';

import type { Role } from '@/services/roles.service';

/**
 * Roles Management Page
 * 
 * Orchestrates all role-related functionality using custom hooks
 * and presentational components following Single Responsibility Principle
 */
export default function AdminRolesPage() {
    // Data Management
    const {
        roles,
        permissions,
        stats,
        loading,
        create,
        update,
        delete: deleteRole,
        bulkDelete,
        assignPermissions,
        exportRoles,
    } = useRoles();

    // Filtering & Sorting
    const filters = useRoleFilters(roles);

    // Multi-Selection (only non-system roles can be selected)
    const selection = useMultiSelect(filters.selectableRoles);

    // Modal States
    const createModal = useModalState<void>();
    const editModal = useModalState<Role>();
    const deleteModal = useModalState<Role>();
    const bulkDeleteModal = useModalState<void>();
    const assignPermissionsModal = useModalState<Role>();
    const assignMenusModal = useModalState<Role>();

    /**
     * Handle delete role
     */
    const handleDelete = async () => {
        const role = deleteModal.selectedItem;
        if (!role) return;

        try {
            await deleteRole(role.id, role.name);
            deleteModal.close();
        } catch (error) {
            // Error handled in hook
        }
    };

    /**
     * Handle bulk delete
     */
    const handleBulkDelete = async () => {
        try {
            await bulkDelete(selection.selectedIdsArray);
            selection.clear();
            bulkDeleteModal.close();
        } catch (error) {
            // Error handled in hook
        }
    };

    /**
     * Handle assign permissions
     */
    const handleAssignPermissions = async (roleId: number, permissionIds: number[]) => {
        await assignPermissions(roleId, permissionIds);
    };

    // Loading State
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <RolesPageHeader
                onCreateClick={createModal.open}
                onExportClick={exportRoles}
            />

            {/* Stats Cards */}
            <RolesStatsCards
                stats={stats}
                selectedCount={selection.count}
            />

            {/* Bulk Actions */}
            <RoleBulkActions
                selectedCount={selection.count}
                totalCount={filters.selectableRoles.length}
                onSelectAll={selection.selectAll}
                onDeselectAll={selection.deselectAll}
                onBulkDelete={bulkDeleteModal.open}
                onBulkAssignPermissions={() => {
                    // For bulk assign, we would need a different modal
                    // For now, just show a toast
                    // Bulk permissions assignment not yet implemented
                }}
            />

            {/* Filter Bar */}
            <RolesFilterBar
                searchTerm={filters.searchTerm}
                setSearchTerm={filters.setSearchTerm}
                sortBy={filters.sortBy}
                setSortBy={filters.setSortBy}
            />

            {/* Roles Grid */}
            <RolesGrid
                roles={filters.filteredRoles}
                selectedIds={selection.selectedIds}
                onToggleSelect={selection.toggle}
                onEditClick={editModal.open}
                onDeleteClick={deleteModal.open}
                onAssignPermissionsClick={assignPermissionsModal.open}
                onAssignMenusClick={assignMenusModal.open}
            />

            {/* Modals */}
            <CreateRoleModal
                isOpen={createModal.isOpen}
                onClose={createModal.close}
                onCreate={create}
            />

            <EditRoleModal
                isOpen={editModal.isOpen}
                onClose={editModal.close}
                onUpdate={update}
                role={editModal.selectedItem}
            />

            <AssignPermissionsModal
                isOpen={assignPermissionsModal.isOpen}
                onClose={assignPermissionsModal.close}
                onAssign={handleAssignPermissions}
                role={assignPermissionsModal.selectedItem}
                permissions={permissions}
            />

            <Modal
                isOpen={assignMenusModal.isOpen}
                onClose={assignMenusModal.close}
                title={`Assign Menus: ${assignMenusModal.selectedItem?.name || ''}`}
                size="xl"
            >
                {assignMenusModal.selectedItem && (
                    <RoleMenuAssignment
                        roleId={assignMenusModal.selectedItem.id}
                        roleName={assignMenusModal.selectedItem.name}
                    />
                )}
            </Modal>

            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={handleDelete}
                title="Delete Role"
                message={`Are you sure you want to delete role "${deleteModal.selectedItem?.name}"? This will remove this role from all assigned users.`}
                confirmText="Delete"
                type="danger"
            />

            <ConfirmDialog
                isOpen={bulkDeleteModal.isOpen}
                onClose={bulkDeleteModal.close}
                onConfirm={handleBulkDelete}
                title="Delete Multiple Roles"
                message={`Are you sure you want to delete ${selection.count} role(s)? This action cannot be undone.`}
                confirmText="Delete All"
                type="danger"
            />
        </div>
    );
}
