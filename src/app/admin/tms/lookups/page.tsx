'use client';

import { useState, useEffect, useMemo } from 'react';
import { ActionIcon, Group, Stack, Box, Text, Paper, Title, Tabs, Badge, TextInput, Button } from '@mantine/core';
import { GitBranch, Database, Settings, Plus, Info, LayoutList, Search, X, Save } from 'lucide-react';
import { PageHeader } from '@/components/molecules/tms/PageHeader';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { LookupTree } from '@/components/organisms/tms/LookupTree';
import { LookupForm } from '@/components/organisms/tms/LookupForm';
import { Modal } from '@/components/Modal';
import { toast } from '@/components/Toast';

const CATEGORIES = [
    { label: 'Business Sectors', value: 'BUSINESS_CATEGORIES', icon: GitBranch, color: 'teal' },
    { label: 'Tenant Status', value: 'TENANT_STATUS', icon: Settings, color: 'blue' },
    { label: 'Building Types', value: 'BUILDING_TYPES', icon: Database, color: 'orange' },
    { label: 'Const. Status', value: 'CONSTRUCTION_STATUS', icon: Info, color: 'cyan' },
    { label: 'Zone Types', value: 'ZONE_TYPES', icon: LayoutList, color: 'indigo' },
    { label: 'Room Status', value: 'ROOM_STATUS', icon: Info, color: 'red' },
    { label: 'Contract Types', value: 'CONTRACT_TYPES', icon: LayoutList, color: 'violet' },
];

export default function LookupsPage() {
    const [mounted, setMounted] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].value);
    const [lookups, setLookups] = useState<SystemLookup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpened, setModalOpened] = useState(false);
    const [editingLookup, setEditingLookup] = useState<Partial<SystemLookup> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        setMounted(true);
        console.log('LOOKUPS PAGE RELOADED - V8 - PREMIUM');
        fetchLookups();
    }, [selectedCategory]);

    const fetchLookups = async () => {
        setIsLoading(true);
        try {
            // Use getTree instead of getByCategory for proper hierarchical display
            const res: any = await lookupsService.getTree(selectedCategory);
            const data = res.data || res;
            setLookups(Array.isArray(data) ? data : []);
            console.log(`Fetched ${Array.isArray(data) ? data.length : 0} tree nodes for ${selectedCategory}`);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to load hierarchical lookups');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredLookups = useMemo(() => {
        if (!searchTerm) return lookups;

        const filterNodes = (nodes: SystemLookup[]): SystemLookup[] => {
            return nodes.reduce((acc, node) => {
                const matches =
                    (node.lookupValue?.en || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (node.lookupValue?.am || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (node.lookupCode || '').toLowerCase().includes(searchTerm.toLowerCase());

                const filteredChildren = node.children ? filterNodes(node.children) : [];

                if (matches || filteredChildren.length > 0) {
                    acc.push({
                        ...node,
                        children: filteredChildren
                    });
                }
                return acc;
            }, [] as SystemLookup[]);
        };

        return filterNodes(lookups);
    }, [lookups, searchTerm]);


    const handleCreate = () => {
        setEditingLookup({
            lookupCategory: selectedCategory,
            isActive: true,
            displayOrder: lookups.length + 1
        });
        setIsFormValid(false); // Reset validity
        setModalOpened(true);
    };

    const handleEdit = (lookup: SystemLookup) => {
        setEditingLookup(lookup);
        setIsFormValid(true); // Assume valid on edit, form will re-validate
        setModalOpened(true);
    };

    const handleDelete = async (lookup: SystemLookup) => {
        if (confirm(`Are you sure you want to delete "${lookup.lookupCode}"?`)) {
            try {
                await lookupsService.delete(lookup.id);
                toast.success('Lookup deleted successfully');
                fetchLookups();
            } catch (error) {
                toast.error('Failed to delete lookup');
            }
        }
    };

    const handleSubmit = async (data: Partial<SystemLookup>) => {
        try {
            if (editingLookup?.id) {
                await lookupsService.update(editingLookup.id, data);
                toast.success('Lookup updated successfully');
            } else {
                await lookupsService.create(data);
                toast.success('Lookup created successfully');
            }
            fetchLookups();
            setModalOpened(false);
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    if (!mounted) return null;

    return (
        <Stack gap="xl" p="xl" className="bg-gray-50/30 min-h-screen">
            <PageHeader
                title="System Metadata & Lookups"
                description="Manage global classification trees, business sectors, and system status indicators."
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'System Configuration' },
                    { label: 'Lookups' }
                ]}
                actions={[
                    {
                        label: 'New Lookup',
                        onClick: handleCreate,
                        icon: Plus,
                        variant: 'primary',
                        color: 'tms-teal'
                    }
                ]}
            />

            <Tabs
                orientation="vertical"
                value={selectedCategory}
                onChange={(val) => val && setSelectedCategory(val)}
                variant="pills"
                radius="lg"
                styles={(theme) => ({
                    root: { display: 'flex', gap: '16px' }, // Further reduced for tighter look
                    tab: {
                        padding: '12px 16px',
                        border: '1px solid transparent',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                        marginBottom: '4px',
                        '&:hover': {
                            backgroundColor: '#f1f5f9',
                            transform: 'translateX(4px)'
                        },
                        '&[dataActive]': {
                            backgroundColor: '#0C7C92', // Brand Teal
                            color: 'white',
                            boxShadow: '0 8px 20px rgba(12, 124, 146, 0.15)',
                            '&:hover': {
                                backgroundColor: '#6EC9C4', // Hover to Navy
                            }
                        }
                    },
                    tabsList: {
                        borderRight: 0,
                        backgroundColor: 'transparent',
                        padding: '0',
                        width: '184px',
                        minWidth: '184px',
                        flexShrink: 0
                    },
                    panel: {
                        flex: 1,
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '24px',
                        border: '1px solid #edf2f7',
                        minHeight: '740px',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.03)',
                        position: 'relative',
                        overflow: 'hidden'
                    }
                })}
            >
                <Tabs.List>
                    <Box mb="lg" px="md">
                        <Text size="xs" fw={800} c="dimmed" tt="uppercase" style={{ letterSpacing: '2px' }} mb={4}>
                            Lookup Domains
                        </Text>
                        <Box h={2} w={30} bg="#0C7C92" style={{ borderRadius: '100px' }} />
                    </Box>

                    {CATEGORIES.map(cat => (
                        <Tabs.Tab
                            key={cat.value}
                            value={cat.value}
                            leftSection={<cat.icon size={20} />}
                        >
                            <Text size="sm" fw={700}>{cat.label}</Text>
                        </Tabs.Tab>
                    ))}

                    <Box mt="auto" pt="xl" px="xs">
                        <Paper bg="tms-mint.0" p="md" radius="lg" style={{ border: '1px dashed #6EC9C499' }}>
                            <Group justify="space-between">
                                <Text size="xs" fw={800} c="tms-navy.9">Count</Text>
                                <Badge color="tms-mint" size="xs" variant="filled">
                                    {lookups.length}
                                </Badge>
                            </Group>
                        </Paper>
                    </Box>
                </Tabs.List>


                {CATEGORIES.map(cat => (
                    <Tabs.Panel key={cat.value} value={cat.value}>
                        <Box
                            pos="absolute"
                            top={-50}
                            right={-50}
                            w={200}
                            h={200}
                            bg="tms-mint.0"
                            style={{ borderRadius: '100%', opacity: 0.3, zIndex: 0 }}
                        />

                        <Box pos="relative" style={{ zIndex: 1 }}>
                            <Group justify="space-between" mb={40} align="flex-start">
                                <Box>
                                    <Title order={3} fw={900} c="tms-navy" style={{ letterSpacing: '-0.5px' }}>
                                        {cat.label}
                                    </Title>
                                    <Text size="sm" c="dimmed" mt={4} fw={500}>
                                        Manage classification values and hierarchical dependencies for {cat.label.toLowerCase()}.
                                    </Text>
                                </Box>
                                <Group gap="md">
                                    <TextInput
                                        placeholder="Search lookups..."
                                        leftSection={<Search size={18} className="text-teal-600" />}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.currentTarget.value)}
                                        size="md"
                                        radius="xl"
                                        w={300}
                                        styles={{
                                            input: {
                                                backgroundColor: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                '&:focus': {
                                                    borderColor: '#0C7C92'
                                                }
                                            }
                                        }}
                                    />
                                    <ActionIcon
                                        variant="filled"
                                        bg="#0C7C92"
                                        size="xl"
                                        onClick={handleCreate}
                                        className="rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                                        title="Create Root Lookup"
                                    >
                                        <Plus size={24} />
                                    </ActionIcon>
                                </Group>
                            </Group>

                            <Box className="min-h-[400px]">
                                {isLoading ? (
                                    <Stack gap="md">
                                        {[1, 2, 3].map(i => (
                                            <Paper key={i} h={80} bg="gray.0" radius="md" style={{ opacity: 0.5 }} />
                                        ))}
                                    </Stack>
                                ) : filteredLookups.length > 0 ? (
                                    <LookupTree
                                        data={filteredLookups}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onAddChild={(node) => {
                                            setEditingLookup({
                                                lookupCategory: selectedCategory,
                                                parentId: node.id,
                                                isActive: true,
                                                level: (node.level || 1) + 1
                                            });
                                            setIsFormValid(false);
                                            setModalOpened(true);
                                        }}
                                    />
                                ) : (
                                    <Paper withBorder p={50} radius="xl" bg="gray.0" style={{ borderStyle: 'dashed', textAlign: 'center' }}>
                                        <Stack align="center" gap="xs">
                                            <Box p="md" bg="white" style={{ borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                                <Search size={32} className="text-gray-300" />
                                            </Box>
                                            <Text fw={700} c="gray.7">No entries found</Text>
                                            <Text size="sm" c="dimmed" maw={300}>
                                                We couldn't find any lookup values for this category. Start by creating the first entry.
                                            </Text>
                                            <ActionIcon variant="light" color="teal" size="lg" radius="md" mt="sm" onClick={handleCreate}>
                                                <Plus size={20} />
                                            </ActionIcon>
                                        </Stack>
                                    </Paper>
                                )}
                            </Box>
                        </Box>
                    </Tabs.Panel>
                ))}
            </Tabs>

            <Modal
                isOpen={modalOpened}
                onClose={() => setModalOpened(false)}
                title={editingLookup?.id ? 'Edit Lookup' : 'New Lookup'}
                description={selectedCategory.replace('_', ' ')}
                size="lg"
                footer={
                    <Group justify="flex-end" gap="md">
                        <Button
                            variant="subtle"
                            color="gray"
                            onClick={() => setModalOpened(false)}
                            size="md"
                            radius="xl"
                            leftSection={<X size={18} />}
                            className="hover:bg-gray-200/50 text-gray-700 font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="filled"
                            bg="#0C7C92"
                            onClick={() => {
                                document.getElementById('lookup-form')?.dispatchEvent(
                                    new Event('submit', { cancelable: true, bubbles: true })
                                );
                            }}
                            size="md"
                            radius="xl"
                            disabled={!isFormValid}
                            leftSection={<Save size={18} />}
                            className={`shadow-lg shadow-teal-100 transition-all ${isFormValid ? 'hover:shadow-xl active:scale-95' : 'opacity-50 cursor-not-allowed'}`}
                        >
                            Save Configuration
                        </Button>
                    </Group>
                }
            >
                <LookupForm
                    initialData={editingLookup || {}}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    onValidityChange={setIsFormValid}
                />
            </Modal>
        </Stack>
    );
}
