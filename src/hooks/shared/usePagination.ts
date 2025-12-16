import { useState, useCallback, useMemo } from 'react';

interface UsePaginationOptions {
    initialPage?: number;
    initialPageSize?: number;
}

/**
 * Generic hook for managing pagination state
 */
export function usePagination(options: UsePaginationOptions = {}) {
    const { initialPage = 1, initialPageSize = 10 } = options;

    const [page, setPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const goToPage = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const nextPage = useCallback(() => {
        setPage(prev => prev + 1);
    }, []);

    const prevPage = useCallback(() => {
        setPage(prev => Math.max(1, prev - 1));
    }, []);

    const reset = useCallback(() => {
        setPage(initialPage);
    }, [initialPage]);

    const changePageSize = useCallback((newSize: number) => {
        setPageSize(newSize);
        setPage(1); // Reset to first page when changing page size
    }, []);

    return {
        page,
        pageSize,
        goToPage,
        nextPage,
        prevPage,
        reset,
        changePageSize,
        setPage,
        setPageSize,
    };
}

/**
 * Hook for client-side pagination of data
 */
export function useClientPagination<T>(data: T[], pageSize: number = 10) {
    const [page, setPage] = useState(1);

    const totalPages = Math.ceil(data.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedData = useMemo(() => {
        return data.slice(startIndex, endIndex);
    }, [data, startIndex, endIndex]);

    const goToPage = useCallback((newPage: number) => {
        setPage(Math.max(1, Math.min(newPage, totalPages)));
    }, [totalPages]);

    const nextPage = useCallback(() => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    }, [page, totalPages]);

    const prevPage = useCallback(() => {
        if (page > 1) {
            setPage(page - 1);
        }
    }, [page]);

    return {
        data: paginatedData,
        page,
        totalPages,
        goToPage,
        nextPage,
        prevPage,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
}
