'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Button, Group, Stack, Box, Text, Paper, Title, Grid,
    Badge as MantineBadge, Card, ActionIcon, Tooltip, Progress, Avatar
} from '@mantine/core';
import {
    Plus, Search as SearchIcon, Building2, MapPin,
    Layers, TrendingUp, Edit, Trash2, Eye, MoreVertical,
    ArrowUpRight, Info, LayoutGrid, List
} from 'lucide-react';
import { locationsService } from '@/services/locations.service';
import { SpatialResourceForm } from '@/components/organisms/tms/SpatialResourceForm';
import { Modal } from '@/components/Modal';
import { toast } from '@/components/Toast';

export default function BuildingsCatalogPage() {
    const [buildings, setBuildings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [opened, setOpened] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeBuilding, setActiveBuilding] = useState<any | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchBuildings();
    }, []);

    const fetchBuildings = async (search?: string) => {
        setIsLoading(true);
        try {
            const res = await locationsService.getBuildings({ search });
            setBuildings(res);
        } catch (error) {
            toast.error('Failed to load building catalog');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBuildings(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleCreate = () => {
        setActiveBuilding({ type: 'BUILDING' });
        setOpened(true);
    };

    const handleEdit = (building: any) => {
        setActiveBuilding({ ...building, type: 'BUILDING' });
        setOpened(true);
    };

    const handleDelete = async (building: any) => {
        if (confirm(`⚠️ Deactivate ${building.name}? This asset will be archived.`)) {
            try {
                await locationsService.delete('BUILDING', building.id);
                toast.success('Asset archived successfully');
                fetchBuildings();
            } catch (error) {
                toast.error('Operation failed');
            }
        }
    };

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await locationsService.create({ ...data, type: 'BUILDING' });
            toast.success('✅ Building intelligence updated');
            setOpened(false);
            fetchBuildings();
        } catch (error) {
            toast.error('Submit failed');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredBuildings = buildings.filter(b =>
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: buildings.length,
        totalGFA: buildings.reduce((acc, curr) => acc + (Number(curr.totalArea) || 0), 0),
        avgFloors: buildings.length ? Math.round(buildings.reduce((acc, curr) => acc + (curr._count?.floorDetails || 0), 0) / buildings.length) : 0,
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Professional Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-[#16284F] tracking-tight">Building Intelligence</h1>
                    <p className="text-slate-500 font-medium mt-1">Specialized asset catalog for IT Park infrastructure management</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:w-80">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by code or moniker..."
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#0C7C92] focus:border-transparent outline-none transition-all text-sm font-bold text-slate-700"
                        />
                    </div>
                    <button
                        onClick={handleCreate}
                        className="bg-[#0C7C92] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-teal-100 hover:brightness-110 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5 flex-shrink-0" />
                        <span className="hidden sm:inline">Add Asset</span>
                    </button>
                </div>
            </div>

            {/* Smart Metrics Tray */}
            <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Paper className="p-6 rounded-[2rem] border border-indigo-50 bg-indigo-50/20 shadow-sm hover:shadow-md transition-all">
                        <Group justify="space-between" align="flex-start">
                            <div>
                                <Text className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Total Units</Text>
                                <Title order={2} className="text-3xl font-black text-[#16284F] mt-1">{stats.total}</Title>
                                <Text className="text-xs font-bold text-indigo-600/70 mt-1">Managed Assets</Text>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-500">
                                <Building2 size={24} />
                            </div>
                        </Group>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Paper className="p-6 rounded-[2rem] border border-emerald-50 bg-emerald-50/20 shadow-sm hover:shadow-md transition-all">
                        <Group justify="space-between" align="flex-start">
                            <div>
                                <Text className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Global GFA</Text>
                                <Title order={2} className="text-3xl font-black text-emerald-900 mt-1">{stats.totalGFA.toLocaleString()}</Title>
                                <Text className="text-xs font-bold text-emerald-600/70 mt-1">Total Square Meters (m²)</Text>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-500">
                                <TrendingUp size={24} />
                            </div>
                        </Group>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Paper className="p-6 rounded-[2rem] border border-amber-50 bg-amber-50/20 shadow-sm hover:shadow-md transition-all">
                        <Group justify="space-between" align="flex-start">
                            <div>
                                <Text className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">Verticality</Text>
                                <Title order={2} className="text-3xl font-black text-amber-900 mt-1">~{stats.avgFloors}</Title>
                                <Text className="text-xs font-bold text-amber-600/70 mt-1">Avg. Floors per Unit</Text>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-500">
                                <Layers size={24} />
                            </div>
                        </Group>
                    </Paper>
                </Grid.Col>
            </Grid>

            {/* Asset Intelligence Grid */}
            {isLoading ? (
                <div className="py-20 text-center">
                    <div className="spinner spinner-lg text-[#0C7C92]" />
                    <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing intelligence satellite...</p>
                </div>
            ) : filteredBuildings.length > 0 ? (
                <Grid gutter="xl">
                    {filteredBuildings.map((building) => (
                        <Grid.Col key={building.id} span={{ base: 12, sm: 6, lg: 4 }}>
                            <Card
                                padding="xl"
                                className="rounded-[2.5rem] border border-slate-100 hover:border-[#0C7C92]/30 hover:shadow-2xl hover:shadow-slate-200 transition-all group overflow-visible"
                            >
                                <div className="absolute top-6 right-6 flex flex-col gap-2">
                                    <MantineBadge
                                        variant="filled"
                                        bg={building.occupantName ? '#0C7C92' : '#94A3B8'}
                                        radius="md"
                                        className="shadow-sm uppercase text-[9px] font-black tracking-widest px-3"
                                    >
                                        {building.occupantName ? 'Occupied' : 'Vacant'}
                                    </MantineBadge>
                                </div>

                                <Stack gap="xs">
                                    <Group gap="md">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#16284F] group-hover:bg-[#16284F] group-hover:text-white transition-all duration-300">
                                            <Building2 size={24} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex-1">
                                            <Title order={4} className="text-lg font-black text-[#16284F] truncate">{building.name}</Title>
                                            <Text className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter leading-none">ID: {building.code}</Text>
                                        </div>
                                    </Group>

                                    <div className="mt-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col">
                                                <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Plot</Text>
                                                <Group gap={4} className="mt-1">
                                                    <MapPin size={10} className="text-rose-400" />
                                                    <Text className="text-xs font-black text-[#16284F] truncate">{building.plot?.name || 'N/A'}</Text>
                                                </Group>
                                            </div>
                                            <div className="flex flex-col text-right">
                                                <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Build Area</Text>
                                                <Text className="text-xs font-black text-slate-700 mt-1">{building.totalArea || '-'} <span className="text-[8px] opacity-40">m²</span></Text>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-2 space-y-1">
                                        <Group justify="space-between" align="center">
                                            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Floor Capacity</Text>
                                            <Text className="text-[9px] font-black text-[#0C7C92] uppercase">{building._count?.floorDetails || 0} Constructed</Text>
                                        </Group>
                                        <Progress
                                            value={(building._count?.floorDetails / 10) * 100}
                                            size="sm"
                                            radius="xl"
                                            color="#0C7C92"
                                            className="bg-slate-100 shadow-inner"
                                        />
                                    </div>

                                    <div className="mt-6 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-1.5 flex-1">
                                            <button
                                                onClick={() => handleEdit(building)}
                                                className="w-10 h-10 flex items-center justify-center text-blue-500 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                                title="Edit Blueprint"
                                            >
                                                <Edit size={16} strokeWidth={2.5} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(building)}
                                                className="w-10 h-10 flex items-center justify-center text-rose-500 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                title="Archive Asset"
                                            >
                                                <Trash2 size={16} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                        <button
                                            className="h-10 px-5 bg-[#16284F] text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:brightness-125 transition-all shadow-md active:scale-95"
                                        >
                                            <Eye size={14} />
                                            <span>Full Intelligence</span>
                                            <ArrowUpRight size={14} />
                                        </button>
                                    </div>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    ))}
                </Grid>
            ) : (
                <div className="py-40 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                    <div className="inline-flex p-10 bg-slate-50 rounded-[3rem] shadow-inner mb-8">
                        <Building2 size={64} className="text-slate-200" strokeWidth={1} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Catalog Is Sterile</h3>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">No building assets have been digitized yet. Start by onboarding your first structural element.</p>
                </div>
            )}

            {/* Branded Management Modal */}
            {mounted && createPortal(
                <Modal
                    isOpen={opened}
                    onClose={() => setOpened(false)}
                    mode="modal"
                    size="lg"
                    title={activeBuilding?.id ? 'Asset Re-Configuration' : 'New Structural Intelligence'}
                    description="IT Park Building Stock Management"
                    icon={<Building2 size={24} className="text-[#0C7C92]" />}
                    footer={
                        <Group justify="flex-end" gap="md">
                            <Button variant="subtle" color="gray" onClick={() => setOpened(false)} radius="xl">Cancel</Button>
                            <Button
                                bg="#0C7C92"
                                radius="xl"
                                onClick={() => document.getElementById('spatial-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
                                disabled={!isFormValid}
                                className="shadow-lg shadow-teal-100"
                            >
                                Sync Intelligence
                            </Button>
                        </Group>
                    }
                >
                    <SpatialResourceForm
                        initialData={activeBuilding || {}}
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
