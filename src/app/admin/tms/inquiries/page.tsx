'use client';

import { useState, useEffect } from 'react';
import {
    Group, Stack, Text, Box, Paper, Title, Button, Badge, Table,
    ActionIcon, Tooltip, ThemeIcon, ScrollArea, Avatar, Divider,
    Drawer, Tabs, SimpleGrid, Card, Progress
} from '@mantine/core';
import {
    Plus, Search, Filter, Mail, Phone, Calendar, MapPin,
    Building2, ChevronRight, Eye, Send, CheckCircle2,
    AlertCircle, Info, LayoutGrid, History, FileText,
    Trophy, Calculator, FileSignature, LogOut, ArrowRight, Maximize
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
                        <ThemeIcon size={48} radius="xl" variant="gradient" gradient={{ from: '#0C7C92', to: '#065E6E', deg: 45 }}>
                            <Trophy size={24} strokeWidth={2.5} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} className="text-3xl font-black text-slate-800 tracking-tight italic">Commercial Intake Lifecycle</Title>
                            <Text c="dimmed" fw={600} size="sm">Strategic tracking of prospective residents & conversion logic</Text>
                        </div>
                    </Group>
                </Box>
                <Group>
                    <Button
                        variant="white"
                        size="md"
                        radius="xl"
                        className="shadow-sm border border-slate-200 text-slate-600 font-bold"
                        leftSection={<LayoutGrid size={20} />}
                    >
                        Workflow Grid
                    </Button>
                    <Button
                        size="md"
                        radius="xl"
                        bg="#0C7C92"
                        component={Link}
                        href="/admin/tms/inquiries/form"
                        className="shadow-lg shadow-teal-100 font-bold hover:scale-105 transition-transform"
                        leftSection={<Plus size={20} strokeWidth={3} />}
                    >
                        Initiate Strategic Intake
                    </Button>
                </Group>
            </div>

            {/* Pipeline Analytics */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
                {[
                    {
                        label: 'Active Pipeline',
                        count: inquiries.filter(i => !['EXITED', 'REJECTED', 'ACTIVE'].includes(i.status)).length,
                        color: 'blue',
                        value: 75,
                        icon: Mail,
                        description: 'Prospects in conversion funnel'
                    },
                    {
                        label: 'Strategic Reviews',
                        count: inquiries.filter(i => ['PROPOSAL_PENDING', 'PROPOSAL_APPROVED'].includes(i.status)).length,
                        color: 'yellow',
                        value: 40,
                        icon: FileText,
                        description: 'In-depth eligibility audits'
                    },
                    {
                        label: 'Negotiation Window',
                        count: inquiries.filter(i => ['OFFER_SENT', 'OFFER_ACCEPTED'].includes(i.status)).length,
                        color: 'cyan',
                        value: 60,
                        icon: Send,
                        description: 'Terms dispatched & pending'
                    },
                    {
                        label: 'Registry Conversions',
                        count: inquiries.filter(i => i.status === 'ACTIVE').length,
                        color: 'green',
                        value: 90,
                        icon: CheckCircle2,
                        description: 'Successfully active residents'
                    },
                ].map((stat, idx) => (
                    <Paper key={idx} p="xl" radius="2rem" withBorder className="bg-white border-slate-100 shadow-sm relative overflow-hidden group">
                        <Box className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.03] group-hover:scale-110 transition-transform`}>
                            <stat.icon size={128} />
                        </Box>
                        <Stack gap="md">
                            <Group justify="space-between">
                                <ThemeIcon variant="light" color={stat.color} size="xl" radius="md">
                                    <stat.icon size={20} />
                                </ThemeIcon>
                                <Badge variant="dot" color={stat.color} size="xs" fw={900}>+12.5%</Badge>
                            </Group>
                            <div>
                                <Text size="xs" fw={900} c="dimmed" tt="uppercase" lts="1.5px" mb={4}>{stat.label}</Text>
                                <Text size="2rem" fw={900} className="text-slate-800 leading-none">{stat.count}</Text>
                                <Text size="10px" fw={700} c="slate.4" className="mt-1 italic">{stat.description}</Text>
                            </div>
                            <Progress
                                value={inquiries.length > 0 ? (stat.count / inquiries.length) * 100 : 0}
                                color={stat.color}
                                size="sm"
                                radius="xl"
                                striped
                                animated
                            />
                        </Stack>
                    </Paper>
                ))}
            </SimpleGrid>

            {/* Main Inquiry List */}
            <Paper p="xs" radius="2.5rem" className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <Stack gap={0}>
                    <div className="p-6 flex justify-between items-center border-b border-slate-50">
                        <div className="relative w-96">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0C7C92] transition-colors" />
                            <input className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:shadow-xl focus:bg-white focus:border-[#0C7C92]/30 transition-all outline-none placeholder:text-slate-400/60 placeholder:font-bold" placeholder="Search by entity, sector, or identifier..." />
                        </div>
                        <Group gap="md">
                            <Button variant="subtle" color="gray" radius="xl" size="sm" leftSection={<Filter size={16} />}>Strategic Filtering</Button>
                            <Divider orientation="vertical" h={24} />
                            <Text size="xs" fw={800} c="dimmed" className="text-right italic">Ordered by Intake Chronology</Text>
                        </Group>
                    </div>

                    <ScrollArea h={600} scrollbarSize={8}>
                        <Table verticalSpacing="md" horizontalSpacing="xl" className="border-separate border-spacing-y-2">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="text-[10px] font-black uppercase text-slate-400 py-4 pl-12">Entity Identification</th>
                                    <th className="text-[10px] font-black uppercase text-slate-400">Allocation Metrics</th>
                                    <th className="text-[10px] font-black uppercase text-slate-400">Workflow Stage</th>
                                    <th className="text-[10px] font-black uppercase text-slate-400 pr-12 text-right text-transparent">Action</th>
                                </tr>
                            </thead>
                            <tbody className="px-6">
                                {inquiries.map((inquiry) => (
                                    <tr key={inquiry.id} className="hover:bg-slate-50/60 hover:shadow-lg transition-all duration-300 group cursor-pointer border-transparent hover:border-slate-100">
                                        <td className="py-6 pl-12 rounded-l-[2rem]">
                                            <Group gap="md">
                                                <Avatar size={48} color={getStatusColor(inquiry.status)} radius="xl" fw={900} className="shadow-inner border-2 border-white">
                                                    {inquiry.tenant?.name.substring(0, 2).toUpperCase()}
                                                </Avatar>
                                                <Stack gap={2}>
                                                    <Group gap="xs">
                                                        <Text size="sm" fw={900} className="text-slate-800">{inquiry.tenant?.name}</Text>
                                                        <Badge variant="outline" color="gray" size="xs" radius="xs" fw={900}>{inquiry.inquiryNumber || inquiry.id}</Badge>
                                                    </Group>
                                                    <Group gap={8}>
                                                        <Badge variant="dot" color="blue" size="xs" fw={800}>{inquiry.inquiryType || 'Institutional'}</Badge>
                                                        <Text size="xs" c="dimmed" fw={700}>Initiated: {format(new Date(inquiry.createdAt), 'MMM dd, yyyy')}</Text>
                                                    </Group>
                                                </Stack>
                                            </Group>
                                        </td>
                                        <td>
                                            <Stack gap={4}>
                                                <Group gap="xs">
                                                    <div className="w-1 h-1 rounded-full bg-[#0C7C92]" />
                                                    <Text size="xs" fw={900} className="text-slate-400 uppercase tracking-widest text-[9px]">Capital</Text>
                                                    <Text size="sm" fw={950} className="text-[#0C7C92] tracking-tighter">
                                                        {inquiry.capexFDI ? `$${Number(inquiry.capexFDI).toLocaleString()}` : 'Pending'}
                                                    </Text>
                                                </Group>
                                                <Group gap="xs">
                                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <Text size="xs" fw={900} className="text-slate-400 uppercase tracking-widest text-[9px]">Area Req</Text>
                                                    <Text size="xs" fw={950} className="text-slate-700">{inquiry.requestedSize || inquiry.minArea || '?'} m²</Text>
                                                </Group>
                                            </Stack>
                                        </td>
                                        <td>
                                            <Stack gap={4} className="w-56">
                                                <Group justify="space-between">
                                                    <Text size="xs" fw={900} color={getStatusColor(inquiry.status)} className="uppercase tracking-tighter">
                                                        {getStatusLabel(inquiry.status)}
                                                    </Text>
                                                    <Text size="xs" fw={800} color="dimmed" fs="italic">Stage {getStageMetrics(inquiry.status).num}/6</Text>
                                                </Group>
                                                <Progress size="xs" radius="xl" color={getStatusColor(inquiry.status)} value={getStageMetrics(inquiry.status).percent} striped animated />
                                            </Stack>
                                        </td>
                                        <td className="text-right pr-12 rounded-r-[2rem]">
                                            <Button
                                                variant="light"
                                                color="blue"
                                                radius="xl"
                                                size="xs"
                                                fw={900}
                                                leftSection={<ArrowRight size={14} strokeWidth={3} />}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                onClick={() => { setSelectedInquiry(inquiry); setDrawerOpened(true); }}
                                            >
                                                Advance Journey
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </ScrollArea>
                </Stack>
            </Paper>

            {/* Lifecycle Intelligence Drawer */}
            <Drawer
                opened={drawerOpened}
                onClose={() => setDrawerOpened(false)}
                position="right"
                size="45rem"
                styles={{
                    content: { borderRadius: '3rem 0 0 3rem' },
                    header: { display: 'none' }
                }}
            >
                {selectedInquiry && (
                    <Box className="h-full flex flex-col">
                        <Box p="3rem" className="bg-[#16284F] text-white relative overflow-hidden">
                            <Box className="absolute top-0 right-0 w-64 h-64 -mr-16 -mt-16 bg-white/5 rounded-full blur-3xl" />
                            <Stack gap="xl">
                                <Group justify="space-between">
                                    <Badge size="lg" radius="md" color="cyan" variant="filled" fw={900}>{selectedInquiry.status}</Badge>
                                    <ActionIcon variant="transparent" color="white" onClick={() => setDrawerOpened(false)}><ArrowRight size={24} /></ActionIcon>
                                </Group>
                                <Stack gap={4}>
                                    <Text size="xs" fw={900} className="opacity-60 uppercase tracking-[3px]">Intake Intelligence Profile</Text>
                                    <Title order={1} className="text-4xl font-black italic">{selectedInquiry.tenant?.name}</Title>
                                </Stack>
                            </Stack>
                        </Box>

                        <Tabs value={activeTab} onChange={setActiveTab} p="3rem" className="flex-1 overflow-auto">
                            <Tabs.List className="border-none mb-8" grow>
                                <Tabs.Tab value="details" leftSection={<Info size={16} />} className="rounded-xl font-bold">Case Details</Tabs.Tab>
                                <Tabs.Tab value="timeline" leftSection={<History size={16} />} className="rounded-xl font-bold">Journey Timeline</Tabs.Tab>
                                <Tabs.Tab value="contract" leftSection={<FileSignature size={16} />} className="rounded-xl font-bold">Agreements</Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="details">
                                <Stack gap="xl">
                                    <SimpleGrid cols={2}>
                                        <Card radius="2rem" withBorder p="lg" className="bg-slate-50/50">
                                            <Stack gap="md">
                                                <Group gap="sm"><Calculator size={18} className="text-blue-500" /><Text size="xs" fw={900} tt="uppercase" c="dimmed">Investment Metrics</Text></Group>
                                                <Stack gap={4}>
                                                    <Text size="xs" fw={700}>Projected CapEx (USD)</Text>
                                                    <Text size="lg" fw={900}>{selectedInquiry.capexFDI ? `$${Number(selectedInquiry.capexFDI).toLocaleString()}` : 'Not Disclosed'}</Text>
                                                </Stack>
                                                <Stack gap={4}>
                                                    <Text size="xs" fw={700}>Estimated Jobs</Text>
                                                    <Text size="lg" fw={900}>{selectedInquiry.estimatedJobs || 'TBD'} Positions</Text>
                                                </Stack>
                                            </Stack>
                                        </Card>
                                        <Card radius="2rem" withBorder p="lg" className="bg-slate-50/50">
                                            <Stack gap="md">
                                                <Group gap="sm"><Maximize size={18} className="text-teal-500" /><Text size="xs" fw={900} tt="uppercase" c="dimmed">Spatial Preferences</Text></Group>
                                                <Stack gap={4}>
                                                    <Text size="xs" fw={700}>Required Footprint</Text>
                                                    <Text size="lg" fw={900}>{selectedInquiry.minArea} - {selectedInquiry.maxArea} m²</Text>
                                                </Stack>
                                                <Stack gap={4}>
                                                    <Text size="xs" fw={700}>Property Category</Text>
                                                    <Text size="lg" fw={900}>{selectedInquiry.propertyType?.lookupCode || 'General Business'}</Text>
                                                </Stack>
                                            </Stack>
                                        </Card>
                                    </SimpleGrid>

                                    <Box>
                                        <Text size="sm" fw={900} tt="uppercase" className="text-slate-400 mb-4 px-2 tracking-widest">Workflow Actions</Text>
                                        <Paper p="xl" radius="2rem" withBorder className="border-[#0C7C92]/20 bg-[#0C7C92]/5">
                                            <Group justify="space-between">
                                                <Stack gap={0}>
                                                    <Text size="sm" fw={900} className="text-[#0C7C92]">Advance Lifecycle</Text>
                                                    <Text size="xs" fw={700} c="dimmed">Execute next workflow stage manually or automate via matching</Text>
                                                </Stack>
                                                <Button
                                                    radius="xl"
                                                    bg="#0C7C92"
                                                    size="md"
                                                    leftSection={<ArrowRight size={18} />}
                                                    onClick={() => setModalOpened(true)}
                                                >
                                                    Advance Workflow
                                                </Button>
                                            </Group>
                                        </Paper>
                                    </Box>
                                </Stack>
                            </Tabs.Panel>

                            <Tabs.Panel value="timeline">
                                <LifecycleTimeline
                                    timeline={selectedInquiry.timeline || []}
                                    currentStatus={selectedInquiry.status}
                                />
                            </Tabs.Panel>

                            <Tabs.Panel value="contract">
                                {selectedInquiry.leaseId ? (
                                    <Stack gap="xl">
                                        <Paper p="xl" radius="2rem" className="bg-green-50/50 border border-green-100">
                                            <Group gap="xl">
                                                <ThemeIcon size={64} radius="xl" color="green" variant="light">
                                                    <FileSignature size={32} />
                                                </ThemeIcon>
                                                <Stack gap={4}>
                                                    <Text size="xs" fw={900} color="green" tt="uppercase">ACTIVE CONVERTED LEASE</Text>
                                                    <Title order={3} className="text-slate-800 italic">{selectedInquiry.lease?.contractNumber}</Title>
                                                    <Group gap="xs">
                                                        <Calendar size={14} className="text-slate-400" />
                                                        <Text size="xs" fw={700} c="dimmed" className="italic">Commenced: {format(new Date(selectedInquiry.contractStartDate!), 'MMM dd, yyyy')}</Text>
                                                    </Group>
                                                </Stack>
                                            </Group>
                                        </Paper>
                                    </Stack>
                                ) : (
                                    <Box className="flex flex-col items-center justify-center py-20 opacity-30">
                                        <FileText size={64} />
                                        <Text fw={900} mt="md">No active contracts found yet</Text>
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
