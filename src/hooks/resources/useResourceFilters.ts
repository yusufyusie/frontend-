import { useState, useMemo } from 'react';
import type { Resource } from '@/services/resource.service';

/**
 * Custom hook for managing resource filters
 */
export function useResourceFilters(resources: Resource[]) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('');

    /**
     * Get unique categories from resources
     */
    const uniqueCategories = useMemo(() => {
        return Array.from(new Set(resources.map(r => r.category).filter(Boolean)));
    }, [resources]);

    /**
     * Filter resources based on current criteria
     */
    const filteredResources = useMemo(() => {
        return resources.filter(resource => {
            const matchesSearch =
                resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resource.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory = !filterCategory || resource.category === filterCategory;

            return matchesSearch && matchesCategory;
        });
    }, [resources, searchTerm, filterCategory]);

    /**
     * Reset all filters
     */
    const resetFilters = () => {
        setSearchTerm('');
        setFilterCategory('');
    };

    return {
        // State
        searchTerm,
        filterCategory,

        // Setters
        setSearchTerm,
        setFilterCategory,

        // Computed
        filteredResources,
        uniqueCategories,

        // Actions
        resetFilters,
    };
}
