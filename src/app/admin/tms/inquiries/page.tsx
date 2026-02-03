'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Group, Stack, Text, Box, Paper, Title, Button, Badge, Table,
    ActionIcon, Tooltip, ThemeIcon, ScrollArea, Avatar, Divider,
    Drawer, Tabs, SimpleGrid, Card, Progress, SegmentedControl
} from '@mantine/core';
import {
    Plus, Search, Filter, Mail, Phone, Calendar, MapPin,
    Building2, ChevronRight, Eye, Send, CheckCircle2,
    AlertCircle, Info, LayoutGrid, History, FileText,
    Trophy, Calculator, FileSignature, LogOut, ArrowRight, Maximize,
    Factory, Briefcase, TrendingUp, DollarSign, X
} from 'lucide-react';
import { inquiriesService, Inquiry } from '@/services/inquiries.service';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { toast } from '@/components/Toast';
import { LifecycleTimeline } from '@/components/organisms/tms/LifecycleTimeline';
import { PipelineUpdateModal } from '@/components/organisms/tms/PipelineUpdateModal';
import { format } from 'date-fns';
import Link from 'next/link';

export default function InquiriesDashboardPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [drawerOpened, setDrawerOpened] = useState(false);
    const [modalOpened, setModalOpened] = useState(false);
    const [activeTab, setActiveTab] = useState<string | null>('details');
    const [inquiryStages, setInquiryStages] = useState<SystemLookup[]>([]);
    const [pipelineFilter, setPipelineFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadInquiries();
        loadInquiryStages();
    }, []);

    const loadInquiryStages = async () => {
        try {
            const res = await lookupsService.getByCategory('INQUIRY_STAGES');
            setInquiryStages((res as any).data || res);
        } catch (e) {
            console.error('Failed to load inquiry stages:', e);
        }
    };

    const loadInquiries = async () => {
        setLoading(true);
        try {
            const res = await inquiriesService.getAll();
            setInquiries(res.data || []);
        } catch (e) {
            toast.error('Failed to load inquiries');
        } finally {
            setLoading(false);
        }
    };

    const loadOneInquiry = async (id: number) => {
        try {
            const res = await inquiriesService.getOne(id);
            setSelectedInquiry(res.data);
        } catch (e) {
            toast.error('Failed to load inquiry details');
        }
    };

    const filteredInquiries = useMemo(() => {
        return inquiries.filter(i => {
            const matchesPipeline = pipelineFilter === 'ALL' ||
                (pipelineFilter === 'OFFICE' && (i.inquiryType === 'OFFICE' || i.inquiryType === 'PROJECT_OFFICE')) ||
                (pipelineFilter === 'LAND' && i.inquiryType === 'LAND_SUBLEASE');

            const matchesSearch = !searchQuery ||
                i.tenant?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                i.inquiryNumber?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesPipeline && matchesSearch;
        });
    }, [inquiries, pipelineFilter, searchQuery]);

    // Dynamic stage helpers using lookup data
    const getStageInfo = (stageCode: string) => {
        const stage = inquiryStages.find(s => s.lookupCode === stageCode);
        if (!stage) {
            return {
                label: stageCode.replace(/_/g, ' '),
                color: 'blue',
                icon: 'Info',
                order: 0,
                total: inquiryStages.length || 1
            };
        }

        return {
            label: stage.lookupValue?.en || stageCode,
            color: stage.metadata?.color || 'blue',
            icon: stage.metadata?.icon || 'Info',
            order: stage.displayOrder || 0,
            total: inquiryStages.length
        };
    };

    const getStatusColor = (status: string) => {
        return getStageInfo(status).color;
    };

    const getStatusLabel = (status: string) => {
        const info = getStageInfo(status);
        return `${info.order}. ${info.label}`;
    };

    const getStageMetrics = (status: string) => {
        const info = getStageInfo(status);
        const percent = info.total > 0 ? Math.round((info.order / info.total) * 100) : 0;
        return { num: info.order, percent };
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <Box>
                    <Group gap="md" mb={4}>
                        <ThemeIcon size={58} radius="22px" variant="gradient" gradient={{ from: '#16284F', to: '#0C7C92', deg: 45 }} className="shadow-lg shadow-brand-navy/20">
                            <Trophy size={28} strokeWidth={2.5} />
                        </ThemeIcon>
                        <div>
                            <div className="flex items-center gap-2">
                                <Title order={1} className="text-3xl md:text-4xl font-extrabold text-brand-navy tracking-tight font-primary">
                                    {pipelineFilter === 'ALL' ? 'Institutional Pipeline' :
                                        pipelineFilter === 'OFFICE' ? 'Office Pipeline' : 'Land Pipeline'}
                                </Title>
                            </div>
                            <Text c="dimmed" fw={600} size="sm" className="mt-1">Management and conversion for institutional residents</Text>
                        </div>
                    </Group>
                </Box>
                <Group gap="md">
                    <SegmentedControl
                        id="pipeline-filter-control"
                        value={pipelineFilter}
                        onChange={setPipelineFilter}
                        data={[
                            { label: 'Unified', value: 'ALL' },
                            { label: 'Office', value: 'OFFICE' },
                            { label: 'Land', value: 'LAND' },
                        ]}
                        radius="xl"
                        size="md"
                        color="#0C7C92"
                        className="bg-slate-100/80 p-1 border border-slate-200"
                        styles={{
                            label: { fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }
                        }}
                    />
                    <Button
                        size="xl"
                        radius="xl"
                        className="bg-brand-navy shadow-xl shadow-slate-200 font-extrabold hover:scale-105 transition-transform px-8 font-primary"
                        component={Link}
                        href="/admin/tms/inquiries/form"
                        leftSection={<Plus size={20} strokeWidth={3} />}
                    >
                        New Intake
                    </Button>
                </Group>
            </div>

            {/* Pipeline Analytics - Enhanced */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
                {[
                    {
                        label: 'Funnel Volume',
                        count: filteredInquiries.filter(i => !['EXITED', 'REJECTED', 'ACTIVE'].includes(i.status)).length,
                        color: 'blue',
                        trend: '+8.4%',
                        icon: TrendingUp,
                        description: 'Prospects in active processing'
                    },
                    {
                        label: 'Investment Outlook',
                        count: filteredInquiries.filter(i => ['PROPOSAL_PENDING', 'PROPOSAL_APPROVED'].includes(i.status)).length,
                        color: 'cyan',
                        trend: '+12.5%',
                        icon: DollarSign,
                        description: 'High-value audits pending'
                    },
                    {
                        label: 'Terms Negotiation',
                        count: filteredInquiries.filter(i => ['OFFER_SENT', 'OFFER_ACCEPTED'].includes(i.status)).length,
                        color: 'indigo',
                        trend: '-2.1%',
                        icon: FileSignature,
                        description: 'Letters dispatched & active'
                    },
                    {
                        label: 'Registry Conversions',
                        count: filteredInquiries.filter(i => i.status === 'ACTIVE').length,
                        color: 'teal',
                        trend: '+5.0%',
                        icon: CheckCircle2,
                        description: 'Total converted residents'
                    },
                ].map((stat, idx) => (
                    <Paper key={idx} p="lg" radius="1.5rem" withBorder className="bg-white border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                        <Box className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-slate-50 rounded-full group-hover:scale-110 transition-transform`} />
                        <Stack gap="sm" className="relative z-10">
                            <Group justify="space-between">
                                <ThemeIcon variant="light" color={stat.color} size="lg" radius="10px">
                                    <stat.icon size={18} />
                                </ThemeIcon>
                                <Badge variant="dot" color={stat.color} size="xs" fw={900} className="bg-white font-primary">{stat.trend}</Badge>
                            </Group>
                            <div>
                                <Text size="10px" fw={800} c="dimmed" tt="uppercase" lts="1.8px" mb={2}>{stat.label}</Text>
                                <div className="flex items-baseline gap-1">
                                    <Text size="1.8rem" fw={800} className="text-brand-navy leading-none tracking-tighter font-primary">{stat.count}</Text>
                                    <Text size="10px" fw={700} c="dimmed">Records</Text>
                                </div>
                                <Text size="10px" fw={700} className="mt-1 text-slate-400 truncate">{stat.description}</Text>
                            </div>
                            <Progress
                                value={filteredInquiries.length > 0 ? (stat.count / filteredInquiries.length) * 100 : 0}
                                color={stat.color}
                                size="xs"
                                radius="xl"
                                striped
                                animated
                                className="mt-1"
                            />
                        </Stack>
                    </Paper>
                ))}
            </SimpleGrid>

            {/* Main Inquiry List - Redesigned for dual-pipeline context */}
            <Paper radius="3rem" className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <Stack gap={0}>
                    <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-50 bg-slate-50/30">
                        <div className="relative w-full md:w-[450px]">
                            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-3xl text-sm font-black shadow-sm focus:shadow-xl focus:border-[#0C7C92]/30 transition-all outline-none placeholder:text-slate-400/60"
                                placeholder="Search by organization, TIN, or inquiry reference..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Group gap="md">
                            <Box className="text-right">
                                <Text size="xs" fw={900} c="dimmed" className="uppercase tracking-[2px] leading-tight">Timeline View</Text>
                                <Text size="xs" fw={800} className="italic text-slate-400">Chronological Sorting Enabled</Text>
                            </Box>
                            <Divider orientation="vertical" h={30} />
                            <Button variant="light" color="gray" radius="xl" size="md" leftSection={<Filter size={16} />} className="font-black uppercase tracking-wider text-[10px]">Filter Matrix</Button>
                        </Group>
                    </div>

                    <ScrollArea h={650} scrollbarSize={8}>
                        <Table verticalSpacing="lg" horizontalSpacing="xl" className="border-separate border-spacing-y-3 px-8">
                            <thead>
                                <tr>
                                    <th className="text-[10px] font-black uppercase text-slate-400 py-4 pl-6 tracking-widest">Resident Entity Identification</th>
                                    <th className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Inquiry Purpose</th>
                                    <th className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Spatial & Fiscal Context</th>
                                    <th className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Lifecycle Status</th>
                                    <th className="text-[10px] font-black uppercase text-slate-400 pr-6 text-right text-transparent">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInquiries.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-32 text-center bg-slate-50/20 rounded-[3rem]">
                                            <ThemeIcon size={80} radius="xl" variant="light" color="slate" className="mb-4">
                                                <Search size={40} />
                                            </ThemeIcon>
                                            <Text fw={900} size="xl" c="slate.3">No matching intelligence found</Text>
                                            <Text size="sm" c="dimmed" className="mt-1">Adjust your pipeline filter or search parameters</Text>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInquiries.map((inquiry) => (
                                        <tr key={inquiry.id} className="bg-white border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group cursor-pointer">
                                            <td className="py-6 pl-8 rounded-l-[2.5rem]">
                                                <Group gap="lg">
                                                    <Avatar size={54} color={getStatusColor(inquiry.status)} radius="18px" fw={900} className="shadow-lg border-2 border-white">
                                                        {inquiry.tenant?.name.substring(0, 2).toUpperCase()}
                                                    </Avatar>
                                                    <Stack gap={2}>
                                                        <Text size="md" fw={800} className="text-brand-navy tracking-tight font-primary group-hover:text-brand-teal transition-colors">
                                                            {inquiry.tenant?.name}
                                                        </Text>
                                                        <Group gap={6}>
                                                            <Badge variant="filled" color="slate" size="xs" radius="xs" className="font-mono text-[9px] px-1.5 h-4">
                                                                {inquiry.inquiryNumber || `SEQ-${inquiry.id}`}
                                                            </Badge>
                                                            <Text size="xs" c="dimmed" fw={700} className="capitalize">
                                                                {format(new Date(inquiry.createdAt), 'MMM dd, yyyy')}
                                                            </Text>
                                                        </Group>
                                                    </Stack>
                                                </Group>
                                            </td>
                                            <td className="text-center">
                                                {inquiry.inquiryType === 'LAND_SUBLEASE' ? (
                                                    <Tooltip label="Industrial Land Sublease" position="top" withArrow transitionProps={{ transition: 'pop' }}>
                                                        <Badge
                                                            variant="light"
                                                            color="teal"
                                                            size="lg"
                                                            p="md"
                                                            radius="xl"
                                                            className="font-black tracking-widest border border-teal-100 shadow-sm"
                                                            leftSection={<Factory size={14} />}
                                                        >
                                                            LAND LEASE
                                                        </Badge>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip label="Commercial Office Space" position="top" withArrow transitionProps={{ transition: 'pop' }}>
                                                        <Badge
                                                            variant="light"
                                                            color="blue"
                                                            size="lg"
                                                            p="md"
                                                            radius="xl"
                                                            className="font-black tracking-widest border border-blue-100 shadow-sm"
                                                            leftSection={<Briefcase size={14} />}
                                                        >
                                                            OFFICE RENT
                                                        </Badge>
                                                    </Tooltip>
                                                )}
                                            </td>
                                            <td>
                                                <Group gap="xl">
                                                    <Stack gap={2}>
                                                        <Group gap={6}>
                                                            <Maximize size={12} className="text-slate-400" />
                                                            <Text size="xs" fw={900} className="text-slate-400 uppercase tracking-tighter">Spatial</Text>
                                                        </Group>
                                                        <Text size="sm" fw={950} className="text-slate-700">
                                                            {inquiry.requestedSize || inquiry.minArea || '?'} m²
                                                        </Text>
                                                    </Stack>
                                                    <Stack gap={2}>
                                                        <Group gap={6}>
                                                            <DollarSign size={12} className={`text-${inquiry.capexFDI ? 'teal' : 'slate-400'}`} />
                                                            <Text size="xs" fw={900} className="text-slate-400 uppercase tracking-tighter">Investment</Text>
                                                        </Group>
                                                        <Text size="sm" fw={950} className={inquiry.capexFDI ? 'text-teal-600' : 'text-slate-500'}>
                                                            {inquiry.capexFDI ? `$${Number(inquiry.capexFDI).toLocaleString()}` : '--'}
                                                        </Text>
                                                    </Stack>
                                                </Group>
                                            </td>
                                            <td>
                                                <Stack gap={4} className="w-56">
                                                    <Group justify="space-between" align="center">
                                                        <Badge
                                                            variant="dot"
                                                            color={getStatusColor(inquiry.status)}
                                                            className="font-black uppercase text-[10px] tracking-tight bg-slate-50 border-none"
                                                            px={0}
                                                        >
                                                            {getStageInfo(inquiry.status).label}
                                                        </Badge>
                                                        <Text size="10px" fw={900} variant="gradient" gradient={{ from: getStatusColor(inquiry.status), to: 'slate.4' }}>
                                                            STAGE {getStageMetrics(inquiry.status).num}/6
                                                        </Text>
                                                    </Group>
                                                    <Progress
                                                        size="sm"
                                                        radius="xl"
                                                        color={getStatusColor(inquiry.status)}
                                                        value={getStageMetrics(inquiry.status).percent}
                                                        striped
                                                        animated
                                                        className="shadow-inner"
                                                    />
                                                </Stack>
                                            </td>
                                            <td className="text-right pr-8 rounded-r-[2.5rem]">
                                                <Button
                                                    variant="filled"
                                                    className="bg-brand-teal opacity-0 group-hover:opacity-100 transition-all hover:scale-105 shadow-lg shadow-brand-teal/30 font-primary"
                                                    radius="xl"
                                                    size="xs"
                                                    fw={800}
                                                    leftSection={<ArrowRight size={14} strokeWidth={3} />}
                                                    onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                        setSelectedInquiry(inquiry);
                                                        setDrawerOpened(true);
                                                    }}
                                                >
                                                    Manage Pipeline
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </ScrollArea>
                </Stack>
            </Paper>

            {/* Lifecycle Intelligence Drawer - Enhanced with better data grid */}
            <Drawer
                opened={drawerOpened}
                onClose={() => setDrawerOpened(false)}
                position="right"
                size="45rem"
                styles={{
                    content: { borderRadius: '4rem 0 0 4rem', boxShadow: '-20px 0 60px rgba(0,0,0,0.1)' },
                    header: { display: 'none' }
                }}
            >
                {selectedInquiry && (
                    <Box className="h-full flex flex-col bg-[#F8FAFC]">
                        <Box p="4rem" className="bg-gradient-to-br from-[#16284F] to-[#0C7C92] text-white relative overflow-hidden">
                            <Box className="absolute top-[-20px] right-[-20px] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                            <Box className="absolute bottom-[-40px] left-[-40px] w-48 h-48 bg-[#0C7C92]/20 rounded-full blur-2xl" />

                            <Stack gap="xl" className="relative z-10">
                                <Group justify="space-between">
                                    <div className="flex gap-2">
                                        <Badge size="lg" radius="md" color="white" variant="outline" fw={900} className="border-white/30 text-white">
                                            {selectedInquiry.status}
                                        </Badge>
                                        <Badge size="lg" radius="md" color="white" variant="filled" fw={900} className="bg-white/10 text-white border-none backdrop-blur-md">
                                            {selectedInquiry.inquiryType}
                                        </Badge>
                                    </div>
                                    <ActionIcon variant="transparent" color="white" onClick={() => setDrawerOpened(false)} className="hover:scale-110 transition-transform">
                                        <X size={28} />
                                    </ActionIcon>
                                </Group>
                                <Stack gap={4}>
                                    <Text size="xs" fw={800} className="text-brand-teal uppercase tracking-[4px] font-bold">Inquiry Lifecycle Analysis</Text>
                                    <Title order={1} className="text-5xl font-extrabold tracking-tight mt-1 font-primary">{selectedInquiry.tenant?.name}</Title>
                                </Stack>
                            </Stack>
                        </Box>

                        <Tabs value={activeTab} onChange={setActiveTab} p="3rem" className="flex-1 overflow-auto custom-scrollbar">
                            <Tabs.List className="border-none mb-10 bg-white p-2 rounded-2xl shadow-sm" grow>
                                <Tabs.Tab value="details" leftSection={<Info size={16} />} className="rounded-xl font-black py-4 data-[active]:bg-[#16284F] data-[active]:text-white">INTEL DETAILS</Tabs.Tab>
                                <Tabs.Tab value="timeline" leftSection={<History size={16} />} className="rounded-xl font-black py-4 data-[active]:bg-[#16284F] data-[active]:text-white">JOURNEY LOG</Tabs.Tab>
                                <Tabs.Tab value="contract" leftSection={<FileSignature size={16} />} className="rounded-xl font-black py-4 data-[active]:bg-[#16284F] data-[active]:text-white">AGREEMENTS</Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="details">
                                <Stack gap="xl">
                                    <div className="grid grid-cols-2 gap-6">
                                        <Paper radius="2.5rem" withBorder p="xl" className="bg-white border-slate-100 shadow-sm group hover:shadow-md transition-shadow">
                                            <Stack gap="md">
                                                <Group gap="sm">
                                                    <ThemeIcon variant="light" color="blue" radius="md">
                                                        <Calculator size={16} />
                                                    </ThemeIcon>
                                                    <Text size="xs" fw={900} tt="uppercase" c="dimmed" lts="1.5px">Economic Metrics</Text>
                                                </Group>
                                                <Divider variant="dashed" />
                                                <Stack gap={16}>
                                                    <div>
                                                        <Text size="11px" fw={900} c="dimmed" className="uppercase mb-1">CapEx / FDI</Text>
                                                        <Text size="lg" fw={900} color="blue">{selectedInquiry.capexFDI ? `$${Number(selectedInquiry.capexFDI).toLocaleString()}` : 'Not Available'}</Text>
                                                    </div>
                                                    <div>
                                                        <Text size="11px" fw={900} c="dimmed" className="uppercase mb-1">Employement Gen</Text>
                                                        <Text size="lg" fw={900} color="slate">{selectedInquiry.estimatedJobs || 'TBD'} Positions</Text>
                                                    </div>
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                        <Paper radius="2.5rem" withBorder p="xl" className="bg-white border-slate-100 shadow-sm group hover:shadow-md transition-shadow">
                                            <Stack gap="md">
                                                <Group gap="sm">
                                                    <ThemeIcon variant="light" color="teal" radius="md">
                                                        <Maximize size={16} />
                                                    </ThemeIcon>
                                                    <Text size="xs" fw={900} tt="uppercase" c="dimmed" lts="1.5px">Spatial Preference</Text>
                                                </Group>
                                                <Divider variant="dashed" />
                                                <Stack gap={16}>
                                                    <div>
                                                        <Text size="11px" fw={900} c="dimmed" className="uppercase mb-1">Req. Footprint</Text>
                                                        <Text size="lg" fw={900} color="teal">{selectedInquiry.minArea} - {selectedInquiry.maxArea} m²</Text>
                                                    </div>
                                                    <div>
                                                        <Text size="11px" fw={900} c="dimmed" className="uppercase mb-1">Asset Category</Text>
                                                        <Text size="lg" fw={900} color="slate">{selectedInquiry.propertyType?.lookupCode || 'UNSPECIFIED'}</Text>
                                                    </div>
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                    </div>

                                    <Paper p="2rem" radius="2.5rem" withBorder className="border-[#0C7C92]/10 bg-white shadow-xl">
                                        <Stack gap="xl">
                                            <div className="flex justify-between items-center">
                                                <Group gap="xs">
                                                    <div className="w-1.5 h-6 bg-[#0C7C92] rounded-full" />
                                                    <Text size="md" fw={950} className="text-slate-800 uppercase tracking-tighter">Workflow Control</Text>
                                                </Group>
                                                <Badge size="lg" radius="xl" bg="#0C7C92" className="font-black px-6 h-10 shadow-lg shadow-[#0C7C92]/20">
                                                    STAGE {getStageMetrics(selectedInquiry.status).num}/6
                                                </Badge>
                                            </div>

                                            <Paper p="xl" radius="2rem" className="bg-slate-50/80 border-slate-100 flex items-center justify-between">
                                                <Stack gap={0}>
                                                    <Text size="sm" fw={900} className="text-slate-800">Ready for Advancement?</Text>
                                                    <Text size="xs" fw={700} c="dimmed">Execute next workflow stage manually or automate via mapping</Text>
                                                </Stack>
                                                <Button
                                                    radius="xl"
                                                    bg="#16284F"
                                                    size="lg"
                                                    className="font-black px-8 hover:scale-105 transition-transform shadow-lg shadow-slate-200"
                                                    rightSection={<ArrowRight size={20} />}
                                                    onClick={() => setModalOpened(true)}
                                                >
                                                    Launch Control
                                                </Button>
                                            </Paper>
                                        </Stack>
                                    </Paper>
                                </Stack>
                            </Tabs.Panel>

                            <Tabs.Panel value="timeline">
                                <Box className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                                    <LifecycleTimeline
                                        timeline={selectedInquiry.timeline || []}
                                        currentStatus={selectedInquiry.status}
                                    />
                                </Box>
                            </Tabs.Panel>

                            <Tabs.Panel value="contract">
                                {selectedInquiry.leaseId ? (
                                    <Stack gap="xl">
                                        <Paper p="2rem" radius="3rem" className="bg-gradient-to-br from-green-50 to-white border border-green-100 shadow-xl shadow-green-100/30">
                                            <Group gap="xl" wrap="nowrap">
                                                <div className="w-20 h-20 bg-green-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-green-200 group transition-transform hover:scale-110">
                                                    <FileSignature size={36} className="text-white" />
                                                </div>
                                                <Stack gap={4} className="flex-1">
                                                    <Badge size="xs" radius="xl" color="green" variant="filled" fw={950} className="w-fit mb-1">CONVERTED ASSET</Badge>
                                                    <Title order={3} className="text-[#16284F] font-black italic text-2xl tracking-tighter">{selectedInquiry.lease?.contractNumber}</Title>
                                                    <Group gap="md">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar size={14} className="text-slate-400" />
                                                            <Text size="xs" fw={800} c="dimmed" className="italic">Commenced: {format(new Date(selectedInquiry.contractStartDate!), 'MMM dd, yyyy')}</Text>
                                                        </div>
                                                        <Divider orientation="vertical" h={14} />
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin size={14} className="text-slate-400" />
                                                            <Text size="xs" fw={800} c="dimmed" className="italic">Leased Plot: {selectedInquiry.lease?.plotId || 'ASSIGNED'}</Text>
                                                        </div>
                                                    </Group>
                                                </Stack>
                                                <Button variant="subtle" color="green" radius="xl" size="sm" component={Link} href={`/admin/tms/leases/${selectedInquiry.leaseId}`}>
                                                    View File
                                                </Button>
                                            </Group>
                                        </Paper>
                                    </Stack>
                                ) : (
                                    <Box className="flex flex-col items-center justify-center py-32 opacity-20 text-slate-400">
                                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                            <FileText size={48} />
                                        </div>
                                        <Text fw={950} size="xl" className="uppercase tracking-[3px]">Contract Pending</Text>
                                        <Text size="xs" fw={700} className="italic mt-1">Complete the workflow stages to generate official registry entries</Text>
                                    </Box>
                                )}
                            </Tabs.Panel>
                        </Tabs>
                    </Box>
                )}
            </Drawer>

            {/* Workflow Transition Modal */}
            {selectedInquiry && (
                <PipelineUpdateModal
                    opened={modalOpened}
                    onClose={() => setModalOpened(false)}
                    inquiry={selectedInquiry}
                    onSuccess={() => {
                        loadInquiries();
                        loadOneInquiry(selectedInquiry.id);
                    }}
                />
            )}
        </div>
    );
}

