'use client';

import { useState, useEffect } from 'react';
import { Group, Stack, Text, Box, Paper, Title, Button, Tabs, Table, Badge, ActionIcon, Tooltip, TextInput, Select, ThemeIcon, ScrollArea } from '@mantine/core';
import { Map, Plus, Search, Filter, Globe, Landmark, Building2, Edit, Trash2, ChevronRight, MapPin } from 'lucide-react';
import { geoService, Country, Region, City } from '@/services/geo.service';
import { toast } from '@/components/Toast';

export default function LocationsPage() {
    const [activeTab, setActiveTab] = useState<string | null>('regions');
    const [countries, setCountries] = useState<Country[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'countries') {
                const res = await geoService.getCountries();
                setCountries(res.data || []);
            } else if (activeTab === 'regions') {
                const res = await geoService.getRegions();
                setRegions(res.data || []);
            } else if (activeTab === 'cities') {
                const res = await geoService.getCities();
                setCities(res.data || []);
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load geographic data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <Box>
                    <Group gap="md" mb={4}>
                        <ThemeIcon size={48} radius="xl" variant="gradient" gradient={{ from: '#0C7C92', to: '#1098AD', deg: 45 }}>
                            <Globe size={24} strokeWidth={2.5} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} className="text-3xl font-black text-slate-800 tracking-tight">Geographic Intelligence</Title>
                            <Text c="dimmed" fw={600} size="sm">Manage multi-layered location hierarchy for ITPC Park</Text>
                        </div>
                    </Group>
                </Box>
                <Button
                    size="md"
                    radius="xl"
                    bg="#0C7C92"
                    className="shadow-lg shadow-teal-100 font-bold"
                    leftSection={<Plus size={20} strokeWidth={3} />}
                >
                    Add Strategic Location
                </Button>
            </div>

            {/* Smart Locations Hub */}
            <Paper p="xl" radius="2.5rem" className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <Tabs value={activeTab} onChange={setActiveTab} color="#0C7C92" variant="pills" radius="xl">
                    <Tabs.List className="bg-slate-50 p-2 rounded-[2rem] border border-slate-100 mb-8 max-w-fit">
                        <Tabs.Tab value="countries" leftSection={<Globe size={16} />}>Countries</Tabs.Tab>
                        <Tabs.Tab value="regions" leftSection={<Landmark size={16} />}>Regions</Tabs.Tab>
                        <Tabs.Tab value="cities" leftSection={<Building2 size={16} />}>Cities & Districts</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="countries">
                        <Stack gap="xl">
                            <Group justify="space-between" className="px-4">
                                <Text size="sm" fw={800} tt="uppercase" className="text-slate-500 tracking-widest">Global Sovereign Registry</Text>
                                <div className="relative w-72">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-[#0C7C92] transition-all" placeholder="Search countries..." />
                                </div>
                            </Group>

                            <ScrollArea h={400}>
                                <Table verticalSpacing="md" horizontalSpacing="xl" className="border-collapse">
                                    <thead className="bg-slate-50/50">
                                        <tr>
                                            <th className="text-[10px] font-black uppercase text-slate-500 py-4">ISO Code</th>
                                            <th className="text-[10px] font-black uppercase text-slate-500">Sovereign Name</th>
                                            <th className="text-[10px] font-black uppercase text-slate-500">Status</th>
                                            <th className="text-[10px] font-black uppercase text-slate-500 text-right pr-12">Operations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {countries.map(c => (
                                            <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="py-4"><Badge variant="dot" color="#0C7C92" size="lg" fw={900} className="font-mono">{c.code || 'INTL'}</Badge></td>
                                                <td><Text size="sm" fw={800} className="text-slate-700">{c.name}</Text></td>
                                                <td><Badge color={c.isActive ? 'teal' : 'gray'} radius="sm" fw={900}>ACTIVE</Badge></td>
                                                <td className="text-right pr-6">
                                                    <Group gap={8} justify="flex-end">
                                                        <ActionIcon variant="subtle" color="blue" radius="md"><Edit size={16} /></ActionIcon>
                                                        <ActionIcon variant="subtle" color="rose" radius="md"><Trash2 size={16} /></ActionIcon>
                                                    </Group>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </ScrollArea>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="regions">
                        <Stack gap="xl">
                            <Group justify="space-between" className="px-4">
                                <Group gap="sm">
                                    <ThemeIcon variant="light" color="cyan" radius="md"><Landmark size={18} /></ThemeIcon>
                                    <Text size="sm" fw={800} tt="uppercase" className="text-slate-500 tracking-widest">Sub-National Administrative Units</Text>
                                </Group>
                            </Group>

                            <Table verticalSpacing="md" horizontalSpacing="xl">
                                <thead className="bg-[#F8FAFC]">
                                    <tr>
                                        <th className="text-[10px] font-black uppercase text-slate-500 px-8 py-5">Region / Province</th>
                                        <th className="text-[10px] font-black uppercase text-slate-500">Country</th>
                                        <th className="text-[10px] font-black uppercase text-slate-500">Admin Code</th>
                                        <th className="text-[10px] font-black uppercase text-slate-500 text-right px-8">Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {regions.map(r => (
                                        <tr key={r.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50">
                                            <td className="px-8 py-5">
                                                <Group gap="xs">
                                                    <Box className="w-2 h-2 rounded-full bg-cyan-400" />
                                                    <Text size="sm" fw={900} className="text-[#16284F]">{r.name}</Text>
                                                </Group>
                                            </td>
                                            <td><Text size="xs" fw={700} c="dimmed">Ethiopia</Text></td>
                                            <td><Text size="xs" fw={800} className="font-mono text-slate-500">{r.code || '-'}</Text></td>
                                            <td className="text-right px-8">
                                                <Group gap={4} justify="flex-end">
                                                    <Tooltip label="Edit Intelligence"><ActionIcon variant="transparent text-slate-400"><Edit size={14} /></ActionIcon></Tooltip>
                                                    <Tooltip label="Terminal Deletion"><ActionIcon variant="transparent text-rose-300"><Trash2 size={14} /></ActionIcon></Tooltip>
                                                </Group>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="cities">
                        <Stack gap="xl">
                            <Paper p="lg" radius="xl" className="bg-slate-50/50 border border-slate-100">
                                <Group justify="space-between">
                                    <Group gap="lg">
                                        <Select
                                            label="Filter by Region"
                                            placeholder="All Regions"
                                            data={regions.map(r => ({ value: r.id.toString(), label: r.name }))}
                                            variant="filled"
                                            radius="md"
                                            size="sm"
                                            className="w-64"
                                        />
                                        <Select
                                            label="Sort Order"
                                            placeholder="Alphabetical"
                                            data={['Alphabetical', 'Most Active']}
                                            variant="filled"
                                            radius="md"
                                            size="sm"
                                        />
                                    </Group>
                                    <Text size="xs" fw={900} c="dimmed" tt="uppercase" className="tracking-widest">32 Cities Registered</Text>
                                </Group>
                            </Paper>

                            <Table verticalSpacing="md" horizontalSpacing="xl">
                                <thead>
                                    <tr className="border-b-2 border-slate-100">
                                        <th className="text-[10px] font-black uppercase text-slate-500 py-4">Metropolitan Unit</th>
                                        <th className="text-[10px] font-black uppercase text-slate-500">Parent Region</th>
                                        <th className="text-[10px] font-black uppercase text-slate-500 text-right pr-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cities.map(ct => (
                                        <tr key={ct.id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="py-4">
                                                <Group gap="sm">
                                                    <ThemeIcon color="orange" size="sm" radius="sm" variant="light"><MapPin size={12} /></ThemeIcon>
                                                    <Text size="sm" fw={800} className="text-slate-800">{ct.name}</Text>
                                                </Group>
                                            </td>
                                            <td><Badge color="cyan" variant="outline" size="sm" fw={900} radius="sm">{ct.region?.name || 'Primary Region'}</Badge></td>
                                            <td className="text-right pr-6">
                                                <Group gap={4} justify="flex-end">
                                                    <ActionIcon variant="light" color="blue" radius="md" size="sm"><Edit size={14} /></ActionIcon>
                                                    <ActionIcon variant="light" color="rose" radius="md" size="sm"><Trash2 size={14} /></ActionIcon>
                                                </Group>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Paper>

            {/* Strategic Analytics Integration */}
            <Paper p="xl" radius="2.5rem" className="bg-[#16284F] text-white overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-full bg-cyan-500/10 skew-x-12 -mr-16" />
                <Group justify="space-between" align="center" className="relative z-10">
                    <Stack gap={0}>
                        <Text size="xs" fw={900} color="cyan.2" tt="uppercase" className="tracking-widest">Geographic Optimization</Text>
                        <Title order={3} className="font-black mt-1">Expanding to Regional Innovation Hubs?</Title>
                        <Text size="sm" className="opacity-70 mt-2 max-w-xl">
                            The system now supports localized taxation and regulatory variance tracking per region. Review city-specific amenities in the **Super Admin Mastery Console**.
                        </Text>
                    </Stack>
                    <Button variant="white" color="dark" radius="xl" size="md" className="font-black">View Regional Report</Button>
                </Group>
            </Paper>
        </div>
    );
}
