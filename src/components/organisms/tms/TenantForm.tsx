import { useState, useEffect, useMemo, useRef } from 'react';
import { Stack, TextInput, Group, Box, LoadingOverlay, Title, Paper, Text, rem, Badge, Select, Switch } from '@mantine/core';
import { Building2, FileText, Globe, Phone, Mail, MapPin, Sparkles, Landmark, Rocket } from 'lucide-react';
import { Tenant } from '@/services/tenants.service';
import { SystemLookup, lookupsService } from '@/services/lookups.service';
import { geoService, Region, City } from '@/services/geo.service';
import { AtomicLookupSelector } from '@/components/molecules/tms/AtomicLookupSelector';

interface Props {
    initialData?: Partial<Tenant>;
    onSubmit: (data: Partial<Tenant>) => Promise<void>;
    onChange?: (data: Partial<Tenant>) => void;
    isLoading?: boolean;
    onValidityChange?: (isValid: boolean) => void;
}

export const TenantForm = ({ initialData, onSubmit, onChange, isLoading, onValidityChange }: Props) => {
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
    const [investmentOrigins, setInvestmentOrigins] = useState<SystemLookup[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const lastValidity = useRef<boolean>(false);

    useEffect(() => {
        onChange?.(formData);
    }, [formData, onChange]);

    useEffect(() => {
        lookupsService.getByCategory('BUSINESS_SECTORS').then(res => setBizCategories((res as any).data || res || []));
        lookupsService.getByCategory('TENANT_STATUS').then(res => setStatusTypes((res as any).data || res || []));
        lookupsService.getByCategory('INVESTMENT_ORIGIN').then(res => setInvestmentOrigins((res as any).data || res || []));
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
            fontWeight: 800,
            color: '#16284F',
            fontSize: rem(11),
            marginBottom: rem(8),
            textTransform: 'uppercase' as const,
            letterSpacing: rem(1.5),
            opacity: 0.8
        },
        input: {
            borderRadius: rem(12),
            height: rem(54),
            fontSize: rem(15),
            border: '2px solid #E2E8F0',
            backgroundColor: '#fff',
            fontWeight: 600,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            paddingLeft: rem(20),
            '&:focus': {
                borderColor: '#0C7C92',
                boxShadow: '0 0 0 4px rgba(12, 124, 146, 0.05)'
            },
            '&::placeholder': {
                color: '#94A3B8',
                fontWeight: 500
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
                <Paper p="2.5rem" radius="2.5rem" bg="white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.03)' }} className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/30 rounded-bl-[10rem] -mr-12 -mt-12 transition-transform group-hover:scale-110 duration-700" />

                    <Group gap="xl" mb="2.5rem" className="relative z-10">
                        <Box p={16} bg="#16284F" className="shadow-lg" style={{ borderRadius: '1.5rem' }}>
                            <Building2 size={26} className="text-white" />
                        </Box>
                        <div className="flex-1">
                            <Badge color="blue" variant="light" size="sm" radius="sm" fw={900} mb={6} className="tracking-widest">OFFICIAL REGISTRY</Badge>
                            <Title order={3} fw={900} lts="-1px" c="#16284F" className="text-2xl">Company Registration</Title>
                        </div>
                    </Group>

                    <Stack gap="2rem" className="relative z-10">
                        <TextInput
                            label="Official Register Name (Legal Entity)"
                            placeholder="Enter legal entity name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                            required
                            size="md"
                            styles={inputStyles}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <TextInput
                                label="Trade License / Registration #"
                                placeholder="AA/---"
                                leftSection={<FileText size={18} className="text-[#0C7C92]" />}
                                value={formData.companyRegNumber}
                                onChange={(e) => setFormData({ ...formData, companyRegNumber: e.currentTarget.value })}
                                required
                                size="md"
                                styles={inputStyles}
                            />
                            <TextInput
                                label="Tax Identification Number (TIN)"
                                placeholder="10-digit PIN"
                                leftSection={<Landmark size={18} className="text-[#0C7C92]" />}
                                value={formData.tinNumber}
                                onChange={(e) => setFormData({ ...formData, tinNumber: e.currentTarget.value })}
                                size="md"
                                styles={inputStyles}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
                            <AtomicLookupSelector
                                label="Investment Origin"
                                items={investmentOrigins}
                                value={(formData as any).metadata?.originId ?? null}
                                onChange={(val) => setFormData({
                                    ...formData,
                                    metadata: { ...(formData.metadata || {}), originId: val }
                                })}
                                variant="form"
                            />
                            <Paper p="md" radius="xl" bg="#F8FAFC" style={{ border: '2px solid #E2E8F0', height: rem(54), display: 'flex', alignItems: 'center' }}>
                                <Group justify="space-between" w="100%" px="xs">
                                    <Group gap="xs">
                                        <Rocket size={18} className="text-[#0C7C92]" />
                                        <Text size="sm" fw={800} c="#16284F">Startup Status</Text>
                                    </Group>
                                    <Switch
                                        size="md"
                                        color="teal"
                                        checked={(formData as any).metadata?.isStartup || false}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            metadata: { ...(formData.metadata || {}), isStartup: e.currentTarget.checked }
                                        })}
                                    />
                                </Group>
                            </Paper>
                        </div>
                    </Stack>
                </Paper>

                {/* 2. Communications & GIS Breadcrumbs */}
                <Paper p="2.5rem" radius="2.5rem" bg="white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.03)' }} className="relative overflow-hidden">
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-[#0C7C92]/30" />

                    <Group gap="xl" mb="2.5rem">
                        <Box p={16} bg="#F1F5F9" className="text-[#0C7C92]" style={{ borderRadius: '1.5rem' }}>
                            <Globe size={26} strokeWidth={2.5} />
                        </Box>
                        <div>
                            <Badge color="teal" variant="light" size="sm" radius="sm" fw={900} mb={6} className="tracking-widest">SITE LOGISTICS</Badge>
                            <Title order={3} fw={900} c="#16284F" className="text-2xl">Site & Location</Title>
                        </div>
                    </Group>

                    <Stack gap="2.5rem">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <TextInput
                                label="Corporate Contact Email"
                                placeholder="admin@domain.com"
                                leftSection={<Mail size={18} className="text-[#0C7C92]" />}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.currentTarget.value })}
                                size="md"
                                styles={inputStyles}
                            />
                            <TextInput
                                label="Primary Operational Phone"
                                placeholder="+251 ..."
                                leftSection={<Phone size={18} className="text-[#0C7C92]" />}
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.currentTarget.value })}
                                size="md"
                                styles={inputStyles}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <Select
                                label="Regional Presence"
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
                                label="Operational City"
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
                            label="Detailed Physical Address (Plot/Street)"
                            placeholder="Plot, Building, Street Information"
                            leftSection={<MapPin size={18} className="text-[#0C7C92]" />}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.currentTarget.value })}
                            size="md"
                            styles={inputStyles}
                        />
                    </Stack>
                </Paper>

                {/* 3. Financial Identity & Compliance */}
                <Paper p="2.5rem" radius="2.5rem" bg="white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.03)' }} className="relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-2 h-full bg-orange-100" />

                    <Group gap="xl" mb="2.5rem">
                        <Box p={16} bg="#FFFBEB" className="text-orange-600" style={{ borderRadius: '1.5rem' }}>
                            <Landmark size={26} strokeWidth={2.5} />
                        </Box>
                        <div>
                            <Badge color="orange" variant="light" size="sm" radius="sm" fw={900} mb={6} className="tracking-widest">FINANCIAL REGISTRY</Badge>
                            <Title order={3} fw={900} c="#16284F" className="text-2xl">Financial Identity</Title>
                        </div>
                    </Group>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <TextInput
                            label="Primary Bank Entity"
                            placeholder="Commercial Bank of Ethiopia, etc."
                            leftSection={<Building2 size={18} className="text-orange-500" />}
                            value={(formData as any).metadata?.bankName || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                metadata: { ...(formData.metadata || {}), bankName: e.currentTarget.value }
                            })}
                            size="md"
                            styles={inputStyles}
                        />
                        <TextInput
                            label="Operational Account Number"
                            placeholder="Account for billing & lease payments"
                            leftSection={<FileText size={18} className="text-orange-500" />}
                            value={(formData as any).metadata?.bankAccount || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                metadata: { ...(formData.metadata || {}), bankAccount: e.currentTarget.value }
                            })}
                            size="md"
                            styles={inputStyles}
                        />
                    </div>
                </Paper>

                {/* 4. High-Fidelity Intelligence & Classification */}
                <Paper p="2.5rem" radius="2.5rem" bg="#16284F" style={{ boxShadow: '0 20px 60px -10px rgba(22, 40, 79, 0.3)' }} className="relative overflow-hidden group">
                    <Box pos="absolute" bottom={-20} right={-20} style={{ opacity: 0.05 }} className="group-hover:scale-110 transition-transform duration-[2s]">
                        <Sparkles size={160} className="text-white" />
                    </Box>

                    <Group gap="sm" mb="2.5rem">
                        <Badge variant="filled" color="#0C7C92" size="lg" radius="sm" fw={900}>Sectors</Badge>
                        <Text size="xs" fw={700} c="rgba(255,255,255,0.4)" tt="uppercase" lts="2px">Business Classification</Text>
                    </Group>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <AtomicLookupSelector
                            label="Industrial Sector"
                            items={bizCategories}
                            value={formData.businessCategoryId ?? null}
                            onChange={(val) => setFormData({ ...formData, businessCategoryId: val })}
                            variant="form"
                        />
                        <AtomicLookupSelector
                            label="Operational Status"
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
