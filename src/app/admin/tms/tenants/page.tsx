'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, RefreshCw, Eye, Edit, Trash2, MoreVertical, Users, Building2, FileText, TrendingUp, Mail, Phone, ExternalLink, X, Save } from 'lucide-react';
import { Button, Group } from '@mantine/core';
import { tenantsService, Tenant } from '@/services/tenants.service';
import { TenantForm } from '@/components/organisms/tms/TenantForm';
import { TenantStatusBadge } from '@/components/atoms/tms/TenantStatusBadge';
import { Modal } from '@/components/Modal';
import { toast } from '@/components/Toast';
import Link from 'next/link';

export default function TenantDirectoryPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [opened, setOpened] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [filters, setFilters] = useState({ search: '', statusId: '', category: '' });
    const [activeTab, setActiveTab] = useState('all');

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
        fetchTenants();
    }, [filters]);

    const handleOnboard = async (data: Partial<Tenant>) => {
        setIsLoading(true);
        try {
            await tenantsService.create(data);
            toast.success('✅ Tenant onboarded successfully');
            setOpened(false);
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

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header - Access Control Style */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-primary">Tenant Directory</h1>
                    <p className="text-gray-500 mt-1">Centralized database for IT Park registered companies</p>
                </div>
                <button
                    onClick={() => {
                        setOpened(true);
                        setIsFormValid(false);
                    }}
                    className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <Plus className="w-5 h-5" />
                    <span>Onboard New Tenant</span>
                </button>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Tenants</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{metrics.total}</p>
                        </div>
                        <Users className="w-10 h-10 text-primary/20" />
                    </div>
                </div>
                <div className="card p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</p>
                            <p className="text-2xl font-black text-success mt-1">{metrics.active}</p>
                        </div>
                        <Building2 className="w-10 h-10 text-success/20" />
                    </div>
                </div>
                <div className="card p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Onboarding</p>
                            <p className="text-2xl font-black text-warning mt-1">{metrics.onboarding}</p>
                        </div>
                        <FileText className="w-10 h-10 text-warning/20" />
                    </div>
                </div>
                <div className="card p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Suspended</p>
                            <p className="text-2xl font-black text-error mt-1">{metrics.suspended}</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-error/20" />
                    </div>
                </div>
            </div>

            {/* Search Filter */}
            <div className="card p-0 overflow-hidden">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        placeholder="Search by company name, registration, or TIN..."
                        className="w-full pl-12 pr-4 py-4 border-none outline-none focus:ring-0 transition-all text-gray-700 bg-transparent"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {[
                    { key: 'all', label: 'All', count: tenants.length },
                    { key: 'active', label: 'Active', count: metrics.active },
                    { key: 'onboarding', label: 'Onboarding', count: metrics.onboarding },
                    { key: 'suspended', label: 'Suspended', count: metrics.suspended }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === tab.key
                            ? 'text-primary border-primary'
                            : 'text-gray-400 border-transparent hover:text-gray-600'
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Table - Access Control Style */}
            <div className="card p-0 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company Info</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sector</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Basics</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assets</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTenants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-12 text-gray-400 italic">
                                        No matching tenant records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredTenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                                    {tenant.nameEn.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 leading-tight">{tenant.nameEn}</div>
                                                    <div className="text-[10px] font-mono text-gray-400 mt-0.5">REG: {tenant.companyRegNumber}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100 uppercase tracking-tighter">
                                                {(tenant as any).businessCategory?.lookupValue?.en || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                {tenant.email && (
                                                    <div className="flex items-center gap-1">
                                                        <Mail size={10} className="text-gray-400" />
                                                        <span className="text-xs text-gray-600">{tenant.email}</span>
                                                    </div>
                                                )}
                                                {tenant.phone && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone size={10} className="text-gray-400" />
                                                        <span className="text-xs text-gray-600">{tenant.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold">
                                                    {tenant._count?.contacts || 0} Liaisons
                                                </span>
                                                <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 text-[10px] font-bold">
                                                    {tenant._count?.documents || 0} Docs
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <TenantStatusBadge statusName={(tenant as any).status?.lookupCode} />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={`/admin/tms/tenants/${tenant.id}`}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                    title="View Profile"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(tenant.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Deactivate Account"
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
            </div>

            {/* Branded Modal */}
            <Modal
                isOpen={opened}
                onClose={() => setOpened(false)}
                title="Register New Tenant"
                description="Onboarding Workflow"
                size="xl"
                footer={
                    <Group justify="flex-end" gap="md">
                        <Button
                            variant="subtle"
                            color="gray"
                            onClick={() => setOpened(false)}
                            leftSection={<X size={18} />}
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
                                document.getElementById('tenant-form')?.dispatchEvent(
                                    new Event('submit', { cancelable: true, bubbles: true })
                                );
                            }}
                            disabled={!isFormValid}
                            leftSection={<Save size={18} />}
                            radius="xl"
                            size="md"
                            className={`shadow-lg shadow-teal-100 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Save Tenant Profile
                        </Button>
                    </Group>
                }
            >
                <TenantForm onSubmit={handleOnboard} isLoading={isLoading} onValidityChange={setIsFormValid} />
            </Modal>
        </div>
    );
}
