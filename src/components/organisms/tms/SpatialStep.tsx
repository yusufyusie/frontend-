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
    startDate: Date;
    constructionStatusId?: number;
}

interface Props {
    data: Partial<SpatialData>;
    onChange: (data: Partial<SpatialData>) => void;
    onValidityChange?: (isValid: boolean) => void;
}

export const SpatialStep = ({ data, onChange, onValidityChange }: Props) => {
    const [availablePlots, setAvailablePlots] = useState<any[]>([]);
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);

    useEffect(() => {
        // Fetch valid resources (In a real app, you'd fetch only VACANT ones)
        landResourcesService.getAll({ type: 'PLOT' }).then(res => setAvailablePlots((res as any).data || res));
        // Simple search for available rooms - this would be expanded
    }, []);

    const plotOptions = useMemo(() =>
        availablePlots.map(p => ({ value: p.id.toString(), label: `${p.code} (${p.areaM2} m²)` })),
        [availablePlots]
    );

    useEffect(() => {
        const isValid = Boolean(data.contractNumber && data.startDate && (data.landResourceId || data.roomId));
        onValidityChange?.(isValid);
    }, [data, onValidityChange]);

    const inputStyles = {
        label: { fontWeight: 800, color: '#16284F', fontSize: rem(13), marginBottom: rem(8), textTransform: 'uppercase' as const, letterSpacing: rem(1) },
        input: { borderRadius: rem(16), height: rem(56), border: '2px solid #f1f5f9', backgroundColor: '#f8fafc' }
    };

    return (
        <Stack gap="2.5rem">
            {/* SEARCH & SELECTION */}
            <Box>
                <Group gap="sm" mb="xl">
                    <Box p={8} bg="blue.0" style={{ borderRadius: '50%' }}>
                        <MapPin size={18} className="text-blue-600" />
                    </Box>
                    <Text size="sm" fw={900} c="#16284F" tt="uppercase" lts="2px">Space Allocation</Text>
                </Group>

                <SimpleGrid cols={2} gap="xl">
                    <Paper
                        withBorder
                        p="xl"
                        radius="md"
                        style={{
                            cursor: 'pointer',
                            borderColor: data.resourceType === 'PLOT' ? '#0C7C92' : '#f1f5f9',
                            backgroundColor: data.resourceType === 'PLOT' ? '#f0f9fa' : '#fff'
                        }}
                        onClick={() => onChange({ ...data, resourceType: 'PLOT', roomId: undefined })}
                    >
                        <Stack align="center" gap="xs">
                            <MapPin size={32} color={data.resourceType === 'PLOT' ? '#0C7C92' : '#94a3b8'} />
                            <Text fw={700}>Land Plot</Text>
                            <Text size="xs" c="dimmed">Assign a numbered plot from a Block/Zone</Text>
                        </Stack>
                    </Paper>

                    <Paper
                        withBorder
                        p="xl"
                        radius="md"
                        style={{
                            cursor: 'pointer',
                            borderColor: data.resourceType === 'ROOM' ? '#0C7C92' : '#f1f5f9',
                            backgroundColor: data.resourceType === 'ROOM' ? '#f0f9fa' : '#fff'
                        }}
                        onClick={() => onChange({ ...data, resourceType: 'ROOM', landResourceId: undefined })}
                    >
                        <Stack align="center" gap="xs">
                            <Building2 size={32} color={data.resourceType === 'ROOM' ? '#0C7C92' : '#94a3b8'} />
                            <Text fw={700}>Building Space</Text>
                            <Text size="xs" c="dimmed">Assign a specific floor or room in a building</Text>
                        </Stack>
                    </Paper>
                </SimpleGrid>
            </Box>

            {/* RESOURCE PICKER */}
            <Box>
                {data.resourceType === 'PLOT' ? (
                    <Select
                        label="Select Land Plot"
                        placeholder="Choose plot code"
                        data={plotOptions}
                        value={data.landResourceId?.toString()}
                        onChange={(val) => {
                            const plot = availablePlots.find(p => p.id.toString() === val);
                            onChange({ ...data, landResourceId: val ? parseInt(val) : undefined, actualAreaM2: plot?.areaM2 || 0 });
                        }}
                        searchable
                        leftSection={<Search size={16} />}
                        styles={inputStyles}
                    />
                ) : (
                    <Text size="sm" c="dimmed" fs="italic">Building room selection will be available after selecting building and floor (Integrated in next step).</Text>
                )}
            </Box>

            {/* CONTRACT DETAILS */}
            <Box>
                <Group gap="sm" mb="xl">
                    <Box p={8} bg="orange.0" style={{ borderRadius: '50%' }}>
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
                            value={data.startDate}
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
                            <Paper withBorder p="md" radius="md" bg="gray.0">
                                <Group justify="space-between">
                                    <Text fw={900} size="xl">{data.actualAreaM2 || 0}</Text>
                                    <Badge color={Math.abs((data.contractAreaM2 || 0) - (data.actualAreaM2 || 0)) > 5 ? 'red' : 'green'}>
                                        {((data.actualAreaM2 || 0) - (data.contractAreaM2 || 0)).toFixed(2)} Variance
                                    </Badge>
                                </Group>
                            </Paper>
                        </Box>
                    </Group>
                </Stack>
            </Box>

            <Paper p="md" radius="md" bg="blue.0" withBorder style={{ borderColor: '#bfdbfe' }}>
                <Group gap="xs" align="flex-start">
                    <Info size={16} className="text-blue-600 mt-1" />
                    <Text size="xs" c="blue.9">
                        **Automated Integrity Check**: If the variance between Contract and Actual area exceeds 5%, an internal audit will be triggered automatically upon registration.
                    </Text>
                </Group>
            </Paper>
        </Stack>
    );
};
