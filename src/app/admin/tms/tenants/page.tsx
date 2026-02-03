'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, RefreshCw, Eye, Edit, Trash2, MoreVertical,
    Users, Building2, FileText, TrendingUp, Mail, Phone, ExternalLink, Globe,
    Sparkles, Factory, Briefcase, Zap, ShieldCheck, MapPin, Target
} from 'lucide-react';
import { tenantsService, Tenant } from '@/services/tenants.service';
import { lookupsService } from '@/services/lookups.service';
import { TenantOnboardingWizard } from '@/components/organisms/tms/TenantOnboardingWizardMaster';
import { TenantStatusBadge } from '@/components/atoms/tms/TenantStatusBadge';
import { SpatialStats } from '@/components/organisms/tms/SpatialStats';
import { SmartPagination } from '@/components/SmartPagination';
import { toast } from '@/components/Toast';
import {
    Group, Stack, Text, Box, Paper, Title, Button, Badge, Table,
    ActionIcon, Tooltip, ThemeIcon, ScrollArea, Avatar, Divider,
    TextInput, Select, Tabs as MantineTabs
} from '@mantine/core';
import Link from 'next/link';

export default function TenantDirectoryPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [opened, setOpened] = useState(false);
    const [industries, setIndustries] = useState<any[]>([]);
    const [sectors, setSectors] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        search: '',
        statusId: '',
        industryId: '',
        sectorId: ''
    });
    const [activeTab, setActiveTab] = useState('all');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Metrics
    const [metrics, setMetrics] = useState({
        total: 0,
        active: 0,
        onboarding: 0,
        suspended: 0
    });

    const [mounted, setMounted] = useState(false);

    const fetchTenants = async () => {
        setIsLoading(true);
        try {
            const res: any = await tenantsService.getAll(filters);
            const data = res.data || res;
            setTenants(data);

            setMetrics({
                total: data.length,
                active: data.filter((t: any) => t.status?.lookupCode === 'ACTIVE').length,
                onboarding: data.filter((t: any) => t.status?.lookupCode === 'ONBOARDING').length,
                suspended: data.filter((t: any) => t.status?.lookupCode === 'SUSPENDED').length,
            });
        } catch (error) {
            toast.error('Failed to load tenant directory');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        lookupsService.getByCategory('INDUSTRY').then(res => setIndustries((res as any).data || res));
        lookupsService.getByCategory('SECTOR').then(res => setSectors((res as any).data || res));
    }, []);

    useEffect(() => {
        if (mounted) fetchTenants();
    }, [filters, mounted]);

    if (!mounted) return null;

    const handleOnboard = async (data: Partial<Tenant>) => {
        setIsLoading(true);
        try {
            await tenantsService.create(data);
            toast.success('✅ Tenant onboarded successfully');
            fetchTenants();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Onboarding failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('⚠️ Deactivate this tenant? This will suspend all associated user access.')) {
            try {
                await tenantsService.delete(id);
                toast.success('Tenant account deactivated');
                fetchTenants();
            } catch (error) {
                toast.error('Delete operation failed');
            }
        }
    };

    const filteredTenants = tenants.filter(t => {
        if (activeTab === 'active') return (t as any).status?.lookupCode === 'ACTIVE';
        if (activeTab === 'onboarding') return (t as any).status?.lookupCode === 'ONBOARDING';
        if (activeTab === 'suspended') return (t as any).status?.lookupCode === 'SUSPENDED';
        return true;
    });

    const paginatedTenants = filteredTenants.slice((page - 1) * pageSize, page * pageSize);
    const totalPages = Math.ceil(filteredTenants.length / pageSize);

    // Helper to determine Commercial Track
    const getCommercialTrack = (tenant: any) => {
        // Priority 1: Metadata track set during onboarding
        const metaTrack = tenant.metadata?.track;
        if (metaTrack === 'LAND') return { label: 'LAND LEASE', color: 'teal', icon: Factory };
        if (metaTrack === 'OFFICE') return { label: 'OFFICE RENT', color: 'blue', icon: Briefcase };

        // Priority 2: Inferred from leases
        const hasLandLease = tenant.leases?.some((l: any) => l.plotId || l.landResourceId);
        const hasOfficeLease = tenant.leases?.some((l: any) => l.roomId);
        const hasLandInquiry = tenant.inquiries?.some((i: any) => i.inquiryType === 'LAND_SUBLEASE');

        if (hasLandLease || hasLandInquiry) return { label: 'LAND LEASE', color: 'teal', icon: Factory };
        if (hasOfficeLease) return { label: 'OFFICE RENT', color: 'blue', icon: Briefcase };

        return { label: 'PENDING', color: 'slate', icon: Target };
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Ultra-Premium Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 overflow-hidden relative">
                <Box>
                    <Group gap="xl" mb={4}>
                        <div className="relative">
                            <ThemeIcon size={64} radius="24px" variant="gradient" gradient={{ from: '#16284F', to: '#0C7C92', deg: 45 }} className="shadow-2xl shadow-brand-navy/30">
                                <Users size={32} strokeWidth={2.5} />
                            </ThemeIcon>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-[#F8FAFC] flex items-center justify-center">
                                <ShieldCheck size={12} className="text-white" />
                            </div>
                        </div>
                        <div>
                            <Title order={1} className="text-3xl font-extrabold text-brand-navy tracking-tight font-primary">Tenant Directory</Title>
                            <Text c="dimmed" fw={600} size="sm" className="mt-1">Official Registry of IT Park Companies</Text>
                        </div>
                    </Group>
                </Box>
                <Group gap="md">
                    <Button
                        size="lg"
                        radius="xl"
                        className="bg-brand-teal shadow-xl shadow-brand-teal/20 font-extrabold hover:scale-105 transition-transform px-8 font-primary"
                        onClick={() => setOpened(true)}
                        leftSection={<Plus size={20} strokeWidth={3} />}
                    >
                        Register New Tenant
                    </Button>
                </Group>
            </div>

            {/* Strategic Intelligence Header */}
            <SpatialStats tenantMetrics={metrics} />

            {/* Integrated Search & Filter Hub */}
            <Paper p="2rem" radius="3rem" className="bg-white border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#16284F] via-[#0C7C92] to-teal-400 opacity-80" />

                <Group gap="xl" wrap="nowrap" align="end">
                    <div className="flex-1">
                        <TextInput
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.currentTarget.value })}
                            placeholder="Search by legal identity, registration, or TIN sequence..."
                            size="lg"
                            radius="xl"
                            leftSection={<Search size={18} className="text-slate-400" />}
                            leftSectionWidth={48}
                            styles={{
                                input: {
                                    backgroundColor: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    paddingLeft: '48px',
                                }
                            }}
                        />
                    </div>

                    <div className="w-64 hidden md:block">
                        <Select
                            data={industries.map(i => ({ value: i.id.toString(), label: i.lookupValue.en }))}
                            value={filters.industryId}
                            onChange={(val) => setFilters({ ...filters, industryId: val || '' })}
                            placeholder="All Vertical Categories"
                            size="lg"
                            radius="xl"
                            clearable
                            leftSection={<Factory size={18} className="text-slate-400" />}
                            leftSectionWidth={48}
                            styles={{
                                input: {
                                    backgroundColor: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    paddingLeft: '48px'
                                }
                            }}
                        />
                    </div>

                    <div className="w-64 hidden md:block">
                        <Select
                            data={sectors.map(s => ({ value: s.id.toString(), label: s.lookupValue.en }))}
                            value={filters.sectorId}
                            onChange={(val) => setFilters({ ...filters, sectorId: val || '' })}
                            placeholder="All Technical Domains"
                            size="lg"
                            radius="xl"
                            clearable
                            leftSection={<Briefcase size={18} className="text-slate-400" />}
                            leftSectionWidth={48}
                            styles={{
                                input: {
                                    backgroundColor: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    paddingLeft: '48px'
                                }
                            }}
                        />
                    </div>
                </Group>
            </Paper>

            {/* Main Lifecycle Table */}
            <Paper radius="3rem" className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden">
                <Box p="xl" className="border-b border-slate-50 bg-[#F8FAFC]/50">
                    <Group justify="space-between">
                        <MantineTabs value={activeTab} onChange={(val) => { setActiveTab(val || 'all'); setPage(1); }} variant="pills" radius="xl">
                            <MantineTabs.List className="bg-white p-1 rounded-full shadow-inner border border-slate-100">
                                <MantineTabs.Tab value="all" className="font-extrabold px-6 data-[active]:bg-brand-navy data-[active]:text-white font-primary text-xs">ALL ENTITIES ({tenants.length})</MantineTabs.Tab>
                                <MantineTabs.Tab value="active" className="font-extrabold px-6 data-[active]:bg-brand-teal data-[active]:text-white font-primary text-xs">OPERATIONAL ({metrics.active})</MantineTabs.Tab>
                                <MantineTabs.Tab value="onboarding" className="font-extrabold px-6 data-[active]:bg-orange-500 data-[active]:text-white font-primary text-xs">ONBOARDING ({metrics.onboarding})</MantineTabs.Tab>
                                <MantineTabs.Tab value="suspended" className="font-extrabold px-6 data-[active]:bg-rose-500 data-[active]:text-white font-primary text-xs">SUSPENDED ({metrics.suspended})</MantineTabs.Tab>
                            </MantineTabs.List>
                        </MantineTabs>

                        <Group gap="xl">
                            <ActionIcon variant="subtle" color="gray" radius="md" size="lg" onClick={fetchTenants}><RefreshCw size={18} /></ActionIcon>
                        </Group>
                    </Group>
                </Box>

                <ScrollArea h={700} scrollbarSize={8}>
                    <Table verticalSpacing="lg" horizontalSpacing="xl" className="border-separate border-spacing-y-3 px-8">
                        <thead>
                            <tr>
                                <th className="text-[11px] font-black uppercase text-slate-500 py-4 pl-6 tracking-wider">Company Profile</th>
                                <th className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Spatial Footprint</th>
                                <th className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Industry Sector</th>
                                <th className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Contacts</th>
                                <th className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Status & Health</th>
                                <th className="text-[11px] font-black uppercase text-slate-500 tracking-wider pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTenants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-40 text-center bg-slate-50/20 rounded-[3rem]">
                                        <div className="flex flex-col items-center">
                                            <div className="p-8 bg-white rounded-full shadow-lg mb-6">
                                                <Users size={64} className="text-slate-200" strokeWidth={1} />
                                            </div>
                                            <Text fw={800} size="xl" className="text-slate-800 uppercase tracking-wide">Registry Empty</Text>
                                            <Text size="sm" c="dimmed" className="mt-1">Adjust filters or register a new company</Text>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedTenants.map((tenant) => {
                                    const track = getCommercialTrack(tenant);
                                    const TrackIcon = track.icon;

                                    return (
                                        <tr key={tenant.id} className="bg-white border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group cursor-pointer">
                                            <td className="py-6 pl-8 rounded-l-[3rem]">
                                                <Group gap="xl">
                                                    <div className="relative">
                                                        <Avatar
                                                            size={54}
                                                            radius="16px"
                                                            bg="white"
                                                            className="shadow-md border-2 border-white font-bold text-[#16284F]"
                                                            style={{ border: `2px solid ${track.color === 'teal' ? '#2dd4bf' : track.color === 'blue' ? '#60a5fa' : '#e2e8f0'}` }}
                                                        >
                                                            {tenant.name.substring(0, 2).toUpperCase()}
                                                        </Avatar>
                                                        <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white bg-${track.color}-500 shadow-sm`}>
                                                            <TrackIcon size={10} className="text-white" />
                                                        </div>
                                                    </div>
                                                    <Stack gap={2}>
                                                        <Group gap="xs">
                                                            <Text size="md" fw={800} className="text-brand-navy tracking-tight font-primary group-hover:text-brand-teal transition-colors leading-tight">
                                                                {tenant.name}
                                                            </Text>
                                                            {tenant.website && (
                                                                <Tooltip label="Visit Corporate Portal">
                                                                    <ActionIcon
                                                                        component="a"
                                                                        href={tenant.website.startsWith('http') ? tenant.website : `https://${tenant.website}`}
                                                                        target="_blank"
                                                                        size="xs"
                                                                        variant="subtle"
                                                                        color="blue"
                                                                    >
                                                                        <Globe size={12} />
                                                                    </ActionIcon>
                                                                </Tooltip>
                                                            )}
                                                        </Group>
                                                        <Group gap={6}>
                                                            <Badge variant="light" color={track.color} size="xs" radius="xs" className="font-black text-[9px] px-1.5 h-4">
                                                                {track.label}
                                                            </Badge>
                                                            <Badge variant="filled" color="slate" size="xs" radius="xs" className="font-mono text-[9px] px-1.5 h-4">
                                                                REG: {tenant.companyRegNumber}
                                                            </Badge>
                                                        </Group>
                                                    </Stack>
                                                </Group>
                                            </td>
                                            <td className="text-center">
                                                <Stack gap={2} align="center">
                                                    <Group gap={4} justify="center">
                                                        <Text size="md" fw={900} className="text-brand-navy">
                                                            {(tenant.leases?.reduce((acc: number, l: any) => acc + (Number(l.contractArea) || 0), 0) || 0).toLocaleString()}
                                                        </Text>
                                                        <Text size="xs" fw={700} c="dimmed">m²</Text>
                                                    </Group>
                                                    <Badge variant="outline" color="gray" size="xs" className="font-black">
                                                        {tenant._count?.leases || 0} Assets
                                                    </Badge>
                                                </Stack>
                                            </td>
                                            <td>
                                                <Stack gap={2}>
                                                    <Group gap={6}>
                                                        <Sparkles size={12} className="text-teal-400" />
                                                        <Text size="xs" fw={900} className="text-slate-400 uppercase tracking-tighter">Industry</Text>
                                                    </Group>
                                                    <Text size="xs" fw={950} className="text-[#16284F] uppercase tracking-tighter">
                                                        {(tenant as any).industry?.lookupValue?.en || 'UNCLASSIFIED'}
                                                    </Text>
                                                </Stack>
                                            </td>
                                            <td>
                                                <Stack gap={6}>
                                                    <Group gap={8} className="group/link">
                                                        <ThemeIcon size={20} radius="sm" variant="light" color="blue"><Mail size={12} /></ThemeIcon>
                                                        <Text size="xs" fw={800} className="text-slate-500 truncate max-w-[140px]">{tenant.email || '—'}</Text>
                                                    </Group>
                                                    <Group gap={8}>
                                                        <ThemeIcon size={20} radius="sm" variant="light" color="teal"><Phone size={12} /></ThemeIcon>
                                                        <Text size="xs" fw={800} className="text-slate-500">{tenant.phone || '—'}</Text>
                                                    </Group>
                                                </Stack>
                                            </td>
                                            <td>
                                                <Stack gap={4}>
                                                    <TenantStatusBadge statusName={(tenant as any).status?.lookupCode} />
                                                    <Group gap={8} justify="center">
                                                        <Tooltip label="Active Leases"><Badge variant="outline" color="teal" size="xs" className="font-black">{tenant._count?.leases || 0} Lease</Badge></Tooltip>
                                                        <Tooltip label="Active Inquiries"><Badge variant="outline" color="blue" size="xs" className="font-black">{tenant._count?.inquiries || 0} Inq</Badge></Tooltip>
                                                    </Group>
                                                </Stack>
                                            </td>
                                            <td className="pr-8 rounded-r-[3rem] text-right">
                                                <Group gap="xs" justify="flex-end">
                                                    <Tooltip label="View Company Profile">
                                                        <ActionIcon
                                                            component={Link}
                                                            href={`/admin/tms/tenants/${tenant.id}`}
                                                            variant="light"
                                                            color="blue"
                                                            radius="30rem"
                                                            size="lg"
                                                            className="hover:scale-110 transition-transform"
                                                        >
                                                            <Eye size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>

                                                    <Tooltip label="Edit Details">
                                                        <ActionIcon
                                                            variant="light"
                                                            color="teal"
                                                            radius="30rem"
                                                            size="lg"
                                                            className="hover:scale-110 transition-transform"
                                                            onClick={(e: React.MouseEvent) => {
                                                                e.stopPropagation();
                                                                // Future: open edit modal or navigate to edit tab
                                                                toast.info('Quick Edit feature coming soon');
                                                            }}
                                                        >
                                                            <Edit size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>

                                                    <Tooltip label="Deactivate Account">
                                                        <ActionIcon
                                                            variant="light"
                                                            color="rose"
                                                            radius="30rem"
                                                            size="lg"
                                                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(tenant.id); }}
                                                            className="hover:bg-rose-100 hover:scale-110 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </Table>
                </ScrollArea>

                <Box className="border-t border-slate-100 bg-slate-50/10">
                    <SmartPagination
                        currentPage={page}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalElements={filteredTenants.length}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                        embedded={true}
                    />
                </Box>
            </Paper>

            {/* Beautiful Wizard Modal */}
            <TenantOnboardingWizard
                opened={opened}
                onClose={() => setOpened(false)}
                onSubmit={handleOnboard}
                isLoading={isLoading}
            />
        </div>
    );
}

