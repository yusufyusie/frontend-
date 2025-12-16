import { useState, useMemo } from 'react';
import type { Role } from '@/services/roles.service';

export type RoleSortOption = 'name' | 'users' | 'permissions';

/**
 * Custom hook for managing role filters and sorting
 */
export function useRoleFilters(roles: Role[]) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<RoleSortOption>('name');

    /**
     * Filter and sort roles based on current criteria
     */
    const filteredRoles = useMemo(() => {
        return roles
            .filter(role =>
                role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                role.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                if (sortBy === 'name') {
                    return a.name.localeCompare(b.name);
                } else if (sortBy === 'users') {
                    const aCount = a._count?.userRoles || 0;
                    const bCount = b._count?.userRoles || 0;
                    return bCount - aCount;
                } else {
                    // Sort by permissions
                    const aCount = a._count?.rolePermissions || 0;
                    const bCount = b._count?.rolePermissions || 0;
                    return bCount - aCount;
                }
            });
    }, [roles, searchTerm, sortBy]);

    /**
     * Get selectable roles (non-system roles)
     */
    const selectableRoles = useMemo(() => {
        return filteredRoles.filter(r => !r.isSystem);
    }, [filteredRoles]);

    /**
     * Reset all filters
     */
    const resetFilters = () => {
        setSearchTerm('');
        setSortBy('name');
    };

    return {
        // State
        searchTerm,
        sortBy,

        // Setters
        setSearchTerm,
        setSortBy,

        // Computed
        filteredRoles,
        selectableRoles,

        // Actions
        resetFilters,
    };
}
