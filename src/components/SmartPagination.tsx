'use client';

import React from 'react';
import { Group, Text, Select, Tooltip, Pagination, Paper, Box } from '@mantine/core';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings2 } from 'lucide-react';

interface SmartPaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalElements: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: string[];
}

export const SmartPagination = ({
    currentPage,
    totalPages,
    pageSize,
    totalElements,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = ['5', '10', '25', '50', '100']
}: SmartPaginationProps) => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalElements);
    const safeTotalPages = Math.max(1, totalPages);

    return (
        <Paper
            withBorder
            p="md"
            radius="xl"
            className="border-[#0C7C92]/20 bg-white shadow-xl mt-4"
        >
            <Group justify="space-between" align="center" wrap="nowrap">
                {/* Information Segment */}
                <Group gap="xl" wrap="nowrap">
                    <div className="flex flex-col min-w-[140px]">
                        <Group gap={6} mb={2}>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0C7C92] animate-pulse" />
                            <Text size="10px" fw={900} className="text-slate-400 tracking-[0.2em] uppercase">Navigation Engine</Text>
                        </Group>
                        <Text size="xs" fw={800} className="text-[#16284F]">
                            Showing <span className="text-[#0C7C92]">{start}-{end}</span> of <span className="text-[#16284F]">{totalElements}</span> items
                        </Text>
                    </div>

                    {onPageSizeChange && (
                        <div className="hidden lg:flex items-center gap-2 pl-6 border-l border-slate-100">
                            <Tooltip label="Set items per page" position="top" withArrow>
                                <Box p={4} bg="slate.50" className="rounded-md text-slate-400">
                                    <Settings2 size={14} />
                                </Box>
                            </Tooltip>
                            <Select
                                size="xs"
                                radius="md"
                                data={pageSizeOptions}
                                value={pageSize.toString()}
                                onChange={(val) => onPageSizeChange(parseInt(val || '10'))}
                                styles={{
                                    input: { border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontWeight: 800, width: '65px', fontSize: '11px' }
                                }}
                            />
                            <Text size="10px" fw={800} className="text-slate-400">PER PAGE</Text>
                        </div>
                    )}
                </Group>

                {/* Interaction Segment */}
                <Group gap="xs" wrap="nowrap">
                    <Pagination.Root
                        total={safeTotalPages}
                        value={currentPage}
                        onChange={onPageChange}
                        size="sm"
                        radius="md"
                    >
                        <Group gap={4}>
                            <Pagination.First icon={ChevronsLeft} />
                            <Pagination.Previous icon={ChevronLeft} />
                            <Pagination.Items />
                            <Pagination.Next icon={ChevronRight} />
                            <Pagination.Last icon={ChevronsRight} />
                        </Group>
                    </Pagination.Root>
                </Group>
            </Group>
        </Paper>
    );
};

