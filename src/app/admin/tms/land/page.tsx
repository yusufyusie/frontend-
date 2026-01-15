'use client';

import { useState, useEffect } from 'react';
import { Button, Group, Stack, Box, Text, Paper, Title, LoadingOverlay } from '@mantine/core';
import { Plus, RefreshCw, Map, Grid3x3, MapPin, TrendingUp, X, Save } from 'lucide-react';
import { landResourcesService, LandResource, LandResourceType } from '@/services/land-resources.service';
import { LandForm } from '@/components/organisms/tms/LandForm';
import { AdvancedTreeGrid, TreeNode } from '@/components/organisms/tms/AdvancedTreeGrid';
import { Modal } from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function LandPage() {
    const [treeData, setTreeData] = useState<LandResource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [opened, setOpened] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [activeResource, setActiveResource] = useState<Partial<LandResource> | null>(null);
    const [metrics, setMetrics] = useState({
        zones: 0,
        blocks: 0,
        plots: 0,
        totalArea: 0
    });

    const fetchTree = async () => {
        setIsLoading(true);
        try {
            const response: any = await landResourcesService.getTree();
            const data = response.data || response;
            setTreeData(data);

            // Calculate metrics
            let zones = 0, blocks = 0, plots = 0, totalArea = 0;
            const countResources = (items: LandResource[]) => {
                items.forEach(item => {
                    if (item.type === LandResourceType.ZONE) zones++;
                    if (item.type === LandResourceType.BLOCK) blocks++;
                    if (item.type === LandResourceType.PLOT) plots++;
                    totalArea += Number(item.areaM2 || 0);
                    if (item.children) countResources(item.children);
                });
            };
            countResources(data);
            setMetrics({ zones, blocks, plots, totalArea });
        } catch (error) {
            toast.error('Failed to fetch land resource tree');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTree();
    }, []);

    const handleEdit = (node: TreeNode) => {
        const resource = findResourceById(treeData, node.id);
        if (resource) {
            setActiveResource(resource);
            setOpened(true);
            setIsFormValid(true); // Assuming existing data is valid, or let form update it
        }
    };

    const handleAddChild = (node: TreeNode) => {
        const parent = findResourceById(treeData, node.id);
        if (!parent) return;

        const nextTypeMap = {
            [LandResourceType.ZONE]: LandResourceType.BLOCK,
            [LandResourceType.BLOCK]: LandResourceType.PLOT,
            [LandResourceType.PLOT]: LandResourceType.PLOT,
        };

        setActiveResource({
            parentId: parent.id,
            type: nextTypeMap[parent.type],
            code: `${parent.code}-`
        });
        setOpened(true);
        setIsFormValid(false);
    };

    const handleDelete = async (node: TreeNode) => {
        const resource = findResourceById(treeData, node.id);
        if (!resource) return;

        if (confirm(`⚠️ Delete ${resource.nameEn}? This cannot be undone if it has no children.`)) {
            try {
                await landResourcesService.delete(resource.id);
                toast.success('Resource deleted');
                fetchTree();
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Delete failed');
            }
        }
    };

    const handleCreateNewZone = () => {
        setActiveResource({ type: LandResourceType.ZONE });
        setOpened(true);
        setIsFormValid(false);
    };

    const handleSubmit = async (data: Partial<LandResource>) => {
        setIsLoading(true);
        try {
            if (data.id) {
                await landResourcesService.update(data.id, data);
                toast.success('✅ Resource updated successfully');
            } else {
                await landResourcesService.create(data);
                toast.success('✅ Resource created successfully');
            }
            setOpened(false);
            fetchTree();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Convert LandResource to TreeNode
    const convertToTreeNodes = (resources: LandResource[]): TreeNode[] => {
        return resources.map(resource => ({
            id: resource.id,
            label: resource.nameEn,
            icon: resource.type === 'ZONE' ? <Map size={16} /> :
                resource.type === 'BLOCK' ? <Grid3x3 size={16} /> :
                    <MapPin size={16} />,
            badge: resource.areaM2 ? {
                text: `${Number(resource.areaM2).toLocaleString()} m²`,
                color: 'blue'
            } : undefined,
            children: resource.children ? convertToTreeNodes(resource.children) : undefined,
            meta: resource
        }));
    };

    const findResourceById = (resources: LandResource[], id: number): LandResource | null => {
        for (const resource of resources) {
            if (resource.id === id) return resource;
            if (resource.children) {
                const found = findResourceById(resource.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-primary">Land Resources</h1>
                    <p className="text-gray-500 mt-1">Territorial hierarchy management: Zones → Blocks → Plots</p>
                </div>
                <button
                    onClick={handleCreateNewZone}
                    className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Zone</span>
                </button>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Zones</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{metrics.zones}</p>
                        </div>
                        <Map className="w-10 h-10 text-primary/20" />
                    </div>
                </div>
                <div className="card p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Blocks</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{metrics.blocks}</p>
                        </div>
                        <Grid3x3 className="w-10 h-10 text-cyan-500/20" />
                    </div>
                </div>
                <div className="card p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Plots</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{metrics.plots}</p>
                        </div>
                        <MapPin className="w-10 h-10 text-success/20" />
                    </div>
                </div>
                <div className="card p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Area</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{metrics.totalArea.toLocaleString()} m²</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-warning/20" />
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="card p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 border-l-4 border-primary">
                <div className="flex items-center gap-3">
                    <Map size={20} className="text-primary flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-gray-900">Territorial Hierarchy Overview</p>
                        <p className="text-xs text-gray-600 mt-1">
                            Resources are organized as: <b>Zone</b> (e.g., Commercial) → <b>Block</b> (e.g., B01) → <b>Plot</b> (e.g., P01). Buildings are linked directly to <b>Plots</b>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Advanced Tree Grid */}
            <div className="card p-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="spinner spinner-lg text-primary" />
                    </div>
                ) : treeData.length > 0 ? (
                    <AdvancedTreeGrid
                        data={convertToTreeNodes(treeData)}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddChild={handleAddChild}
                        searchable={true}
                        initialExpandLevel={1}
                    />
                ) : (
                    <div className="text-center py-12">
                        <Map size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-bold text-gray-400">No Land Resources</p>
                        <p className="text-sm text-gray-400 mt-2">Start by creating your first Zone to organize your territory.</p>
                    </div>
                )}
            </div>

            {/* Branded Modal */}
            <Modal
                isOpen={opened}
                onClose={() => setOpened(false)}
                title={activeResource?.id ? 'Edit Land Resource' : 'New Land Resource'}
                description="Territorial Management"
                size="lg"
                footer={
                    <Group justify="flex-end" gap="md">
                        <Button
                            variant="subtle"
                            color="gray"
                            onClick={() => setOpened(false)}
                            leftSection={<X size={18} />}
                            radius="xl"
                            size="md"
                            className="hover:bg-gray-200/50 text-gray-700 font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="filled"
                            bg="#0C7C92"
                            onClick={() => {
                                document.getElementById('land-form')?.dispatchEvent(
                                    new Event('submit', { cancelable: true, bubbles: true })
                                );
                            }}
                            disabled={!isFormValid}
                            leftSection={<Save size={18} />}
                            radius="xl"
                            size="md"
                            className={`shadow-lg shadow-teal-100 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Save Land Resource
                        </Button>
                    </Group>
                }
            >
                <LandForm
                    initialData={activeResource || {}}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    onValidityChange={setIsFormValid}
                />
            </Modal>
        </div>
    );
}
