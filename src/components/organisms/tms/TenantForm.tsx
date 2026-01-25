import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Stack, TextInput, Group, Select, Button, Box, LoadingOverlay, Title, Divider, Paper, Text, rem } from '@mantine/core';
import { Building2, FileText, Globe, Phone, Mail, MapPin, Sparkles, Landmark } from 'lucide-react';
import { Tenant, tenantsService } from '@/services/tenants.service';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { geoService, Region, City } from '@/services/geo.service';

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
        lookupsService.getByCategory('BUSINESS_CATEGORIES').then(res => setBizCategories((res as any).data || res));
        lookupsService.getByCategory('TENANT_STATUS').then(res => setStatusTypes((res as any).data || res));
        geoService.getRegions().then(res => setRegions(res.data || []));
    }, []);

    useEffect(() => {
        if (formData.regionId) {
            geoService.getCities(formData.regionId).then(res => setCities(res.data || []));
        } else {
            setCities([]);
        }
    }, [formData.regionId]);

    const bizCategoryData = useMemo(
        () => bizCategories.map(c => ({ value: c.id.toString(), label: c.lookupValue.en })),
        [bizCategories]
    );

    const statusData = useMemo(
        () => statusTypes.map(s => ({ value: s.id.toString(), label: s.lookupValue.en })),
        [statusTypes]
    );

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
            marginBottom: rem(4),
            textTransform: 'uppercase' as const,
            letterSpacing: rem(0.5)
        },
        input: {
            borderRadius: rem(12),
            height: rem(44),
            fontSize: rem(14),
            border: '2px solid #f1f5f9',
            backgroundColor: '#f8fafc',
            transition: 'all 0.2s ease',
            '&:focus': {
                borderColor: '#0C7C92',
                backgroundColor: '#fff'
            }
        }
    };

    return (
        <Box pos="relative">
            <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
            <form id="tenant-form" onSubmit={handleSubmit}>
                <Stack gap="1.5rem">
                    {/* LEGAL IDENTITY */}
                    <Paper withBorder p="md" radius="2rem" className="border-slate-100 bg-white shadow-sm">
                        <Group gap="xs" mb="lg">
                            <Box p={6} bg="blue.0" style={{ borderRadius: '50%' }}>
                                <Sparkles size={14} className="text-blue-600" />
                            </Box>
                            <Text size="xs" fw={900} c="#16284F" tt="uppercase" lts="1.5px">Legal Identity</Text>
                        </Group>

                        <Stack gap="lg">
                            <TextInput
                                label="Official Company Name"
                                placeholder="Enter legal entity name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                                required
                                size="md"
                                styles={inputStyles}
                            />

                            <Group grow gap="xl">
                                <TextInput
                                    label="Trade License #"
                                    placeholder="ET/AA/---"
                                    leftSection={<FileText size={18} className="text-slate-400" />}
                                    value={formData.companyRegNumber}
                                    onChange={(e) => setFormData({ ...formData, companyRegNumber: e.currentTarget.value })}
                                    required
                                    size="md"
                                    styles={inputStyles}
                                />
                                <TextInput
                                    label="TIN Number"
                                    placeholder="10-digit number"
                                    value={formData.tinNumber}
                                    onChange={(e) => setFormData({ ...formData, tinNumber: e.currentTarget.value })}
                                    size="md"
                                    styles={inputStyles}
                                />
                            </Group>
                        </Stack>
                    </Paper>

                    {/* COMMUNICATIONS */}
                    <Paper withBorder p="md" radius="2rem" className="border-slate-50 bg-[#F8FAFC]/50 backdrop-blur-xl">
                        <Group gap="sm" mb="xl">
                            <Box p={8} bg="teal.0" style={{ borderRadius: '50%' }}>
                                <Globe size={18} className="text-teal-600" />
                            </Box>
                            <Text size="sm" fw={900} c="#16284F" tt="uppercase" lts="2px">Communications</Text>
                        </Group>

                        <Stack gap="xl">
                            <Group grow gap="xl">
                                <TextInput
                                    label="Public Email"
                                    placeholder="admin@company.com"
                                    leftSection={<Mail size={18} className="text-slate-400" />}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.currentTarget.value })}
                                    size="md"
                                    styles={inputStyles}
                                />
                                <TextInput
                                    label="Primary Phone"
                                    placeholder="+251 --- ---"
                                    leftSection={<Phone size={18} className="text-slate-400" />}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.currentTarget.value })}
                                    size="md"
                                    styles={inputStyles}
                                />
                            </Group>
                            <Group grow gap="xl">
                                <Select
                                    label="Region / State"
                                    placeholder="Select region"
                                    data={regions.map(r => ({ value: r.id.toString(), label: r.name }))}
                                    value={formData.regionId?.toString()}
                                    onChange={(val) => setFormData({ ...formData, regionId: val ? parseInt(val) : undefined, cityId: undefined })}
                                    leftSection={<Landmark size={18} className="text-slate-400" />}
                                    size="md"
                                    styles={inputStyles}
                                    searchable
                                />
                                <Select
                                    label="City / District"
                                    placeholder="Select city"
                                    data={cities.map(c => ({ value: c.id.toString(), label: c.name }))}
                                    value={formData.cityId?.toString()}
                                    onChange={(val) => setFormData({ ...formData, cityId: val ? parseInt(val) : undefined })}
                                    leftSection={<MapPin size={18} className="text-slate-400" />}
                                    size="md"
                                    styles={inputStyles}
                                    searchable
                                    disabled={!formData.regionId}
                                />
                            </Group>
                            <TextInput
                                label="Detailed Physical Address"
                                placeholder="Plot #, Building, Street"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.currentTarget.value })}
                                size="md"
                                styles={inputStyles}
                            />
                        </Stack>
                    </Paper>

                    {/* CLASSIFICATION */}
                    <Paper withBorder p="md" radius="2rem" className="border-slate-100 bg-white">
                        <Group grow gap="xl">
                            <Select
                                label="Core Business Sector"
                                data={bizCategoryData}
                                value={formData.businessCategoryId?.toString()}
                                onChange={(val) => setFormData({ ...formData, businessCategoryId: val ? parseInt(val) : undefined })}
                                size="md"
                                styles={inputStyles}
                                placeholder="Select industrial sector"
                            />
                            <Select
                                label="Tenant Account Status"
                                data={statusData}
                                value={formData.statusId?.toString()}
                                onChange={(val) => setFormData({ ...formData, statusId: val ? parseInt(val) : undefined })}
                                size="md"
                                styles={inputStyles}
                                placeholder="Assign lifecycle status"
                            />
                        </Group>
                    </Paper>
                </Stack>
            </form>
        </Box>
    );
};
