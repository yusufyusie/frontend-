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

    useEffect(() => {
        lookupsService.getCategories().then(res => {
            const data = (res as any).data || res;
            if (Array.isArray(data)) {
                setCategories(data);
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
                    <Paper withBorder p="md" radius="2rem" className="border-slate-100 bg-white/50 backdrop-blur-sm shadow-sm">
                        <Group gap="md" mb="md">
                            <Box p={10} bg="linear-gradient(135deg, #0C7C92 0%, #065e6e 100%)" className="rounded-2xl shadow-lg shadow-teal-100/50">
                                <Layout size={20} className="text-white" />
                            </Box>
                            <div>
                                <Title order={4} fw={900} className="text-slate-800 tracking-tight leading-none mb-1">Entity Definition</Title>
                                <Text size="11px" c="dimmed" fw={700} tt="uppercase" lts="1px">Core Classification & Display</Text>
                            </div>
                        </Group>

                        <Stack gap="xl">
                            <Select
                                label="Category Domain"
                                description="The logical grouping for this lookup entry"
                                placeholder="Select category..."
                                data={categories}
                                value={formData.lookupCategory}
                                onChange={(val) => setFormData(prev => ({ ...prev, lookupCategory: val || '' }))}
                                searchable
                                required
                                disabled={!!category}
                                radius="xl"
                                size="md"
                                checkIconPosition="right"
                                maxDropdownHeight={320}
                                comboboxProps={{
                                    withinPortal: true,
                                    transitionProps: { transition: 'pop', duration: 250 },
                                    shadow: 'xl',
                                    radius: 'xl'
                                }}
                                styles={{
                                    label: { fontWeight: 800, marginBottom: 4, color: '#1e293b' },
                                    input: {
                                        borderRadius: '1.25rem',
                                        backgroundColor: '#fff',
                                        border: '1.5px solid #eef2f6',
                                        transition: 'all 0.2s ease'
                                    },
                                    dropdown: {
                                        borderRadius: '1.5rem',
                                        border: '1px solid #f1f5f9',
                                        padding: '8px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                                    },
                                    option: {
                                        borderRadius: '1rem',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        padding: '10px 14px',
                                        margin: '2px 0',
                                        transition: 'all 0.2s ease'
                                    }
                                }}
                                renderOption={(item: any) => {
                                    const CategoryIcon = getIcon(item.option.metadata?.icon);
                                    const color = getColorClass(item.option.metadata?.color);
                                    return (
                                        <Group gap="sm" wrap="nowrap">
                                            <Box p={6} style={{ backgroundColor: `${color}15`, borderRadius: '8px' }}>
                                                <CategoryIcon size={14} style={{ color }} />
                                            </Box>
                                            <div style={{ flex: 1 }}>
                                                <Text size="sm" fw={700} c="slate.8">{item.option.label}</Text>
                                                <Text size="10px" c="dimmed" fw={600} tt="uppercase">{item.option.value}</Text>
                                            </div>
                                        </Group>
                                    );
                                }}
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
                                    styles={{
                                        label: { fontWeight: 800, marginBottom: 4, color: '#1e293b' },
                                        input: {
                                            borderRadius: '1.25rem',
                                            fontWeight: 900,
                                            letterSpacing: '0.5px',
                                            backgroundColor: '#f8fafc',
                                            border: '1.5px solid #eef2f6'
                                        }
                                    }}
                                />

                                <TextInput
                                    label="Display Name"
                                    placeholder="Enter natural name..."
                                    value={formData.lookupValue?.en || ''}
                                    onChange={(e) => {
                                        const value = e.currentTarget.value;
                                        setFormData(prev => ({
                                            ...prev,
                                            lookupValue: {
                                                en: value,
                                                am: value
                                            }
                                        }));
                                    }}
                                    required
                                    radius="xl"
                                    size="md"
                                    styles={{
                                        label: { fontWeight: 800, marginBottom: 4, color: '#1e293b' },
                                        input: {
                                            borderRadius: '1.25rem',
                                            backgroundColor: '#fff',
                                            border: '1.5px solid #eef2f6'
                                        }
                                    }}
                                />
                            </Group>
                        </Stack>
                    </Paper>

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
                                    placeholder="Select icon"
                                    data={[
                                        'Map', 'Layers', 'Building2', 'LayoutList', 'DoorOpen', 'Settings', 'Info', 'GitBranch', 'Coffee', 'FileText', 'Sparkles', 'Database', 'Users', 'Hammer', 'Clock', 'Shield'
                                    ]}
                                    value={(formData.metadata as any)?.icon || 'Database'}
                                    onChange={(val) => setFormData(prev => ({
                                        ...prev,
                                        metadata: { ...(prev.metadata as object || {}), icon: val }
                                    }))}
                                    radius="xl"
                                    size="md"
                                    searchable
                                    maxDropdownHeight={250}
                                    comboboxProps={{ withinPortal: true, transitionProps: { transition: 'pop', duration: 250 }, radius: 'xl', shadow: 'xl' }}
                                    styles={{
                                        label: { fontWeight: 800, marginBottom: 4, color: '#1e293b' },
                                        input: { borderRadius: '1.25rem', border: '1.5px solid #c8ebf1', backgroundColor: '#fff' },
                                        dropdown: { borderRadius: '1.5rem', padding: '8px' },
                                        option: { borderRadius: '1rem', fontWeight: 600 }
                                    }}
                                    renderOption={(item: any) => {
                                        const IconComp = getIcon(item.option.value);
                                        return (
                                            <Group gap="sm">
                                                <IconComp size={14} />
                                                <Text size="sm" fw={600}>{item.option.value}</Text>
                                            </Group>
                                        );
                                    }}
                                />
                                <Select
                                    label="Theme Color"
                                    placeholder="Select color"
                                    data={[
                                        'teal', 'blue', 'violet', 'pink', 'amber', 'cyan', 'indigo', 'orange', 'emerald', 'slate', 'red'
                                    ]}
                                    value={(formData.metadata as any)?.color || 'blue'}
                                    onChange={(val) => setFormData(prev => ({
                                        ...prev,
                                        metadata: { ...(prev.metadata as object || {}), color: val }
                                    }))}
                                    radius="xl"
                                    size="md"
                                    maxDropdownHeight={250}
                                    comboboxProps={{ withinPortal: true, transitionProps: { transition: 'pop', duration: 250 }, radius: 'xl', shadow: 'xl' }}
                                    styles={{
                                        label: { fontWeight: 800, marginBottom: 4, color: '#1e293b' },
                                        input: { borderRadius: '1.25rem', border: '1.5px solid #c8ebf1', backgroundColor: '#fff' },
                                        dropdown: { borderRadius: '1.5rem', padding: '8px' },
                                        option: { borderRadius: '1rem', fontWeight: 600 }
                                    }}
                                    renderOption={(item: any) => (
                                        <Group gap="sm">
                                            <Box w={12} h={12} style={{ borderRadius: '50%', backgroundColor: getColorClass(item.option.value) }} />
                                            <Text size="sm" fw={600} tt="capitalize">{item.option.value}</Text>
                                        </Group>
                                    )}
                                />
                            </Group>
                        </Paper>
                    )}

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
                                    radius="sm"
                                    styles={{ label: { cursor: 'pointer', paddingLeft: 12 } }}
                                />
                                <Checkbox
                                    label={<Text size="sm" fw={800} className="text-slate-700">System Protected</Text>}
                                    checked={formData.isSystem}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isSystem: e.currentTarget.checked }))}
                                    color="#0C7C92"
                                    radius="sm"
                                    styles={{ label: { cursor: 'pointer', paddingLeft: 12 } }}
                                />
                            </Group>
                        </Stack>
                    </Paper>
                </Stack>
            </form>

            <style jsx global>{`
                /* Force Scrollbar visibility and branding */
                .mantine-Select-dropdown,
                .mantine-Combobox-dropdown,
                .mantine-ScrollArea-viewport {
                    scrollbar-width: auto !important;
                    scrollbar-color: #0C7C9266 transparent !important;
                }

                .mantine-Select-dropdown::-webkit-scrollbar,
                .mantine-Combobox-dropdown::-webkit-scrollbar,
                .mantine-ScrollArea-scrollbar {
                    width: 8px !important;
                    display: block !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                }

                .mantine-Select-dropdown::-webkit-scrollbar-track,
                .mantine-Combobox-dropdown::-webkit-scrollbar-track,
                .mantine-ScrollArea-scrollbar {
                    background: #f8fafc !important;
                    border-radius: 10px !important;
                }

                .mantine-Select-dropdown::-webkit-scrollbar-thumb,
                .mantine-Combobox-dropdown::-webkit-scrollbar-thumb,
                .mantine-ScrollArea-thumb {
                    background-color: #0C7C92 !important;
                    border-radius: 20px !important;
                    border: 2px solid #f8fafc !important;
                    display: block !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    min-height: 40px !important;
                }

                .mantine-ScrollArea-thumb {
                    background-color: #0C7C9266 !important;
                }

                .mantine-ScrollArea-thumb:hover {
                    background-color: #0C7C92 !important;
                }

                /* Ensure dropdown list has minimum spacing */
                .mantine-Select-options {
                    padding: 8px !important;
                }

                /* Branded Selected State */
                .mantine-Select-option[data-selected],
                .mantine-Combobox-option[data-selected] {
                    background-color: #0C7C92 !important;
                    color: white !important;
                }

                .mantine-Select-option[data-selected] *,
                .mantine-Combobox-option[data-selected] * {
                    color: white !important;
                }

                /* Branded Focus State */
                .mantine-Select-input:focus,
                .mantine-TextInput-input:focus,
                .mantine-NumberInput-input:focus {
                    border-color: #0C7C92 !important;
                    box-shadow: 0 0 0 4px rgba(12, 124, 146, 0.05) !important;
                }
            `}</style>
        </Box>
    );
};
