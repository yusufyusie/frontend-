import { useState } from 'react';
import { Stack, TextInput, Group, Select, Button, Box, LoadingOverlay, Title, NumberInput } from '@mantine/core';
import { Save, Map, Layers } from 'lucide-react';
import { LandResource, LandResourceType } from '@/services/land-resources.service';

interface Props {
    initialData?: Partial<LandResource>;
    onSubmit: (data: Partial<LandResource>) => Promise<void>;
    isLoading?: boolean;
    parentId?: number | null;
    defaultType?: LandResourceType;
}

export const LandForm = ({ initialData, onSubmit, isLoading, parentId, defaultType }: Props) => {
    const [formData, setFormData] = useState<Partial<LandResource>>({
        code: '',
        nameEn: '',
        nameAm: '',
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

    const landTypes = [
        { value: LandResourceType.ZONE, label: 'Zone' },
        { value: LandResourceType.BLOCK, label: 'Block' },
        { value: LandResourceType.PLOT, label: 'Plot' }
    ];

    return (
        <Box pos="relative">
            <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
            <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                    <Box>
                        <Group gap="xs" mb="xs">
                            <Map size={20} className="text-green-600" />
                            <Title order={5}>Land Resource Information</Title>
                        </Group>
                        <Stack gap="sm">
                            <Select
                                label="Resource Type"
                                leftSection={<Layers size={16} />}
                                data={landTypes}
                                value={formData.type}
                                onChange={(val) => setFormData({ ...formData, type: val as LandResourceType })}
                                required
                                disabled={!!defaultType}
                            />
                            <TextInput
                                label="Resource Code"
                                placeholder="e.g. Z-001, B-001, P-001"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.currentTarget.value })}
                                required
                            />
                            <TextInput
                                label="Name (English)"
                                value={formData.nameEn}
                                onChange={(e) => setFormData({ ...formData, nameEn: e.currentTarget.value })}
                                required
                            />
                            <TextInput
                                label="Name (Amharic)"
                                value={formData.nameAm}
                                onChange={(e) => setFormData({ ...formData, nameAm: e.currentTarget.value })}
                            />
                            <NumberInput
                                label="Area (m²)"
                                placeholder="Area in square meters"
                                min={0}
                                value={formData.areaM2}
                                onChange={(val) => setFormData({ ...formData, areaM2: Number(val) || undefined })}
                            />
                        </Stack>
                    </Box>

                    <Group justify="flex-end" mt="xl">
                        <Button
                            type="submit"
                            leftSection={<Save size={18} />}
                            loading={isLoading}
                            size="md"
                            bg="green"
                        >
                            Save Land Resource
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Box>
    );
};
