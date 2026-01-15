import { useState, useEffect } from 'react';
import { Stack, TextInput, Group, Select, Button, Box, LoadingOverlay, Title, NumberInput } from '@mantine/core';
import { Save, Building2, Layers } from 'lucide-react';
import { Building } from '@/services/buildings.service';
import { lookupsService, SystemLookup } from '@/services/lookups.service';

interface Props {
    initialData?: Partial<Building>;
    onSubmit: (data: Partial<Building>) => Promise<void>;
    isLoading?: boolean;
    plotId?: number;
}

export const BuildingForm = ({ initialData, onSubmit, isLoading, plotId }: Props) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <Box pos="relative">
            <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
            <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                    <Box>
                        <Group gap="xs" mb="xs">
                            <Building2 size={20} className="text-blue-600" />
                            <Title order={5}>Building Information</Title>
                        </Group>
                        <Stack gap="sm">
                            <TextInput
                                label="Building Code"
                                placeholder="e.g. B-001"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.currentTarget.value })}
                                required
                            />
                            <TextInput
                                label="Building Name (English)"
                                value={formData.nameEn}
                                onChange={(e) => setFormData({ ...formData, nameEn: e.currentTarget.value })}
                                required
                            />
                            <Group grow>
                                <NumberInput
                                    label="Total Floors"
                                    leftSection={<Layers size={16} />}
                                    min={1}
                                    value={formData.totalFloors}
                                    onChange={(val) => setFormData({ ...formData, totalFloors: Number(val) || 1 })}
                                    required
                                />
                                <NumberInput
                                    label="Basement Floors"
                                    leftSection={<Layers size={16} />}
                                    min={0}
                                    value={formData.basementFloors}
                                    onChange={(val) => setFormData({ ...formData, basementFloors: Number(val) || 0 })}
                                />
                            </Group>
                            <Group grow>
                                <Select
                                    label="Building Type"
                                    data={buildingTypes.map(t => ({ value: t.id.toString(), label: t.lookupValue.en }))}
                                    value={formData.buildingTypeId?.toString()}
                                    onChange={(val) => setFormData({ ...formData, buildingTypeId: val ? parseInt(val) : undefined })}
                                />
                                <Select
                                    label="Construction Status"
                                    data={statusTypes.map(s => ({ value: s.id.toString(), label: s.lookupValue.en }))}
                                    value={formData.constructionStatusId?.toString()}
                                    onChange={(val) => setFormData({ ...formData, constructionStatusId: val ? parseInt(val) : undefined })}
                                />
                            </Group>
                        </Stack>
                    </Box>

                    <Group justify="flex-end" mt="xl">
                        <Button
                            type="submit"
                            leftSection={<Save size={18} />}
                            loading={isLoading}
                            size="md"
                            bg="blue"
                        >
                            Save Building
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Box>
    );
};
