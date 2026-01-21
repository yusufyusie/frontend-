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
            <LoadingOverlay visible={isLoading} overlayProps={{ blur: 1, radius: 'md' }} />
            <form id="lookup-form" onSubmit={handleSubmit}>
                <Stack gap="sm">
                    <Paper withBorder p="sm" radius="lg" className="border-slate-100 bg-slate-50/30">
                        <Group gap="sm" mb="sm">
                            <Box p={6} bg="#0C7C92" className="rounded-lg shadow-md shadow-teal-100">
                                <Tag size={14} className="text-white" />
                            </Box>
                            <div>
                                <Title order={6} fw={800} className="text-slate-800 leading-tight text-sm">Classification Data</Title>
                                <Text size="10px" c="dimmed" fw={700} tt="uppercase" lts="0.5px">Identification & Domain</Text>
                            </div>
                        </Group>

                        <Stack gap="sm">
                            <Select
                                label="Category Domain"
                                placeholder="Select category"
                                data={categories.map(c => ({ value: c, label: c }))}
                                value={formData.lookupCategory}
                                onChange={(val) => setFormData(prev => ({ ...prev, lookupCategory: val || '' }))}
                                searchable
                                required
                                disabled={!!category}
                                radius="md"
                                size="sm"
                                styles={{
                                    label: { fontWeight: 700, marginBottom: 4, fontSize: '12px' },
                                    input: { border: '1.5px solid #f1f5f9', '&:focus': { borderColor: '#0C7C92' } }
                                }}
                            />

                            <TextInput
                                label="Identification Code"
                                placeholder="e.g. ACTIVE"
                                value={formData.lookupCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, lookupCode: e.currentTarget.value.toUpperCase() }))}
                                required
                                radius="md"
                                size="sm"
                                styles={{
                                    label: { fontWeight: 700, marginBottom: 4, fontSize: '12px' },
                                    input: { border: '1.5px solid #f1f5f9', '&:focus': { borderColor: '#0C7C92' }, fontWeight: 800 }
                                }}
                            />
                        </Stack>
                    </Paper>

                    <Paper withBorder p="sm" radius="lg" className="border-slate-100 bg-slate-50/30">
                        <Group gap="sm" mb="sm">
                            <Box p={6} bg="#0C7C92" className="rounded-lg shadow-md shadow-teal-100">
                                <Globe size={14} className="text-white" />
                            </Box>
                            <div>
                                <Title order={6} fw={800} className="text-slate-800 leading-tight text-sm">Internationalization</Title>
                                <Text size="10px" c="dimmed" fw={700} tt="uppercase" lts="0.5px">Display Name</Text>
                            </div>
                        </Group>

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
                            radius="md"
                            size="sm"
                            styles={{ label: { fontWeight: 700, fontSize: '12px' } }}
                        />
                    </Paper>

                    {formData.lookupCategory === 'CAT_CONFIG' && (
                        <Paper withBorder p="sm" radius="lg" className="border-cyan-100 bg-cyan-50/20">
                            <Group gap="sm" mb="sm">
                                <Box p={6} bg="#0C7C92" className="rounded-lg shadow-md shadow-teal-100">
                                    <Globe size={14} className="text-white" />
                                </Box>
                                <div>
                                    <Title order={6} fw={800} className="text-slate-800 leading-tight text-sm">Visual Configuration</Title>
                                    <Text size="10px" c="dimmed" fw={700} tt="uppercase" lts="0.5px">Appearance & Branding</Text>
                                </div>
                            </Group>

                            <Group grow gap="sm">
                                <Select
                                    label="Navigation Icon"
                                    placeholder="Select icon"
                                    data={[
                                        { value: 'Map', label: 'Map / Zone' },
                                        { value: 'Layers', label: 'Layers / Block' },
                                        { value: 'Building2', label: 'Building' },
                                        { value: 'LayoutList', label: 'Layout / Plot' },
                                        { value: 'DoorOpen', label: 'Door / Room' },
                                        { value: 'Settings', label: 'Settings' },
                                        { value: 'Info', label: 'Info' },
                                        { value: 'GitBranch', label: 'Sectors' },
                                        { value: 'Coffee', label: 'Status' },
                                        { value: 'FileText', label: 'Contract' },
                                        { value: 'Sparkles', label: 'Effect' },
                                        { value: 'Database', label: 'Data' },
                                        { value: 'Users', label: 'People' },
                                        { value: 'Hammer', label: 'Tools' },
                                        { value: 'Clock', label: 'Time' },
                                        { value: 'Shield', label: 'Security' },
                                    ]}
                                    value={(formData.metadata as any)?.icon || 'Database'}
                                    onChange={(val) => setFormData(prev => ({
                                        ...prev,
                                        metadata: { ...(prev.metadata as object || {}), icon: val }
                                    }))}
                                    radius="md"
                                    size="sm"
                                    styles={{ label: { fontWeight: 700, fontSize: '12px' } }}
                                />
                                <Select
                                    label="Theme Color"
                                    placeholder="Select color"
                                    data={[
                                        { value: 'teal', label: 'Teal' },
                                        { value: 'blue', label: 'Blue' },
                                        { value: 'violet', label: 'Violet' },
                                        { value: 'pink', label: 'Pink' },
                                        { value: 'amber', label: 'Amber' },
                                        { value: 'cyan', label: 'Cyan' },
                                        { value: 'indigo', label: 'Indigo' },
                                        { value: 'orange', label: 'Orange' },
                                        { value: 'emerald', label: 'Emerald' },
                                        { value: 'slate', label: 'Slate' },
                                        { value: 'red', label: 'Red' },
                                    ]}
                                    value={(formData.metadata as any)?.color || 'blue'}
                                    onChange={(val) => setFormData(prev => ({
                                        ...prev,
                                        metadata: { ...(prev.metadata as object || {}), color: val }
                                    }))}
                                    radius="md"
                                    size="sm"
                                    styles={{ label: { fontWeight: 700, fontSize: '12px' } }}
                                />
                            </Group>
                        </Paper>
                    )}

                    <Paper withBorder p="sm" radius="lg" className="border-slate-100 bg-slate-50/30">
                        <Group gap="sm" mb="sm">
                            <Box p={6} bg="#0C7C92" className="rounded-lg shadow-md shadow-teal-100">
                                <Layers size={14} className="text-white" />
                            </Box>
                            <div>
                                <Title order={6} fw={800} className="text-slate-800 leading-tight text-sm">Hierarchy & Logic</Title>
                                <Text size="10px" c="dimmed" fw={700} tt="uppercase" lts="0.5px">Access & Ordering</Text>
                            </div>
                        </Group>

                        <Stack gap="sm">
                            <Group grow>
                                <NumberInput
                                    label="Hierarchy Level"
                                    min={1}
                                    value={formData.level}
                                    onChange={(val) => setFormData(prev => ({ ...prev, level: Number(val) || 1 }))}
                                    required
                                    radius="md"
                                    size="sm"
                                    styles={{ label: { fontWeight: 700, fontSize: '12px' } }}
                                />
                                <NumberInput
                                    label="Sort Priority"
                                    min={1}
                                    value={formData.displayOrder}
                                    onChange={(val) => setFormData(prev => ({ ...prev, displayOrder: Number(val) || 1 }))}
                                    required
                                    radius="md"
                                    size="sm"
                                    styles={{ label: { fontWeight: 700, fontSize: '12px' } }}
                                />
                            </Group>

                            <Divider variant="dashed" my={4} />

                            <Group gap="lg" justify="center">
                                <Checkbox
                                    label={<Text size="xs" fw={800} className="text-slate-700">Active</Text>}
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.currentTarget.checked }))}
                                    color="#0C7C92"
                                    styles={{ label: { cursor: 'pointer' } }}
                                />
                                <Checkbox
                                    label={<Text size="xs" fw={800} className="text-slate-700">Protected</Text>}
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
