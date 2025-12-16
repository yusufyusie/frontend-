import { useState, useEffect, useCallback } from 'react';
import type { Permission } from '@/services/permissions.service';

// Simplified permission type that Role.permissions uses
type SimplePermission = { id: number; name: string };

/**
 * Custom hook for managing permission assignment to roles
 * Handles the complex logic of the AssignPermissionsModal
 */
export function usePermissionAssignment(
    rolePermissions: SimplePermission[] | Permission[] | undefined,
    allPermissions: Permission[]
) {
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
    const [initialPermissionIds, setInitialPermissionIds] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');
    const [showTemplates, setShowTemplates] = useState(true);
    const [showImpactPreview, setShowImpactPreview] = useState(false);

    /**
     * Initialize selected permissions when role permissions change
     */
    useEffect(() => {
        if (rolePermissions) {
            const ids = rolePermissions.map(p => p.id);
            setSelectedPermissionIds(ids);
            setInitialPermissionIds(ids);
        } else {
            setSelectedPermissionIds([]);
            setInitialPermissionIds([]);
        }
        // Reset UI states
        setShowTemplates(true);
        setShowImpactPreview(false);
    }, [rolePermissions]);

    /**
     * Apply a permission template
     */
    const applyTemplate = useCallback((permissionIds: number[]) => {
        setSelectedPermissionIds(permissionIds);
        setShowTemplates(false);
    }, []);

    /**
     * Check if there are unsaved changes
     */
    const hasChanges = useCallback(() => {
        const current = [...selectedPermissionIds].sort();
        const initial = [...initialPermissionIds].sort();
        return JSON.stringify(current) !== JSON.stringify(initial);
    }, [selectedPermissionIds, initialPermissionIds]);

    /**
     * Reset changes
     */
    const resetChanges = useCallback(() => {
        setSelectedPermissionIds(initialPermissionIds);
        setShowTemplates(true);
        setShowImpactPreview(false);
    }, [initialPermissionIds]);

    /**
     * Get added permissions
     */
    const addedPermissions = useCallback(() => {
        return selectedPermissionIds.filter(id => !initialPermissionIds.includes(id));
    }, [selectedPermissionIds, initialPermissionIds]);

    /**
     * Get removed permissions
     */
    const removedPermissions = useCallback(() => {
        return initialPermissionIds.filter(id => !selectedPermissionIds.includes(id));
    }, [selectedPermissionIds, initialPermissionIds]);

    return {
        // State
        selectedPermissionIds,
        viewMode,
        showTemplates,
        showImpactPreview,

        // Setters
        setSelectedPermissionIds,
        setViewMode,
        setShowTemplates,
        setShowImpactPreview,

        // Computed
        hasChanges: hasChanges(),
        addedPermissions: addedPermissions(),
        removedPermissions: removedPermissions(),

        // Actions
        applyTemplate,
        resetChanges,
    };
}
