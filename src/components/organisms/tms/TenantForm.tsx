import { useState, useEffect } from 'react';
import { Stack, TextInput, Group, Select, Button, Box, LoadingOverlay, Title, Divider } from '@mantine/core';
import { Save, Building2, FileText, Globe, Phone, Mail, MapPin } from 'lucide-react';
import { Tenant, tenantsService } from '@/services/tenants.service';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { MultiLangInput } from '@/components/molecules/tms/MultiLangInput';

interface Props {
    initialData?: Partial<Tenant>;
    onSubmit: (data: Partial<Tenant>) => Promise<void>;
    isLoading?: boolean;
}

export const TenantForm = ({ initialData, onSubmit, isLoading }: Props) => {
    const [formData, setFormData] = useState<Partial<Tenant>>({
        nameEn: '',
        nameAm: '',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <Box pos="relative">
            <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
            <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                    <Box>
                        <Group gap="xs" mb="xs">
                            <Building2 size={20} className="text-blue-600" />
                            <Title order={5}>Company Identification</Title>
                        </Group>
                        <Stack gap="sm">
                            <TextInput
                                label="Company Name (English)"
                                value={formData.nameEn}
                                onChange={(e) => setFormData({ ...formData, nameEn: e.currentTarget.value })}
                                required
                            />
                            <TextInput
                                label="Company Name (Amharic)"
                                value={formData.nameAm}
                                onChange={(e) => setFormData({ ...formData, nameAm: e.currentTarget.value })}
                            />
                            <Group grow>
                                <TextInput
                                    label="Registration Number"
                                    placeholder="e.g. ET/AA/12345"
                                    leftSection={<FileText size={16} />}
                                    value={formData.companyRegNumber}
                                    onChange={(e) => setFormData({ ...formData, companyRegNumber: e.currentTarget.value })}
                                    required
                                />
                                <TextInput
                                    label="TIN Number"
                                    placeholder="10 digits"
                                    value={formData.tinNumber}
                                    onChange={(e) => setFormData({ ...formData, tinNumber: e.currentTarget.value })}
                                />
                            </Group>
                        </Stack>
                    </Box>

                    <Divider />

                    <Box>
                        <Group gap="xs" mb="xs">
                            <Globe size={20} className="text-orange-600" />
                            <Title order={5}>Contact Information</Title>
                        </Group>
                        <Stack gap="sm">
                            <Group grow>
                                <TextInput
                                    label="Public Email"
                                    leftSection={<Mail size={16} />}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.currentTarget.value })}
                                />
                                <TextInput
                                    label="Public Phone"
                                    leftSection={<Phone size={16} />}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.currentTarget.value })}
                                />
                            </Group>
                            <TextInput
                                label="Website"
                                placeholder="https://"
                                leftSection={<Globe size={16} />}
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.currentTarget.value })}
                            />
                            <TextInput
                                label="Physical Address"
                                leftSection={<MapPin size={16} />}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.currentTarget.value })}
                            />
                        </Stack>
                    </Box>

                    <Divider />

                    <Box>
                        <Title order={5} mb="xs">Categorization</Title>
                        <Group grow>
                            <Select
                                label="Business Category"
                                data={bizCategories.map(c => ({ value: c.id.toString(), label: c.lookupValue.en }))}
                                value={formData.businessCategoryId?.toString()}
                                onChange={(val) => setFormData({ ...formData, businessCategoryId: val ? parseInt(val) : undefined })}
                            />
                            <Select
                                label="Onboarding Status"
                                data={statusTypes.map(s => ({ value: s.id.toString(), label: s.lookupValue.en }))}
                                value={formData.statusId?.toString()}
                                onChange={(val) => setFormData({ ...formData, statusId: val ? parseInt(val) : undefined })}
                            />
                        </Group>
                    </Box>

                    <Group justify="flex-end" mt="xl">
                        <Button
                            type="submit"
                            leftSection={<Save size={18} />}
                            loading={isLoading}
                            size="md"
                            bg="blue"
                        >
                            Save Tenant Profile
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Box>
    );
};
