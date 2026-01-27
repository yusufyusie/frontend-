'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Group, Stack, Box, Text, Paper, Title, LoadingOverlay, Badge, Progress } from '@mantine/core';
import { Plus, RefreshCw, Map, Grid3x3, MapPin, TrendingUp, X as CloseIcon, Save, Search as SearchIcon, Building2, Layers, DoorOpen, ChevronRight, Home } from 'lucide-react';
import { locationsService } from '@/services/locations.service';
import { SpatialResourceForm } from '@/components/organisms/tms/SpatialResourceForm';
import { AdvancedTreeGrid, TreeNode } from '@/components/organisms/tms/AdvancedTreeGrid';
import { Modal } from '@/components/Modal';
import { toast } from '@/components/Toast';
import { LayoutList } from 'lucide-react';
import { AuditSummaryCards } from '@/components/organisms/tms/AuditSummaryCards';
import { GridColumn } from '@/components/organisms/tms/AdvancedTreeGrid';

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
    const [navigationStack, setNavigationStack] = useState<any[]>([]);
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
        }
    };

    const handleDrillDown = (node: TreeNode) => {
        const resource = findResourceById(treeData, node.id as any);
        if (resource) {
            setNavigationStack(prev => [...prev, resource]);
        }
    };

    const handleGoHome = () => {
        setNavigationStack([]);
    };

    const handleGoBack = (index: number) => {
        setNavigationStack(prev => prev.slice(0, index + 1));
    };

    // Calculate current visible data
    const visibleData = navigationStack.length > 0
        ? (navigationStack[navigationStack.length - 1].children || [])
        : treeData;

    const currentLevel = navigationStack.length === 0 ? 'ZONE' :
        navigationStack[navigationStack.length - 1].type === 'ZONE' ? 'BLOCK' :
            navigationStack[navigationStack.length - 1].type === 'BLOCK' ? 'PLOT' :
                navigationStack[navigationStack.length - 1].type === 'PLOT' ? 'BUILDING' :
                    navigationStack[navigationStack.length - 1].type === 'BUILDING' ? 'FLOOR' :
                        navigationStack[navigationStack.length - 1].type === 'FLOOR' ? 'ROOM' : 'ROOM';

    const currentParent = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : null;

    const handleLevelAdd = () => {
        if (navigationStack.length === 0) {
            handleCreateNewZone();
        } else {
            const parent = navigationStack[navigationStack.length - 1];
            setActiveResource({
                parentId: parent.realId || parent.id,
                type: currentLevel,
                code: `${parent.code}-`
            } as any);
            setOpened(true);
            setIsFormValid(false);
        }
    };

    const handleLevelClick = (level: 'ZONE' | 'BLOCK' | 'PLOT' | 'BUILDING' | 'ROOM') => {
        // Reset navigation to show all entities of the clicked level
        setNavigationStack([]);

        // For now, clicking a level badge returns to the Zones view
        // In the future, this could be expanded to filter by specific entity types
        toast.info(`Viewing all ${level.toLowerCase()}s`);
    };

    // Professional Contextual Column Definitions (Database-Aligned)
    const columnConfigs: Record<string, GridColumn[]> = {
        'ZONE': [
            { header: 'Zone Code', accessor: 'code', width: '150px' },
            { header: 'Description', accessor: 'description', width: '300px' },
            {
                header: 'Total Blocks', accessor: 'childrenCount', width: '150px', align: 'center', render: (node) => (
                    <Badge variant="light" color="blue" radius="sm" size="lg" className="font-black">
                        {node.children?.length || 0} Blocks
                    </Badge>
                )
            },
            {
                header: 'Status', accessor: 'isActive', width: '150px', align: 'center', render: (node) => (
                    <Badge variant="dot" color={node.meta?.isActive ? 'teal' : 'gray'} size="sm">
                        {node.meta?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                )
            }
        ],
        'BLOCK': [
            { header: 'Block Code', accessor: 'code', width: '150px' },
            { header: 'Description', accessor: 'description', width: '250px' },
            {
                header: 'Total Plots', accessor: 'childrenCount', width: '150px', align: 'center', render: (node) => (
                    <Badge variant="light" color="teal" radius="sm" size="lg" className="font-black">
                        {node.children?.length || 0} Plots
                    </Badge>
                )
            },
            {
                header: 'Parent Zone', accessor: 'zoneCode', width: '200px', render: (node) => (
                    <span className="text-[11px] font-black text-[#0C7C92] uppercase">{currentParent?.name}</span>
                )
            }
        ],
        'PLOT': [
            {
                header: 'Code', accessor: 'code', width: '140px', render: (node) => (
                    <span className="text-[11px] font-mono font-black text-slate-700">{node.meta?.code}</span>
                )
            },
            {
                header: 'Name', accessor: 'name', width: '220px', render: (node) => (
                    <span className="text-[11px] font-bold text-slate-800">{node.meta?.name || node.label}</span>
                )
            },
            {
                header: 'Area (m²)', accessor: 'area', width: '150px', align: 'right', render: (node) => (
                    <span className="text-[12px] font-mono font-black text-slate-700">
                        {node.meta?.area ? Number(node.meta.area).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                    </span>
                )
            },

            {
                header: 'Contract Area (m²)', accessor: 'contractArea', width: '185px', align: 'right', render: (node) => (
                    <span className="text-[12px] font-mono font-black text-blue-700">
                        {node.meta?.contractArea ? Number(node.meta.contractArea).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                    </span>
                )
            },

            {
                header: 'Variance (m²)', accessor: 'areaVariance', width: '150px', align: 'right', render: (node) => {
                    const variance = node.meta?.areaVariance || 0;
                    return (
                        <span className={`text-[12px] font-mono font-black ${variance < 0 ? 'text-rose-600' : variance > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                            {variance ? Number(variance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                        </span>
                    );
                }
            },
            {
                header: 'Buildings', accessor: 'buildingsCount', width: '145px', align: 'center', render: (node) => {
                    const count = node.meta?.buildingsCount || node.children?.length || 0;
                    return (
                        <Badge variant="light" color="violet" radius="sm" size="lg" className="font-black">
                            {count} {count === 1 ? 'Building' : 'Buildings'}
                        </Badge>
                    );
                }
            },
            {
                header: 'Master Plan Ref', accessor: 'masterPlanRef', width: '170px', render: (node) => (
                    <span className="text-[10px] font-mono text-slate-600">{node.meta?.masterPlanRef || '-'}</span>
                )
            },
            {
                header: 'Status', accessor: 'isActive', width: '130px', align: 'center', render: (node) => (
                    <Badge variant="dot" color={node.meta?.isActive ? 'teal' : 'gray'} size="sm">
                        {node.meta?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                )
            }
        ],
        'BUILDING': [
            {
                header: 'Structure Specs', accessor: 'itpcBuildingType', width: '200px', render: (node) => (
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-700">{node.meta?.itpcBuildingType || 'Standard G+0'}</span>
                        <div className="flex gap-2 mt-1">
                            {node.meta?.hasElevator && <Badge size="xs" color="indigo" variant="outline">Elevator</Badge>}
                            {node.meta?.hasParking && <Badge size="xs" color="teal" variant="outline">Parking</Badge>}
                        </div>
                    </div>
                )
            },
            { header: 'Floors', accessor: 'floors', width: '100px', align: 'center' },
            { header: 'Year Built', accessor: 'yearBuilt', width: '120px', align: 'center' },
            {
                header: 'Status', accessor: 'isActive', width: '120px', align: 'center', render: (node) => (
                    <Badge variant="dot" color={node.meta?.isActive ? 'teal' : 'gray'} size="sm">
                        {node.meta?.isActive ? 'Operational' : 'Inactive'}
                    </Badge>
                )
            }
        ],
        'FLOOR': [
            { header: 'Floor No', accessor: 'floorNumber', width: '100px', align: 'center' },
            {
                header: 'Rentable Area', accessor: 'rentableArea', width: '150px', align: 'right', render: (node) => (
                    <span className="text-[12px] font-mono font-black">{Number(node.meta?.rentableArea || 0).toLocaleString()} m²</span>
                )
            },
            {
                header: 'Total Area', accessor: 'totalArea', width: '150px', align: 'right', render: (node) => (
                    <span className="text-[12px] font-mono font-black">{Number(node.meta?.totalArea || 0).toLocaleString()} m²</span>
                )
            }
        ],
        'ROOM': [
            { header: 'Unit Area', accessor: 'areaM2', width: '140px', align: 'right' },
            {
                header: 'Tenant', accessor: 'occupantName', width: '200px', render: (node) => (
                    <span className="text-[11px] font-black text-[#0C7C92] uppercase">{node.meta?.occupantName || 'VACANT'}</span>
                )
            },
            {
                header: 'Status', accessor: 'occupancyStatus', width: '130px', align: 'center', render: (node) => (
                    <Badge
                        variant="gradient"
                        gradient={node.meta?.occupancyStatus === 'Occupied' ? { from: '#0C7C92', to: '#1098AD', deg: 45 } : { from: '#94A3B8', to: '#CBD5E1', deg: 45 }}
                        size="sm" radius="xl" fw={900} className="text-white"
                    >
                        {(node.meta?.occupancyStatus || 'VACANT').toUpperCase()}
                    </Badge>
                )
            }
        ]
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
                    onClick={handleLevelAdd}
                    className="flex items-center gap-2 w-full sm:w-auto justify-center px-6 py-2.5 rounded-xl border-none font-bold text-white transition-all shadow-md active:scale-95 hover:shadow-lg hover:brightness-110 cursor-pointer"
                    style={{ backgroundColor: '#0C7C92' }}
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New {currentLevel.charAt(0) + currentLevel.slice(1).toLowerCase()}</span>
                </button>
            </div>

            {/* Official Audit Intelligence - Unified Single Row Command Center */}
            <AuditSummaryCards structuralMetrics={metrics} onLevelClick={handleLevelClick} />

            {/* Integrated Navigation & Search Control Bar */}
            <div className="card p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 border-l-4 border-primary">
                <div className="flex items-center gap-4 justify-between flex-wrap">
                    {/* Navigation Breadcrumbs */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Zone Home Button */}
                        <button
                            onClick={handleGoHome}
                            className={`h-9 px-3 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.1em] ${navigationStack.length === 0 ? 'bg-[#16284F] text-white shadow-md' : 'bg-white text-[#0C7C92] hover:bg-slate-50 border border-slate-200'}`}
                        >
                            <Map size={12} />
                            <span>Zone</span>
                        </button>

                        {navigationStack.filter(item => item.type !== 'ZONE').map((item, index) => {
                            // Map database types to user-friendly level labels
                            const levelLabels: Record<string, string> = {
                                'ZONE': 'Zone',
                                'BLOCK': 'Block',
                                'PLOT': 'Plot',
                                'BUILDING': 'Building',
                                'FLOOR': 'Floor',
                                'ROOM': 'Room'
                            };

                            return (
                                <div key={item.id} className="flex items-center gap-2">
                                    <ChevronRight size={14} className="text-slate-400" strokeWidth={3} />
                                    <button
                                        onClick={() => handleGoBack(navigationStack.indexOf(item))}
                                        className={`h-9 px-3 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.1em] bg-white text-[#0C7C92] hover:bg-slate-50 border border-slate-200`}
                                    >
                                        {item.type === 'ZONE' ? <Map size={12} /> :
                                            item.type === 'BLOCK' ? <Grid3x3 size={12} /> :
                                                item.type === 'PLOT' ? <MapPin size={12} /> :
                                                    item.type === 'BUILDING' ? <Building2 size={12} /> :
                                                        <Layers size={12} />}
                                        <span>{levelLabels[item.type] || item.type}</span>
                                    </button>
                                </div>
                            );
                        })}

                        {/* Current Level Indicator */}
                        {navigationStack.length > 0 && (
                            <div className="flex items-center gap-2">
                                <ChevronRight size={14} className="text-slate-400" strokeWidth={3} />
                                <div className="h-9 px-3 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.1em] bg-[#16284F] text-white shadow-md">
                                    {currentLevel === 'ZONE' ? <Map size={12} /> :
                                        currentLevel === 'BLOCK' ? <Grid3x3 size={12} /> :
                                            currentLevel === 'PLOT' ? <MapPin size={12} /> :
                                                currentLevel === 'BUILDING' ? <Building2 size={12} /> :
                                                    currentLevel === 'FLOOR' ? <Layers size={12} /> :
                                                        <DoorOpen size={12} />}
                                    <span>{currentLevel.charAt(0) + currentLevel.slice(1).toLowerCase()}</span>
                                </div>
                            </div>
                        )}

                        {navigationStack.length > 0 && (
                            <button
                                onClick={() => handleGoBack(navigationStack.length - 2)}
                                className="h-9 px-3 rounded-xl bg-white text-slate-600 hover:bg-slate-50 transition-all font-black text-[9px] uppercase tracking-wider flex items-center gap-2 border border-slate-200 shadow-sm"
                            >
                                <TrendingUp className="rotate-270 w-3 h-3" />
                                <span>Back</span>
                            </button>
                        )}
                    </div>

                    {/* Search */}
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
                ) : visibleData.length > 0 ? (
                    <AdvancedTreeGrid
                        data={convertToTreeNodes(visibleData)}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAddChild={handleAddChild}
                        onViewDetail={handleViewDetail}
                        onDrillDown={handleDrillDown}
                        mode="tiered"
                        levelLabel={currentLevel}
                        columns={columnConfigs[currentLevel]}
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
