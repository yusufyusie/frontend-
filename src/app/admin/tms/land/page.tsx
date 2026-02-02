'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Button, Group, Stack, Box, Text, Paper, Title, LoadingOverlay, Badge, Progress } from '@mantine/core';
import { Plus, RefreshCw, Map, Grid3x3, MapPin, TrendingUp, X as CloseIcon, Save, Search as SearchIcon, Building2, Layers, DoorOpen, ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { locationsService } from '@/services/locations.service';
import { SpatialResourceForm } from '@/components/organisms/tms/SpatialResourceForm';
import { AdvancedTreeGrid, TreeNode } from '@/components/organisms/tms/AdvancedTreeGrid';
import { Modal } from '@/components/Modal';
import { toast } from '@/components/Toast';
import { GridColumn } from '@/components/organisms/tms/AdvancedTreeGrid';
import { AuditSummaryCards } from '@/components/organisms/tms/AuditSummaryCards';
import { AtomicLookupSelector } from '@/components/molecules/tms/AtomicLookupSelector';
import { SpatialMapDashboard } from '@/components/organisms/tms/SpatialMapDashboard';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { LayoutGrid, Map as MapIcon } from 'lucide-react';

export default function LandPage() {
    const router = useRouter();
    const [treeData, setTreeData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [opened, setOpened] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [activeResource, setActiveResource] = useState<Partial<any> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [discoveryMode, setDiscoveryMode] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [navigationStack, setNavigationStack] = useState<any[]>([]);
    const [allCategories, setAllCategories] = useState<SystemLookup[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

    useEffect(() => {
        const fetchCats = async () => {
            const res = await lookupsService.getCategories();
            const allCats = (res as any).data || res || [];

            // Dynamically discover spatial categories based on DB metadata
            const filtered = allCats
                .filter((cat: any) => cat.isSpatial || cat.metadata?.isSpatial)
                .sort((a: any, b: any) => (a.order || 99) - (b.order || 99))
                .map((cat: any, idx: number) => ({
                    // Transform category config to SystemLookup structure
                    id: idx + 1,
                    lookupCode: cat.value,
                    lookupValue: { en: cat.label, am: cat.label },
                    lookupCategory: 'SPATIAL_DISCOVERY',
                    level: 1,
                    displayOrder: cat.order || idx,
                    metadata: { icon: cat.icon, color: cat.color, isSpatial: true },
                    isSystem: true,
                    isActive: true
                }));

            setAllCategories(filtered);
        };
        fetchCats();
    }, []);

    const [metrics, setMetrics] = useState({
        zones: 0,
        blocks: 0,
        plots: 0,
        buildings: 0,
        floors: 0,
        rooms: 0,
        totalArea: 0
    });

    useEffect(() => {
        setMounted(true);
        fetchTree();
    }, []);

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
            toast.error('Failed to fetch territorial registry');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper: Find resource by ID in tree
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

    // Helper: Flatten tree by level type with parent context injection
    const flattenTreeByType = (items: any[], type: string, parentName?: string): any[] => {
        let results: any[] = [];
        items.forEach(item => {
            const itemWithParent = { ...item, parentRefName: parentName };
            if (item.type === type) results.push(itemWithParent);
            if (item.children) results.push(...flattenTreeByType(item.children, type, item.name || item.code));
        });
        return results;
    };

    // Event Handlers
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
            parentName: parent.name,
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

    const handleViewDetail = (node: TreeNode) => {
        router.push(`/admin/tms/resources/${node.meta?.type}/${node.id}`);
    };

    const handleDrillDown = (node: TreeNode) => {
        const resource = findResourceById(treeData, node.id as any);
        if (resource) {
            setDiscoveryMode(null);
            setNavigationStack(prev => [...prev, resource]);
        }
    };

    const handleGoHome = () => {
        setDiscoveryMode(null);
        setSelectedCategory(null);
        setNavigationStack([]);
    };

    const handleGoBack = (index: number) => {
        setDiscoveryMode(null);
        setNavigationStack(prev => prev.slice(0, index + 1));
    };

    const handleLevelClick = (level: 'ZONE' | 'BLOCK' | 'PLOT' | 'BUILDING' | 'FLOOR' | 'ROOM') => {
        setDiscoveryMode(level);
        setNavigationStack([]);
        const labelMap: any = { 'ZONE': 'Zones', 'BLOCK': 'Blocks', 'PLOT': 'Plots', 'BUILDING': 'Buildings', 'FLOOR': 'Floors', 'ROOM': 'Rooms' };
        toast.info(`Discovery Mode: Listing all ${labelMap[level].toLowerCase()} across the system.`);
    };

    const handleDiscoverySelect = (category: string) => {
        const mapping: any = {
            'ZONE_TYPES': 'ZONE',
            'ZONE_STATUS': 'ZONE',
            'BLOCK_STATUS': 'BLOCK',
            'PLOT_STATUS': 'PLOT',
            'CONSTRUCTION_STATUS': 'BUILDING',
            'BUILDING_CLASS': 'BUILDING',
            'BUILDING_TYPES': 'BUILDING',
            'ROOM_STATUS': 'ROOM',
            'ROOM_TYPE': 'ROOM',
            'LAND_USAGE': 'PLOT',
            'TENANT_STATUS': 'ROOM'
        };

        const level = mapping[category];
        if (level) {
            setSelectedCategory(category);
            handleLevelClick(level);
        } else {
            toast.warning('This category is not yet mapped to a spatial level.');
        }
    };

    // Calculate dynamic state logic
    const nextHierarchyLevel = useMemo(() => {
        if (navigationStack.length === 0) return 'ZONE';
        const last = navigationStack[navigationStack.length - 1];
        const map: any = {
            'ZONE': 'BLOCK',
            'BLOCK': 'PLOT',
            'PLOT': 'BUILDING',
            'BUILDING': 'FLOOR',
            'FLOOR': 'ROOM',
            'ROOM': 'ROOM'
        };
        return map[last.type] || 'ROOM';
    }, [navigationStack]);

    const activeViewLevel = discoveryMode || nextHierarchyLevel;

    const visibleData = useMemo(() => {
        if (discoveryMode) return flattenTreeByType(treeData, discoveryMode);
        if (navigationStack.length > 0) return navigationStack[navigationStack.length - 1].children || [];
        return treeData;
    }, [treeData, discoveryMode, navigationStack]);

    const handleLevelAdd = () => {
        if (navigationStack.length === 0) {
            handleCreateNewZone();
        } else {
            const parent = navigationStack[navigationStack.length - 1];
            setActiveResource({
                parentId: parent.realId || parent.id,
                parentName: parent.name,
                type: nextHierarchyLevel,
                code: `${parent.code}-`
            } as any);
            setOpened(true);
            setIsFormValid(false);
        }
    };

    const convertToTreeNodes = (resources: any[], parentName?: string): TreeNode[] => {
        return resources.map(resource => ({
            id: resource.id,
            label: resource.name || resource.code,
            icon: resource.type === 'ZONE' ? <Map size={18} className="text-emerald-600" /> :
                resource.type === 'BLOCK' ? <Grid3x3 size={18} className="text-blue-600" /> :
                    resource.type === 'PLOT' ? <MapPin size={18} className="text-teal-600" /> :
                        resource.type === 'BUILDING' ? <Building2 size={18} className="text-violet-600" /> :
                            resource.type === 'FLOOR' ? <Layers size={18} className="text-amber-600" /> :
                                <DoorOpen size={18} className="text-pink-600" />,
            children: resource.children ? convertToTreeNodes(resource.children, resource.name || resource.code) : undefined,
            meta: {
                ...resource,
                parentRefName: resource.parentRefName || parentName,
                usageType: resource.type,
                areaM2: resource.area || 0,
                contractAreaM2: resource.contractArea || 0,
                areaVarianceM2: resource.areaVariance || 0,
                occupancyStatus: resource.roomStatus?.name || (resource.occupantName ? 'Occupied' : 'Vacant'),
            }
        }));
    };

    const columnConfigs: Record<string, GridColumn[]> = {
        'ZONE': [
            { header: 'Zone Code', accessor: 'code', width: '150px' },
            { header: 'Description', accessor: 'description', width: '300px' },
            {
                header: 'Total Blocks', accessor: 'childrenCount', width: '150px', align: 'center', render: (node) => (
                    <Badge variant="light" color="blue" radius="sm" size="lg" className="font-black">{node.children?.length || 0} Blocks</Badge>
                )
            },
            {
                header: 'Status', accessor: 'isActive', width: '150px', align: 'center', render: (node) => (
                    <Badge variant="dot" color={node.meta?.isActive ? 'teal' : 'gray'} size="sm">{node.meta?.isActive ? 'Active' : 'Inactive'}</Badge>
                )
            }
        ],
        'BLOCK': [
            { header: 'Block Code', accessor: 'code', width: '140px' },
            { header: 'Description', accessor: 'description', width: '250px' },
            {
                header: 'Total Plots', accessor: 'childrenCount', width: '130px', align: 'center', render: (node) => (
                    <Badge variant="light" color="teal" radius="sm" size="sm" className="font-black">{node.children?.length || 0} Plots</Badge>
                )
            },
            {
                header: 'Parent Zone', accessor: 'parentRefName', width: '160px', render: (node) => (
                    node.meta?.parentRefName && <Badge variant="outline" color="emerald" size="xs" radius="sm" className="font-black uppercase">{node.meta?.parentRefName}</Badge>
                )
            }
        ],
        'PLOT': [
            { header: 'Plot Code', accessor: 'code', width: '140px' },

            {
                header: 'Area (m²)', accessor: 'area', width: '140px', align: 'right', render: (node) => (
                    <span className="text-[12px] font-mono font-black">{Number(node.meta?.area || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                )
            },
            {
                header: 'Contract Area', accessor: 'contractArea', width: '140px', align: 'right', render: (node) => (
                    <span className="text-[12px] font-mono font-black italic text-slate-500">{Number(node.meta?.contractArea || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                )
            },
            {
                header: 'Variance', accessor: 'areaVariance', width: '120px', align: 'right', render: (node) => (
                    <span className={`text-[12px] font-mono font-black ${Number(node.meta?.areaVariance || 0) < 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                        {Number(node.meta?.areaVariance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                )
            },
            {
                header: 'Parent Block', accessor: 'parentRefName', width: '160px', render: (node) => (
                    node.meta?.parentRefName && <Badge variant="outline" color="blue" size="xs" radius="sm" className="font-black uppercase">{node.meta?.parentRefName}</Badge>
                )
            }
        ],
        'BUILDING': [
            { header: 'Building Code', accessor: 'code', width: '120px' },
            {
                header: 'Specs', accessor: 'itpcBuildingType', width: '180px', render: (node) => (
                    <Badge variant="light" color="gray" size="sm" radius="sm" className="font-black">{node.meta?.itpcBuildingType || 'Standard G+0'}</Badge>
                )
            },
            { header: 'Levels', accessor: 'floors', width: '90px', align: 'center' },
            {
                header: 'Status', accessor: 'isActive', width: '110px', align: 'center', render: (node) => (
                    <Badge variant="dot" color={node.meta?.isActive ? 'teal' : 'gray'} size="sm">Operational</Badge>
                )
            },
            {
                header: 'Parent Plot', accessor: 'parentRefName', width: '160px', render: (node) => (
                    node.meta?.parentRefName && <Badge variant="outline" color="teal" size="xs" radius="sm" className="font-black uppercase">{node.meta?.parentRefName}</Badge>
                )
            }
        ],
        'FLOOR': [
            { header: 'Floor Code', accessor: 'code', width: '120px' },
            { header: 'No.', accessor: 'floorNumber', width: '80px', align: 'center' },
            {
                header: 'Assignable (m²)', accessor: 'rentableArea', width: '140px', align: 'right', render: (node) => (
                    <span className="text-[12px] font-mono font-black">{Number(node.meta?.rentableArea || 0).toLocaleString()}</span>
                )
            },
            {
                header: 'Parent Building', accessor: 'parentRefName', width: '160px', render: (node) => (
                    node.meta?.parentRefName && <Badge variant="outline" color="violet" size="xs" radius="sm" className="font-black uppercase">{node.meta?.parentRefName}</Badge>
                )
            }
        ],
        'ROOM': [
            { header: 'Room Code', accessor: 'code', width: '120px' },
            { header: 'Area (m²)', accessor: 'areaM2', width: '120px', align: 'right' },
            {
                header: 'Resident', accessor: 'occupantName', width: '180px', render: (node) => (
                    <span className="text-[11px] font-black text-[#0C7C92] uppercase">{node.meta?.occupantName || 'VACANT'}</span>
                )
            },
            {
                header: 'Residency', accessor: 'occupancyStatus', width: '120px', align: 'center', render: (node) => (
                    <Badge variant="gradient" gradient={node.meta?.occupancyStatus === 'Occupied' ? { from: '#0C7C92', to: '#1098AD', deg: 45 } : { from: '#94A3B8', to: '#CBD5E1', deg: 45 }} size="sm" radius="xl" fw={900} className="text-white">
                        {(node.meta?.occupancyStatus || 'VACANT').toUpperCase()}
                    </Badge>
                )
            },
            {
                header: 'Parent Floor', accessor: 'parentRefName', width: '160px', render: (node) => (
                    node.meta?.parentRefName && <Badge variant="outline" color="amber" size="xs" radius="sm" className="font-black uppercase">{node.meta?.parentRefName}</Badge>
                )
            }
        ]
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} zIndex={1000} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-primary">Territorial Registry</h1>
                    <p className="text-gray-500 mt-1">Unified strategic hierarchy: Zone → Block → Plot → Building → Floor → Room</p>
                </div>
                {!discoveryMode && (
                    <button
                        onClick={handleLevelAdd}
                        className="flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-2.5 rounded-xl border-none font-bold text-white transition-all shadow-md active:scale-95 hover:shadow-lg hover:brightness-110 cursor-pointer"
                        style={{ backgroundColor: '#0C7C92' }}
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add {nextHierarchyLevel.charAt(0) + nextHierarchyLevel.slice(1).toLowerCase()}</span>
                    </button>
                )}
            </div>

            <AuditSummaryCards structuralMetrics={metrics} onLevelClick={handleLevelClick} />


            <div className="card p-3 bg-gradient-to-r from-blue-50/50 to-blue-100/30 border-l-4 border-primary shadow-md">
                <div className="flex items-center gap-4 justify-between flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                        {(navigationStack.length > 0 || discoveryMode) && (
                            <button
                                onClick={navigationStack.length > 0 ? () => handleGoBack(navigationStack.length - 2) : handleGoHome}
                                className="h-9 w-9 rounded-xl flex items-center justify-center bg-white text-[#0C7C92] border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                                title="Go Back One Level"
                            >
                                <ArrowLeft size={16} strokeWidth={3} />
                            </button>
                        )}

                        <button
                            onClick={handleGoHome}
                            className={`h-9 px-3 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.1em] ${navigationStack.length === 0 && !discoveryMode ? 'bg-[#16284F] text-white shadow-md' : 'bg-white text-[#0C7C92] hover:bg-slate-50 border border-slate-200'}`}
                        >
                            <Map size={12} />
                            <span>Zones</span>
                        </button>

                        {navigationStack.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-2">
                                <ChevronRight size={14} className="text-slate-400" strokeWidth={3} />
                                <button
                                    onClick={() => handleGoBack(index)}
                                    className={`h-9 px-3 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.1em] ${index === navigationStack.length - 1 ? 'bg-[#16284F] text-white shadow-md' : 'bg-white text-[#0C7C92] hover:bg-slate-50 border border-slate-200'}`}
                                >
                                    <span>{item.name}</span>
                                </button>
                            </div>
                        ))}

                        {discoveryMode && (
                            <div className="flex items-center gap-2 ml-2">
                                <ChevronRight size={14} className="text-slate-400" strokeWidth={3} />
                                <div className="h-9 px-3 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.1em] bg-[#0C7C92] text-white shadow-md">
                                    <span>All {discoveryMode.charAt(0) + discoveryMode.slice(1).toLowerCase()}s</span>
                                    <button
                                        onClick={handleGoHome}
                                        className="ml-2 h-7 w-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-rose-500 hover:text-white transition-all text-white"
                                    >
                                        <CloseIcon size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by Name or Occupant..."
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-xs font-medium h-[44px]"
                            />
                        </div>

                        <div className="w-64">
                            <AtomicLookupSelector
                                label=""
                                items={allCategories}
                                value={selectedCategory}
                                onChange={handleDiscoverySelect}
                                variant="form"
                                placeholder="Global Type Discovery..."
                            />
                        </div>
                    </div>

                    <Button.Group ml="auto">
                        <Button
                            variant={viewMode === 'grid' ? 'filled' : 'light'}
                            color="primary"
                            size="sm"
                            leftSection={<LayoutGrid size={16} />}
                            onClick={() => setViewMode('grid')}
                            className="transition-all duration-300"
                        >
                            Registry Grid
                        </Button>
                        <Button
                            variant={viewMode === 'map' ? 'filled' : 'light'}
                            color="primary"
                            size="sm"
                            leftSection={<MapIcon size={16} />}
                            onClick={() => setViewMode('map')}
                            className="transition-all duration-300"
                        >
                            Strategic Map
                        </Button>
                    </Button.Group>
                </div>
            </div>

            <div className="card p-6 min-h-[600px] relative">
                {viewMode === 'grid' ? (
                    <AdvancedTreeGrid
                        data={convertToTreeNodes(
                            visibleData,
                            navigationStack.length > 0 ? (navigationStack[navigationStack.length - 1].name || navigationStack[navigationStack.length - 1].code) : undefined
                        )}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddChild={handleAddChild}
                        onViewDetail={handleViewDetail}
                        onDrillDown={handleDrillDown}
                        mode="tiered"
                        levelLabel={activeViewLevel}
                        columns={columnConfigs[activeViewLevel] || columnConfigs['ROOM']}
                        searchable={true}
                        initialExpandLevel={0}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                    />
                ) : (
                    <SpatialMapDashboard
                        data={treeData}
                        onResourceClick={(res) => {
                            // Marker clicked - resource detail handling could be added here

                            // Future: handle drill down from map
                        }}
                    />
                )}
            </div>

            {
                mounted && createPortal(
                    <Modal
                        isOpen={opened}
                        onClose={() => setOpened(false)}
                        mode="modal"
                        size="lg"
                        title={activeResource?.realId || activeResource?.id ? `Edit ${activeResource?.type?.charAt(0) + activeResource?.type?.slice(1).toLowerCase()}` : `Register ${activeResource?.type?.charAt(0) + activeResource?.type?.slice(1).toLowerCase()}`}
                        description="Spatial Structure Management"
                        footer={
                            <Group justify="flex-end" gap="md">
                                <Button variant="subtle" color="gray" onClick={() => setOpened(false)} radius="xl">Cancel</Button>
                                <Button variant="filled" bg="#0C7C92" onClick={() => document.getElementById('spatial-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))} disabled={!isFormValid} radius="xl">Save Changes</Button>
                            </Group>
                        }
                    >
                        <SpatialResourceForm initialData={activeResource || {}} onSubmit={handleSubmit} isLoading={isLoading} onValidityChange={setIsFormValid} />
                    </Modal>,
                    document.body
                )
            }
        </div >
    );
}
