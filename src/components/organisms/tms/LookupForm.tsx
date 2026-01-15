import { useState, useEffect } from 'react';
import { Stack, TextInput, Group, Select, Button, Box, LoadingOverlay, Title, NumberInput, Checkbox, Paper, Divider, Text } from '@mantine/core';
import { Save, Tag, Layers, Globe } from 'lucide-react';
import { SystemLookup, lookupsService } from '@/services/lookups.service';

interface Props {
    initialData?: Partial<SystemLookup>;
    onSubmit: (data: Partial<SystemLookup>) => Promise<void>;
    isLoading?: boolean;
    category?: string;
    parentId?: number | null;
}

export const LookupForm = ({ initialData, onSubmit, isLoading, category, parentId }: Props) => {
    const [formData, setFormData] = useState<Partial<SystemLookup>>({
        lookupCode: '',
        lookupValue: { en: '', am: '' },
        lookupCategory: category || '',
        level: 1,
        displayOrder: 1,
        parentId: parentId,
        isActive: true,
        isSystem: false,
        metadata: {},
        ...initialData
    });

    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        lookupsService.getAll().then(res => {
            const data = (res as any).data || res;
            if (Array.isArray(data)) {
                const uniqueCategories = [...new Set(data.map((l: SystemLookup) => l.lookupCategory))];
                setCategories(uniqueCategories);
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <Box pos="relative">
            <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2, radius: 'xl' }} />
            <form onSubmit={handleSubmit}>
                <Stack gap="xl">
                    <Paper withBorder p="xl" radius="xl" bg="gray.0/30">
                        <Group gap="sm" mb="lg">
                            <Box p={8} bg="teal.0" style={{ borderRadius: '12px' }}>
                                <Tag size={20} className="text-teal-600" />
                            </Box>
                            <Box>
                                <Title order={5} fw={800} lts="-0.3px">Classification Data</Title>
                                <Text size="xs" c="dimmed">Define how this lookup behaves in the system.</Text>
                            </Box>
                        </Group>

                        <Stack gap="md">
                            <Select
                                label="Category Domain"
                                placeholder="Select or type a category"
                                data={categories.map(c => ({ value: c, label: c }))}
                                value={formData.lookupCategory}
                                onChange={(val) => setFormData(prev => ({ ...prev, lookupCategory: val || '' }))}
                                searchable
                                required
                                disabled={!!category}
                                radius="md"
                                size="md"
                            />

                            <TextInput
                                label="Identification Code"
                                placeholder="e.g. ACTIVE, PENDING_APPROVAL"
                                value={formData.lookupCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, lookupCode: e.currentTarget.value.toUpperCase() }))}
                                required
                                radius="md"
                                size="md"
                                styles={{ input: { fontWeight: 600, textTransform: 'uppercase' } }}
                            />
                        </Stack>
                    </Paper>

                    <Paper withBorder p="xl" radius="xl">
                        <Group gap="sm" mb="lg">
                            <Box p={8} bg="blue.0" style={{ borderRadius: '12px' }}>
                                <Globe size={20} className="text-blue-600" />
                            </Box>
                            <Box>
                                <Title order={5} fw={800} lts="-0.3px">Internationalization</Title>
                                <Text size="xs" c="dimmed">Bilingual display values for the user interface.</Text>
                            </Box>
                        </Group>

                        <Stack gap="md">
                            <TextInput
                                label="Display Name (English)"
                                placeholder="Value visible to English users"
                                value={formData.lookupValue?.en}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    lookupValue: { ...prev.lookupValue!, en: e.currentTarget.value }
                                }))}
                                required
                                radius="md"
                            />
                            <TextInput
                                label="Display Name (Amharic)"
                                placeholder="Value visible to Amharic users"
                                value={formData.lookupValue?.am}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    lookupValue: { ...prev.lookupValue!, am: e.currentTarget.value }
                                }))}
                                radius="md"
                            />
                        </Stack>
                    </Paper>

                    <Paper withBorder p="xl" radius="xl" bg="gray.0/10">
                        <Group gap="sm" mb="lg">
                            <Box p={8} bg="violet.0" style={{ borderRadius: '12px' }}>
                                <Layers size={20} className="text-violet-600" />
                            </Box>
                            <Box>
                                <Title order={5} fw={800} lts="-0.3px">Hierarchy & Order</Title>
                                <Text size="xs" c="dimmed">Position and access control settings.</Text>
                            </Box>
                        </Group>

                        <Stack gap="md">
                            <Group grow>
                                <NumberInput
                                    label="Hierarchy Level"
                                    min={1}
                                    value={formData.level}
                                    onChange={(val) => setFormData(prev => ({ ...prev, level: Number(val) || 1 }))}
                                    required
                                    radius="md"
                                />
                                <NumberInput
                                    label="Sort Priority"
                                    min={1}
                                    value={formData.displayOrder}
                                    onChange={(val) => setFormData(prev => ({ ...prev, displayOrder: Number(val) || 1 }))}
                                    required
                                    radius="md"
                                />
                            </Group>

                            <Divider my="sm" variant="dashed" />

                            <Group gap="xl">
                                <Checkbox
                                    label={<Text size="sm" fw={600}>Entry is Active</Text>}
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.currentTarget.checked }))}
                                    color="teal"
                                />
                                <Checkbox
                                    label={<Text size="sm" fw={600}>System Protected</Text>}
                                    checked={formData.isSystem}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isSystem: e.currentTarget.checked }))}
                                    color="red"
                                />
                            </Group>
                        </Stack>
                    </Paper>

                    <Button
                        type="submit"
                        leftSection={<Save size={20} />}
                        loading={isLoading}
                        size="xl"
                        radius="xl"
                        bg="#0C7C92"
                        className="shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] mt-4"
                        fullWidth
                    >
                        Save Configuration
                    </Button>
                </Stack>
            </form>
        </Box>
    );
};
