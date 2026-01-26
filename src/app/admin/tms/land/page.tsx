'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Group, Stack, Box, Text, Paper, Title, LoadingOverlay } from '@mantine/core';
import { Plus, RefreshCw, Map, Grid3x3, MapPin, TrendingUp, X as CloseIcon, Save, Search as SearchIcon, Building2, Layers, DoorOpen } from 'lucide-react';
import { locationsService } from '@/services/locations.service';
import { SpatialResourceForm } from '@/components/organisms/tms/SpatialResourceForm';
import { AdvancedTreeGrid, TreeNode } from '@/components/organisms/tms/AdvancedTreeGrid';
import { Modal } from '@/components/Modal';
import { Badge as MantineBadge } from '@mantine/core';
import { toast } from '@/components/Toast';
import { LayoutList } from 'lucide-react';
import { AuditSummaryCards } from '@/components/organisms/tms/AuditSummaryCards';

export default function LandPage() {
    const [treeData, setTreeData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [opened, setOpened] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    const [isFormValid, setIsFormValid] = useState(false);
    const [activeResource, setActiveResource] = useState<Partial<any> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [metrics, setMetrics] = useState({
        zones: 0,
        blocks: 0,
        plots: 0,
        buildings: 0,
        floors: 0,
        rooms: 0,
        totalArea: 0
    });

    const fetchTree = async () => {
        setIsLoading(true);
        try {
            const response: any = await locationsService.getTree();
            const data = response.data || response;
            setTreeData(data);

            // Calculate metrics
            let zones = 0, blocks = 0, buildings = 0, plots = 0, floors = 0, rooms = 0, totalArea = 0;
            const countResources = (items: any[]) => {
                items.forEach(item => {
                    if (item.type === 'ZONE') zones++;
                    if (item.type === 'BLOCK') blocks++;
                    if (item.type === 'PLOT') {
                        plots++;
                        totalArea += Number(item.area || 0);
                    }
                    if (item.type === 'BUILDING') buildings++;
                    if (item.type === 'FLOOR') floors++;
                    if (item.type === 'ROOM') {
                        rooms++;
                        totalArea += Number(item.area || 0);
                    }
                    if (item.children) countResources(item.children);
                });
            };
            countResources(data);
            setMetrics({ zones, blocks, plots, buildings, floors, rooms, totalArea });
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
        const resource = findResourceById(treeData, node.id as any);
        if (resource) {
            setActiveResource(resource);
            setOpened(true);
            setIsFormValid(true);
        }
    };

    const handleAddChild = (node: TreeNode) => {
        const parent = findResourceById(treeData, node.id as any);
        if (!parent) return;

        const nextTypeMap: any = {
            'ZONE': 'BLOCK',
            'BLOCK': 'PLOT',
            'PLOT': 'BUILDING',
            'BUILDING': 'FLOOR',
            'FLOOR': 'ROOM',
            'ROOM': 'ROOM',
        };

        setActiveResource({
            parentId: parent.realId || parent.id,
            type: nextTypeMap[parent.type],
            code: `${parent.code}-`
        } as any);
        setOpened(true);
        setIsFormValid(false);
    };

    const handleDelete = async (node: TreeNode) => {
        const resource = findResourceById(treeData, node.id as any);
        if (!resource) return;

        if (confirm(`⚠️ Delete ${resource.name}? This cannot be undone.`)) {
            try {
                await locationsService.delete(resource.type, resource.realId);
                toast.success('Resource deleted successfully');
                fetchTree();
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Delete failed');
            }
        }
    };

    const handleCreateNewZone = () => {
        setActiveResource({ type: 'ZONE' } as any);
        setOpened(true);
        setIsFormValid(false);
    };

    const handleSubmit = async (data: Partial<any>) => {
        setIsLoading(true);
        try {
            await locationsService.create(data);
            toast.success(`${data.type} created successfully`);
            fetchTree();
            setOpened(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Convert LandResource to TreeNode
    const convertToTreeNodes = (resources: any[]): TreeNode[] => {
        return resources.map(resource => ({
            id: resource.id,
            label: resource.name || resource.code,
            icon: resource.type === 'ZONE' ? <Map size={18} className="text-emerald-600" /> :
                resource.type === 'BLOCK' ? <Grid3x3 size={18} className="text-blue-600" /> :
                    resource.type === 'PLOT' ? <MapPin size={18} className="text-teal-600" /> :
                        resource.type === 'BUILDING' ? <Building2 size={18} className="text-violet-600" /> :
                            resource.type === 'FLOOR' ? <Layers size={18} className="text-amber-600" /> :
                                <DoorOpen size={18} className="text-pink-600" />,
            children: resource.children ? convertToTreeNodes(resource.children) : undefined,
            meta: {
                ...resource,
                usageType: resource.type,
                ownershipType: resource.code,
                areaM2: resource.area || resource.totalArea || 0,
                contractAreaM2: resource.contractArea || 0,
                areaVarianceM2: resource.areaVariance || 0,
                occupancyStatus: resource.roomStatus?.name || (resource.occupantName ? 'Occupied' : 'Vacant'),
            }
        }));
    };

    const findResourceById = (resources: any[], id: string | number): any | null => {
        for (const resource of resources) {
            if (resource.id === id || resource.realId === id) return resource;
            if (resource.children) {
                const found = findResourceById(resource.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const handleViewDetail = (node: TreeNode) => {
        const resource = findResourceById(treeData, node.id as any);
        if (resource) {
            toast.info(`Viewing details for ${resource.name}...`);
            // Future implementation: Open a robust detail drawer or analytics page
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-primary">Spatial Structure</h1>
                    <p className="text-gray-500 mt-1">Unified territorial hierarchy: Zone → Block → Plot → Building → Floor → Room</p>
                </div>
                <button
                    onClick={handleCreateNewZone}
                    className="flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-2.5 rounded-xl border-none font-bold text-white transition-all shadow-md active:scale-95 hover:shadow-lg hover:brightness-110 cursor-pointer"
                    style={{ backgroundColor: '#0C7C92' }}
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Zone</span>
                </button>
            </div>

            {/* Official Audit Intelligence - Unified Single Row Command Center */}
            <AuditSummaryCards structuralMetrics={metrics} />

            {/* Info Banner with Integrated Search */}
            <div className="card p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 border-l-4 border-primary">
                <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3">
                        <Map size={20} className="text-primary flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-gray-900">Spatial Structure Hierarchy Overview</p>
                            <p className="text-xs text-gray-600 mt-1">
                                Physical layout: <b>Zone</b> → <b>Block</b> → <b>Plot</b> → <b>Building</b> → <b>Floor</b> → <b>Room</b>.
                            </p>
                        </div>
                    </div>
                    <div className="relative w-80 flex-shrink-0">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Name or Occupant..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-xs font-medium"
                        />
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
                        onViewDetail={handleViewDetail}
                        searchable={true}
                        initialExpandLevel={0}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                    />
                ) : (
                    <div className="text-center py-12">
                        <Map size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-bold text-gray-400">No Land Resources</p>
                        <p className="text-sm text-gray-400 mt-2">Start by creating your first Zone to organize your territory.</p>
                    </div>
                )}
            </div>

            {/* Branded Elite Modal Architecture - Aligned with System Lookups Reference */}
            {mounted && createPortal(
                <Modal
                    isOpen={opened}
                    onClose={() => setOpened(false)}
                    mode="modal"
                    size="lg"
                    title={activeResource?.realId || activeResource?.id ? 'Edit Configuration' : `Register ${activeResource?.type || ''}`}
                    description="Spatial Structure Management"
                    icon={activeResource?.type === 'ZONE' ? <Map size={24} className="text-[#0C7C92]" /> :
                        activeResource?.type === 'BLOCK' ? <Grid3x3 size={24} className="text-[#0C7C92]" /> :
                            activeResource?.type === 'PLOT' ? <MapPin size={24} className="text-[#0C7C92]" /> :
                                activeResource?.type === 'BUILDING' ? <Building2 size={24} className="text-[#0C7C92]" /> :
                                    activeResource?.type === 'FLOOR' ? <Layers size={24} className="text-[#0C7C92]" /> :
                                        activeResource?.type === 'ROOM' ? <DoorOpen size={24} className="text-[#0C7C92]" /> : undefined}
                    footer={
                        <Group justify="flex-end" gap="md">
                            <Button
                                variant="subtle"
                                color="gray"
                                onClick={() => setOpened(false)}
                                leftSection={<CloseIcon size={18} />}
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
                                    document.getElementById('spatial-form')?.dispatchEvent(
                                        new Event('submit', { cancelable: true, bubbles: true })
                                    );
                                }}
                                disabled={!isFormValid}
                                leftSection={<Save size={18} />}
                                radius="xl"
                                size="md"
                                className={`shadow-lg shadow-teal-100 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Save Configuration
                            </Button>
                        </Group>
                    }
                >
                    <SpatialResourceForm
                        initialData={activeResource || {}}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        onValidityChange={setIsFormValid}
                    />
                </Modal>,
                document.body
            )}
        </div>
    );
}
