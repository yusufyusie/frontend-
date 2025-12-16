import { useState, useEffect, useCallback } from 'react';
import { permissionsService, type Permission, type CreatePermissionData, type PermissionStats } from '@/services/permissions.service';
import { toast } from '@/components/Toast';

/**
 * Custom hook for managing permissions data and operations
 */
export function usePermissions() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [stats, setStats] = useState<PermissionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    /**
     * Fetch all permissions and stats
     */
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [permData, statsData] = await Promise.all([
                permissionsService.getAll(),
                permissionsService.getStats(),
            ]);
            setPermissions(permData);
            setStats(statsData);
        } catch (err) {
            const error = err as Error;
            setError(error);
            toast.error('Failed to load permissions: ' + error.message);
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
     * Create a new permission
     */
    const create = useCallback(async (data: CreatePermissionData) => {
        try {
            await permissionsService.create(data);
            toast.success('Permission created successfully');
            await fetchData();
        } catch (err) {
            const error = err as Error;
            toast.error('Failed to create permission: ' + error.message);
            throw error;
        }
    }, [fetchData]);

    /**
     * Update an existing permission
     */
    const update = useCallback(async (id: number, data: Partial<CreatePermissionData>) => {
        try {
            await permissionsService.update(id, data);
            toast.success('Permission updated successfully');
            await fetchData();
        } catch (err) {
            const error = err as Error;
            toast.error('Failed to update permission: ' + error.message);
            throw error;
        }
    }, [fetchData]);

    /**
     * Delete a permission
     */
    const deletePermission = useCallback(async (id: number, name: string) => {
        try {
            await permissionsService.delete(id);
            toast.success(`Permission "${name}" deleted successfully`);
            await fetchData();
        } catch (err) {
            const error = err as Error;
            toast.error('Failed to delete permission: ' + error.message);
            throw error;
        }
    }, [fetchData]);

    /**
     * Bulk delete permissions
     */
    const bulkDelete = useCallback(async (ids: number[]) => {
        try {
            const result = await permissionsService.bulkDelete(ids);
            toast.success(result.message);
            await fetchData();
        } catch (err) {
            const error = err as Error;
            toast.error('Failed to delete permissions: ' + error.message);
            throw error;
        }
    }, [fetchData]);

    /**
     * Bulk update group
     */
    const bulkUpdateGroup = useCallback(async (ids: number[], groupName: string) => {
        try {
            const result = await permissionsService.bulkUpdateGroup(ids, groupName);
            toast.success(result.message);
            await fetchData();
        } catch (err) {
            const error = err as Error;
            toast.error('Failed to move permissions: ' + error.message);
            throw error;
        }
    }, [fetchData]);

    /**
     * Export permissions
     */
    const exportPermissions = useCallback(async () => {
        try {
            const data = await permissionsService.exportPermissions();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `permissions-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Permissions exported successfully');
        } catch (err) {
            const error = err as Error;
            toast.error('Failed to export permissions: ' + error.message);
            throw error;
        }
    }, []);

    return {
        permissions,
        stats,
        loading,
        error,
        refresh: fetchData,
        create,
        update,
        delete: deletePermission,
        bulkDelete,
        bulkUpdateGroup,
        exportPermissions,
    };
}
