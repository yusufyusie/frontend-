import { useState, useEffect, useMemo } from 'react';
import { Stack, Group, Text, Paper, Select, NumberInput, TextInput, Divider, SimpleGrid, rem, Box, Badge, ActionIcon, ScrollArea } from '@mantine/core';
import { MapPin, Building2, Calendar, FileText, CheckCircle2, Search, Info } from 'lucide-react';
import { landResourcesService } from '@/services/land-resources.service';
import { buildingsService } from '@/services/buildings.service';
import { DateInput } from '@mantine/dates';

interface SpatialData {
    resourceType: 'PLOT' | 'ROOM';
    landResourceId?: number;
    roomId?: number;
    contractNumber: string;
    contractAreaM2: number;
    actualAreaM2: number;
    startDate: Date | string;
    constructionStatusId?: number;
}

interface Props {
    data: Partial<SpatialData>;
    onChange: (data: Partial<SpatialData>) => void;
    onValidityChange?: (isValid: boolean) => void;
}

export const SpatialStep = ({ data, onChange, onValidityChange }: Props) => {
    const [availableZones, setAvailableZones] = useState<any[]>([]);
    const [availableBlocks, setAvailableBlocks] = useState<any[]>([]);
    const [availablePlots, setAvailablePlots] = useState<any[]>([]);

    const [availableBuildings, setAvailableBuildings] = useState<any[]>([]);
    const [availableFloors, setAvailableFloors] = useState<any[]>([]);
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);

    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
    const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);

    useEffect(() => {
        // Fetch Root level resources
        landResourcesService.getAll({ type: 'ZONE' }).then(res => setAvailableZones((res as any).data || res));
        buildingsService.getAll().then(res => setAvailableBuildings((res as any).data || res));
    }, []);

    // Fetch blocks when zone changes
    useEffect(() => {
        if (selectedZoneId) {
            landResourcesService.getAll({ type: 'BLOCK', parentId: selectedZoneId }).then(res => {
                setAvailableBlocks((res as any).data || res);
                setSelectedBlockId(null);
                setAvailablePlots([]);
            });
        } else {
            setAvailableBlocks([]);
            setSelectedBlockId(null);
        }
    }, [selectedZoneId]);

    // Fetch plots when block changes
    useEffect(() => {
        if (selectedBlockId) {
            landResourcesService.getAll({ type: 'PLOT', parentId: selectedBlockId }).then(res => {
                setAvailablePlots((res as any).data || res);
            });
        } else {
            setAvailablePlots([]);
        }
    }, [selectedBlockId]);

    // Fetch floors when building changes
    useEffect(() => {
        if (selectedBuildingId) {
            buildingsService.getFloors(parseInt(selectedBuildingId)).then(res => {
                setAvailableFloors((res as any).data || res);
                setSelectedFloorId(null);
            });
        } else {
            setAvailableFloors([]);
            setSelectedFloorId(null);
        }
    }, [selectedBuildingId]);

    // Fetch rooms when floor changes
    useEffect(() => {
        if (selectedFloorId) {
            buildingsService.getRooms(parseInt(selectedFloorId)).then(res => {
                setAvailableRooms((res as any).data || res);
            });
        } else {
            setAvailableRooms([]);
        }
    }, [selectedFloorId]);

    const zoneOptions = useMemo(() => availableZones.map(z => ({ value: z.id.toString(), label: z.nameEn })), [availableZones]);
    const blockOptions = useMemo(() => availableBlocks.map(b => ({ value: b.id.toString(), label: b.nameEn })), [availableBlocks]);
    const plotOptions = useMemo(() => availablePlots.map(p => ({ value: p.id.toString(), label: `${p.code} (${p.areaM2} m²)` })), [availablePlots]);

    const buildingOptions = useMemo(() => availableBuildings.map(b => ({ value: b.id.toString(), label: b.nameEn })), [availableBuildings]);
    const floorOptions = useMemo(() => availableFloors.map(f => ({ value: f.id.toString(), label: f.nameEn })), [availableFloors]);
    const roomOptions = useMemo(() => availableRooms.map(r => ({ value: r.id.toString(), label: `${r.code} (${r.areaM2} m²)` })), [availableRooms]);

    useEffect(() => {
        const isValid = Boolean(data.contractNumber && data.startDate && (data.landResourceId || data.roomId));
        onValidityChange?.(isValid);
    }, [data, onValidityChange]);

    const inputStyles = {
        label: { fontWeight: 800, color: '#16284F', fontSize: rem(13), marginBottom: rem(8), textTransform: 'uppercase' as const, letterSpacing: rem(1) },
        input: { borderRadius: rem(16), height: rem(56), border: '2px solid #f1f5f9', backgroundColor: '#f8fafc' }
    };

    return (
        <Stack gap="2.5rem" className="animate-fade-in">
            {/* SEARCH & SELECTION */}
            <Box>
                <Group gap="sm" mb="xl">
                    <Box p={8} bg="blue.0" style={{ borderRadius: '12px' }} className="shadow-sm">
                        <MapPin size={18} className="text-blue-600" />
                    </Box>
                    <Text size="sm" fw={900} c="#16284F" tt="uppercase" lts="2px">Space Allocation</Text>
                </Group>

                <SimpleGrid cols={2} spacing="xl">
                    <Paper
                        withBorder
                        p="xl"
                        radius="lg"
                        className={`hover-lift transition-all duration-300 ${data.resourceType === 'PLOT' ? 'shadow-lg border-teal-500 bg-teal-50/30' : 'bg-white/50'}`}
                        style={{
                            cursor: 'pointer',
                            borderColor: data.resourceType === 'PLOT' ? '#0C7C92' : undefined,
                            backdropFilter: 'blur(8px)'
                        }}
                        onClick={() => onChange({ ...data, resourceType: 'PLOT', roomId: undefined })}
                    >
                        <Stack align="center" gap="md">
                            <Box p="md" bg={data.resourceType === 'PLOT' ? 'teal.1' : 'gray.0'} style={{ borderRadius: '50%' }} className="transition-base">
                                <MapPin size={32} color={data.resourceType === 'PLOT' ? '#0C7C92' : '#94a3b8'} />
                            </Box>
                            <Box style={{ textAlign: 'center' }}>
                                <Text fw={800} size="lg" c={data.resourceType === 'PLOT' ? 'teal.9' : 'gray.8'}>Land Plot</Text>
                                <Text size="xs" c="dimmed">Assign a numbered plot from a Block/Zone</Text>
                            </Box>
                        </Stack>
                    </Paper>

                    <Paper
                        withBorder
                        p="xl"
                        radius="lg"
                        className={`hover-lift transition-all duration-300 ${data.resourceType === 'ROOM' ? 'shadow-lg border-teal-500 bg-teal-50/30' : 'bg-white/50'}`}
                        style={{
                            cursor: 'pointer',
                            borderColor: data.resourceType === 'ROOM' ? '#0C7C92' : undefined,
                            backdropFilter: 'blur(8px)'
                        }}
                        onClick={() => onChange({ ...data, resourceType: 'ROOM', landResourceId: undefined })}
                    >
                        <Stack align="center" gap="md">
                            <Box p="md" bg={data.resourceType === 'ROOM' ? 'teal.1' : 'gray.0'} style={{ borderRadius: '50%' }} className="transition-base">
                                <Building2 size={32} color={data.resourceType === 'ROOM' ? '#0C7C92' : '#94a3b8'} />
                            </Box>
                            <Box style={{ textAlign: 'center' }}>
                                <Text fw={800} size="lg" c={data.resourceType === 'ROOM' ? 'teal.9' : 'gray.8'}>Building Space</Text>
                                <Text size="xs" c="dimmed">Assign a specific floor or room in a building</Text>
                            </Box>
                        </Stack>
                    </Paper>
                </SimpleGrid>
            </Box>

            {/* RESOURCE PICKER */}
            <Box className="animate-scale-up" key={data.resourceType}>
                {data.resourceType === 'PLOT' ? (
                    <Stack gap="md">
                        <Select
                            label="Select Zone"
                            placeholder="Choose destination zone"
                            data={zoneOptions}
                            value={selectedZoneId}
                            onChange={(val) => setSelectedZoneId(val)}
                            searchable
                            styles={inputStyles}
                            className="hover-glow rounded-2xl"
                        />

                        {selectedZoneId && (
                            <SimpleGrid cols={2} spacing="md" className="animate-slide-down">
                                <Select
                                    label="Select Block"
                                    placeholder="Choose block"
                                    data={blockOptions}
                                    value={selectedBlockId}
                                    onChange={(val) => setSelectedBlockId(val)}
                                    searchable
                                    styles={inputStyles}
                                />
                                <Select
                                    label="Select Plot"
                                    placeholder="Choose plot"
                                    data={plotOptions}
                                    value={data.landResourceId?.toString()}
                                    onChange={(val) => {
                                        const plot = availablePlots.find(p => p.id.toString() === val);
                                        onChange({ ...data, landResourceId: val ? parseInt(val) : undefined, actualAreaM2: plot?.areaM2 || 0 });
                                    }}
                                    searchable
                                    disabled={!selectedBlockId}
                                    styles={inputStyles}
                                />
                            </SimpleGrid>
                        )}
                    </Stack>
                ) : (
                    <Stack gap="md">
                        <Select
                            label="Select Building"
                            placeholder="Choose facility"
                            data={buildingOptions}
                            value={selectedBuildingId}
                            onChange={(val) => setSelectedBuildingId(val)}
                            searchable
                            leftSection={<Building2 size={16} />}
                            styles={inputStyles}
                            className="hover-glow rounded-2xl"
                        />

                        {selectedBuildingId && (
                            <SimpleGrid cols={2} spacing="md" className="animate-slide-down">
                                <Select
                                    label="Select Floor"
                                    placeholder="Choose level"
                                    data={floorOptions}
                                    value={selectedFloorId}
                                    onChange={(val) => setSelectedFloorId(val)}
                                    searchable
                                    styles={inputStyles}
                                />
                                <Select
                                    label="Select Room"
                                    placeholder="Choose unit"
                                    data={roomOptions}
                                    value={data.roomId?.toString()}
                                    onChange={(val) => {
                                        const room = availableRooms.find(r => r.id.toString() === val);
                                        onChange({ ...data, roomId: val ? parseInt(val) : undefined, actualAreaM2: room?.areaM2 || 0 });
                                    }}
                                    searchable
                                    disabled={!selectedFloorId}
                                    styles={inputStyles}
                                />
                            </SimpleGrid>
                        )}
                    </Stack>
                )}
            </Box>

            {/* CONTRACT DETAILS */}
            <Box>
                <Group gap="sm" mb="xl">
                    <Box p={8} bg="orange.0" style={{ borderRadius: '12px' }} className="shadow-sm">
                        <FileText size={18} className="text-orange-600" />
                    </Box>
                    <Text size="sm" fw={900} c="#16284F" tt="uppercase" lts="2px">Contractual Metrics</Text>
                </Group>

                <Stack gap="xl">
                    <Group grow gap="xl">
                        <TextInput
                            label="Internal Contract #"
                            placeholder="EITP-REG-2024-..."
                            value={data.contractNumber}
                            onChange={(e) => onChange({ ...data, contractNumber: e.currentTarget.value })}
                            styles={inputStyles}
                        />
                        <DateInput
                            label="Lease Start Date"
                            placeholder="Picker date"
                            value={data.startDate ? new Date(data.startDate) : undefined}
                            onChange={(val) => onChange({ ...data, startDate: val || new Date() })}
                            styles={inputStyles}
                        />
                    </Group>

                    <Group grow gap="xl">
                        <NumberInput
                            label="Area on Contract (m²)"
                            placeholder="Required measurement"
                            value={data.contractAreaM2}
                            onChange={(val) => onChange({ ...data, contractAreaM2: Number(val) })}
                            styles={inputStyles}
                        />
                        <Box>
                            <Text size="xs" fw={800} c="#16284F" tt="uppercase" lts="1px" mb={8}>Actual Surveyed Area (m²)</Text>
                            <Paper withBorder p="md" radius="lg" bg="gray.0" className="shadow-inner border-dashed">
                                <Group justify="space-between">
                                    <Stack gap={0}>
                                        <Text size="xs" c="dimmed" fw={700}>VERIFIED AREA</Text>
                                        <Text fw={900} size="xl">{data.actualAreaM2 || 0} m²</Text>
                                    </Stack>
                                    <Badge
                                        size="lg"
                                        variant="filled"
                                        color={Math.abs((data.contractAreaM2 || 0) - (data.actualAreaM2 || 0)) > 5 ? 'red' : 'teal'}
                                        className="shadow-sm"
                                    >
                                        {((data.actualAreaM2 || 0) - (data.contractAreaM2 || 0)).toFixed(2)} Variance
                                    </Badge>
                                </Group>
                            </Paper>
                        </Box>
                    </Group>
                </Stack>
            </Box>

            <Paper p="md" radius="lg" bg="blue.0" withBorder style={{ borderColor: '#bfdbfe', borderLeftWidth: rem(6) }} className="glass">
                <Group gap="md" align="flex-start" wrap="nowrap">
                    <Box p={4} bg="white" style={{ borderRadius: '50%' }}>
                        <Info size={16} className="text-blue-600" />
                    </Box>
                    <Text size="xs" c="blue.9" fw={500}>
                        <Text component="span" fw={800}>Automated Integrity Check:</Text> If the variance between Contract and Actual area exceeds 5%, an internal audit will be triggered automatically upon registration.
                    </Text>
                </Group>
            </Paper>
        </Stack>
    );
};
