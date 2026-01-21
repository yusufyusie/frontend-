import { useState, useEffect } from 'react';
import { Stack, TextInput, Group, Select, Button, Box, LoadingOverlay, Title, NumberInput, Paper, Text } from '@mantine/core';
import { Save, Building2, Layers } from 'lucide-react';
import { buildingsService, Building } from '@/services/buildings.service';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { locationsService, LocationOption } from '@/services/locations.service';

interface Props {
    initialData?: Partial<Building>;
    onSubmit: (data: Partial<Building>) => Promise<void>;
    isLoading?: boolean;
    blockId?: number;
    onValidityChange?: (isValid: boolean) => void;
}

export const BuildingForm = ({ initialData, onSubmit, isLoading, blockId, onValidityChange }: Props) => {
    const [formData, setFormData] = useState<Partial<Building>>({
        code: '',
        name: '',
        floors: 1,
        hasElevator: false,
        hasParking: false,
        buildingClassId: undefined,
        blockId: blockId,
        isActive: true,
        ...initialData
    });

    const [classTypes, setClassTypes] = useState<SystemLookup[]>([]);
    const [blocks, setBlocks] = useState<LocationOption[]>([]);

    useEffect(() => {
        lookupsService.getByCategory('BUILDING_CLASS').then(res => setClassTypes((res as any).data || res));
        locationsService.getBlocks().then(res => setBlocks((res as any).data || res));
    }, []);

    // Validation Effect
    useEffect(() => {
        const isValid = Boolean(
            formData.code &&
            formData.name &&
            formData.blockId &&
            (formData.floors || 0) >= 1
        );
        onValidityChange?.(isValid);
    }, [formData, onValidityChange]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <Box pos="relative">
            <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
            <form id="building-form" onSubmit={handleSubmit}>
                <Stack gap="xl">
                    <Paper withBorder p="lg" radius="2rem" shadow="sm" className="border-slate-100">
                        <Group gap="md" mb="xl">
                            <Box p={12} bg="#0C7C92" style={{ borderRadius: '1rem' }} className="shadow-lg shadow-teal-100">
                                <Building2 size={24} className="text-white" />
                            </Box>
                            <div>
                                <Title order={4} fw={800} lts="-0.5px" c="#16284F" style={{ display: 'inline-block', marginRight: '0.75rem' }}>Building Identity</Title>
                                <Text span size="xs" c="dimmed" fw={700} tt="uppercase" lts="1px">Core Identification</Text>
                            </div>
                        </Group>

                        <Stack gap="lg">
                            <TextInput
                                label="Building Unique Code"
                                placeholder="e.g. B-001"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.currentTarget.value })}
                                required
                                radius="xl"
                                size="md"
                                styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                            />
                            <TextInput
                                label="Building Public Name"
                                placeholder="e.g. Skyline Tower"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                                required
                                radius="xl"
                                size="md"
                                styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                            />
                            <Select
                                label="Assigned Block"
                                placeholder="Select block"
                                data={blocks.map(b => ({ value: b.id.toString(), label: `${b.code} - ${b.name}` }))}
                                value={formData.blockId?.toString()}
                                onChange={(val) => setFormData({ ...formData, blockId: val ? parseInt(val) : undefined })}
                                required
                                radius="xl"
                                size="md"
                                styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                            />
                        </Stack>
                    </Paper>

                    <Paper withBorder p="lg" radius="2rem" shadow="sm" className="border-slate-100">
                        <Group gap="md" mb="xl">
                            <Box p={12} bg="#0C7C92" style={{ borderRadius: '1rem' }} className="shadow-lg shadow-teal-100">
                                <Layers size={24} className="text-white" />
                            </Box>
                            <div>
                                <Title order={4} fw={800} lts="-0.5px" c="#16284F" style={{ display: 'inline-block', marginRight: '0.75rem' }}>Structural Configuration</Title>
                                <Text span size="xs" c="dimmed" fw={700} tt="uppercase" lts="1px">Elevation & Classification</Text>
                            </div>
                        </Group>

                        <Stack gap="xl">
                            <Group grow>
                                <NumberInput
                                    label="Above Ground Floors"
                                    min={1}
                                    value={formData.floors}
                                    onChange={(val) => setFormData({ ...formData, floors: Number(val) || 1 })}
                                    required
                                    radius="xl"
                                    size="md"
                                    styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                                />
                            </Group>

                            <Group grow>
                                <Select
                                    label="Has Elevator"
                                    data={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]}
                                    value={formData.hasElevator?.toString()}
                                    onChange={(val) => setFormData({ ...formData, hasElevator: val === 'true' })}
                                    radius="xl"
                                    size="md"
                                    styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                                />
                                <Select
                                    label="Has Parking"
                                    data={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]}
                                    value={formData.hasParking?.toString()}
                                    onChange={(val) => setFormData({ ...formData, hasParking: val === 'true' })}
                                    radius="xl"
                                    size="md"
                                    styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                                />
                            </Group>

                            <Select
                                label="Building Grade / Class"
                                placeholder="Select class"
                                data={classTypes.map(c => ({ value: c.id.toString(), label: c.lookupValue.en }))}
                                value={formData.buildingClassId?.toString()}
                                onChange={(val) => setFormData({ ...formData, buildingClassId: val ? parseInt(val) : undefined })}
                                radius="xl"
                                size="md"
                                styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                            />
                        </Stack>
                    </Paper>
                </Stack>
            </form>
        </Box>
    );
};
