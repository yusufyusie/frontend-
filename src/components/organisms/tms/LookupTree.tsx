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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
        >
            <Paper
                className={`
                    backdrop-blur-md transition-all duration-300 group
                    ${node.isActive ? 'bg-white/80 border-slate-200' : 'bg-slate-50/50 border-slate-100'}
                    hover:shadow-xl hover:scale-[1.01] border relative overflow-hidden
                `}
                p="md"
                radius="xl"
            >
                {/* Active Indicator Bar */}
                {node.isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#0C7C92] to-cyan-600" />
                )}

                <Group justify="space-between" wrap="nowrap">
                    <Group gap="lg" wrap="nowrap">
                        <div className="flex items-center gap-3">
                            {hasChildren && (
                                <ActionIcon
                                    variant="subtle"
                                    color="tms-teal"
                                    onClick={toggle}
                                    size="lg"
                                    radius="xl"
                                    className="transition-transform group-hover:bg-teal-50"
                                >
                                    <motion.div animate={{ rotate: opened ? 90 : 0 }}>
                                        <ChevronRight size={20} className="text-[#0C7C92]" />
                                    </motion.div>
                                </ActionIcon>
                            )}

                            <ThemeIcon
                                size={44}
                                radius="xl"
                                variant="light"
                                color={node.metadata?.color || 'blue'}
                                className="shadow-inner"
                            >
                                <Icon size={22} strokeWidth={2.5} />
                            </ThemeIcon>
                        </div>

                        <Stack gap={2}>
                            <Group gap="xs">
                                <Text fw={800} size="lg" className="text-slate-800 tracking-tight">
                                    <LocalizedText value={node.lookupValue as any} />
                                </Text>
                                {node.isSystem && (
                                    <Badge size="xs" variant="gradient" gradient={{ from: 'slate.5', to: 'slate.7' }} radius="sm">
                                        System
                                    </Badge>
                                )}
                            </Group>
                            <Group gap={8}>
                                <Text size="xs" fw={800} className={`px-2 py-0.5 rounded-md uppercase tracking-wider font-mono ${node.isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'}`}>
                                    {node.lookupCode}
                                </Text>
                                {node.metadata?.color && (
                                    <Badge size="xs" variant="dot" color={node.metadata.color}>
                                        {node.metadata.color}
                                    </Badge>
                                )}
                            </Group>
                        </Stack>
                    </Group>

                    <Group gap="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <LookupStatusBadge active={node.isActive} />

                        <Tooltip label="Edit Details" withArrow transitionProps={{ transition: 'pop' }}>
                            <ActionIcon
                                variant="filled"
                                className="bg-[#0C7C92] hover:bg-[#0a6c7e] shadow-md active:scale-90"
                                onClick={() => onEdit(node)}
                                size="lg"
                                radius="xl"
                            >
                                <Edit size={18} strokeWidth={2.5} />
                            </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Add Child" withArrow transitionProps={{ transition: 'pop' }}>
                            <ActionIcon
                                variant="light"
                                color="teal"
                                onClick={() => onAddChild(node)}
                                size="lg"
                                radius="xl"
                                className="border border-teal-200 bg-white hover:bg-teal-50 active:scale-90"
                            >
                                <Plus size={18} strokeWidth={3} className="text-teal-600" />
                            </ActionIcon>
                        </Tooltip>

                        {!node.isSystem && (
                            <Tooltip label="Delete" withArrow transitionProps={{ transition: 'pop' }}>
                                <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    onClick={() => onDelete(node)}
                                    size="lg"
                                    radius="xl"
                                    className="hover:bg-red-50 active:scale-90"
                                >
                                    <Trash2 size={18} strokeWidth={2.5} />
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
