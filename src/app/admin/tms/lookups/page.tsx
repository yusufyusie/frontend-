'use client';

import { useState, useEffect } from 'react';
import { Group, Stack, Box, SegmentedControl, Text, Paper, Title } from '@mantine/core';
import { GitBranch, Database, Settings, Plus, Info, Filter, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/molecules/tms/PageHeader';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { AdvancedTreeGrid, TreeNode } from '@/components/organisms/tms/AdvancedTreeGrid';
import { LookupForm } from '@/components/organisms/tms/LookupForm';
import { Modal } from '@/components/Modal';
import { toast } from '@/components/Toast';

const CATEGORIES = [
    { label: 'Business Sectors', value: 'BUSINESS_CATEGORIES', icon: GitBranch },
    { label: 'Tenant Status', value: 'TENANT_STATUS', icon: Settings },
    { label: 'Building Types', value: 'BUILDING_TYPES', icon: Database },
    { label: 'Const. Status', value: 'CONSTRUCTION_STATUS', icon: Info },
];

export default function LookupsPage() {
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].value);
    const [lookups, setLookups] = useState<SystemLookup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpened, setModalOpened] = useState(false);
    const [editingLookup, setEditingLookup] = useState<Partial<SystemLookup> | null>(null);

    useEffect(() => {
        console.log('LOOKUPS PAGE CANARY RELOADED - V6');
        fetchLookups();
    }, [selectedCategory]);

    const fetchLookups = async () => {
        setIsLoading(true);
        try {
            const res: any = await lookupsService.getByCategory(selectedCategory);
            setLookups(res.data || res);
        } catch (error) {
            toast.error('Failed to load system lookups');
        } finally {
            setIsLoading(false);
        }
    };

    const convertToTreeNodes = (items: SystemLookup[]): TreeNode[] => {
        return items.map(item => ({
            id: item.id,
            label: item.lookupValue.en,
            meta: {
                code: item.lookupCode,
                category: item.lookupCategory
            },
            badge: {
                text: item.isActive ? 'Active' : 'Inactive',
                color: item.isActive ? 'green' : 'red'
            },
            children: item.children ? convertToTreeNodes(item.children) : []
        }));
    };

    const handleCreate = () => {
        setEditingLookup({
            lookupCategory: selectedCategory,
            isActive: true,
            displayOrder: lookups.length + 1
        });
        setModalOpened(true);
    };

    const handleEdit = (node: TreeNode) => {
        const lookup = lookups.find(l => l.id === node.id);
        if (lookup) {
            setEditingLookup(lookup);
            setModalOpened(true);
        }
    };

    const handleDelete = async (node: TreeNode) => {
        if (confirm(`Are you sure you want to delete "${node.label}"?`)) {
            try {
                await lookupsService.delete(node.id);
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

    return (
        <Stack gap="xl" p="xl" className="bg-gray-50/30 min-h-screen">
            <Title order={1} c="red" bg="yellow" p="xl" style={{ border: '5px solid red', textAlign: 'center' }}>
                CANARY VERSION 6 - IF YOU SEE THIS, THE SERVER IS LIVE
            </Title>

            <PageHeader
                title="System Lookups"
                description="Manage classification trees and system configuration metadata."
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'System Configuration' },
                    { label: 'Lookups' }
                ]}
                actions={[
                    {
                        label: 'Add New Lookup',
                        onClick: handleCreate,
                        icon: Plus,
                        variant: 'primary'
                    }
                ]}
            />

            <Box>
                <SegmentedControl
                    data={CATEGORIES}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    fullWidth
                    size="md"
                    radius="xl"
                    color="blue"
                    className="shadow-sm border border-gray-100"
                    styles={{
                        root: { padding: '8px', backgroundColor: 'white' },
                        indicator: { boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }
                    }}
                />
            </Box>

            <Group grow wrap="nowrap">
                <Paper withBorder p="md" radius="md" shadow="sm">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" fw={700} tt="uppercase">Defined Lookups</Text>
                        <Settings size={16} className="text-primary" />
                    </Group>
                    <Text size="xl" fw={900} mt="xs">{lookups.length}</Text>
                </Paper>
                <Paper withBorder p="md" radius="md" shadow="sm">
                    <Group justify="space-between">
                        <Text size="xs" c="dimmed" fw={700} tt="uppercase">Current Category</Text>
                        <Filter size={16} className="text-orange-500" />
                    </Group>
                    <Text size="lg" fw={800} mt="xs" className="truncate">{selectedCategory}</Text>
                </Paper>
            </Group>

            <Box className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
                <Box p="lg" className="border-b border-gray-100 bg-gray-50/50">
                    <Text fw={700} size="sm" c="dimmed" tt="uppercase" lts="0.1em">
                        Hierarchy Visualizer
                    </Text>
                </Box>
                <Box p="xl">
                    <AdvancedTreeGrid
                        data={convertToTreeNodes(lookups)}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddChild={(node) => {
                            setEditingLookup({
                                lookupCategory: selectedCategory,
                                parentId: node.id,
                                isActive: true
                            });
                            setModalOpened(true);
                        }}
                    />
                </Box>
            </Box>

            <Modal
                isOpen={modalOpened}
                onClose={() => setModalOpened(false)}
                title={editingLookup?.id ? 'Edit Lookup' : 'Create New Lookup'}
                description={selectedCategory}
                size="md"
            >
                <LookupForm
                    initialData={editingLookup || {}}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                />
            </Modal>
        </Stack>
    );
}
