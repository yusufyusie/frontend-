'use client';

import { useState, useEffect } from 'react';
import { Group, Stack, Text, Box, Paper, Title, Button, Badge, SimpleGrid, ThemeIcon, Progress, Tooltip, ActionIcon } from '@mantine/core';
import { FileText, Plus, Search, Filter, TrendingUp, Users, Clock, AlertCircle, FileCheck, Eye, Edit, Trash2, Download, DollarSign } from 'lucide-react';
import { SmartPagination } from '@/components/SmartPagination';
import { motion } from 'framer-motion';

import { LeaseForm } from '@/components/organisms/tms/LeaseForm';
import { Modal } from '@/components/Modal';
import { leasesService } from '@/services/leases.service';
import { toast } from '@/components/Toast';
import { createPortal } from 'react-dom';

export default function LeasesPage() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleExecuteLease = async (data: any) => {
        setIsLoading(true);
        try {
            await leasesService.create(data);
            toast.success('Lease agreement executed successfully!');
            setIsModalOpen(false);
            // In a real app, refresh data here
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed to execute lease');
        } finally {
            setIsLoading(false);
        }
    };

    // Mock Intelligence Data for Executive Review
    const metrics = [
        { label: 'Total Annual Revenue', value: '42.8M', sub: '+12% from LY', icon: DollarSign, color: 'teal', trend: 'up' },
        { label: 'Active Contracts', value: '184', sub: '92% Occupancy', icon: FileCheck, color: 'blue', trend: 'up' },
        { label: 'Expiring Soon', value: '12', sub: 'Next 30 Days', icon: Clock, color: 'orange', trend: 'neutral' },
        { label: 'Pending Renewals', value: '8', sub: 'In Negotiation', icon: Users, color: 'violet', trend: 'down' },
    ];

    const mockLeases = [
        { id: 1, contract: 'ITPC/L-2024/001', tenant: 'Ethio-Telecom', area: '1,200', rent: '240,000', status: 'Active', expiry: '2027-12-31', payment: 'Current' },
        { id: 2, contract: 'ITPC/L-2024/042', tenant: 'Safaricom Ethiopia', area: '850', rent: '170,000', status: 'Active', expiry: '2026-06-15', payment: 'Current' },
        { id: 3, contract: 'ITPC/L-2023/118', tenant: 'Gebeya Inc.', area: '450', rent: '90,000', status: 'Expiring', expiry: '2024-02-28', payment: 'Review' },
        { id: 4, contract: 'ITPC/L-2024/009', tenant: 'Kifiya Financial', area: '200', rent: '40,000', status: 'Active', expiry: '2025-08-10', payment: 'Current' },
        { id: 5, contract: 'ITPC/L-2024/088', tenant: 'Digital Ethiopia', area: '150', rent: '30,000', status: 'Draft', expiry: '2025-01-01', payment: 'N/A' },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Executive Header Segment */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <Box>
                    <Group gap="md" mb={4}>
                        <ThemeIcon size={48} radius="xl" variant="gradient" gradient={{ from: '#0C7C92', to: '#1098AD', deg: 45 }}>
                            <FileText size={24} strokeWidth={2.5} />
                        </ThemeIcon>
                        <div>
                            <Title order={1} className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                                Lease Management
                            </Title>
                            <Text c="dimmed" fw={600} size="sm">Contract Intelligence & Financial Oversight Console</Text>
                        </div>
                    </Group>
                </Box>
                <Group gap="md">
                    <Button
                        variant="light"
                        color="gray"
                        radius="xl"
                        leftSection={<Download size={18} />}
                        className="font-bold hidden sm:flex"
                    >
                        Export PDF Report
                    </Button>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        size="md"
                        radius="xl"
                        bg="#0C7C92"
                        className="shadow-lg shadow-teal-100 font-bold hover:brightness-110 transition-all"
                        leftSection={<Plus size={20} strokeWidth={3} />}
                    >
                        Execute New Lease
                    </Button>
                </Group>
            </div>

            {/* Premium Metrics Dashboard */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                {metrics.map((metric, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Paper p="xl" radius="2.5rem" className="bg-white border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-${metric.color}-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
                            <Stack gap="xs">
                                <ThemeIcon color={metric.color} variant="light" size="lg" radius="md">
                                    <metric.icon size={20} />
                                </ThemeIcon>
                                <div>
                                    <Text size="xs" fw={800} c="dimmed" tt="uppercase" lts="1px">{metric.label}</Text>
                                    <Group align="baseline" gap={4}>
                                        <Text size="28px" fw={900} className="text-slate-800">{metric.value}</Text>
                                        <Text size="xs" fw={700} className={metric.trend === 'up' ? 'text-emerald-500' : metric.trend === 'down' ? 'text-rose-500' : 'text-slate-400'}>
                                            {metric.trend === 'up' ? '▲' : metric.trend === 'down' ? '▼' : '•'}
                                        </Text>
                                    </Group>
                                    <Text size="xs" fw={700} className="text-slate-400 mt-1">{metric.sub}</Text>
                                </div>
                            </Stack>
                        </Paper>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Search & Filter Intelligence */}
            <Paper p="md" radius="2rem" className="bg-slate-50/50 border border-slate-100 shadow-inner">
                <Group justify="space-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find by Contract, Tenant or Unit..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#0C7C92] outline-none text-sm font-bold shadow-sm transition-all"
                        />
                    </div>
                    <Group gap="sm">
                        <Button variant="white" radius="xl" leftSection={<Filter size={16} />} className="text-slate-600 font-black">Filters</Button>
                        <Box className="w-[1px] h-8 bg-slate-200 mx-2 hidden sm:block" />
                        <Text size="xs" fw={900} c="dimmed" tt="uppercase" className="tracking-widest pr-4">Showing 184 Active Results</Text>
                    </Group>
                </Group>
            </Paper>

            {/* Main Contract Grid */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#F8FAFC] border-b border-slate-200">
                                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Contract #</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Corporate Tenant</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Allocation (m²)</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Base Rent / Mo</th>
                                <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Expiry Date</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-[#0C7C92]">Intelligence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockLeases.map((lease) => (
                                <tr key={lease.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-default">
                                    <td className="px-8 py-5">
                                        <Text size="sm" fw={900} className="text-[#16284F] tracking-tight">{lease.contract}</Text>
                                        <Text size="10px" fw={800} className="text-slate-400 font-mono mt-0.5 uppercase tracking-tighter">Verified Terms</Text>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Group gap="sm">
                                            <Box className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#0C7C92] font-black text-xs">
                                                {lease.tenant.charAt(0)}
                                            </Box>
                                            <Text size="sm" fw={800} className="text-slate-700">{lease.tenant}</Text>
                                        </Group>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Text size="sm" fw={900} className="text-slate-800 font-mono">{lease.area} <span className="text-[10px] text-slate-400">m²</span></Text>
                                        <Progress value={85} size="xs" radius="xl" color="teal" className="w-20 mt-2" />
                                    </td>
                                    <td className="px-6 py-5">
                                        <Text size="sm" fw={900} className="text-blue-700 font-mono tracking-tighter">
                                            {lease.rent} <span className="text-[10px] text-slate-400">ETB</span>
                                        </Text>
                                        <Text size="9px" fw={900} className="text-emerald-500 uppercase mt-0.5 tracking-widest">{lease.payment}</Text>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <Badge
                                                variant="light"
                                                color={lease.status === 'Active' ? 'teal' : lease.status === 'Expiring' ? 'orange' : 'gray'}
                                                radius="sm"
                                                size="sm"
                                                fw={900}
                                                className="uppercase tracking-widest text-[9px]"
                                            >
                                                {lease.status}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Text size="sm" fw={800} className={lease.status === 'Expiring' ? 'text-orange-600' : 'text-slate-600'}>
                                            {new Date(lease.expiry).toLocaleDateString()}
                                        </Text>
                                        <Text size="9px" fw={700} c="dimmed">ISO: {lease.expiry}</Text>
                                    </td>
                                    <td className="px-8 py-5">
                                        <Group gap={8} justify="flex-end">
                                            <Tooltip label="Deep Analytics" position="top">
                                                <ActionIcon variant="subtle" color="blue" radius="md"><Eye size={16} /></ActionIcon>
                                            </Tooltip>
                                            <Tooltip label="Modify Contract" position="top">
                                                <ActionIcon variant="subtle" color="violet" radius="md"><Edit size={16} /></ActionIcon>
                                            </Tooltip>
                                            <Tooltip label="Download PDF" position="top">
                                                <ActionIcon variant="subtle" color="gray" radius="md"><Download size={16} /></ActionIcon>
                                            </Tooltip>
                                        </Group>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Integration with our premium Navigation Engine */}
                <div className="p-8">
                    <SmartPagination
                        currentPage={page}
                        totalPages={19}
                        pageSize={pageSize}
                        totalElements={184}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                    />
                </div>
            </div>

            {/* High-Manager Insight Banner */}
            <Paper p="xl" radius="2.5rem" className="bg-[#16284F] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-full bg-[#0C7C92] opacity-10 skew-x-12 -mr-16" />
                <Group justify="space-between" align="center" style={{ position: 'relative', zIndex: 1 }}>
                    <Stack gap={0}>
                        <Group gap="xs">
                            <ThemeIcon color="cyan" variant="filled" size="xs" radius="xl"><TrendingUp size={10} /></ThemeIcon>
                            <Text size="xs" fw={900} color="cyan.2" className="tracking-[0.2em] uppercase">Intelligence Snapshot</Text>
                        </Group>
                        <Title order={3} className="font-black mt-1">Optimization Required: Regional Space Vacancy</Title>
                        <Text size="sm" className="opacity-70 mt-2 max-w-xl">
                            Corporate demand for <span className="text-cyan-400 font-bold">Block B (Tech Center)</span> has increased by 14%. Consider reviewing standard rent rates for upcoming renewals in Q3.
                        </Text>
                    </Stack>
                    <Button variant="white" color="dark" radius="xl" size="md" className="font-black">View Executive Summary</Button>
                </Group>
            </Paper>

            {/* Portal-Rendered Configuration Wizard */}
            {mounted && createPortal(
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Execute Strategic Lease"
                    description="Configure Contractual Terms & Asset Allocation"
                    size="xl"
                    icon={<FileText size={24} className="text-[#0C7C92]" />}
                >
                    <LeaseForm
                        onSubmit={handleExecuteLease}
                        isLoading={isLoading}
                    />
                </Modal>,
                document.body
            )}
        </div>
    );
}
