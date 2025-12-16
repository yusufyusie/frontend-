import { useState, useCallback } from 'react';

/**
 * Generic hook for managing modal state
 * @template T - Type of the item associated with the modal
 */
export function useModalState<T = any>() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);

    /**
     * Open the modal, optionally with an associated item
     */
    const open = useCallback((item?: T) => {
        if (item !== undefined) {
            setSelectedItem(item);
        }
        setIsOpen(true);
    }, []);

    /**
     * Close the modal and clear selected item
     */
    const close = useCallback(() => {
        setIsOpen(false);
        setSelectedItem(null);
    }, []);

    /**
     * Close modal but keep selected item (useful for chained modals)
     */
    const closeKeepItem = useCallback(() => {
        setIsOpen(false);
    }, []);

    /**
     * Update the selected item without changing open state
     */
    const setItem = useCallback((item: T | null) => {
        setSelectedItem(item);
    }, []);

    return {
        isOpen,
        selectedItem,
        open,
        close,
        closeKeepItem,
        setItem,
    };
}

/**
 * Hook for managing multiple modal states
 * Useful when a page has several different modals
 */
export function useMultiModalState<T = any>(modalNames: string[]) {
    const modals = modalNames.reduce((acc, name) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        acc[name] = useModalState<T>();
        return acc;
    }, {} as Record<string, ReturnType<typeof useModalState<T>>>);

    return modals;
}
