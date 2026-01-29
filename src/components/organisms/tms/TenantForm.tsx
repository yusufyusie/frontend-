import { useState, useEffect, useMemo, useRef } from 'react';
import { Stack, TextInput, Group, Box, LoadingOverlay, Title, Paper, Text, rem, Badge, Select } from '@mantine/core';
import { Building2, FileText, Globe, Phone, Mail, MapPin, Sparkles, Landmark, Briefcase, Activity } from 'lucide-react';
import { Tenant } from '@/services/tenants.service';
import { SystemLookup, lookupsService } from '@/services/lookups.service';
import { geoService, Region, City } from '@/services/geo.service';
import { AtomicLookupSelector } from '@/components/molecules/tms/AtomicLookupSelector';

interface Props {
    initialData?: Partial<Tenant>;
    onSubmit: (data: Partial<Tenant>) => Promise<void>;
    isLoading?: boolean;
    onValidityChange?: (isValid: boolean) => void;
}

export const TenantForm = ({ initialData, onSubmit, isLoading, onValidityChange }: Props) => {
    const [formData, setFormData] = useState<Partial<Tenant>>({
        name: '',
        companyRegNumber: '',
        tinNumber: '',
        businessCategoryId: undefined,
        statusId: undefined,
        email: '',
        phone: '',
        website: '',
        address: '',
        regionId: undefined,
        cityId: undefined,
        ...initialData
    });

    const [bizCategories, setBizCategories] = useState<SystemLookup[]>([]);
    const [statusTypes, setStatusTypes] = useState<SystemLookup[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const lastValidity = useRef<boolean>(false);

    useEffect(() => {
        lookupsService.getByCategory('BUSINESS_SECTORS').then(res => setBizCategories((res as any).data || res || []));
        lookupsService.getByCategory('TENANT_STATUS').then(res => setStatusTypes((res as any).data || res || []));
        geoService.getRegions().then(res => setRegions(res.data || []));
    }, []);

    useEffect(() => {
        if (formData.regionId) {
            geoService.getCities(formData.regionId).then(res => setCities(res.data || []));
        } else {
            setCities([]);
        }
    }, [formData.regionId]);

    useEffect(() => {
        const isValid = Boolean(formData.name && formData.companyRegNumber);
        if (isValid !== lastValidity.current) {
            lastValidity.current = isValid;
            onValidityChange?.(isValid);
        }
    }, [formData.name, formData.companyRegNumber, onValidityChange]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const inputStyles = {
        label: {
            fontWeight: 900,
            color: '#16284F',
            fontSize: rem(12),
            marginBottom: rem(6),
            textTransform: 'uppercase' as const,
            letterSpacing: rem(1)
        },
        input: {
            borderRadius: rem(16),
            height: rem(48),
            fontSize: rem(14),
            border: '2px solid #F1F5F9',
            backgroundColor: '#F8FAFC',
            fontWeight: 700,
            transition: 'all 0.2s ease',
            '&:focus': {
                borderColor: '#16284F',
                backgroundColor: '#fff'
            }
        }
    };

    return (
        <Box pos="relative">
            <LoadingOverlay
                visible={isLoading}
                overlayProps={{ blur: 1, color: '#F8FAFC' }}
                loaderProps={{ color: '#0C7C92', size: 'xl', type: 'bars' }}
            />
            <form id="tenant-form" onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Legal Identity & Corporate Branding */}
                <Paper withBorder p="xl" radius="2rem" className="border-slate-100 bg-white shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F8FAFC] rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />

                    <Group gap="lg" mb="2rem" className="relative z-10">
                        <Box p={14} className="bg-blue-600 shadow-xl shadow-blue-100 rotate-[-2deg] group-hover:rotate-0 transition-transform duration-300" style={{ borderRadius: '1.25rem' }}>
                            <Building2 size={24} className="text-white" />
                        </Box>
                        <div className="flex-1">
                            <Group gap={6} mb={2}>
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <Text size="10px" fw={900} className="text-slate-400 tracking-[0.2em] uppercase">Corporate Entity</Text>
                            </Group>
                            <Title order={3} fw={900} lts="-1px" c="#16284F" className="text-2xl">Legal Identity</Title>
                        </div>
                    </Group>

                    <Stack gap="xl" className="relative z-10">
                        <TextInput
                            label="Official Register Name"
                            placeholder="Enter legal entity name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                            required
                            size="md"
                            styles={inputStyles}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <TextInput
                                label="Trade License #"
                                placeholder="AA/---"
                                leftSection={<FileText size={18} className="text-slate-400" />}
                                value={formData.companyRegNumber}
                                onChange={(e) => setFormData({ ...formData, companyRegNumber: e.currentTarget.value })}
                                required
                                size="md"
                                styles={inputStyles}
                            />
                            <TextInput
                                label="TIN Number"
                                placeholder="10-digit PIN"
                                leftSection={<Landmark size={18} className="text-slate-400" />}
                                value={formData.tinNumber}
                                onChange={(e) => setFormData({ ...formData, tinNumber: e.currentTarget.value })}
                                size="md"
                                styles={inputStyles}
                            />
                        </div>
                    </Stack>
                </Paper>

                {/* 2. Communications & GIS Breadcrumbs */}
                <Paper withBorder p="xl" radius="2rem" className="border-slate-50 bg-[#F8FAFC]/50 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute left-0 top-0 w-1 h-full bg-teal-500/20" />

                    <Group gap="lg" mb="2rem">
                        <Box p={12} bg="white" className="shadow-lg border border-slate-100 text-teal-600" style={{ borderRadius: '1rem' }}>
                            <Globe size={22} strokeWidth={2.5} />
                        </Box>
                        <div>
                            <Text size="10px" fw={900} c="dimmed" tt="uppercase" lts="1.5px">Support & Logistics</Text>
                            <Title order={4} fw={900} c="#16284F">Communications</Title>
                        </div>
                    </Group>

                    <Stack gap="xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <TextInput
                                label="Corporate Email"
                                placeholder="admin@domain.com"
                                leftSection={<Mail size={18} className="text-slate-400" />}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.currentTarget.value })}
                                size="md"
                                styles={inputStyles}
                            />
                            <TextInput
                                label="Primary Contact"
                                placeholder="+251 ..."
                                leftSection={<Phone size={18} className="text-slate-400" />}
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.currentTarget.value })}
                                size="md"
                                styles={inputStyles}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Select
                                label="Region / HQ State"
                                placeholder="Select region"
                                data={regions.map(r => ({ value: r.id.toString(), label: r.name }))}
                                value={formData.regionId?.toString()}
                                onChange={(val) => setFormData({ ...formData, regionId: val ? parseInt(val) : undefined, cityId: undefined })}
                                searchable
                                size="md"
                                radius="xl"
                                styles={inputStyles}
                            />
                            <Select
                                label="City / Operations HQ"
                                placeholder="Select city"
                                data={cities.map(c => ({ value: c.id.toString(), label: c.name }))}
                                value={formData.cityId?.toString()}
                                onChange={(val) => setFormData({ ...formData, cityId: val ? parseInt(val) : undefined })}
                                searchable
                                disabled={!formData.regionId}
                                size="md"
                                radius="xl"
                                styles={inputStyles}
                            />
                        </div>

                        <TextInput
                            label="Detailed Physical Address"
                            placeholder="Plot, Building, Street Information"
                            leftSection={<MapPin size={18} className="text-slate-400" />}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.currentTarget.value })}
                            size="md"
                            styles={inputStyles}
                        />
                    </Stack>
                </Paper>

                {/* 3. High-Fidelity Intelligence & Classification */}
                <Paper withBorder p="xl" radius="2rem" className="border-slate-100 bg-white shadow-2xl shadow-slate-200/20">
                    <Group gap="xs" mb="lg">
                        <Badge variant="light" color="indigo" size="lg" radius="sm">Sectoral Intelligence</Badge>
                        <Text size="xs" fw={700} c="dimmed">Assign industrial and lifecycle metadata</Text>
                    </Group>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <AtomicLookupSelector
                            label="Business Sector"
                            items={bizCategories}
                            value={formData.businessCategoryId ?? null}
                            onChange={(val) => setFormData({ ...formData, businessCategoryId: val })}
                            variant="form"
                        />
                        <AtomicLookupSelector
                            label="Account Status"
                            items={statusTypes}
                            value={formData.statusId ?? null}
                            onChange={(val) => setFormData({ ...formData, statusId: val })}
                            variant="form"
                        />
                    </div>
                </Paper>
            </form>
        </Box >
    );
};
