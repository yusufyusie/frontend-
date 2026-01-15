import { ActionIcon, Group, Stack, Text, Box, Collapse, Paper } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ChevronRight, ChevronDown, Edit, Plus, Trash2 } from 'lucide-react';
import { SystemLookup } from '../../../services/lookups.service';
import { LocalizedText } from '../../atoms/tms/LocalizedText';
import { LookupStatusBadge } from '../../atoms/tms/LookupStatusBadge';

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
        <Box mb={4}>
            <Paper
                withBorder
                p="sm"
                radius="sm"
                className="hover:shadow-md transition-all cursor-default"
                style={{ backgroundColor: 'white' }}
            >
                <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                        {hasChildren ? (
                            <ActionIcon variant="subtle" color="gray" onClick={toggle} size="sm">
                                {opened ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </ActionIcon>
                        ) : (
                            <Box w={28} />
                        )}
                        <Stack gap={0}>
                            <LocalizedText value={node.lookupValue as any} />
                            <Text size="xs" c="dimmed">{node.lookupCode}</Text>
                        </Stack>
                    </Group>

                    <Group gap="xs">
                        <LookupStatusBadge active={node.isActive} />
                        <ActionIcon variant="light" color="blue" onClick={() => onEdit(node)} size="sm" title="Edit">
                            <Edit size={14} />
                        </ActionIcon>
                        <ActionIcon variant="light" color="green" onClick={() => onAddChild(node)} size="sm" title="Add Child">
                            <Plus size={14} />
                        </ActionIcon>
                        {!node.isSystem && (
                            <ActionIcon variant="light" color="red" onClick={() => onDelete(node)} size="sm" title="Delete">
                                <Trash2 size={14} />
                            </ActionIcon>
                        )}
                    </Group>
                </Group>
            </Paper>

            {hasChildren && (
                <Collapse in={opened}>
                    <Box pl={32} mt={4}>
                        <Stack gap={4}>
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
