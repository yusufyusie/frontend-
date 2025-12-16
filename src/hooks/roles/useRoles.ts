import { useState, useEffect, useCallback } from 'react';
import { rolesService, type Role, type CreateRoleData, type RoleStats } from '@/services/roles.service';
import { permissionsService, type Permission } from '@/services/permissions.service';
import { toast } from '@/components/Toast';

/**
 * Custom hook for managing roles data and operations
 */
export function useRoles() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [stats, setStats] = useState<RoleStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    /**
     * Fetch all roles, permissions, and stats
     */
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [rolesData, permissionsData, statsData] = await Promise.all([
                rolesService.getAll(),
                permissionsService.getAll(),
                rolesService.getStats(),
            ]);
            setRoles(rolesData);
            setPermissions(permissionsData);
            setStats(statsData);
        } catch (err) {
            const error = err as Error;
            setError(error);
            toast.error('Failed to load data: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Initialize data on mount
     */
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /**
     * Create a new role
     */
    const create = useCallback(async (data: CreateRoleData) => {
        try {
            await rolesService.create(data);
            toast.success('Role created successfully');
            await fetchData();
        } catch (err) {
            const error = err as Error;
            toast.error('Failed to create role: ' + error.message);
            throw error;
        }
    }, [fetchData]);

    /**
     * Update an existing role
     */
    const update = useCallback(async (id: number, data: Partial<CreateRoleData>) => {
        try {
            await rolesService.update(id, data);
            toast.success('Role updated successfully');
            await fetchData();
        } catch (err) {
            const error = err as Error;
            toast.error('Failed to update role: ' + error.message);
            throw error;
        }
    }, [fetchData]);

    /**
     * Delete a role
     */
    const deleteRole = useCallback(async (id: number, name: string) => {
        try {
            await rolesService.delete(id);
            toast.success(`Role "${name}" deleted successfully`);
            await fetchData();
        } catch (err) {
            const error = err as Error;
            toast.error('Failed to delete role: ' + error.message);
            throw error;
        }
    }, [fetchData]);

    /**
     * Bulk delete roles
     */
    const bulkDelete = useCallback(async (ids: number[]) => {
        try {
            const result = await rolesService.bulkDelete(ids);
            toast.success(result.message);
            await fetchData();
        } catch (err) {
            const error = err as Error;
            toast.error('Failed to delete roles: ' + error.message);
            throw error;
        }
    }, [fetchData]);

    /**
     * Assign permissions to a role
     */
    const assignPermissions = useCallback(async (roleId: number, permissionIds: number[]) => {
        try {
            await rolesService.assignPermissions(roleId, permissionIds);
            toast.success('Permissions assigned successfully');
            await fetchData();
        } catch (err) {
            const error = err as Error;
            toast.error('Failed to assign permissions: ' + error.message);
            throw error;
        }
    }, [fetchData]);

    /**
     * Export roles
     */
    const exportRoles = useCallback(async () => {
        try {
            const data = await rolesService.exportRoles();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `roles-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Roles exported successfully');
        } catch (err) {
            const error = err as Error;
            toast.error('Failed to export roles: ' + error.message);
            throw error;
        }
    }, []);

    return {
        roles,
        permissions,
        stats,
        loading,
        error,
        refresh: fetchData,
        create,
        update,
        delete: deleteRole,
        bulkDelete,
        assignPermissions,
        exportRoles,
    };
}
