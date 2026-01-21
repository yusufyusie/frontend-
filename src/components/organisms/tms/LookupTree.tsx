import { ActionIcon, Group, Stack, Text, Box, Paper, Tooltip, Badge, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ChevronRight, ChevronDown, Edit, Plus, Trash2, Hash, Database, LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SystemLookup } from '@/services/lookups.service';
import { LocalizedText } from '@/components/atoms/tms/LocalizedText';
import { LookupStatusBadge } from '@/components/atoms/tms/LookupStatusBadge';
import * as Icons from 'lucide-react';

interface NodeProps {
    node: SystemLookup;
    onEdit: (node: SystemLookup) => void;
    onAddChild: (node: SystemLookup) => void;
    onDelete: (node: SystemLookup) => void;
}

const LookupNode = ({ node, onEdit, onAddChild, onDelete }: NodeProps) => {
    const [opened, { toggle }] = useDisclosure(true);
    const hasChildren = node.children && node.children.length > 0;

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
                                <Box fw={800} className="text-slate-800 tracking-tight leading-tight" style={{ fontSize: '14px' }}>
                                    <LocalizedText value={node.lookupValue as any} />
                                </Box>
                                {node.isSystem && (
                                    <Badge size="xs" variant="light" color="slate" radius="xs" style={{ fontSize: '9px', height: '14px' }}>
                                        SYSTEM
                                    </Badge>
                                )}
                            </Group>
                            <Group gap={6} align="center">
                                <Text size="xs" fw={800} className={`px-1 rounded-sm uppercase tracking-wider font-mono text-[9px] ${node.isActive ? 'bg-cyan-50 text-[#0C7C92]' : 'bg-slate-100 text-slate-500'}`}>
                                    {node.lookupCode}
                                </Text>
                                {hasChildren && (
                                    <Text size="xs" c="dimmed" fw={600} style={{ fontSize: '10px' }}>
                                        • {node.children?.length} children
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
                        <Box pl={54} mt={4} className="border-l-2 border-dashed border-slate-200 ml-5">
                            <Stack gap={0}>
                                {node.children?.map((child) => (
                                    <LookupNode
                                        key={child.id}
                                        node={child}
                                        onEdit={onEdit}
                                        onAddChild={onAddChild}
                                        onDelete={onDelete}
                                    />
                                ))}
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
    return (
        <Stack gap={8}>
            {data.map((node) => (
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
        </Stack>
    );
};
