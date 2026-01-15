import { Paper, Group, Stack, Text, Badge, ActionIcon, Box, SimpleGrid } from '@mantine/core';
import { Building2, Layers, DoorOpen, Eye, Trash2 } from 'lucide-react';
import { Building } from '../../../services/buildings.service';
import Link from 'next/link';

interface Props {
    building: Building;
    onDelete: (id: number) => void;
}

export const BuildingCard = ({ building, onDelete }: Props) => {
    return (
        <Paper withBorder p="lg" radius="md" className="hover:shadow-lg transition-all group overflow-hidden pos-relative">
            <Group justify="space-between" mb="md">
                <Box>
                    <Group gap="xs" mb={4}>
                        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <Building2 size={24} className="text-blue-600" />
                        </div>
                        <Stack gap={0}>
                            <Text fw={700} size="lg">{building.nameEn}</Text>
                            <Text size="xs" c="dimmed">{building.code}</Text>
                        </Stack>
                    </Group>
                    <Text size="sm" c="dimmed" fs="italic">{building.nameAm}</Text>
                </Box>

                <Group gap="xs">
                    <ActionIcon
                        component={Link}
                        href={`/admin/tms/buildings/${building.id}`}
                        variant="light"
                        color="blue"
                        size="md"
                    >
                        <Eye size={18} />
                    </ActionIcon>
                    <ActionIcon
                        variant="light"
                        color="red"
                        size="md"
                        onClick={() => onDelete(building.id)}
                    >
                        <Trash2 size={18} />
                    </ActionIcon>
                </Group>
            </Group>

            <SimpleGrid cols={2} gap="sm" mt="md">
                <Paper withBorder p="xs" radius="sm" bg="gray.0">
                    <Group gap="xs">
                        <Layers size={14} className="text-gray-500" />
                        <Text size="xs" fw={500}>Floors: {building.totalFloors}</Text>
                    </Group>
                </Paper>
                <Paper withBorder p="xs" radius="sm" bg="gray.0">
                    <Group gap="xs">
                        <DoorOpen size={14} className="text-gray-500" />
                        <Text size="xs" fw={500}>Rooms: {building.floors?.reduce((acc, f) => acc + (f._count?.rooms || 0), 0) || 0}</Text>
                    </Group>
                </Paper>
            </SimpleGrid>

            {/* Plot info */}
            <Box mt="md" pt="sm" style={{ borderTop: '1px solid #f1f5f9' }}>
                <Text size="xs" c="dimmed">Located on Plot: <span className="text-blue-600 font-medium">{(building as any).plot?.code || 'N/A'}</span></Text>
            </Box>
        </Paper>
    );
};
