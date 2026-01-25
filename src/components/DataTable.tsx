'use client';

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { SmartPagination } from './SmartPagination';

// End of file (technically not needed but satisfies the tool)
export interface Column<T> {
    key: string;
    header: React.ReactNode;
    sortable?: boolean;
    render?: (row: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    searchable?: boolean;
    searchPlaceholder?: string;
    pageSize?: number;
    emptyMessage?: string;
    className?: string;
    currentPage?: number;
    totalPages?: number;
    totalElements?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    searchable = true,
    searchPlaceholder = 'Search...',
    pageSize = 10,
    emptyMessage = 'No data available',
    className = '',
    currentPage: externalPage,
    totalPages: externalTotalPages,
    totalElements: externalTotalElements,
    onPageChange,
    onPageSizeChange,
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [internalPage, setInternalPage] = useState(1);

    const isControlled = externalPage !== undefined && externalTotalPages !== undefined && onPageChange !== undefined;
    const currentPage = isControlled ? externalPage : internalPage;

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;

        return data.filter((row) =>
            columns.some((column) => {
                const value = row[column.key];
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            })
        );
    }, [data, searchTerm, columns]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortColumn) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];

            if (aValue === bValue) return 0;

            const comparison = aValue > bValue ? 1 : -1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortColumn, sortDirection]);

    // Paginate data - ONLY if not controlled. Controlled means data is ALREADY paginated.
    const displayData = useMemo(() => {
        if (isControlled) return sortedData;

        const startIndex = (currentPage - 1) * pageSize;
        return sortedData.slice(startIndex, startIndex + pageSize);
    }, [sortedData, currentPage, pageSize, isControlled]);

    const totalPages = isControlled ? externalTotalPages : Math.ceil(sortedData.length / pageSize);
    const totalElements = isControlled ? (externalTotalElements || externalTotalPages * pageSize) : sortedData.length;

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const handlePageChange = (page: number) => {
        const newPage = Math.max(1, Math.min(page, totalPages));
        if (isControlled) {
            onPageChange(newPage);
        } else {
            setInternalPage(newPage);
        }
    };

    const renderSortIcon = (columnKey: string) => {
        if (sortColumn !== columnKey) return null;

        return sortDirection === 'asc' ? (
            <ChevronUp className="w-4 h-4 inline-block ml-1" />
        ) : (
            <ChevronDown className="w-4 h-4 inline-block ml-1" />
        );
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Search Bar */}
            {searchable && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            if (!isControlled) setInternalPage(1);
                        }}
                        className="input pl-10"
                    />
                </div>
            )}

            {/* Table */}
            <div className="table-container custom-scrollbar overflow-x-auto">
                <table className="table">
                    <thead className="table-header">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`${column.className || ''} ${column.sortable !== false ? 'cursor-pointer select-none hover:bg-gray-200/50' : ''
                                        }`}
                                    onClick={() => column.sortable !== false && handleSort(column.key)}
                                >
                                    <div className="flex items-center gap-1">
                                        {column.header}
                                        {column.sortable !== false && renderSortIcon(column.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-12 text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            displayData.map((row, rowIndex) => (
                                <tr key={rowIndex} className="table-row">
                                    {columns.map((column) => (
                                        <td key={column.key} className={column.className || ''}>
                                            {column.render ? column.render(row) : row[column.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Premium Smart Pagination */}
            {totalPages > 1 && (
                <SmartPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalElements={totalElements}
                    onPageChange={handlePageChange}
                    onPageSizeChange={onPageSizeChange}
                />
            )}
        </div>
    );
}
