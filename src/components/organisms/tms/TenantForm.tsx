import { useState, useEffect } from 'react';
import { Stack, TextInput, Group, Select, Button, Box, LoadingOverlay, Title, Divider, Paper, Text } from '@mantine/core';
import { Save, Building2, FileText, Globe, Phone, Mail, MapPin } from 'lucide-react';
import { Tenant, tenantsService } from '@/services/tenants.service';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { MultiLangInput } from '@/components/molecules/tms/MultiLangInput';

interface Props {
    initialData?: Partial<Tenant>;
    onSubmit: (data: Partial<Tenant>) => Promise<void>;
    isLoading?: boolean;
    onValidityChange?: (isValid: boolean) => void;
}

export const TenantForm = ({ initialData, onSubmit, isLoading, onValidityChange }: Props) => {
    const [formData, setFormData] = useState<Partial<Tenant>>({
        nameEn: '',
        companyRegNumber: '',
        tinNumber: '',
        businessCategoryId: undefined,
        statusId: undefined,
        email: '',
        phone: '',
        website: '',
        address: '',
        ...initialData
    });

    const [bizCategories, setBizCategories] = useState<SystemLookup[]>([]);
    const [statusTypes, setStatusTypes] = useState<SystemLookup[]>([]);

    useEffect(() => {
        lookupsService.getByCategory('BUSINESS_CATEGORIES').then(res => setBizCategories((res as any).data || res));
        lookupsService.getByCategory('TENANT_STATUS').then(res => setStatusTypes((res as any).data || res));
    }, []);

    // Validation Effect
    useEffect(() => {
        const isValid = Boolean(
            formData.nameEn &&
            formData.companyRegNumber
        );
        onValidityChange?.(isValid);
    }, [formData, onValidityChange]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <Box pos="relative">
            <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
            <form id="tenant-form" onSubmit={handleSubmit}>
                <Stack gap="xl">
                    {/* Identity Section */}
                    <Paper withBorder p="lg" radius="2rem" shadow="sm" className="border-slate-100">
                        <Group gap="md" mb="xl">
                            <Box p={12} bg="#0C7C92" style={{ borderRadius: '1rem' }} className="shadow-lg shadow-teal-100">
                                <Building2 size={24} className="text-white" />
                            </Box>
                            <div>
                                <Title order={4} fw={800} lts="-0.5px" c="#16284F" style={{ display: 'inline-block', marginRight: '0.75rem' }}>Company Identity</Title>
                                <Text span size="xs" c="dimmed" fw={700} tt="uppercase" lts="1px">Legal & Registration</Text>
                            </div>
                        </Group>

                        <Stack gap="lg">
                            <TextInput
                                label="Company Name (English)"
                                value={formData.nameEn}
                                onChange={(e) => setFormData({ ...formData, nameEn: e.currentTarget.value })}
                                required
                                radius="xl"
                                size="md"
                                styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                            />
                            <Group grow>
                                <TextInput
                                    label="Registration Number"
                                    placeholder="e.g. ET/AA/12345"
                                    leftSection={<FileText size={18} />}
                                    value={formData.companyRegNumber}
                                    onChange={(e) => setFormData({ ...formData, companyRegNumber: e.currentTarget.value })}
                                    required
                                    radius="xl"
                                    size="md"
                                    styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                                />
                                <TextInput
                                    label="TIN Number"
                                    placeholder="10 digits"
                                    value={formData.tinNumber}
                                    onChange={(e) => setFormData({ ...formData, tinNumber: e.currentTarget.value })}
                                    radius="xl"
                                    size="md"
                                    styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                                />
                            </Group>
                        </Stack>
                    </Paper>

                    {/* Contact Section */}
                    <Paper withBorder p="lg" radius="2rem" shadow="sm" className="border-slate-100">
                        <Group gap="md" mb="xl">
                            <Box p={12} bg="#0C7C92" style={{ borderRadius: '1rem' }} className="shadow-lg shadow-teal-100">
                                <Globe size={24} className="text-white" />
                            </Box>
                            <div>
                                <Title order={4} fw={800} lts="-0.5px" c="#16284F" style={{ display: 'inline-block', marginRight: '0.75rem' }}>Contact Details</Title>
                                <Text span size="xs" c="dimmed" fw={700} tt="uppercase" lts="1px">Communication Channels</Text>
                            </div>
                        </Group>

                        <Stack gap="lg">
                            <Group grow>
                                <TextInput
                                    label="Public Email"
                                    leftSection={<Mail size={18} />}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.currentTarget.value })}
                                    radius="xl"
                                    size="md"
                                    styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                                />
                                <TextInput
                                    label="Public Phone"
                                    leftSection={<Phone size={18} />}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.currentTarget.value })}
                                    radius="xl"
                                    size="md"
                                    styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                                />
                            </Group>
                            <TextInput
                                label="Website"
                                placeholder="https://"
                                leftSection={<Globe size={18} />}
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.currentTarget.value })}
                                radius="xl"
                                size="md"
                                styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                            />
                            <TextInput
                                label="Physical Address"
                                leftSection={<MapPin size={18} />}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.currentTarget.value })}
                                radius="xl"
                                size="md"
                                styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                            />
                        </Stack>
                    </Paper>

                    {/* Classification Section */}
                    <Paper withBorder p="lg" radius="2rem" shadow="sm" className="border-slate-100">
                        <Group gap="md" mb="xl">
                            <Box p={12} bg="#0C7C92" style={{ borderRadius: '1rem' }} className="shadow-lg shadow-teal-100">
                                <FileText size={24} className="text-white" />
                            </Box>
                            <div>
                                <Title order={4} fw={800} lts="-0.5px" c="#16284F" style={{ display: 'inline-block', marginRight: '0.75rem' }}>Categorization</Title>
                                <Text span size="xs" c="dimmed" fw={700} tt="uppercase" lts="1px">Business Classification</Text>
                            </div>
                        </Group>

                        <Group grow>
                            <Select
                                label="Business Category"
                                data={bizCategories.map(c => ({ value: c.id.toString(), label: c.lookupValue.en }))}
                                value={formData.businessCategoryId?.toString()}
                                onChange={(val) => setFormData({ ...formData, businessCategoryId: val ? parseInt(val) : undefined })}
                                radius="xl"
                                size="md"
                                styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                            />
                            <Select
                                label="Onboarding Status"
                                data={statusTypes.map(s => ({ value: s.id.toString(), label: s.lookupValue.en }))}
                                value={formData.statusId?.toString()}
                                onChange={(val) => setFormData({ ...formData, statusId: val ? parseInt(val) : undefined })}
                                radius="xl"
                                size="md"
                                styles={{ label: { fontWeight: 700, color: '#16284F' } }}
                            />
                        </Group>
                    </Paper>
                </Stack>
            </form>
        </Box>
    );
};
