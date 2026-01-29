'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Container, Title, Text, Group, Button, Paper, Stack, Grid, Badge,
    Box, LoadingOverlay, Breadcrumbs, Anchor, Tabs, Divider, SimpleGrid,
    Table, rem
} from '@mantine/core';
import {
    Building2, MapPin, History, ArrowLeft, Settings, ShieldCheck,
    ArrowRightLeft, FileText, LayoutDashboard, Ruler, Layers, DoorOpen,
    Landmark, Users, Zap
} from 'lucide-react';
import { locationsService } from '@/services/locations.service';
import { ResourceProfilePreview } from '@/components/organisms/tms/ResourceProfilePreview';
import { BuildingStackExplorer } from '@/components/organisms/tms/BuildingStackExplorer';
import { toast } from '@/components/Toast';
import Link from 'next/link';

export default function ResourceDetailPage() {
    const params = useParams();
    const type = params.type as string;
    const id = parseInt(params.id as string);
    const router = useRouter();

    const [resource, setResource] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id && type) fetchResource();
    }, [id, type]);

    const fetchResource = async () => {
        setIsLoading(true);
        try {
            const res: any = await locationsService.getOne(type, id);
            setResource(res.data || res);
        } catch (error) {
            toast.error('Failed to load asset intelligence');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <LoadingOverlay visible />;
    if (!resource) return <Container py="xl"><Text>Asset not found</Text></Container>;

    const primaryArea = resource.area || resource.totalArea || resource.contractArea || 0;
    const activeLeases = resource.leases || [];

    return (
        <Container size="xl" py="xl" className="animate-fade-in">
            {/* Breadcrumbs & Header */}
            <Box mb="xl">
                <Breadcrumbs mb="xs">
                    <Anchor href="/admin" size="xs">Admin</Anchor>
                    <Anchor href={`/admin/tms/${type === 'PLOT' ? 'land' : 'buildings'}`} size="xs">Asset Directory</Anchor>
                    <Text size="xs" c="dimmed">{resource.code}</Text>
                </Breadcrumbs>

                <Group justify="space-between" align="flex-start">
                    <Box>
                        <Group gap="md">
                            <Button
                                variant="subtle"
                                color="gray"
                                onClick={() => router.back()}
                                leftSection={<ArrowLeft size={16} />}
                                p={0}
                            />
                            <Title order={1} fw={900} className="text-[#16284F] tracking-tight">
                                {resource.name || resource.code}
                            </Title>
                            <Badge size="lg" variant="dot" color={resource.isActive ? 'teal' : 'red'} className="glass border shadow-sm">
                                {resource.status?.name || (resource.isActive ? 'Active' : 'Inactive')}
                            </Badge>
                        </Group>
                        <Group gap="xs" mt={4} ml={40}>
                            <Text c="dimmed" size="sm" fw={600}>{type} • REGISTRY ID: {resource.id}</Text>
                            <Text c="dimmed" size="sm">•</Text>
                            <Text c="dimmed" size="sm">Indexed on {new Date(resource.createdAt).toLocaleDateString()}</Text>
                        </Group>
                    </Box>
                    <Group>
                        <Button variant="light" color="blue" leftSection={<Settings size={18} />} className="hover-lift rounded-xl glass">Technical Config</Button>
                        <Button variant="filled" color="indigo" leftSection={<MapPin size={18} />} className="shadow-lg hover-lift rounded-xl">View on GIS</Button>
                    </Group>
                </Group>
            </Box>

            {/* Main Stage Grid (TMS 4.0 Split-Pane) */}
            <Grid gutter="xl" grow>
                {/* LEFT CONTEXT PANEL: Asset Identity Artifact */}
                <Grid.Col span={{ base: 12, lg: 4 }} visibleFrom="lg">
                    <Box h="100%" style={{ position: 'sticky', top: '1rem' }}>
                        <ResourceProfilePreview
                            data={resource}
                            type={type.toUpperCase()}
                        />
                    </Box>
                </Grid.Col>

                {/* RIGHT STAGE: Tactical Asset Intelligence */}
                <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Stack gap="xl">
                        {/* Stats Overview */}
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                            <Paper withBorder p="lg" radius="1.5rem" className="glass shadow-sm hover-glow transition-base" style={{ background: 'white' }}>
                                <Group justify="space-between" mb="xs">
                                    <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">Spatial Footprint</Text>
                                    <Box p={6} bg="teal.0" style={{ borderRadius: '8px' }}><Ruler size={14} className="text-teal-600" /></Box>
                                </Group>
                                <Group gap="xs" align="flex-end">
                                    <Title order={3} fw={900} c="#16284F">{primaryArea.toLocaleString()}</Title>
                                    <Text size="xs" c="dimmed" mb={4} fw={700}>m²</Text>
                                </Group>
                            </Paper>

                            <Paper withBorder p="lg" radius="1.5rem" className="glass shadow-sm hover-glow transition-base" style={{ background: 'white' }}>
                                <Group justify="space-between" mb="xs">
                                    <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">Occupancy</Text>
                                    <Box p={6} bg="blue.0" style={{ borderRadius: '8px' }}><Users size={14} className="text-blue-600" /></Box>
                                </Group>
                                <Title order={3} fw={900} c="#16284F">
                                    {activeLeases.length > 0 ? 'RENTED' : 'VACANT'}
                                </Title>
                            </Paper>

                            <Paper withBorder p="lg" radius="1.5rem" className="glass shadow-sm hover-glow transition-base" style={{ background: 'white' }}>
                                <Group justify="space-between" mb="xs">
                                    <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">Venture Count</Text>
                                    <Box p={6} bg="indigo.0" style={{ borderRadius: '8px' }}><Landmark size={14} className="text-indigo-600" /></Box>
                                </Group>
                                <Title order={3} fw={900} c="#16284F">{activeLeases.length}</Title>
                            </Paper>

                            <Paper withBorder p="lg" radius="1.5rem" className="glass shadow-sm hover-glow transition-base" style={{ background: 'white' }}>
                                <Group justify="space-between" mb="xs">
                                    <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">Asset Health</Text>
                                    <Box p={6} bg="green.0" style={{ borderRadius: '8px' }}><ShieldCheck size={14} className="text-green-600" /></Box>
                                </Group>
                                <Title order={3} fw={900} c="#16284F">EXCELLENT</Title>
                            </Paper>
                        </SimpleGrid>

                        {/* Content Tabs */}
                        <Tabs defaultValue="management" variant="pills" radius="xl">
                            <Tabs.List className="glass p-1 border shadow-xs inline-flex mb-lg" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
                                <Tabs.Tab h={rem(40)} value="management" leftSection={<LayoutDashboard size={14} />}>Occupancy Hub</Tabs.Tab>
                                <Tabs.Tab h={rem(40)} value="details" leftSection={<Layers size={14} />}>Hierarchy & Child Assets</Tabs.Tab>
                                <Tabs.Tab h={rem(40)} value="history" leftSection={<History size={14} />}>Evolution Log</Tabs.Tab>
                                <Tabs.Tab h={rem(40)} value="docs" leftSection={<FileText size={14} />}>Technical Archive</Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="management">
                                <Paper withBorder p="xl" radius="xl" className="glass shadow-md">
                                    <Group justify="space-between" mb="xl">
                                        <Box>
                                            <Title order={4} className="text-[#16284F]">Venture Assignment History</Title>
                                            <Text size="xs" c="dimmed">Detailed log of past and current corporate occupants</Text>
                                        </Box>
                                        <Button variant="light" color="blue" size="xs" leftSection={<ArrowRightLeft size={14} />}>Reassign Asset</Button>
                                    </Group>

                                    <Table verticalSpacing="md" highlightOnHover>
                                        <Table.Thead className="bg-gray-50/50">
                                            <Table.Tr>
                                                <Table.Th h={rem(40)}>Corporate Name</Table.Th>
                                                <Table.Th>Agreement Ref</Table.Th>
                                                <Table.Th>Leased Area</Table.Th>
                                                <Table.Th>Status</Table.Th>
                                                <Table.Th>Action</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {activeLeases.length === 0 ? (
                                                <Table.Tr>
                                                    <Table.Td colSpan={5} style={{ textAlign: 'center' }} py="xl">
                                                        <Stack align="center" gap="xs">
                                                            <MapPin size={32} className="text-gray-200" />
                                                            <Text c="dimmed" size="sm">No active occupant assigned to this spatial resource.</Text>
                                                        </Stack>
                                                    </Table.Td>
                                                </Table.Tr>
                                            ) : (
                                                activeLeases.map((l: any) => (
                                                    <Table.Tr key={l.id}>
                                                        <Table.Td>
                                                            <Group gap="sm">
                                                                <Box p={6} bg="blue.0" style={{ borderRadius: '6px' }}><Building2 size={12} className="text-blue-600" /></Box>
                                                                <Text fw={700} size="sm">{l.tenant?.name}</Text>
                                                            </Group>
                                                        </Table.Td>
                                                        <Table.Td><Badge variant="outline" size="sm">{l.contractNumber}</Badge></Table.Td>
                                                        <Table.Td><Text fw={600} size="sm">{l.actualArea} m²</Text></Table.Td>
                                                        <Table.Td><Badge color="teal" size="sm">{l.status?.name || 'Active'}</Badge></Table.Td>
                                                        <Table.Td>
                                                            <Button variant="subtle" size="xs" component={Link} href={`/admin/tms/tenants/${l.tenantId}`}>View Profile</Button>
                                                        </Table.Td>
                                                    </Table.Tr>
                                                ))
                                            )}
                                        </Table.Tbody>
                                    </Table>
                                </Paper>
                            </Tabs.Panel>

                            <Tabs.Panel value="details">
                                <Grid gutter="xl">
                                    <Grid.Col span={{ base: 12, md: 7 }}>
                                        {type.toUpperCase() === 'BUILDING' ? (
                                            <BuildingStackExplorer
                                                buildingName={resource.name || resource.code}
                                                floors={resource.floorDetails || []}
                                            />
                                        ) : (
                                            <Paper withBorder p="xl" radius="xl" className="glass shadow-md h-full">
                                                <Title order={4} mb="xl" className="text-[#16284F]">Structural Hierarchy</Title>
                                                <Stack gap="md">
                                                    {type === 'PLOT' && resource.buildings?.map((bldg: any) => (
                                                        <Paper key={bldg.id} withBorder p="md" radius="lg" className="hover-lift transition-base">
                                                            <Group justify="space-between">
                                                                <Group>
                                                                    <Box p={8} bg="blue.0" style={{ borderRadius: '8px' }}><Building2 size={18} className="text-blue-600" /></Box>
                                                                    <Box>
                                                                        <Text fw={700} size="sm">{bldg.name}</Text>
                                                                        <Text size="xs" c="dimmed">Built: {bldg.yearBuilt || 'TBD'}</Text>
                                                                    </Box>
                                                                </Group>
                                                                <Button variant="light" size="xs" component={Link} href={`/admin/tms/resources/building/${bldg.id}`}>Details</Button>
                                                            </Group>
                                                        </Paper>
                                                    ))}
                                                    {(type === 'ROOM' || type === 'ZONE' || type === 'BLOCK') && (
                                                        <Box py="xl" style={{ textAlign: 'center' }}>
                                                            <Text c="dimmed" size="sm">This is an atomic spatial node.</Text>
                                                        </Box>
                                                    )}
                                                </Stack>
                                            </Paper>
                                        )}
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, md: 5 }}>
                                        <Paper withBorder p="xl" radius="xl" className="glass shadow-md h-full">
                                            <Title order={4} mb="xl" className="text-[#16284F]">Asset Context</Title>
                                            <Stack gap="md">
                                                <Box>
                                                    <Text size="xs" fw={800} c="dimmed" tt="uppercase">Registry Context</Text>
                                                    <Paper withBorder p="sm" mt={4} radius="md" bg="gray.0">
                                                        <Text size="xs" fw={500}>The {type} is currently indexed as {resource.status?.name || 'Operational'} in the master central plan.</Text>
                                                    </Paper>
                                                </Box>
                                                <Box>
                                                    <Text size="xs" fw={800} c="dimmed" tt="uppercase">Facility Features</Text>
                                                    <Group gap="xs" mt={8}>
                                                        {resource.hasElevator && <Badge variant="light" color="blue">Elevator</Badge>}
                                                        {resource.hasParking && <Badge variant="light" color="indigo">Parking</Badge>}
                                                        {resource.capacity && <Badge variant="light" color="teal">Cap: {resource.capacity}</Badge>}
                                                    </Group>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </Grid.Col>
                                </Grid>
                            </Tabs.Panel>

                            <Tabs.Panel value="history">
                                <Paper withBorder p="xl" radius="xl" className="glass shadow-md">
                                    <Title order={4} mb="xl" className="text-[#16284F]">Historical Evolution</Title>
                                    <Text size="sm" c="dimmed">History of modifications, status changes, and former occupants.</Text>
                                    <Divider my="xl" />
                                    <Stack gap="md" align="center" py={60}>
                                        <History size={48} className="text-gray-200" strokeWidth={1} />
                                        <Text c="dimmed" size="xs" fw={500}>Detailed event logs for this asset are being migrated.</Text>
                                    </Stack>
                                </Paper>
                            </Tabs.Panel>

                            <Tabs.Panel value="docs">
                                <Paper withBorder p="xl" radius="xl" className="glass shadow-md">
                                    <Title order={4} mb="xl" className="text-[#16284F]">Technical Registry</Title>
                                    <Text size="sm" c="dimmed">Structural drawings, master plan references, and land titles.</Text>
                                    <Divider my="xl" />
                                    <Box py={40} style={{ textAlign: 'center' }}>
                                        <Group justify="center">
                                            <Badge p="xl" radius="md" variant="light" color="gray" h={100} w={120}>CAD ARCHIVE</Badge>
                                            <Badge p="xl" radius="md" variant="light" color="gray" h={100} w={120}>LAND TITLE</Badge>
                                            <Badge p="xl" radius="md" variant="light" color="gray" h={100} w={120}>PLAN REF</Badge>
                                        </Group>
                                    </Box>
                                </Paper>
                            </Tabs.Panel>
                        </Tabs>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
