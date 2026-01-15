import { ActionIcon, Group, Stack, Text, Box, Collapse, Paper, Tooltip, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ChevronRight, ChevronDown, Edit, Plus, Trash2, Hash } from 'lucide-react';
import { SystemLookup } from '@/services/lookups.service';
import { LocalizedText } from '@/components/atoms/tms/LocalizedText';
import { LookupStatusBadge } from '@/components/atoms/tms/LookupStatusBadge';

interface NodeProps {
    node: SystemLookup;
    onEdit: (node: SystemLookup) => void;
    onAddChild: (node: SystemLookup) => void;
    onDelete: (node: SystemLookup) => void;
}

const LookupNode = ({ node, onEdit, onAddChild, onDelete }: NodeProps) => {
    const [opened, { toggle }] = useDisclosure(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <Box mb={8}>
            <Paper
                withBorder
                p="md"
                radius="lg"
                className="hover:shadow-lg transition-all cursor-default border-gray-100"
                style={{
                    backgroundColor: 'white',
                    borderLeft: node.isActive ? '4px solid #0C7C92' : '4px solid #e2e8f0'
                }}
            >
                <Group justify="space-between" wrap="nowrap">
                    <Group gap="md" wrap="nowrap">
                        {hasChildren ? (
                            <ActionIcon
                                variant="light"
                                color="teal"
                                onClick={toggle}
                                size="md"
                                radius="md"
                                className="shadow-sm"
                            >
                                {opened ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </ActionIcon>
                        ) : (
                            <Box w={34} display="flex" style={{ justifyContent: 'center' }}>
                                <Hash size={14} className="text-gray-300" />
                            </Box>
                        )}
                        <Stack gap={2}>
                            <Group gap="xs">
                                <LocalizedText value={node.lookupValue as any} />
                                {node.isSystem && (
                                    <Badge size="xs" variant="light" color="gray" radius="xs">System</Badge>
                                )}
                            </Group>
                            <Group gap={6}>
                                <Text size="xs" fw={700} className="text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">
                                    {node.lookupCode}
                                </Text>
                                {node.metadata?.color && (
                                    <Box w={8} h={8} style={{ borderRadius: '50%', backgroundColor: node.metadata.color }} />
                                )}
                            </Group>
                        </Stack>
                    </Group>

                    <Group gap="xs">
                        <LookupStatusBadge active={node.isActive} />

                        <Tooltip label="Edit Details" withArrow position="top">
                            <ActionIcon variant="light" color="blue" onClick={() => onEdit(node)} size="md" radius="md">
                                <Edit size={16} />
                            </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Append Child" withArrow position="top">
                            <ActionIcon variant="light" color="teal" onClick={() => onAddChild(node)} size="md" radius="md">
                                <Plus size={16} />
                            </ActionIcon>
                        </Tooltip>

                        {!node.isSystem && (
                            <Tooltip label="Delete Lookup" withArrow position="top">
                                <ActionIcon variant="light" color="red" onClick={() => onDelete(node)} size="md" radius="md">
                                    <Trash2 size={16} />
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </Group>
                </Group>
            </Paper>

            {hasChildren && (
                <Collapse in={opened}>
                    <Box pl={38} mt={8} mb={12} style={{ borderLeft: '2px dashed #e2e8f0', marginLeft: '17px' }}>
                        <Stack gap={8}>
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
                </Collapse>
            )}
        </Box>
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
