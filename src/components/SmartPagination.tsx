'use client';

import React from 'react';
import { Group, Text, Select, Tooltip, Pagination, Paper, Box, Divider } from '@mantine/core';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings2 } from 'lucide-react';

interface SmartPaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalElements: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: string[];
    embedded?: boolean;
}

export const SmartPagination = ({
    currentPage,
    totalPages,
    pageSize,
    totalElements,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = ['5', '10', '25', '50', '100'],
    embedded = false
}: SmartPaginationProps) => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalElements);
    const safeTotalPages = Math.max(1, totalPages);

    return (
        <Paper
            withBorder={!embedded}
            px={embedded ? "xl" : "xl"}
            py="md"
            radius={embedded ? 0 : "2rem"}
            className={`${embedded ? 'border-none bg-transparent mt-0 shadow-none' : 'border-slate-100 bg-white shadow-2xl shadow-slate-200/50 mt-6'}`}
        >
            <Group justify="space-between" align="center" wrap="nowrap">
                {/* Information Hub */}
                <Group gap="xl" wrap="nowrap">
                    <Box className="flex flex-col">
                        <Group gap={8} mb={4}>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-teal/10 rounded-full border border-brand-teal/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                                <Text size="9px" fw={900} className="text-brand-teal tracking-[0.15em] uppercase font-primary">Registry Engine</Text>
                            </div>
                        </Group>
                        <Group gap={6} wrap="nowrap">
                            <Text size="xs" fw={800} className="text-brand-navy">
                                <span className="opacity-40 font-medium">VIEWING</span> {start}-{end}
                            </Text>
                            <Divider orientation="vertical" h={12} className="border-slate-200" />
                            <Text size="xs" fw={700} c="dimmed">
                                <span className="font-black text-brand-navy">{totalElements}</span> <span className="text-[10px] font-extrabold uppercase tracking-tighter ml-1">Total Records</span>
                            </Text>
                        </Group>
                    </Box>

                    {onPageSizeChange && (
                        <div className="hidden lg:flex items-center gap-3 pl-8 border-l border-slate-100">
                            <Tooltip label="Adjust view scaling" position="top" withArrow>
                                <Box p={6} bg="slate.50" className="rounded-xl text-slate-400">
                                    <Settings2 size={12} />
                                </Box>
                            </Tooltip>
                            <Select
                                size="xs"
                                radius="md"
                                data={pageSizeOptions}
                                value={pageSize.toString()}
                                onChange={(val) => onPageSizeChange(parseInt(val || '10'))}
                                styles={{
                                    input: { border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontWeight: 800, width: '60px', height: '32px', fontSize: '11px', textAlign: 'center' }
                                }}
                            />
                        </div>
                    )}
                </Group>

                {/* Navigation Controls */}
                <Group gap="xs" wrap="nowrap">
                    <Pagination.Root
                        total={safeTotalPages}
                        value={currentPage}
                        onChange={onPageChange}
                        size="sm"
                        radius="xl"
                    >
                        <Group gap={6}>
                            <Pagination.First icon={ChevronsLeft} className="border-slate-100 hover:bg-slate-50 transition-colors" />
                            <Pagination.Previous icon={ChevronLeft} className="border-slate-100 hover:bg-slate-50 transition-colors" />
                            <Pagination.Items />
                            <Pagination.Next icon={ChevronRight} className="border-slate-100 hover:bg-slate-50 transition-colors" />
                            <Pagination.Last icon={ChevronsRight} className="border-slate-100 hover:bg-slate-50 transition-colors" />
                        </Group>
                    </Pagination.Root>
                </Group>
            </Group>
        </Paper>
    );
};
