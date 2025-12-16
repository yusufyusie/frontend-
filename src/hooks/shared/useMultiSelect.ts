import { useState, useCallback, useMemo } from 'react';

/**
 * Generic hook for managing multi-selection state
 * @template T - Type of items being selected (must have an id property)
 */
export function useMultiSelect<T extends { id: number }>(items: T[]) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    /**
     * Toggle selection for a single item
     */
    const toggle = useCallback((id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    /**
     * Select all items
     */
    const selectAll = useCallback(() => {
        setSelectedIds(new Set(items.map(item => item.id)));
    }, [items]);

    /**
     * Deselect all items
     */
    const deselectAll = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    /**
     * Check if an item is selected
     */
    const isSelected = useCallback((id: number) => {
        return selectedIds.has(id);
    }, [selectedIds]);

    /**
     * Get array of selected items
     */
    const selectedItems = useMemo(() => {
        return items.filter(item => selectedIds.has(item.id));
    }, [items, selectedIds]);

    /**
     * Get array of selected IDs
     */
    const selectedIdsArray = useMemo(() => {
        return Array.from(selectedIds);
    }, [selectedIds]);

    return {
        selectedIds,
        selectedIdsArray,
        selectedItems,
        toggle,
        selectAll,
        deselectAll,
        clear: deselectAll,
        count: selectedIds.size,
        isSelected,
        hasSelection: selectedIds.size > 0,
    };
}
