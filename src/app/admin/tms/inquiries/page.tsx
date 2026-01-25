'use client';

import { useState, useEffect } from 'react';
import { Group, Stack, Text, Box, Paper, Title, Button, Badge, Table, ActionIcon, Tooltip, ThemeIcon, ScrollArea, Avatar, Divider, Drawer } from '@mantine/core';
import { Plus, Search, Filter, Mail, Phone, Calendar, MapPin, Building2, ChevronRight, Eye, Send, CheckCircle2, AlertCircle, Info, LayoutGrid } from 'lucide-react';
import { inquiriesService, Inquiry } from '@/services/inquiries.service';
import { toast } from '@/components/Toast';

export default function InquiriesDashboardPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [drawerOpened, setDrawerOpened] = useState(false);

    useEffect(() => {
        loadInquiries();
    }, []);

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'blue';
            case 'ANALYZING': return 'orange';
            case 'OPTIONS_SENT': return 'violet';
            case 'INTERESTED': return 'teal';
            case 'EXECUTED': return 'green';
            default: return 'gray';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <Box>
                    <Group gap="md" mb={4}>
                        <ThemeIcon size={48} radius="xl" variant="gradient" gradient={{ from: '#0C7C92', to: '#065E6E', deg: 45 }}>
                            <Mail size={24} strokeWidth={2.5} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} className="text-3xl font-black text-slate-800 tracking-tight">Requirement Intake Hub</Title>
                            <Text c="dimmed" fw={600} size="sm">Manage automated inquiry lifecycles & property matching</Text>
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
                    Submit Requirements
                </Button>
            </div>

            {/* Inquiry Pipeline Summary */}
            <Group grow gap="xl">
                {[
                    { label: 'Unanalyzed Requests', count: inquiries.filter(i => i.status === 'NEW').length, color: 'blue', icon: Info },
                    { label: 'Pending Selection', count: inquiries.filter(i => i.status === 'OPTIONS_SENT').length, color: 'violet', icon: Send },
                    { label: 'Qualified Leads', count: inquiries.filter(i => i.status === 'INTERESTED').length, color: 'teal', icon: CheckCircle2 },
                ].map((stat, idx) => (
                    <Paper key={idx} p="md" radius="1.5rem" withBorder className="bg-white border-slate-100 shadow-sm">
                        <Group justify="space-between">
                            <Stack gap={2}>
                                <Text size="xs" fw={900} c="dimmed" tt="uppercase" lts="1.2px">{stat.label}</Text>
                                <Text size="xl" fw={900} className="text-slate-800">{stat.count}</Text>
                            </Stack>
                            <ThemeIcon variant="light" color={stat.color} size="xl" radius="md">
                                <stat.icon size={20} />
                            </ThemeIcon>
                        </Group>
                    </Paper>
                ))}
            </Group>

            {/* Main Inquiry Table */}
            <Paper p="xl" radius="2.5rem" className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <Stack gap="xl">
                    <Group justify="space-between">
                        <div className="relative w-80">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:shadow-md transition-all" placeholder="Search by tenant or industry..." />
                        </div>
                        <Group gap="xs">
                            <Button variant="light" color="gray" radius="xl" size="xs" leftSection={<Filter size={14} />}>Advanced Filters</Button>
                        </Group>
                    </Group>

                    <Table verticalSpacing="lg" horizontalSpacing="xl">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="text-[10px] font-black uppercase text-slate-500 py-4 rounded-l-2xl">Prospective Tenant</th>
                                <th className="text-[10px] font-black uppercase text-slate-500">Requirements Preview</th>
                                <th className="text-[10px] font-black uppercase text-slate-500 text-center">Lifecycle Status</th>
                                <th className="text-[10px] font-black uppercase text-slate-500 pr-10 text-right rounded-r-2xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiries.map((inquiry) => (
                                <tr key={inquiry.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 group">
                                    <td className="py-5">
                                        <Group gap="md">
                                            <Avatar color="blue" radius="md" fw={900}>{inquiry.tenant?.name.substring(0, 2).toUpperCase()}</Avatar>
                                            <Stack gap={2}>
                                                <Text size="sm" fw={800} className="text-slate-800">{inquiry.tenant?.name}</Text>
                                                <Text size="xs" c="dimmed" fw={700}>Industry: {inquiry.propertyType?.lookupValue?.en || 'Standard'}</Text>
                                            </Stack>
                                        </Group>
                                    </td>
                                    <td>
                                        <Group gap="sm">
                                            <Badge variant="light" color="gray" size="sm" radius="md">{inquiry.minArea || 0} - {inquiry.maxArea || '?'} m²</Badge>
                                            <Badge variant="dot" color="teal" size="sm" radius="md" fw={900}>
                                                {inquiry.minBaseRent ? `$${inquiry.minBaseRent.toLocaleString()}` : 'Flexible'}
                                            </Badge>
                                        </Group>
                                    </td>
                                    <td className="text-center">
                                        <Badge
                                            variant="filled"
                                            color={getStatusColor(inquiry.status)}
                                            radius="xl"
                                            size="sm"
                                            fw={900}
                                            className="px-4"
                                        >
                                            {inquiry.status}
                                        </Badge>
                                    </td>
                                    <td className="text-right pr-6">
                                        <Group gap={8} justify="flex-end">
                                            <Tooltip label="Analyze Intelligence">
                                                <ActionIcon
                                                    variant="white"
                                                    radius="md"
                                                    size="lg"
                                                    className="shadow-sm border border-slate-100 text-slate-600 hover:text-[#0C7C92]"
                                                    onClick={() => { setSelectedInquiry(inquiry); setDrawerOpened(true); }}
                                                >
                                                    <ChevronRight size={18} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </Group>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Stack>
            </Paper>

            {/* Analysis Drawer */}
            <Drawer
                opened={drawerOpened}
                onClose={() => setDrawerOpened(false)}
                position="right"
                size="md"
                title={<Title order={3} className="font-black text-slate-800">Inquiry Intelligence Analysis</Title>}
                padding="xl"
            >
                {selectedInquiry && (
                    <Stack gap="xl">
                        <Paper p="lg" radius="xl" className="bg-[#16284F] text-white">
                            <Group justify="space-between">
                                <Stack gap={0}>
                                    <Text size="xs" fw={900} className="opacity-60 uppercase tracking-widest">Client Identity</Text>
                                    <Text size="xl" fw={900}>{selectedInquiry.tenant?.name}</Text>
                                </Stack>
                                <Badge color="cyan" variant="outline" fw={900}>{selectedInquiry.status}</Badge>
                            </Group>
                        </Paper>

                        <Stack gap="md">
                            <Text size="sm" fw={900} tt="uppercase" className="text-slate-400 tracking-widest px-2">Core Requirements</Text>
                            <Paper withBorder p="md" radius="xl" className="border-slate-100 bg-slate-50/50">
                                <Stack gap="md">
                                    <Group justify="space-between">
                                        <Group gap="xs"><LayoutGrid size={16} className="text-blue-500" /><Text size="xs" fw={800}>Space Requirement</Text></Group>
                                        <Text size="sm" fw={900}>{selectedInquiry.minArea} - {selectedInquiry.maxArea} m²</Text>
                                    </Group>
                                    <Divider variant="dashed" />
                                    <Group justify="space-between">
                                        <Group gap="xs"><Calendar size={16} className="text-orange-500" /><Text size="xs" fw={800}>Preferred Move-in</Text></Group>
                                        <Text size="sm" fw={900}>{selectedInquiry.preferredMoveIn ? new Date(selectedInquiry.preferredMoveIn).toLocaleDateString() : 'ASAP'}</Text>
                                    </Group>
                                    <Divider variant="dashed" />
                                    <Group justify="space-between">
                                        <Group gap="xs"><Building2 size={16} className="text-teal-500" /><Text size="xs" fw={800}>Furniture Preference</Text></Group>
                                        <Text size="sm" fw={900}>{selectedInquiry.furnitureStatus?.lookupValue?.en || 'Not Specified'}</Text>
                                    </Group>
                                </Stack>
                            </Paper>
                        </Stack>

                        <Stack gap="md">
                            <Text size="sm" fw={900} tt="uppercase" className="text-slate-400 tracking-widest px-2">Administrative Actions</Text>
                            <Group grow>
                                <Button
                                    variant="gradient"
                                    gradient={{ from: '#0C7C92', to: '#1098AD' }}
                                    radius="xl"
                                    size="md"
                                    leftSection={<Send size={16} />}
                                >
                                    Matching Properties
                                </Button>
                                <Button variant="light" color="gray" radius="xl" size="md">Close Case</Button>
                            </Group>
                        </Stack>
                    </Stack>
                )}
            </Drawer>
        </div>
    );
}
