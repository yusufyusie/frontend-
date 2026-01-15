import { useState, useEffect } from 'react';
import { Stack, TextInput, Group, Select, Button, Box, LoadingOverlay, Title, NumberInput, Paper, Text } from '@mantine/core';
import { Save, Building2, Layers } from 'lucide-react';
import { Building } from '@/services/buildings.service';
import { lookupsService, SystemLookup } from '@/services/lookups.service';

interface Props {
    initialData?: Partial<Building>;
    onSubmit: (data: Partial<Building>) => Promise<void>;
    isLoading?: boolean;
    plotId?: number;
    onValidityChange?: (isValid: boolean) => void;
}

export const BuildingForm = ({ initialData, onSubmit, isLoading, plotId, onValidityChange }: Props) => {
    const [formData, setFormData] = useState<Partial<Building>>({
        code: '',
        nameEn: '',
        totalFloors: 1,
        basementFloors: 0,
        buildingTypeId: undefined,
        constructionStatusId: undefined,
        plotId: plotId,
        ...initialData
    });

    const [buildingTypes, setBuildingTypes] = useState<SystemLookup[]>([]);
    const [statusTypes, setStatusTypes] = useState<SystemLookup[]>([]);

    useEffect(() => {
        lookupsService.getByCategory('BUILDING_TYPES').then(res => setBuildingTypes((res as any).data || res));
        lookupsService.getByCategory('CONSTRUCTION_STATUS').then(res => setStatusTypes((res as any).data || res));
    }, []);

    // Validation Effect
    useEffect(() => {
        const isValid = Boolean(
            formData.code &&
            formData.nameEn &&
            (formData.totalFloors || 0) >= 1
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
                                value={formData.nameEn}
                                onChange={(e) => setFormData({ ...formData, nameEn: e.currentTarget.value })}
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
                                    value={formData.totalFloors}
                                    onChange={(val) => setFormData({ ...formData, totalFloors: Number(val) || 1 })}
                                    required
                                    radius="xl"
                                    size="md"
                                    styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                                />
                                <NumberInput
                                    label="Basement Levels"
                                    min={0}
                                    value={formData.basementFloors}
                                    onChange={(val) => setFormData({ ...formData, basementFloors: Number(val) || 0 })}
                                    radius="xl"
                                    size="md"
                                    styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                                />
                            </Group>

                            <Group grow>
                                <Select
                                    label="Architectural Type"
                                    placeholder="Select type"
                                    data={buildingTypes.map(t => ({ value: t.id.toString(), label: t.lookupValue.en }))}
                                    value={formData.buildingTypeId?.toString()}
                                    onChange={(val) => setFormData({ ...formData, buildingTypeId: val ? parseInt(val) : undefined })}
                                    radius="xl"
                                    size="md"
                                    styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                                />
                                <Select
                                    label="Development Status"
                                    placeholder="Select status"
                                    data={statusTypes.map(s => ({ value: s.id.toString(), label: s.lookupValue.en }))}
                                    value={formData.constructionStatusId?.toString()}
                                    onChange={(val) => setFormData({ ...formData, constructionStatusId: val ? parseInt(val) : undefined })}
                                    radius="xl"
                                    size="md"
                                    styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                                />
                            </Group>
                        </Stack>
                    </Paper>
                </Stack>
            </form>
        </Box>
    );
};
