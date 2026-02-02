'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, RefreshCw, Eye, Edit, Trash2, MoreVertical, Users, Building2, FileText, TrendingUp, Mail, Phone, ExternalLink, Sparkles } from 'lucide-react';
import { tenantsService, Tenant } from '@/services/tenants.service';
import { lookupsService } from '@/services/lookups.service';
import { TenantOnboardingWizard } from '@/components/organisms/tms/TenantOnboardingWizardMaster';
import { TenantStatusBadge } from '@/components/atoms/tms/TenantStatusBadge';
import { SpatialStats } from '@/components/organisms/tms/SpatialStats';
import { SmartPagination } from '@/components/SmartPagination';
import { toast } from '@/components/Toast';
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
    const pageSize = 10;

    // Metrics
    const [metrics, setMetrics] = useState({
        total: 0,
        active: 0,
        onboarding: 0,
        suspended: 0
    });

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
        lookupsService.getByCategory('INDUSTRY').then(res => setIndustries((res as any).data || res));
        lookupsService.getByCategory('SECTOR').then(res => setSectors((res as any).data || res));
    }, []);

    useEffect(() => {
        fetchTenants();
    }, [filters]);

    const handleOnboard = async (data: Partial<Tenant>) => {
        setIsLoading(true);
        try {
            await tenantsService.create(data);
            toast.success('✅ Tenant onboarded successfully');
            // setOpened(false); // DEFERRED TO WIZARD SUCCESS SCREEN
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

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header - Access Control Style */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-primary">Tenant Profile</h1>
                    <p className="text-gray-500 mt-1">Enterprise-grade database of IT Park registered organizations</p>
                </div>
                <button
                    onClick={() => setOpened(true)}
                    className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <Plus className="w-5 h-5" />
                    <span>Onboard New Tenant</span>
                </button>
            </div>

            {/* Compact Intelligence Header - Replaces individual metric cards and large stats */}
            <SpatialStats tenantMetrics={metrics} />

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="card p-0 overflow-hidden flex-grow shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            placeholder="Search by company name, registration, or TIN..."
                            className="w-full pl-12 pr-4 py-4 border-none outline-none focus:ring-0 transition-all text-sm font-medium text-gray-700 bg-transparent"
                        />
                    </div>
                </div>
                <div className="w-full md:w-64">
                    <div className="card p-0 overflow-hidden shadow-sm h-full flex items-center bg-white">
                        <Filter className="ml-4 w-4 h-4 text-gray-400" />
                        <select
                            value={filters.industryId}
                            onChange={(e) => setFilters({ ...filters, industryId: e.target.value })}
                            className="w-full py-4 px-3 border-none outline-none focus:ring-0 text-sm font-bold text-gray-600 bg-transparent cursor-pointer"
                        >
                            <option value="">All Industries</option>
                            {industries.map(i => (
                                <option key={i.id} value={i.id}>{i.lookupValue.en}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="w-full md:w-64">
                    <div className="card p-0 overflow-hidden shadow-sm h-full flex items-center bg-white">
                        <Filter className="ml-4 w-4 h-4 text-gray-400" />
                        <select
                            value={filters.sectorId}
                            onChange={(e) => setFilters({ ...filters, sectorId: e.target.value })}
                            className="w-full py-4 px-3 border-none outline-none focus:ring-0 text-sm font-bold text-gray-600 bg-transparent cursor-pointer"
                        >
                            <option value="">All Sectors</option>
                            {sectors.map(s => (
                                <option key={s.id} value={s.id}>{s.lookupValue.en}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabs - Modern Pill Style */}
            <div className="flex gap-4 p-1.5 bg-slate-100/50 rounded-2xl w-fit">
                {[
                    { key: 'all', label: 'All Organizations', count: tenants.length },
                    { key: 'active', label: 'Active', count: metrics.active },
                    { key: 'onboarding', label: 'Onboarding', count: metrics.onboarding },
                    { key: 'suspended', label: 'Suspended', count: metrics.suspended }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2 text-[11px] font-black transition-all rounded-[0.85rem] tracking-wider uppercase ${activeTab === tab.key
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab.label} <span className="ml-1 opacity-50">{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Table - Access Control Style */}
            <div className="border border-slate-200/60 rounded-3xl overflow-hidden bg-white shadow-xl shadow-slate-200/40">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F8FAFC] border-b border-slate-200">
                                <th className="px-6 py-5 text-[10px] font-black text-[#64748B] uppercase tracking-[0.15em] w-[25%]">Organization Entity</th>
                                <th className="px-6 py-5 text-[10px] font-black text-[#64748B] uppercase tracking-[0.15em] w-[15%]">Institutional Industry</th>
                                <th className="px-6 py-5 text-[10px] font-black text-[#64748B] uppercase tracking-[0.15em] w-[15%]">Business Sector</th>
                                <th className="px-6 py-5 text-[10px] font-black text-[#64748B] uppercase tracking-[0.15em] w-[15%]">Interface</th>
                                <th className="px-6 py-5 text-[10px] font-black text-[#64748B] uppercase tracking-[0.15em] w-[15%]">Resources</th>
                                <th className="px-6 py-5 text-[10px] font-black text-[#64748B] uppercase tracking-[0.15em] text-center w-[10%]">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-[#0C7C92] uppercase tracking-[0.15em] text-right w-[10%]">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedTenants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-32 bg-slate-50/50">
                                        <div className="inline-flex p-8 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 mb-6">
                                            <TrendingUp size={56} className="text-slate-200" strokeWidth={1} />
                                        </div>
                                        <p className="text-xl font-black text-slate-800 tracking-tight">System Record Empty</p>
                                        <p className="text-sm text-slate-400 mt-2 font-medium">No tenants match the current filter criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedTenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-teal-50/20 transition-all duration-200 group relative">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-[1rem] bg-white shadow-lg border border-slate-100 flex items-center justify-center text-primary font-black text-sm group-hover:scale-110 transition-transform">
                                                    {tenant.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-[#16284F] text-[14px] leading-tight mb-1">{tenant.name}</div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-wider">REG: {tenant.companyRegNumber}</span>
                                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-50 text-orange-500 uppercase tracking-wider">TIN: {tenant.tinNumber || 'PENDING'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <Sparkles size={14} className="text-teal-400" />
                                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">
                                                    {(tenant as any).industry?.lookupValue?.en || 'UNSPECIFIED'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={14} className="text-blue-400" />
                                                <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">
                                                    {(tenant as any).sector?.lookupValue?.en || (tenant as any).businessCategory?.lookupValue?.en || 'UNSPECIFIED'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-2">
                                                {tenant.email && (
                                                    <a href={`mailto:${tenant.email}`} className="flex items-center gap-2 group/link">
                                                        <div className="p-1 rounded-md bg-slate-50 group-hover/link:bg-blue-50 transition-colors">
                                                            <Mail size={12} className="text-slate-400 group-hover/link:text-blue-500" />
                                                        </div>
                                                        <span className="text-[11px] font-bold text-slate-500 group-hover/link:text-blue-600 truncate max-w-[150px]">{tenant.email}</span>
                                                    </a>
                                                )}
                                                {tenant.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 rounded-md bg-slate-50">
                                                            <Phone size={12} className="text-slate-400" />
                                                        </div>
                                                        <span className="text-[11px] font-bold text-slate-500">{tenant.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <Users size={12} className="text-teal-500" />
                                                    <span className="text-[11px] font-black text-slate-700">{tenant._count?.contacts || 0} Professional Liaisons</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FileText size={12} className="text-orange-500" />
                                                    <span className="text-[11px] font-black text-slate-700">{tenant._count?.documents || 0} Registered Documents</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <TenantStatusBadge statusName={(tenant as any).status?.lookupCode} />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/admin/tms/tenants/${tenant.id}`}
                                                    className="p-2.5 bg-white text-primary border border-slate-200 rounded-xl hover:shadow-lg hover:bg-slate-50 transition-all active:scale-95"
                                                    title="Organization Intelligence"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(tenant.id)}
                                                    className="p-2.5 bg-white text-rose-500 border border-slate-200 rounded-xl hover:shadow-lg hover:bg-rose-50 transition-all active:scale-95"
                                                    title="Deactivate Access"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-6 border-t border-slate-100 bg-[#F8FAFC]/50">
                        <SmartPagination
                            currentPage={page}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalElements={filteredTenants.length}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>

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
