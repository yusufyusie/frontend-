import { useState, useCallback } from 'react';
import type { Permission } from '@/services/permissions.service';

/**
 * Custom hook for managing expanded/collapsed state of permission groups
 */
export function usePermissionGroups(initialGroups: string[] = []) {
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(initialGroups));

    /**
     * Toggle a group's expanded state
     */
    const toggleGroup = useCallback((group: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(group)) {
                next.delete(group);
            } else {
                next.add(group);
            }
            return next;
        });
    }, []);

    /**
     * Expand all groups
     */
    const expandAll = useCallback((groups: string[]) => {
        setExpandedGroups(new Set(groups));
    }, []);

    /**
     * Collapse all groups
     */
    const collapseAll = useCallback(() => {
        setExpandedGroups(new Set());
    }, []);

    /**
     * Check if a group is expanded
     */
    const isExpanded = useCallback((group: string) => {
        return expandedGroups.has(group);
    }, [expandedGroups]);

    return {
        expandedGroups,
        toggleGroup,
        expandAll,
        collapseAll,
        isExpanded,
    };
}
