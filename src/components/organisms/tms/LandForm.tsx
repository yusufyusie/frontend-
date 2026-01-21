import { useState, useEffect } from 'react';
import { Stack, TextInput, Group, Select, Button, Box, LoadingOverlay, Title, NumberInput, Paper, Text } from '@mantine/core';
import { Save, Map, Layers } from 'lucide-react';
import { lookupsService, SystemLookup } from '@/services/lookups.service';

interface Props {
    initialData?: Partial<any>;
    onSubmit: (data: Partial<any>) => Promise<void>;
    isLoading?: boolean;
    parentId?: number | null | string;
    defaultType?: string;
    onValidityChange?: (isValid: boolean) => void;
}

export const LandForm = ({ initialData, onSubmit, isLoading, parentId, defaultType, onValidityChange }: Props) => {
    const [formData, setFormData] = useState<Partial<any>>({
        code: '',
        name: '',
        type: defaultType || 'ZONE',
        parentId: parentId,
        description: '',
        isActive: true,
        ...initialData
    });

    const [usageTypes, setUsageTypes] = useState<SystemLookup[]>([]);
    const [ownershipTypes, setOwnershipTypes] = useState<SystemLookup[]>([]);
    const [resourceStatuses, setResourceStatuses] = useState<SystemLookup[]>([]);

    useEffect(() => {
        lookupsService.getByCategory('LAND_USAGE').then(res => setUsageTypes((res as any).data || res));
        lookupsService.getByCategory('LAND_OWNERSHIP').then(res => setOwnershipTypes((res as any).data || res));
        lookupsService.getByCategory('CONSTRUCTION_STATUS').then(res => setResourceStatuses((res as any).data || res));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    // Validation Effect
    useEffect(() => {
        const isValid = Boolean(
            formData.type &&
            formData.code &&
            formData.name
        );
        onValidityChange?.(isValid);
    }, [formData, onValidityChange]);

    const landTypes = [
        { value: 'ZONE', label: 'Zone' },
        { value: 'BLOCK', label: 'Block' }
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
                                <Title order={4} fw={800} lts="-0.5px" c="#16284F" style={{ display: 'inline-block', marginRight: '0.75rem' }}>Hierarchy Identification</Title>
                                <Text span size="xs" c="dimmed" fw={700} tt="uppercase" lts="1px">Territorial Management</Text>
                            </div>
                        </Group>

                        <Stack gap="lg">
                            <Select
                                label="Hierarchy Level"
                                placeholder="Select level"
                                data={landTypes}
                                value={formData.type}
                                onChange={(val) => setFormData({ ...formData, type: val })}
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
                            <TextInput
                                label="Display Name"
                                placeholder="e.g. Commercial Zone"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
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
                                <Title order={4} fw={800} lts="-0.5px" c="#16284F" style={{ display: 'inline-block', marginRight: '0.75rem' }}>Additional Info</Title>
                                <Text span size="xs" c="dimmed" fw={700} tt="uppercase" lts="1px">Description & Scope</Text>
                            </div>
                        </Group>

                        <Stack gap="lg">
                            <TextInput
                                label="Description"
                                placeholder="Optional details..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
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
