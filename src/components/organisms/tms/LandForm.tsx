import { useState, useEffect } from 'react';
import { Stack, TextInput, Group, Select, Button, Box, LoadingOverlay, Title, NumberInput, Paper, Text } from '@mantine/core';
import { Save, Map, Layers } from 'lucide-react';
import { LandResource, LandResourceType } from '@/services/land-resources.service';

interface Props {
    initialData?: Partial<LandResource>;
    onSubmit: (data: Partial<LandResource>) => Promise<void>;
    isLoading?: boolean;
    parentId?: number | null;
    defaultType?: LandResourceType;
    onValidityChange?: (isValid: boolean) => void;
}

export const LandForm = ({ initialData, onSubmit, isLoading, parentId, defaultType, onValidityChange }: Props) => {
    const [formData, setFormData] = useState<Partial<LandResource>>({
        code: '',
        nameEn: '',
        type: defaultType || LandResourceType.ZONE,
        parentId: parentId,
        areaM2: undefined,
        metadata: {},
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    // Validation Effect
    useEffect(() => {
        const isValid = Boolean(
            formData.type &&
            formData.code &&
            formData.nameEn
        );
        onValidityChange?.(isValid);
    }, [formData, onValidityChange]);

    const landTypes = [
        { value: LandResourceType.ZONE, label: 'Zone' },
        { value: LandResourceType.BLOCK, label: 'Block' },
        { value: LandResourceType.PLOT, label: 'Plot' }
    ];

    return (
        <Box pos="relative">
            <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
            <form id="land-form" onSubmit={handleSubmit}>
                <Stack gap="xl">
                    <Paper withBorder p="lg" radius="2rem" shadow="sm" className="border-slate-100">
                        <Group gap="md" mb="xl">
                            <Box p={12} bg="#0C7C92" style={{ borderRadius: '1rem' }} className="shadow-lg shadow-teal-100">
                                <Map size={24} className="text-white" />
                            </Box>
                            <div>
                                <Title order={4} fw={800} lts="-0.5px" c="#16284F" style={{ display: 'inline-block', marginRight: '0.75rem' }}>Resource Identification</Title>
                                <Text span size="xs" c="dimmed" fw={700} tt="uppercase" lts="1px">Basic Territory Info</Text>
                            </div>
                        </Group>

                        <Stack gap="lg">
                            <Select
                                label="Resource Level"
                                placeholder="Select level"
                                data={landTypes}
                                value={formData.type}
                                onChange={(val) => setFormData({ ...formData, type: val as LandResourceType })}
                                required
                                disabled={!!defaultType}
                                radius="xl"
                                size="md"
                                leftSection={<Layers size={18} className="text-[#0C7C92]" />}
                                styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                            />
                            <TextInput
                                label="Unique Code"
                                placeholder="e.g. Z-001, B-001"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.currentTarget.value })}
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
                                <Title order={4} fw={800} lts="-0.5px" c="#16284F" style={{ display: 'inline-block', marginRight: '0.75rem' }}>Resource Details</Title>
                                <Text span size="xs" c="dimmed" fw={700} tt="uppercase" lts="1px">Localization & Magnitude</Text>
                            </div>
                        </Group>

                        <Stack gap="lg">
                            <TextInput
                                label="Resource Name"
                                value={formData.nameEn}
                                onChange={(e) => setFormData({ ...formData, nameEn: e.currentTarget.value })}
                                required
                                radius="xl"
                                size="md"
                                styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                            />
                            <NumberInput
                                label="Total Area (m²)"
                                placeholder="Area in square meters"
                                min={0}
                                value={formData.areaM2}
                                onChange={(val) => setFormData({ ...formData, areaM2: Number(val) || undefined })}
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
