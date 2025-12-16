import { useState, useEffect, useCallback } from 'react';
import { resourceService, type Resource, type CreateResourceData, type ResourceStats } from '@/services/resource.service';
import { toast } from '@/components/Toast';

/**
 * Custom hook for managing resources data and operations
 */
export function useResources() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [stats, setStats] = useState<ResourceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    /**
     * Fetch all resources and stats
     */
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [resourcesData, statsData] = await Promise.all([
                resourceService.getAll(),
                resourceService.getStats(),
            ]);
            setResources(resourcesData);
            setStats(statsData);
        } catch (err) {
            const error = err as Error;
            setError(error);
            toast.error('Failed to load resources: ' + error.message);
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
     * Create a new resource
     */
    const create = useCallback(async (data: CreateResourceData) => {
        try {
            await resourceService.create(data);
            toast.success('Resource created successfully');
            await fetchData();
        } catch (err) {
            const error = err as Error;
            toast.error('Failed to create resource: ' + error.message);
            throw error;
        }
    }, [fetchData]);

    /**
     * Update an existing resource
     */
    const update = useCallback(async (id: number, data: Partial<CreateResourceData>) => {
        try {
            await resourceService.update(id, data);
            toast.success('Resource updated successfully');
            await fetchData();
        } catch (err) {
            const error = err as Error;
            toast.error('Failed to update resource: ' + error.message);
            throw error;
        }
    }, [fetchData]);

    /**
     * Delete a resource
     */
    const deleteResource = useCallback(async (id: number, name: string) => {
        try {
            await resourceService.delete(id);
            toast.success(`Resource "${name}" deleted successfully`);
            await fetchData();
        } catch (err) {
            const error = err as Error;
            toast.error('Failed to delete resource: ' + error.message);
            throw error;
        }
    }, [fetchData]);

    /**
     * Bulk delete resources
     */
    const bulkDelete = useCallback(async (ids: number[]) => {
        try {
            const result = await resourceService.bulkDelete(ids);
            toast.success(result.message);
            await fetchData();
        } catch (err) {
            const error = err as Error;
            toast.error('Failed to delete resources: ' + error.message);
            throw error;
        }
    }, [fetchData]);

    return {
        resources,
        stats,
        loading,
        error,
        refresh: fetchData,
        create,
        update,
        delete: deleteResource,
        bulkDelete,
    };
}
