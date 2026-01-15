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
    onValidityChange?: (isValid: boolean) => void;
}

export const LookupForm = ({ initialData, onSubmit, isLoading, category, parentId, onValidityChange }: Props) => {
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
                const uniqueCategories = [...new Set(data
                    .map((l: SystemLookup) => l.lookupCategory)
                    .filter(c => typeof c === 'string' && c.length > 0)
                )];
                setCategories(uniqueCategories);
            }
        });
    }, []);

    // Validation Effect
    useEffect(() => {
        const isValid = Boolean(
            formData.lookupCategory &&
            formData.lookupCode &&
            formData.lookupValue?.en &&
            formData.level &&
            formData.displayOrder
        );
        onValidityChange?.(isValid);
    }, [formData, onValidityChange]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <Box pos="relative">
            <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2, radius: 'xl' }} />
            <form id="lookup-form" onSubmit={handleSubmit}>
                <Stack gap="xl">
                    <Paper withBorder p="lg" radius="2rem" shadow="sm" className="border-slate-100">
                        <Group gap="md" mb="xl">
                            <Box p={12} bg="#0C7C92" style={{ borderRadius: '1rem' }} className="shadow-lg shadow-teal-100">
                                <Tag size={24} className="text-white" />
                            </Box>
                            <div>
                                <Title order={4} fw={800} lts="-0.5px" c="#16284F" style={{ display: 'inline-block', marginRight: '0.75rem' }}>Classification Data</Title>
                                <Text span size="xs" c="dimmed" fw={700} tt="uppercase" lts="1px">Identification & Domain</Text>
                            </div>
                        </Group>

                        <Stack gap="xl">
                            <Select
                                label="Category Domain"
                                description="Select the system domain for this classification entry"
                                placeholder="Select category"
                                data={categories.map(c => ({ value: c, label: c }))}
                                value={formData.lookupCategory}
                                onChange={(val) => setFormData(prev => ({ ...prev, lookupCategory: val || '' }))}
                                searchable
                                required
                                disabled={!!category}
                                radius="xl"
                                size="lg"
                                styles={{
                                    label: { fontWeight: 700, marginBottom: 8, color: '#16284F' },
                                    input: { border: '2px solid #f1f5f9', '&:focus': { borderColor: '#0C7C92' } }
                                }}
                            />

                            <TextInput
                                label="Identification Code"
                                description="Unique system code (UPPERCASE)"
                                placeholder="e.g. ACTIVE"
                                value={formData.lookupCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, lookupCode: e.currentTarget.value.toUpperCase() }))}
                                required
                                radius="xl"
                                size="lg"
                                styles={{
                                    label: { fontWeight: 700, marginBottom: 8, color: '#16284F' },
                                    input: { border: '2px solid #f1f5f9', '&:focus': { borderColor: '#0C7C92' }, fontWeight: 800 }
                                }}
                            />
                        </Stack>
                    </Paper>

                    <Paper withBorder p="lg" radius="2rem" shadow="sm" className="border-slate-100">
                        <Group gap="md" mb="xl">
                            <Box p={12} bg="#0C7C92" style={{ borderRadius: '1rem' }} className="shadow-lg shadow-teal-100">
                                <Globe size={24} className="text-white" />
                            </Box>
                            <div>
                                <Title order={4} fw={800} lts="-0.5px" c="#16284F" style={{ display: 'inline-block', marginRight: '0.75rem' }}>Internationalization</Title>
                                <Text span size="xs" c="dimmed" fw={700} tt="uppercase" lts="1px">Display Name</Text>
                            </div>
                        </Group>

                        <Stack gap="lg">
                            <TextInput
                                label="Display Name (English)"
                                placeholder="Value visible to English users"
                                value={formData.lookupValue?.en || ''}
                                onChange={(e) => {
                                    const value = e.currentTarget.value;
                                    setFormData(prev => ({
                                        ...prev,
                                        lookupValue: {
                                            en: value,
                                            am: prev.lookupValue?.am || ''
                                        }
                                    }));
                                }}
                                required
                                radius="xl"
                                size="md"
                                styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                            />
                        </Stack>
                    </Paper>

                    <Paper withBorder p="xl" radius="2rem" shadow="sm" className="border-slate-100">
                        <Group gap="md" mb="xl">
                            <Box p={12} bg="#0C7C92" style={{ borderRadius: '1rem' }} className="shadow-lg shadow-teal-100">
                                <Layers size={24} className="text-white" />
                            </Box>
                            <div>
                                <Title order={4} fw={800} lts="-0.5px" c="#16284F" style={{ display: 'inline-block', marginRight: '0.75rem' }}>Hierarchy & Logic</Title>
                                <Text span size="xs" c="dimmed" fw={700} tt="uppercase" lts="1px">Access & Ordering</Text>
                            </div>
                        </Group>

                        <Stack gap="xl">
                            <Group grow>
                                <NumberInput
                                    label="Hierarchy Level"
                                    min={1}
                                    value={formData.level}
                                    onChange={(val) => setFormData(prev => ({ ...prev, level: Number(val) || 1 }))}
                                    required
                                    radius="xl"
                                    size="md"
                                    styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                                />
                                <NumberInput
                                    label="Sort Priority"
                                    min={1}
                                    value={formData.displayOrder}
                                    onChange={(val) => setFormData(prev => ({ ...prev, displayOrder: Number(val) || 1 }))}
                                    required
                                    radius="xl"
                                    size="md"
                                    styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                                />
                            </Group>

                            <Divider variant="dashed" />

                            <Group gap="xl">
                                <Checkbox
                                    label={<Text size="sm" fw={800} c="#16284F">Active Status</Text>}
                                    description="Enable usage in system records"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.currentTarget.checked }))}
                                    color="#0C7C92"
                                    styles={{ label: { cursor: 'pointer' } }}
                                />
                                <Checkbox
                                    label={<Text size="sm" fw={800} c="#16284F">Protected Mode</Text>}
                                    description="Prevent accidental deletion"
                                    checked={formData.isSystem}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isSystem: e.currentTarget.checked }))}
                                    color="#0C7C92"
                                    styles={{ label: { cursor: 'pointer' } }}
                                />
                            </Group>
                        </Stack>
                    </Paper>
                </Stack>
            </form>
        </Box>
    );
};
