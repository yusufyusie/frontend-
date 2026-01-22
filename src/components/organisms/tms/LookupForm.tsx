import { useState, useEffect } from 'react';
import { Stack, TextInput, Group, Select, Button, Box, LoadingOverlay, Title, NumberInput, Checkbox, Paper, Divider, Text } from '@mantine/core';
import { Save, Tag, Layers, Sparkles, Hash, Layout, Map, Building2, LayoutList, Settings, Info, GitBranch, FileText, Database, DoorOpen, Coffee, Shield, Wallet, Activity, Leaf, Headset, Server, Radio, Code2, Hammer, Clock, Users, Briefcase, Settings2 } from 'lucide-react';
import { SystemLookup, lookupsService } from '@/services/lookups.service';

const ICON_MAP: Record<string, any> = {
    Map, Layers, Building2, LayoutList, Settings, Info, GitBranch, FileText, Database, DoorOpen, Coffee,
    Shield, Wallet, Activity, Leaf, Headset, Server, Radio, Code2, Hammer, Clock, Users, Briefcase, Settings2
};

const getIcon = (name: string) => ICON_MAP[name] || Database;

const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
        emerald: '#10b981',
        blue: '#3b82f6',
        violet: '#8b5cf6',
        pink: '#ec4899',
        amber: '#f59e0b',
        cyan: '#06b6d4',
        teal: '#14b8a6',
        indigo: '#6366f1',
        orange: '#f97316',
        slate: '#64748b',
        red: '#ef4444',
    };
    return colors[color] || '#64748b';
};

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

    const [categories, setCategories] = useState<any[]>([]);
    const [constructionStatuses, setConstructionStatuses] = useState<any[]>([]);

    useEffect(() => {
        lookupsService.getCategories().then(res => {
            const data = (res as any).data || res;
            if (Array.isArray(data)) {
                setCategories(data);
            }
        });

        lookupsService.getByCategory('CONSTRUCTION_STATUS').then(res => {
            const data = (res as any).data || res;
            if (Array.isArray(data)) {
                setConstructionStatuses(data.map((d: any) => ({
                    value: d.id.toString(),
                    label: d.lookupValue.en
                })));
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
                    {/* Core Definition Section */}
                    <Paper withBorder p="md" radius="2rem" className="border-slate-100 bg-white shadow-sm">
                        <Group gap="md" mb="md">
                            <Box p={10} bg="linear-gradient(135deg, #0C7C92 0%, #065e6e 100%)" className="rounded-2xl shadow-lg shadow-teal-100/50">
                                <Layout size={20} className="text-white" />
                            </Box>
                            <div>
                                <Title order={4} fw={900} className="text-slate-800 tracking-tight leading-none mb-1">Entity Definition</Title>
                                <Text size="11px" c="dimmed" fw={700} tt="uppercase" lts="1px">Core Classification & Display</Text>
                            </div>
                        </Group>

                        <Stack gap="md">
                            <Select
                                label="Category Domain"
                                placeholder="Select category..."
                                data={categories}
                                value={formData.lookupCategory}
                                onChange={(val) => setFormData(prev => ({ ...prev, lookupCategory: val || '' }))}
                                searchable
                                required
                                disabled={!!category}
                                radius="xl"
                                size="md"
                                styles={{ label: { fontWeight: 800, color: '#1e293b' } }}
                            />

                            <Group grow gap="md">
                                <TextInput
                                    label="Identification Code"
                                    placeholder="e.g. ZONE_001"
                                    value={formData.lookupCode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, lookupCode: e.currentTarget.value.toUpperCase() }))}
                                    required
                                    radius="xl"
                                    size="md"
                                    styles={{ label: { fontWeight: 800, color: '#1e293b' } }}
                                />

                                <TextInput
                                    label="Display Name"
                                    placeholder="Enter natural name..."
                                    value={formData.lookupValue?.en || ''}
                                    onChange={(e) => {
                                        const value = e.currentTarget.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            lookupValue: { en: value, am: value }
                                        }));
                                    }}
                                    required
                                    radius="xl"
                                    size="md"
                                    styles={{ label: { fontWeight: 800, color: '#1e293b' } }}
                                />
                            </Group>
                        </Stack>
                    </Paper>

                    {/* Floor Specific Section */}
                    {formData.lookupCategory === 'FLOOR' && (
                        <Paper withBorder p="md" radius="2rem" className="border-cyan-100 bg-cyan-50/20 backdrop-blur-sm shadow-sm">
                            <Group gap="md" mb="md">
                                <Box p={10} bg="linear-gradient(135deg, #0C7C92 0%, #15AABF 100%)" className="rounded-2xl shadow-lg shadow-cyan-100">
                                    <Hash size={20} className="text-white" />
                                </Box>
                                <div>
                                    <Title order={4} fw={900} className="text-slate-800 tracking-tight leading-none mb-1">Floor Details</Title>
                                    <Text size="11px" c="dimmed" fw={700} tt="uppercase" lts="1px">Engineering & Capacity</Text>
                                </div>
                            </Group>

                            <Stack gap="md">
                                <Group grow gap="md">
                                    <NumberInput
                                        label="Floor Number"
                                        placeholder="0 for Ground, 1, 2..."
                                        value={formData.metadata?.floorNumber}
                                        onChange={(val) => setFormData(prev => ({
                                            ...prev,
                                            metadata: { ...prev.metadata, floorNumber: Number(val) }
                                        }))}
                                        required
                                        radius="xl"
                                        size="md"
                                        styles={{ label: { fontWeight: 800, color: '#1e293b' } }}
                                    />
                                    <Select
                                        label="Construction Status"
                                        placeholder="Select status..."
                                        data={constructionStatuses}
                                        value={formData.metadata?.constructionStatusId?.toString()}
                                        onChange={(val) => setFormData(prev => ({
                                            ...prev,
                                            metadata: { ...prev.metadata, constructionStatusId: val ? parseInt(val) : undefined }
                                        }))}
                                        radius="xl"
                                        size="md"
                                        styles={{ label: { fontWeight: 800, color: '#1e293b' } }}
                                    />
                                </Group>
                                <Group grow gap="md">
                                    <NumberInput
                                        label="Total Constructed Area (m²)"
                                        placeholder="Gross area"
                                        value={formData.metadata?.totalArea}
                                        onChange={(val) => setFormData(prev => ({
                                            ...prev,
                                            metadata: { ...prev.metadata, totalArea: Number(val) }
                                        }))}
                                        decimalScale={2}
                                        radius="xl"
                                        size="md"
                                        styles={{ label: { fontWeight: 800, color: '#1e293b' } }}
                                    />
                                    <NumberInput
                                        label="Rentable Area (m²)"
                                        placeholder="Leasable area"
                                        value={formData.metadata?.rentableArea}
                                        onChange={(val) => setFormData(prev => ({
                                            ...prev,
                                            metadata: { ...prev.metadata, rentableArea: Number(val) }
                                        }))}
                                        decimalScale={2}
                                        radius="xl"
                                        size="md"
                                        error={formData.metadata?.rentableArea > formData.metadata?.totalArea ? 'Cannot exceed total area' : null}
                                        styles={{ label: { fontWeight: 800, color: '#1e293b' } }}
                                    />
                                </Group>
                            </Stack>
                        </Paper>
                    )}

                    {/* Plot Specific Section */}
                    {formData.lookupCategory === 'PLOT' && (
                        <Paper withBorder p="md" radius="2rem" className="border-pink-100 bg-pink-50/20 backdrop-blur-sm shadow-sm">
                            <Group gap="md" mb="md">
                                <Box p={10} bg="linear-gradient(135deg, #db2777 0%, #be185d 100%)" className="rounded-2xl shadow-lg shadow-pink-100">
                                    <LayoutList size={20} className="text-white" />
                                </Box>
                                <div>
                                    <Title order={4} fw={900} className="text-slate-800 tracking-tight leading-none mb-1">Land Reference</Title>
                                    <Text size="11px" c="dimmed" fw={700} tt="uppercase" lts="1px">Spatial Dimensions</Text>
                                </div>
                            </Group>

                            <NumberInput
                                label="Plot Area (m²)"
                                placeholder="Total land area"
                                value={formData.metadata?.area}
                                onChange={(val) => setFormData(prev => ({
                                    ...prev,
                                    metadata: { ...prev.metadata, area: Number(val) }
                                }))}
                                decimalScale={2}
                                required
                                radius="xl"
                                size="md"
                                styles={{ label: { fontWeight: 800, color: '#1e293b' } }}
                            />
                        </Paper>
                    )}

                    {/* Visual Config for CAT_CONFIG */}
                    {formData.lookupCategory === 'CAT_CONFIG' && (
                        <Paper withBorder p="md" radius="2rem" className="border-cyan-100 bg-cyan-50/20 backdrop-blur-sm shadow-sm">
                            <Group gap="md" mb="md">
                                <Box p={10} bg="linear-gradient(135deg, #0C7C92 0%, #15AABF 100%)" className="rounded-2xl shadow-lg shadow-cyan-100">
                                    <Sparkles size={20} className="text-white" />
                                </Box>
                                <div>
                                    <Title order={4} fw={900} className="text-slate-800 tracking-tight leading-none mb-1">Visual Configuration</Title>
                                    <Text size="11px" c="dimmed" fw={700} tt="uppercase" lts="1px">Branding & Layout Settings</Text>
                                </div>
                            </Group>

                            <Group grow gap="md">
                                <Select
                                    label="Navigation Icon"
                                    data={['Map', 'Layers', 'Building2', 'LayoutList', 'DoorOpen', 'Settings', 'Info', 'GitBranch', 'Coffee', 'FileText', 'Sparkles', 'Database', 'Users', 'Hammer', 'Clock', 'Shield']}
                                    value={(formData.metadata as any)?.icon || 'Database'}
                                    onChange={(val) => setFormData(prev => ({
                                        ...prev,
                                        metadata: { ...prev.metadata, icon: val }
                                    }))}
                                    radius="xl"
                                    size="md"
                                    searchable
                                    styles={{ label: { fontWeight: 800, color: '#1e293b' } }}
                                />
                                <Select
                                    label="Theme Color"
                                    data={['teal', 'blue', 'violet', 'pink', 'amber', 'cyan', 'indigo', 'orange', 'emerald', 'slate', 'red']}
                                    value={(formData.metadata as any)?.color || 'blue'}
                                    onChange={(val) => setFormData(prev => ({
                                        ...prev,
                                        metadata: { ...prev.metadata, color: val }
                                    }))}
                                    radius="xl"
                                    size="md"
                                    styles={{ label: { fontWeight: 800, color: '#1e293b' } }}
                                />
                            </Group>
                        </Paper>
                    )}

                    {/* Hierarchy & Logic Section */}
                    <Paper withBorder p="md" radius="2rem" className="border-slate-100 bg-slate-50/50">
                        <Group gap="md" mb="md">
                            <Box p={10} bg="linear-gradient(135deg, #0C7C92 0%, #475569 100%)" className="rounded-2xl shadow-lg shadow-slate-200">
                                <Layers size={20} className="text-white" />
                            </Box>
                            <div>
                                <Title order={4} fw={900} className="text-slate-800 tracking-tight leading-none mb-1">Hierarchy & Logic</Title>
                                <Text size="11px" c="dimmed" fw={700} tt="uppercase" lts="1px">Ordering & System Security</Text>
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

                            <Group gap="xl" justify="center" mt="sm">
                                <Checkbox
                                    label={<Text size="sm" fw={800} className="text-slate-700">Display Active</Text>}
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.currentTarget.checked }))}
                                    color="#0C7C92"
                                />
                                <Checkbox
                                    label={<Text size="sm" fw={800} className="text-slate-700">System Protected</Text>}
                                    checked={formData.isSystem}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isSystem: e.currentTarget.checked }))}
                                    color="#0C7C92"
                                />
                            </Group>
                        </Stack>
                    </Paper>
                </Stack>
            </form>

            <style jsx global>{`
                .mantine-Select-input:focus, .mantine-TextInput-input:focus, .mantine-NumberInput-input:focus {
                    border-color: #0C7C92 !important;
                    box-shadow: 0 0 0 4px rgba(12, 124, 146, 0.05) !important;
                }
            `}</style>
        </Box>
    );
};
