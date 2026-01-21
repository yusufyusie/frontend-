import { useState, useEffect, useMemo } from 'react';
import { Paper, Group, Stack, Text, Button, ActionIcon, Box, SimpleGrid, Tabs, TextInput, NumberInput, Select, Divider, Title, Badge, Collapse } from '@mantine/core';
import { Layers, Plus, Trash2, Home, Maximize2, ChevronDown, ChevronRight, LayoutGrid, BoxIcon } from 'lucide-react';
import { buildingsService, Floor, Plot, Room } from '@/services/buildings.service';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { toast } from '@/components/Toast';

interface Props {
    buildingId: number;
}

export const FloorManager = ({ buildingId }: Props) => {
    const [floors, setFloors] = useState<Floor[]>([]);
    const [plots, setPlots] = useState<Plot[]>([]);
    const [activeFloorId, setActiveFloorId] = useState<string | null>(null);
    const [expandedPlotId, setExpandedPlotId] = useState<number | null>(null);
    const [roomTypes, setRoomTypes] = useState<SystemLookup[]>([]);
    const [roomStatuses, setRoomStatuses] = useState<SystemLookup[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [newFloor, setNewFloor] = useState({ code: '', nameEn: '', floorNumber: 0 });
    const [newPlot, setNewPlot] = useState({ code: '', name: '', area: 0 });
    const [newRoom, setNewRoom] = useState<{ code: string; area: number; roomTypeId?: number; roomStatusId?: number }>({ code: '', area: 0, roomTypeId: undefined, roomStatusId: undefined });

    useEffect(() => {
        fetchData();
        lookupsService.getByCategory('ROOM_TYPE').then(res => setRoomTypes((res as any).data || res));
        lookupsService.getByCategory('ROOM_STATUS').then(res => setRoomStatuses((res as any).data || res));
    }, [buildingId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [floorsRes, plotsRes] = await Promise.all([
                buildingsService.getFloors(buildingId),
                buildingsService.getPlots(buildingId)
            ]);

            const floorData = (floorsRes.data || floorsRes) as Floor[];
            const plotData = (plotsRes.data || plotsRes) as Plot[];

            setFloors(floorData);
            setPlots(plotData);

            if (floorData.length > 0 && !activeFloorId) {
                setActiveFloorId(floorData[0].id.toString());
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddFloor = async () => {
        try {
            await buildingsService.addFloor(buildingId, { ...newFloor, nameAm: newFloor.nameEn });
            toast.success('Structural floor added');
            setNewFloor({ code: '', nameEn: '', floorNumber: floors.length + 1 });
            fetchData();
        } catch (e: any) { toast.error('Failed to add floor'); }
    };

    const handleAddPlot = async (floorNumber: number) => {
        try {
            await buildingsService.addPlot(buildingId, { ...newPlot, floorNumber });
            toast.success('Unit/Plot added to floor');
            setNewPlot({ code: '', name: '', area: 0 });
            fetchData();
        } catch (e: any) { toast.error('Failed to add unit'); }
    };

    const handleAddRoom = async (plotId: number) => {
        try {
            await buildingsService.addRoom(plotId, newRoom);
            toast.success('Room added to unit');
            setNewRoom({ code: '', area: 0, roomTypeId: undefined, roomStatusId: undefined });
            fetchData();
        } catch (e: any) { toast.error('Failed to add room'); }
    };

    const handleDeleteFloor = async (id: number) => {
        if (confirm('Delete this structural floor?')) {
            try {
                await buildingsService.deleteFloor(id);
                toast.success('Floor deleted');
                fetchData();
            } catch (e: any) { toast.error('Delete failed'); }
        }
    };

    const plotsByFloor = useMemo(() => {
        const grouped: Record<number, Plot[]> = {};
        plots.forEach(p => {
            const floorNum = p.floorNumber || 0;
            if (!grouped[floorNum]) grouped[floorNum] = [];
            grouped[floorNum].push(p);
        });
        return grouped;
    }, [plots]);

    return (
        <Stack gap="xl">
            <Paper withBorder p="md" radius="md" bg="gray.50/50">
                <Text fw={700} size="sm" mb="md" c="blue.9">Register Structural Floor</Text>
                <Group align="flex-end" grow gap="sm">
                    <TextInput
                        label="Code" placeholder="G0"
                        value={newFloor.code}
                        onChange={e => setNewFloor({ ...newFloor, code: e.target.value })}
                    />
                    <TextInput
                        label="Label" placeholder="Ground Floor"
                        value={newFloor.nameEn}
                        onChange={e => setNewFloor({ ...newFloor, nameEn: e.target.value })}
                    />
                    <NumberInput
                        label="Floor Level"
                        value={newFloor.floorNumber}
                        onChange={val => setNewFloor({ ...newFloor, floorNumber: Number(val) })}
                    />
                    <Button leftSection={<Plus size={16} />} onClick={handleAddFloor} color="blue">Add Floor</Button>
                </Group>
            </Paper>

            <Divider label={<Group gap={4}><Layers size={14} /><Text fw={700}>Building Units & Spaces</Text></Group>} labelPosition="center" />

            {floors.length > 0 ? (
                <Tabs value={activeFloorId} onChange={setActiveFloorId} variant="pills" radius="md">
                    <Tabs.List>
                        {floors.slice().sort((a, b) => a.floorNumber - b.floorNumber).map(f => (
                            <Tabs.Tab key={f.id} value={f.id.toString()} leftSection={<Layers size={14} />}>
                                <Group gap={8}>
                                    <Text size="sm" fw={700}>{f.nameEn}</Text>
                                    <Badge size="xs" variant="filled" color="gray">{plotsByFloor[f.floorNumber]?.length || 0}</Badge>
                                    <ActionIcon
                                        size="xs" color="red" variant="subtle"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteFloor(f.id); }}
                                    >
                                        <Trash2 size={12} />
                                    </ActionIcon>
                                </Group>
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>

                    {floors.map(f => (
                        <Tabs.Panel key={f.id} value={f.id.toString()} pt="xl">
                            <Stack gap="lg">
                                <Group justify="space-between" align="center">
                                    <Box>
                                        <Title order={4} c="tms-navy">{f.nameEn} Inventory</Title>
                                        <Text size="xs" c="dimmed">Manage rentable units (plots) and their internal rooms for this level.</Text>
                                    </Box>
                                    <Paper withBorder p="xs" radius="sm" bg="white">
                                        <Group gap="md">
                                            <Group gap={4}>
                                                <LayoutGrid size={14} className="text-blue-600" />
                                                <Text size="xs" fw={700}>{plotsByFloor[f.floorNumber]?.length || 0} Units</Text>
                                            </Group>
                                            <Group gap={4}>
                                                <Maximize2 size={14} className="text-green-600" />
                                                <Text size="xs" fw={700}>{plotsByFloor[f.floorNumber]?.reduce((acc, p) => acc + Number(p.area), 0).toFixed(2)} m²</Text>
                                            </Group>
                                        </Group>
                                    </Paper>
                                </Group>

                                <Paper withBorder p="md" radius="md" style={{ borderStyle: 'dashed' }}>
                                    <Text size="xs" fw={800} mb="xs" c="dimmed" tt="uppercase">Add Level Unit (Plot)</Text>
                                    <Group align="flex-end" grow gap="sm">
                                        <TextInput
                                            placeholder="Unit ID (e.g. R-101)"
                                            value={newPlot.code}
                                            onChange={e => setNewPlot({ ...newPlot, code: e.target.value })}
                                        />
                                        <TextInput
                                            placeholder="Description (e.g. Office A)"
                                            value={newPlot.name}
                                            onChange={e => setNewPlot({ ...newPlot, name: e.target.value })}
                                        />
                                        <NumberInput
                                            placeholder="Area m²"
                                            value={newPlot.area}
                                            onChange={val => setNewPlot({ ...newPlot, area: Number(val) })}
                                        />
                                        <Button variant="light" color="teal" onClick={() => handleAddPlot(f.floorNumber)} leftSection={<Plus size={16} />}>
                                            Add Unit
                                        </Button>
                                    </Group>
                                </Paper>

                                <Stack gap="sm">
                                    {(plotsByFloor[f.floorNumber] || []).map(plot => (
                                        <Paper key={plot.id} withBorder p="md" radius="md" className="hover:shadow-sm transition-shadow">
                                            <Group justify="space-between">
                                                <Group gap="md">
                                                    <BoxIcon size={20} className="text-teal-600" />
                                                    <Box>
                                                        <Text fw={800} size="sm">{plot.code} - {plot.name}</Text>
                                                        <Text size="xs" c="dimmed">{plot.area} m² • {plot.rooms?.length || 0} rooms</Text>
                                                    </Box>
                                                </Group>
                                                <Group>
                                                    <Button
                                                        variant="subtle"
                                                        size="xs"
                                                        radius="xl"
                                                        onClick={() => setExpandedPlotId(expandedPlotId === plot.id ? null : plot.id)}
                                                        rightSection={expandedPlotId === plot.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                    >
                                                        {expandedPlotId === plot.id ? 'Hide Rooms' : 'Manage Rooms'}
                                                    </Button>
                                                    <ActionIcon color="red" variant="subtle" onClick={async () => {
                                                        if (confirm(`Delete Unit ${plot.code}?`)) {
                                                            await buildingsService.deletePlot(plot.id);
                                                            fetchData();
                                                        }
                                                    }}>
                                                        <Trash2 size={16} />
                                                    </ActionIcon>
                                                </Group>
                                            </Group>

                                            <Collapse in={expandedPlotId === plot.id}>
                                                <Box mt="md" pt="md" style={{ borderTop: '1px solid #f1f5f9' }}>
                                                    <Title order={6} mb="sm" c="gray.7">Internal Rooms / Sub-Spaces</Title>
                                                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                                                        {(plot.rooms || []).map(room => (
                                                            <Paper key={room.id} withBorder p="xs" radius="sm" bg="gray.50">
                                                                <Group justify="space-between">
                                                                    <Box>
                                                                        <Text size="xs" fw={700}>{room.code}</Text>
                                                                        <Text size="xs" c="dimmed">{room.area} m²</Text>
                                                                    </Box>
                                                                    <Group gap={4}>
                                                                        <Badge size="xs" color="blue">{room.roomType?.name || 'Office'}</Badge>
                                                                        <ActionIcon size="xs" color="red" variant="subtle" onClick={async () => {
                                                                            await buildingsService.deleteRoom(room.id);
                                                                            fetchData();
                                                                        }}>
                                                                            <Trash2 size={12} />
                                                                        </ActionIcon>
                                                                    </Group>
                                                                </Group>
                                                            </Paper>
                                                        ))}
                                                    </SimpleGrid>

                                                    <Paper p="sm" mt="sm" bg="teal.0/30" radius="sm">
                                                        <Group gap="xs" align="flex-end">
                                                            <TextInput
                                                                placeholder="Room Code" size="xs"
                                                                value={newRoom.code}
                                                                onChange={e => setNewRoom({ ...newRoom, code: e.target.value })}
                                                                style={{ flex: 1 }}
                                                            />
                                                            <NumberInput
                                                                placeholder="Area" size="xs"
                                                                value={newRoom.area}
                                                                onChange={val => setNewRoom({ ...newRoom, area: Number(val) })}
                                                                w={80}
                                                            />
                                                            <Select
                                                                placeholder="Type" size="xs"
                                                                data={roomTypes.map(r => ({ value: String(r.id), label: r.lookupValue?.en || r.lookupCode }))}
                                                                onChange={val => setNewRoom({ ...newRoom, roomTypeId: val ? Number(val) : undefined } as any)}
                                                                w={120}
                                                            />
                                                            <Button size="xs" color="teal" onClick={() => handleAddRoom(plot.id)}>Add</Button>
                                                        </Group>
                                                    </Paper>
                                                </Box>
                                            </Collapse>
                                        </Paper>
                                    ))}

                                    {(plotsByFloor[f.floorNumber] || []).length === 0 && (
                                        <Box py={30} style={{ textAlign: 'center' }}>
                                            <Text c="dimmed" size="sm">No units registered for this floor.</Text>
                                        </Box>
                                    )}
                                </Stack>
                            </Stack>
                        </Tabs.Panel>
                    ))}
                </Tabs>
            ) : (
                <Paper p={50} withBorder radius="md" bg="gray.0" style={{ textAlign: 'center', borderStyle: 'dashed' }}>
                    <Stack align="center" gap="xs">
                        <Layers size={40} className="text-gray-300" />
                        <Text fw={700} c="gray.6">No Floors Defined</Text>
                        <Text size="sm" c="dimmed">Structural floors must be defined before adding units (plots).</Text>
                    </Stack>
                </Paper>
            )}
        </Stack>
    );
};
