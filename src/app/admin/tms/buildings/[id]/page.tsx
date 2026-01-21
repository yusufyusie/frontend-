'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Title, Text, Group, Button, Paper, Stack, Grid, Badge, SimpleGrid, Box, LoadingOverlay, Breadcrumbs, Anchor, Divider } from '@mantine/core';
import { Building2, MapPin, Layers, LayoutList, Calendar, Info, ArrowLeft } from 'lucide-react';
import { buildingsService, Building } from '@/services/buildings.service';
import { FloorManager } from '@/components/organisms/tms/FloorManager';
import { toast } from '@/components/Toast';
import Link from 'next/link';

export default function BuildingDetailPage() {
    const params = useParams();
    const id = parseInt(params.id as string);
    const [building, setBuilding] = useState<Building | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) fetchBuilding();
    }, [id]);

    const fetchBuilding = async () => {
        setIsLoading(true);
        try {
            const res: any = await buildingsService.getOne(id);
            setBuilding(res.data || res);
        } catch (error) {
            toast.error('Failed to load building details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <LoadingOverlay visible />;
    if (!building) return <Box p="xl"><Text>Building not found</Text></Box>;

    return (
        <Box p="xl">
            <Group justify="space-between" mb="xl">
                <Box>
                    <Breadcrumbs mb="xs">
                        <Anchor href="/admin" size="xs">Admin</Anchor>
                        <Anchor href="/admin/tms/buildings" size="xs">Property Catalog</Anchor>
                        <Text size="xs" c="dimmed">{building.code}</Text>
                    </Breadcrumbs>
                    <Group gap="md">
                        <Button
                            variant="subtle"
                            color="gray"
                            component={Link}
                            href="/admin/tms/buildings"
                            leftSection={<ArrowLeft size={16} />}
                            p={0}
                        />
                        <Title order={2} fw={800}>{building.name}</Title>
                        <Badge size="lg" variant="light" color="blue">{building.code}</Badge>
                    </Group>
                </Box>
            </Group>

            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap="lg">
                        <Paper withBorder p="xl" radius="md">
                            <Title order={4} mb="lg">Quick Info</Title>
                            <Stack gap="md">
                                <Group gap="sm">
                                    <MapPin size={18} className="text-blue-600" />
                                    <Box>
                                        <Text size="xs" c="dimmed">Block Location</Text>
                                        <Text size="sm" fw={600}>{(building as any).block?.name || 'N/A'}</Text>
                                    </Box>
                                </Group>
                                <Group gap="sm">
                                    <Info size={18} className="text-orange-600" />
                                    <Box>
                                        <Text size="xs" c="dimmed">Building Classification</Text>
                                        <Text size="sm" fw={600}>{(building as any).buildingClass?.name || 'Standard'}</Text>
                                    </Box>
                                </Group>
                                <Group gap="sm">
                                    <Calendar size={18} className="text-green-600" />
                                    <Box>
                                        <Text size="xs" c="dimmed">Date Added</Text>
                                        <Text size="sm" fw={600}>{building.createdAt ? new Date(building.createdAt as any).toLocaleDateString() : 'N/A'}</Text>
                                    </Box>
                                </Group>
                            </Stack>

                            <Divider my="xl" />

                            <SimpleGrid cols={2}>
                                <Stack gap={0} align="center">
                                    <Text size="xl" fw={900}>{building.floors || 0}</Text>
                                    <Text size="xs" c="dimmed">Floors</Text>
                                </Stack>
                                <Stack gap={0} align="center">
                                    <Text size="xl" fw={900}>{building.plots?.length || 0}</Text>
                                    <Text size="xs" c="dimmed">Units/Plots</Text>
                                </Stack>
                            </SimpleGrid>
                        </Paper>

                        <Paper withBorder p="xl" radius="md" bg="blue.0" style={{ borderColor: '#bfdbfe' }}>
                            <Group gap="sm" mb="xs">
                                <Building2 size={24} className="text-blue-600" />
                                <Text fw={700} c="blue.9">Asset Status</Text>
                            </Group>
                            <Text size="xs" c="blue.8">This building is currently <b>{building.isActive ? 'Active' : 'Inactive'}</b>. All plots/units are manageable via the Unit Manager.</Text>
                        </Paper>
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Paper withBorder p="xl" radius="md" mih={600}>
                        <FloorManager buildingId={id} />
                    </Paper>
                </Grid.Col>
            </Grid>
        </Box>
    );
}
