import { useState, useEffect } from 'react';
import { Paper, Group, Stack, Text, Button, ActionIcon, Box, SimpleGrid, Tabs, TextInput, NumberInput, Select, Divider, Title, Badge } from '@mantine/core';
import { Layers, Plus, Trash2, Home, Maximize2 } from 'lucide-react';
import { buildingsService, Floor, Room } from '@/services/buildings.service';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { toast } from '@/components/Toast';

interface Props {
    buildingId: number;
}

export const FloorManager = ({ buildingId }: Props) => {
    const [floors, setFloors] = useState<Floor[]>([]);
    const [activeFloorId, setActiveFloorId] = useState<string | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomStatusTypes, setRoomStatusTypes] = useState<SystemLookup[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form states for adding
    const [newFloor, setNewFloor] = useState({ code: '', nameEn: '', floorNumber: 0 });
    const [newRoom, setNewRoom] = useState<{ code: string; nameEn: string; areaM2: number; statusId?: number }>({ code: '', nameEn: '', areaM2: 0, statusId: undefined });

    useEffect(() => {
        fetchFloors();
        lookupsService.getByCategory('ROOM_STATUS').then(res => setRoomStatusTypes((res as any).data || res));
    }, [buildingId]);

    useEffect(() => {
        if (activeFloorId) {
            fetchRooms(parseInt(activeFloorId));
        }
    }, [activeFloorId]);

    const fetchFloors = async () => {
        setIsLoading(true);
        try {
            const res: any = await buildingsService.getFloors(buildingId);
            const data = (res.data || res) as Floor[];
            setFloors(data);
            if (data.length > 0 && !activeFloorId) {
                setActiveFloorId(data[0].id.toString());
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRooms = async (floorId: number) => {
        const res: any = await buildingsService.getRooms(floorId);
        setRooms(res.data || res);
    };

    const handleAddFloor = async () => {
        try {
            await buildingsService.addFloor(buildingId, newFloor);
            toast.success('Floor added');
            setNewFloor({ code: '', nameEn: '', floorNumber: floors.length });
            fetchFloors();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed');
        }
    };

    const handleAddRoom = async () => {
        if (!activeFloorId) return;
        try {
            await buildingsService.addRoom(parseInt(activeFloorId), newRoom);
            toast.success('Room added');
            setNewRoom({ code: '', nameEn: '', areaM2: 0, statusId: undefined });
            fetchRooms(parseInt(activeFloorId));
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed');
        }
    };

    const handleDeleteFloor = async (id: number) => {
        if (confirm('Delete this floor?')) {
            try {
                await buildingsService.deleteFloor(id);
                toast.success('Floor deleted');
                fetchFloors();
            } catch (e: any) {
                toast.error(e.response?.data?.message || 'Delete failed');
            }
        }
    };

    const handleDeleteRoom = async (id: number) => {
        try {
            await buildingsService.deleteRoom(id);
            toast.success('Room deleted');
            fetchRooms(parseInt(activeFloorId!));
        } catch (e: any) {
            toast.error('Failed to delete room');
        }
    };

    return (
        <Stack gap="xl">
            <Paper withBorder p="md" radius="md">
                <Text fw={600} size="sm" mb="md">Add New Floor</Text>
                <Group align="flex-end" grow>
                    <TextInput
                        label="Code" placeholder="e.g. GRD"
                        value={newFloor.code}
                        onChange={e => setNewFloor({ ...newFloor, code: e.target.value })}
                    />
                    <TextInput
                        label="Name (EN)" placeholder="Ground Floor"
                        value={newFloor.nameEn}
                        onChange={e => setNewFloor({ ...newFloor, nameEn: e.target.value })}
                    />
                    <NumberInput
                        label="Floor #"
                        value={newFloor.floorNumber}
                        onChange={val => setNewFloor({ ...newFloor, floorNumber: typeof val === 'number' ? val : 0 })}
                    />
                    <Button leftSection={<Plus size={16} />} onClick={handleAddFloor}>Add Floor</Button>
                </Group>
            </Paper>

            <Divider label="Building Layout" labelPosition="center" />

            <Tabs value={activeFloorId} onChange={setActiveFloorId} variant="outline" radius="md">
                <Tabs.List>
                    {floors.map(f => (
                        <Tabs.Tab key={f.id} value={f.id.toString()} leftSection={<Layers size={14} />}>
                            <Group gap={4}>
                                {f.nameEn}
                                <ActionIcon
                                    size="xs" color="red" variant="subtle"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteFloor(f.id); }}
                                >
                                    <Trash2 size={10} />
                                </ActionIcon>
                            </Group>
                        </Tabs.Tab>
                    ))}
                </Tabs.List>

                {floors.map(f => (
                    <Tabs.Panel key={f.id} value={f.id.toString()} pt="xl">
                        <Stack gap="lg">
                            <Group justify="space-between">
                                <Box>
                                    <Title order={4}>{f.nameEn} Units</Title>
                                    <Text size="xs" c="dimmed">Manage rooms/spaces for this floor</Text>
                                </Box>
                                <Paper withBorder p="xs" radius="sm">
                                    <Group gap="xl">
                                        <Group gap={4}>
                                            <Home size={14} className="text-blue-600" />
                                            <Text size="xs" fw={700}>{rooms.length} Units</Text>
                                        </Group>
                                        <Group gap={4}>
                                            <Maximize2 size={14} className="text-green-600" />
                                            <Text size="xs" fw={700}>{rooms.reduce((acc, r) => acc + Number(r.areaM2), 0).toFixed(2)} m² Total</Text>
                                        </Group>
                                    </Group>
                                </Paper>
                            </Group>

                            <Paper withBorder p="md" radius="md" style={{ backgroundColor: '#f9fafb' }}>
                                <Group align="flex-end" grow>
                                    <TextInput
                                        label="Room Code" placeholder="ITS01-GR-R01"
                                        value={newRoom.code}
                                        onChange={e => setNewRoom({ ...newRoom, code: e.target.value })}
                                    />
                                    <TextInput
                                        label="Display Name" placeholder="Suite A"
                                        value={newRoom.nameEn}
                                        onChange={e => setNewRoom({ ...newRoom, nameEn: e.target.value })}
                                    />
                                    <NumberInput
                                        label="Area (m²)"
                                        value={newRoom.areaM2}
                                        onChange={val => setNewRoom({ ...newRoom, areaM2: typeof val === 'number' ? val : 0 })}
                                    />
                                    <Select
                                        label="Status"
                                        data={(roomStatusTypes || []).map((s: any) => ({ value: String(s.id || ''), label: String(s.lookupValue?.en || '') }))}
                                        value={newRoom.statusId?.toString()}
                                        onChange={val => setNewRoom({ ...newRoom, statusId: val ? parseInt(val) : undefined } as any)}
                                    />
                                    <Button variant="light" color="green" onClick={handleAddRoom}>Add Unit</Button>
                                </Group>
                            </Paper>

                            <SimpleGrid cols={2} spacing="sm" mt="md">
                                {rooms.map(room => (
                                    <Paper key={room.id} withBorder p="md" radius="md" className="hover:border-blue-400">
                                        <Group justify="space-between" mb="xs">
                                            <Text fw={600} size="sm">{room.code}</Text>
                                            <ActionIcon size="xs" color="red" variant="light" onClick={() => handleDeleteRoom(room.id)}>
                                                <Trash2 size={12} />
                                            </ActionIcon>
                                        </Group>
                                        <Text size="sm" mb="sm">{room.nameEn}</Text>
                                        <Group justify="space-between">
                                            <Badge variant="dot" color="green" radius="xs" size="xs">
                                                {roomStatusTypes.find(s => s.id === room.statusId)?.lookupValue.en || 'Unknown'}
                                            </Badge>
                                            <Text size="xs" fw={700}>{room.areaM2} m²</Text>
                                        </Group>
                                    </Paper>
                                ))}
                                {rooms.length === 0 && (
                                    <Box py={40} style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                                        <Text c="dimmed" size="sm">No units added to this floor yet.</Text>
                                    </Box>
                                )}
                            </SimpleGrid>
                        </Stack>
                    </Tabs.Panel>
                ))}
                {floors.length === 0 && (
                    <Paper p={50} withBorder radius="md" bg="gray.0" style={{ textAlign: 'center' }}>
                        <Text c="dimmed">No floors defined for this building yet.</Text>
                    </Paper>
                )}
            </Tabs>
        </Stack>
    );
};
