import { useState, useMemo } from 'react';
import type { Permission } from '@/services/permissions.service';

export type SortOption = 'name' | 'usage' | 'date';

/**
 * Custom hook for managing permission filters and sorting
 */
export function usePermissionFilters(permissions: Permission[]) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortOption>('name');

    /**
     * Get unique groups from permissions
     */
    const uniqueGroups = useMemo(() => {
        return Array.from(new Set(permissions.map(p => p.groupName)));
    }, [permissions]);

    /**
     * Filter and sort permissions based on current criteria
     */
    const filteredPermissions = useMemo(() => {
        return permissions
            .filter(perm => {
                const matchesSearch =
                    perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    perm.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    perm.groupName.toLowerCase().includes(searchTerm.toLowerCase());

                const matchesGroup = selectedGroup === 'all' || perm.groupName === selectedGroup;

                return matchesSearch && matchesGroup;
            })
            .sort((a, b) => {
                if (sortBy === 'name') {
                    return a.name.localeCompare(b.name);
                } else if (sortBy === 'usage') {
                    const aCount = a._count?.rolePermissions || 0;
                    const bCount = b._count?.rolePermissions || 0;
                    return bCount - aCount;
                } else {
                    // Sort by date
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
            });
    }, [permissions, searchTerm, selectedGroup, sortBy]);

    /**
     * Group filtered permissions by groupName
     */
    const groupedPermissions = useMemo(() => {
        return filteredPermissions.reduce((acc, perm) => {
            const group = perm.groupName || 'Other';
            if (!acc[group]) acc[group] = [];
            acc[group].push(perm);
            return acc;
        }, {} as Record<string, Permission[]>);
    }, [filteredPermissions]);

    /**
     * Reset all filters
     */
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedGroup('all');
        setSortBy('name');
    };

    return {
        // State
        searchTerm,
        selectedGroup,
        sortBy,

        // Setters
        setSearchTerm,
        setSelectedGroup,
        setSortBy,

        // Computed
        filteredPermissions,
        groupedPermissions,
        uniqueGroups,

        // Actions
        resetFilters,
    };
}
