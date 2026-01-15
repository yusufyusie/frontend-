import { ActionIcon, Group, Stack, Text, Box, Collapse, Paper, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ChevronRight, ChevronDown, Edit, Plus, Trash2, Building2 } from 'lucide-react';
import { LandResource, LandResourceType } from '@/services/land-resources.service';
import { ResourceIcon } from '@/components/atoms/tms/ResourceIcon';

interface NodeProps {
    node: LandResource;
    onEdit: (node: LandResource) => void;
    onAddChild: (node: LandResource) => void;
    onDelete: (node: LandResource) => void;
}

const LandNode = ({ node, onEdit, onAddChild, onDelete }: NodeProps) => {
    const [opened, { toggle }] = useDisclosure(true);
    const hasChildren = node.children && node.children.length > 0;
    const canHaveChildren = node.type !== LandResourceType.PLOT;

    return (
        <Box mb={6}>
            <Paper
                withBorder
                p="md"
                radius="md"
                className="hover:shadow-md transition-all border-l-4"
                style={{
                    backgroundColor: 'white',
                    borderLeftColor: node.type === LandResourceType.ZONE ? '#2563eb' : node.type === LandResourceType.BLOCK ? '#f97316' : '#16a34a'
                }}
            >
                <Group justify="space-between" wrap="nowrap">
                    <Group gap="md" wrap="nowrap">
                        {hasChildren ? (
                            <ActionIcon variant="subtle" color="gray" onClick={toggle} size="sm">
                                {opened ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </ActionIcon>
                        ) : (
                            <Box w={32} />
                        )}

                        <ResourceIcon type={node.type} size={22} />

                        <Stack gap={0}>
                            <Group gap="xs">
                                <Text fw={600} size="sm">{node.nameEn}</Text>
                                <Text size="xs" c="dimmed">({node.code})</Text>
                            </Group>
                            <Text size="xs" c="dimmed" fs="italic">{node.nameAm}</Text>
                        </Stack>

                        <Group gap={4}>
                            {node.areaM2 && (
                                <Badge variant="light" color="gray" size="sm" radius="xs">
                                    {Number(node.areaM2).toLocaleString()} m²
                                </Badge>
                            )}
                            {node._count?.buildings ? (
                                <Badge variant="filled" color="blue" size="sm" radius="xs" leftSection={<Building2 size={10} />}>
                                    {node._count.buildings} Buildings
                                </Badge>
                            ) : null}
                        </Group>
                    </Group>

                    <Group gap="xs">
                        <ActionIcon variant="light" color="blue" onClick={() => onEdit(node)} size="sm" title="Edit">
                            <Edit size={14} />
                        </ActionIcon>
                        {canHaveChildren && (
                            <ActionIcon variant="light" color="green" onClick={() => onAddChild(node)} size="sm" title="Add Child">
                                <Plus size={14} />
                            </ActionIcon>
                        )}
                        <ActionIcon variant="light" color="red" onClick={() => onDelete(node)} size="sm" title="Delete">
                            <Trash2 size={14} />
                        </ActionIcon>
                    </Group>
                </Group>
            </Paper>

            {hasChildren && (
                <Collapse in={opened}>
                    <Box pl={40} mt={6}>
                        <Stack gap={6}>
                            {node.children?.map((child) => (
                                <LandNode
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
    data: LandResource[];
    onEdit: (node: LandResource) => void;
    onAddChild: (node: LandResource) => void;
    onDelete: (node: LandResource) => void;
}

export const LandResourceTree = ({ data, onEdit, onAddChild, onDelete }: TreeProps) => {
    return (
        <Stack gap={8}>
            {data.map((node) => (
                <LandNode
                    key={node.id}
                    node={node}
                    onEdit={onEdit}
                    onAddChild={onAddChild}
                    onDelete={onDelete}
                />
            ))}
            {data.length === 0 && (
                <Paper p="xl" withBorder radius="md" style={{ textAlign: 'center', backgroundColor: '#f8fafc' }}>
                    <Text c="dimmed">No land resources defined yet. Start by adding a Zone.</Text>
                </Paper>
            )}
        </Stack>
    );
};
