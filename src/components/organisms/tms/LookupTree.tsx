import { ActionIcon, Group, Stack, Text, Box, Paper, Tooltip, Badge, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ChevronRight, ChevronDown, Edit, Plus, Trash2, Hash, Database, LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SystemLookup } from '@/services/lookups.service';
import { SmartPagination } from '@/components/SmartPagination';
import { LocalizedText } from '@/components/atoms/tms/LocalizedText';
import { LookupStatusBadge } from '@/components/atoms/tms/LookupStatusBadge';
import * as Icons from 'lucide-react';
import { useState } from 'react';

interface NodeProps {
    node: SystemLookup;
    onEdit: (node: SystemLookup) => void;
    onAddChild: (node: SystemLookup) => void;
    onDelete: (node: SystemLookup) => void;
}

const LookupNode = ({ node, onEdit, onAddChild, onDelete }: NodeProps) => {
    const [opened, { toggle }] = useDisclosure(true);
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const hasChildren = node.children && node.children.length > 0;
    const totalPages = hasChildren ? Math.ceil(node.children!.length / pageSize) : 0;
    const paginatedChildren = hasChildren ? node.children!.slice((page - 1) * pageSize, page * pageSize) : [];

    const Icon = (Icons as any)[node.metadata?.icon] || Hash;

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-2"
        >
            <Paper
                className={`
                    backdrop-blur-md transition-all duration-200 group
                    ${node.isActive ? 'bg-white/95 border-slate-200' : 'bg-slate-50/70 border-slate-100'}
                    hover:shadow-lg hover:border-cyan-200 border relative overflow-hidden
                `}
                p="xs"
                radius="lg"
            >
                {/* Active Indicator Bar */}
                {node.isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-600 opacity-60" />
                )}

                <Group justify="space-between" wrap="nowrap">
                    <Group gap="md" wrap="nowrap">
                        <div className="flex items-center gap-1">
                            {hasChildren && (
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    onClick={toggle}
                                    size="sm"
                                    radius="sm"
                                    className="transition-transform"
                                >
                                    <motion.div animate={{ rotate: opened ? 90 : 0 }}>
                                        <ChevronRight size={14} className="text-slate-400" />
                                    </motion.div>
                                </ActionIcon>
                            )}

                            <ThemeIcon
                                size={32}
                                radius="md"
                                variant="light"
                                color={node.metadata?.color || 'blue'}
                                className="shadow-sm"
                            >
                                <Icon size={16} strokeWidth={2.5} />
                            </ThemeIcon>
                        </div>

                        <Stack gap={0}>
                            <Group gap="xs" align="center">
                                <Box fw={900} className="text-[#16284F] tracking-tight leading-tight" style={{ fontSize: '15px' }}>
                                    <LocalizedText value={node.lookupValue as any} />
                                </Box>
                                {node.isSystem && (
                                    <Badge size="xs" variant="filled" color="slate" radius="sm" style={{ fontSize: '8px', height: '14px', fontWeight: 900 }}>
                                        CORE
                                    </Badge>
                                )}
                            </Group>
                            <Group gap={8} align="center">
                                <Text size="xs" fw={900} className={`px-2 py-0.5 rounded-md uppercase tracking-[0.1em] font-mono text-[9px] ${node.isActive ? 'bg-cyan-100 text-[#0C7C92]' : 'bg-slate-100 text-slate-500'}`}>
                                    {node.lookupCode}
                                </Text>
                                {hasChildren && (
                                    <Text size="xs" c="dimmed" fw={800} tt="uppercase" className="tracking-widest" style={{ fontSize: '9px' }}>
                                        • {node.children?.length} Nodes
                                    </Text>
                                )}
                            </Group>
                        </Stack>
                    </Group>

                    <Group gap={4} className="opacity-40 group-hover:opacity-100 transition-opacity">
                        <Tooltip label="Edit" withArrow position="top">
                            <ActionIcon
                                variant="subtle"
                                color="blue"
                                onClick={() => onEdit(node)}
                                size="sm"
                                radius="md"
                            >
                                <Edit size={14} strokeWidth={2.5} />
                            </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Add Child" withArrow position="top">
                            <ActionIcon
                                variant="subtle"
                                color="teal"
                                onClick={() => onAddChild(node)}
                                size="sm"
                                radius="md"
                            >
                                <Plus size={14} strokeWidth={3} />
                            </ActionIcon>
                        </Tooltip>

                        {!node.isSystem && (
                            <Tooltip label="Delete" withArrow position="top">
                                <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    onClick={() => onDelete(node)}
                                    size="sm"
                                    radius="md"
                                >
                                    <Trash2 size={14} strokeWidth={2.5} />
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </Group>
                </Group>
            </Paper>

            <AnimatePresence>
                {hasChildren && opened && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <Box pl={50} mt={6} className="relative">
                            {/* Systemic Hierarchy Line */}
                            <div className="absolute left-[25px] top-0 bottom-8 border-l-2 border-slate-200/50" />
                            <Stack gap={8} py={2}>
                                {paginatedChildren.map((child) => (
                                    <LookupNode
                                        key={child.id}
                                        node={child}
                                        onEdit={onEdit}
                                        onAddChild={onAddChild}
                                        onDelete={onDelete}
                                    />
                                ))}

                                {totalPages > 1 && (
                                    <Box py="xs" className="border-t border-slate-100/50">
                                        <SmartPagination
                                            currentPage={page}
                                            totalPages={totalPages}
                                            pageSize={pageSize}
                                            totalElements={node.children?.length || 0}
                                            onPageChange={setPage}
                                        />
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

interface TreeProps {
    data: SystemLookup[];
    onEdit: (node: SystemLookup) => void;
    onAddChild: (node: SystemLookup) => void;
    onDelete: (node: SystemLookup) => void;
}

export const LookupTree = ({ data, onEdit, onAddChild, onDelete }: TreeProps) => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const totalPages = Math.ceil(data.length / pageSize);
    const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

    return (
        <Stack gap={10}>
            {paginatedData.map((node) => (
                <LookupNode
                    key={node.id}
                    node={node}
                    onEdit={onEdit}
                    onAddChild={onAddChild}
                    onDelete={onDelete}
                />
            ))}
            {data.length === 0 && (
                <Paper p="xl" withBorder radius="sm" style={{ textAlign: 'center' }}>
                    <Text c="dimmed">No lookups found in this category.</Text>
                </Paper>
            )}

            {data.length > 0 && (
                <Box pt="sm" className="border-t border-slate-100">
                    <SmartPagination
                        currentPage={page}
                        totalPages={totalPages || 1}
                        pageSize={pageSize}
                        totalElements={data.length}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                    />
                </Box>
            )}
        </Stack>
    );
};

