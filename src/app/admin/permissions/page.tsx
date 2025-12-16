'use client';

import { useState, useEffect } from 'react';
import { rolesService } from '@/services/roles.service';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PermissionBulkActions } from '@/components/PermissionBulkActions';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PermissionDetailsDrawer } from '@/components/PermissionDetailsDrawer';

// Custom Hooks
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { usePermissionFilters } from '@/hooks/permissions/usePermissionFilters';
import { usePermissionGroups } from '@/hooks/permissions/usePermissionGroups';
import { useMultiSelect } from '@/hooks/shared/useMultiSelect';
import { useModalState } from '@/hooks/shared/useModalState';

// Page Components
import { PermissionsPageHeader } from '@/components/permissions/PermissionsPageHeader';
import { PermissionsStatsCards } from '@/components/permissions/PermissionsStatsCards';
import { PermissionsFilterBar } from '@/components/permissions/PermissionsFilterBar';
import { PermissionsGrid } from '@/components/permissions/PermissionsGrid';

// Modals
import { CreatePermissionModal } from '@/components/permissions/modals/CreatePermissionModal';
import { EditPermissionModal } from '@/components/permissions/modals/EditPermissionModal';
import { MoveGroupModal } from '@/components/permissions/modals/MoveGroupModal';

import type { Permission } from '@/services/permissions.service';

/**
 * Permissions Management Page
 * 
 * Orchestrates all permission-related functionality using custom hooks
 * and presentational components following Single Responsibility Principle
 */
export default function AdminPermissionsPage() {
    // Data Management
    const {
        permissions,
        stats,
        loading,
        create,
        update,
        delete: deletePermission,
        bulkDelete,
        bulkUpdateGroup,
        exportPermissions,
    } = usePermissions();

    // Filtering & Sorting
    const filters = usePermissionFilters(permissions);

    // Group Expansion State
    const groups = usePermissionGroups();

    // Multi-Selection
    const selection = useMultiSelect(filters.filteredPermissions);

    // Modal States
    const createModal = useModalState<void>();
    const editModal = useModalState<Permission>();
    const deleteModal = useModalState<Permission>();
    const bulkDeleteModal = useModalState<void>();
    const moveGroupModal = useModalState<void>();
    const detailsDrawer = useModalState<Permission>();

    // Local state for details drawer
    const [rolesForPermission, setRolesForPermission] = useState<{ id: number; name: string }[]>([]);

    // Expand all groups when permissions are loaded
    useEffect(() => {
        if (permissions.length > 0 && groups.expandedGroups.size === 0) {
            const uniqueGroups = Array.from(new Set(permissions.map(p => p.groupName || 'Other')));
            groups.expandAll(uniqueGroups);
        }
    }, [permissions, groups]);

    /**
     * Handle delete permission
     */
    const handleDelete = async () => {
        const permission = deleteModal.selectedItem;
        if (!permission) return;

        try {
            await deletePermission(permission.id, permission.name);
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
     * Handle bulk move group
     */
    const handleBulkMoveGroup = async (groupName: string) => {
        try {
            await bulkUpdateGroup(selection.selectedIdsArray, groupName);
            selection.clear();
        } catch (error) {
            // Error handled in hook
        }
    };

    /**
     * Handle view permission details
     */
    const handleViewDetails = async (permission: Permission) => {
        detailsDrawer.open(permission);

        // Fetch roles using this permission
        try {
            const allRoles = await rolesService.getAll();
            const rolesWithPerm = allRoles
                .filter(role => role.permissions?.some(p => p.id === permission.id))
                .map(r => ({ id: r.id, name: r.name }));
            setRolesForPermission(rolesWithPerm);
        } catch (error) {
            setRolesForPermission([]);
        }
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
            <PermissionsPageHeader
                onCreateClick={createModal.open}
                onExportClick={exportPermissions}
            />

            {/* Stats Cards */}
            <PermissionsStatsCards
                stats={stats}
                selectedCount={selection.count}
            />

            {/* Bulk Actions */}
            <PermissionBulkActions
                selectedCount={selection.count}
                totalCount={filters.filteredPermissions.length}
                onSelectAll={selection.selectAll}
                onDeselectAll={selection.deselectAll}
                onBulkDelete={bulkDeleteModal.open}
                onBulkMoveGroup={moveGroupModal.open}
            />

            {/* Filter Bar */}
            <PermissionsFilterBar
                searchTerm={filters.searchTerm}
                setSearchTerm={filters.setSearchTerm}
                selectedGroup={filters.selectedGroup}
                setSelectedGroup={filters.setSelectedGroup}
                sortBy={filters.sortBy}
                setSortBy={filters.setSortBy}
                uniqueGroups={filters.uniqueGroups}
            />

            {/* Permissions Grid */}
            <PermissionsGrid
                groupedPermissions={filters.groupedPermissions}
                expandedGroups={groups.expandedGroups}
                onToggleGroup={groups.toggleGroup}
                selectedIds={selection.selectedIds}
                onToggleSelect={selection.toggle}
                onEditClick={editModal.open}
                onDeleteClick={deleteModal.open}
                onViewDetailsClick={handleViewDetails}
            />

            {/* Modals */}
            <CreatePermissionModal
                isOpen={createModal.isOpen}
                onClose={createModal.close}
                onCreate={create}
                existingGroups={filters.uniqueGroups}
            />

            <EditPermissionModal
                isOpen={editModal.isOpen}
                onClose={editModal.close}
                onUpdate={update}
                permission={editModal.selectedItem}
                existingGroups={filters.uniqueGroups}
            />

            <MoveGroupModal
                isOpen={moveGroupModal.isOpen}
                onClose={moveGroupModal.close}
                onMoveGroup={handleBulkMoveGroup}
                selectedCount={selection.count}
                existingGroups={filters.uniqueGroups}
            />

            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={handleDelete}
                title="Delete Permission"
                message={`Are you sure you want to delete permission "${deleteModal.selectedItem?.name}"? This will remove it from all roles.`}
                confirmText="Delete"
                type="danger"
            />

            <ConfirmDialog
                isOpen={bulkDeleteModal.isOpen}
                onClose={bulkDeleteModal.close}
                onConfirm={handleBulkDelete}
                title="Delete Multiple Permissions"
                message={`Are you sure you want to delete ${selection.count} permission(s)? This action cannot be undone.`}
                confirmText="Delete All"
                type="danger"
            />

            <PermissionDetailsDrawer
                isOpen={detailsDrawer.isOpen}
                onClose={detailsDrawer.close}
                permission={detailsDrawer.selectedItem}
                roles={rolesForPermission}
            />
        </div>
    );
}
