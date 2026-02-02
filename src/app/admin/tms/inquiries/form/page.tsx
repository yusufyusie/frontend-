'use client';

import { useState, useEffect } from 'react';
import { Group, Stack, Text, Box, Paper, Title, Button, TextInput, Select, NumberInput, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Mail, Calendar, MapPin, Building2, LayoutGrid, DollarSign, Clock, Send, Sparkles } from 'lucide-react';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { tenantsService, Tenant } from '@/services/tenants.service';
import { inquiriesService } from '@/services/inquiries.service';
import { toast } from '@/components/Toast';
import { useRouter } from 'next/navigation';

export default function InquiryFormPage() {
    const router = useRouter();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [furnitureTypes, setFurnitureTypes] = useState<SystemLookup[]>([]);
    const [officeLayouts, setOfficeLayouts] = useState<SystemLookup[]>([]);
    const [propertyTypes, setPropertyTypes] = useState<SystemLookup[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        tenantId: '',
        propertyTypeId: '',
        minArea: 0,
        maxArea: 0,
        minBaseRent: 0,
        preferredMoveIn: '',
        furnitureStatusId: '',
        officeSpreadId: '',
        leaseTermMonths: 12,
        note: '',
    });

    useEffect(() => {
        tenantsService.getAll().then(res => setTenants((res as any).data || res));
        lookupsService.getByCategory('OFFICE_SPREAD_TYPES').then(res => setOfficeLayouts((res as any).data || res));
        lookupsService.getByCategory('FURNITURE_TYPES').then(res => setFurnitureTypes((res as any).data || res));
        lookupsService.getByCategory('PROPERTY_TYPES').then(res => setPropertyTypes((res as any).data || res));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await inquiriesService.create({
                ...formData,
                tenantId: Number(formData.tenantId),
                propertyTypeId: formData.propertyTypeId ? Number(formData.propertyTypeId) : undefined,
                furnitureStatusId: formData.furnitureStatusId ? Number(formData.furnitureStatusId) : undefined,
                officeSpreadId: formData.officeSpreadId ? Number(formData.officeSpreadId) : undefined,
            });
            toast.success('🚀 Inquiry submitted successfully! Moving to analysis.');
            router.push('/admin/tms/inquiries');
        } catch (e) {
            toast.error('Failed to submit inquiry');
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = {
        label: { fontWeight: 800, color: '#16284F', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
        input: { borderRadius: '12px', border: '2px solid #f1f5f9', backgroundColor: '#f8fafc' }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
            <div className="text-center space-y-2">
                <Title order={1} className="text-4xl font-black text-[#16284F]">Institutional Requirement Intake</Title>
                <Text fw={600} c="dimmed">Complete the formal requirement profiling for strategic ITPC matching</Text>
            </div>

            <form onSubmit={handleSubmit}>
                <Stack gap="xl">
                    {/* Basic Identity */}
                    <Paper p="xl" radius="2rem" withBorder className="border-slate-100 bg-white shadow-xl">
                        <Group gap="xs" mb="xl">
                            <Box p={8} bg="blue.0" style={{ borderRadius: '50%' }}><Sparkles size={18} className="text-blue-600" /></Box>
                            <Text size="sm" fw={900} c="#16284F" tt="uppercase" lts="2px">Strategic Identity</Text>
                        </Group>

                        <Stack gap="lg">
                            <Select
                                label="Requesting Organization"
                                placeholder="Select registered tenant"
                                data={tenants.map(t => ({ value: t.id.toString(), label: t.name }))}
                                value={formData.tenantId}
                                onChange={(val) => setFormData({ ...formData, tenantId: val || '' })}
                                required
                                styles={inputStyles}
                                searchable
                            />
                            <Select
                                label="Intended Property Class"
                                placeholder="Select spatial category"
                                data={propertyTypes.map(p => ({ value: p.id.toString(), label: p.lookupValue.en }))}
                                value={formData.propertyTypeId}
                                onChange={(val) => setFormData({ ...formData, propertyTypeId: val || '' })}
                                styles={inputStyles}
                            />
                        </Stack>
                    </Paper>

                    {/* Spatial & Layout Requirements */}
                    <Paper p="xl" radius="2rem" withBorder className="border-slate-100 bg-white shadow-xl">
                        <Group gap="xs" mb="xl">
                            <Box p={8} bg="teal.0" style={{ borderRadius: '50%' }}><LayoutGrid size={18} className="text-teal-600" /></Box>
                            <Text size="sm" fw={900} c="#16284F" tt="uppercase" lts="2px">Spatial Requirements</Text>
                        </Group>

                        <Group grow align="start" gap="xl">
                            <Stack gap="lg">
                                <Group grow>
                                    <NumberInput
                                        label="Min Area (m²)"
                                        placeholder="0"
                                        value={formData.minArea}
                                        onChange={(val) => setFormData({ ...formData, minArea: Number(val) })}
                                        styles={inputStyles}
                                    />
                                    <NumberInput
                                        label="Max Area (m²)"
                                        placeholder="No limit"
                                        value={formData.maxArea}
                                        onChange={(val) => setFormData({ ...formData, maxArea: Number(val) })}
                                        styles={inputStyles}
                                    />
                                </Group>
                                <Select
                                    label="Office Layout Preference"
                                    placeholder="Select configuration"
                                    data={officeLayouts.map(o => ({ value: o.id.toString(), label: o.lookupValue.en }))}
                                    value={formData.officeSpreadId}
                                    onChange={(val) => setFormData({ ...formData, officeSpreadId: val || '' })}
                                    styles={inputStyles}
                                />
                            </Stack>
                            <Stack gap="lg">
                                <NumberInput
                                    label="Target Rent (Monthly)"
                                    placeholder="ETB / USD"
                                    leftSection={<DollarSign size={16} />}
                                    value={formData.minBaseRent}
                                    onChange={(val) => setFormData({ ...formData, minBaseRent: Number(val) })}
                                    styles={inputStyles}
                                />
                                <Select
                                    label="Furnishing Requirement"
                                    placeholder="Select preference"
                                    data={furnitureTypes.map(f => ({ value: f.id.toString(), label: f.lookupValue.en }))}
                                    value={formData.furnitureStatusId}
                                    onChange={(val) => setFormData({ ...formData, furnitureStatusId: val || '' })}
                                    styles={inputStyles}
                                />
                            </Stack>
                        </Group>
                    </Paper>

                    {/* Timeline & Notes */}
                    <Paper p="xl" radius="2rem" withBorder className="border-slate-100 bg-white shadow-xl">
                        <Group grow align="start" gap="xl">
                            <Stack gap="lg" className="w-1/2">
                                <TextInput
                                    label="Preferred Move-in Date"
                                    type="date"
                                    placeholder="YYYY-MM-DD"
                                    value={formData.preferredMoveIn}
                                    onChange={(e) => setFormData({ ...formData, preferredMoveIn: e.target.value })}
                                    styles={inputStyles}
                                />
                                <NumberInput
                                    label="Lease Term (Months)"
                                    value={formData.leaseTermMonths}
                                    onChange={(val) => setFormData({ ...formData, leaseTermMonths: Number(val) })}
                                    styles={inputStyles}
                                />
                            </Stack>
                            <Textarea
                                label="Operational Notes / Specific Amenities"
                                placeholder="I.e. Near server room, specific ventilation needs..."
                                className="flex-grow"
                                rows={5}
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                styles={inputStyles}
                            />
                        </Group>
                    </Paper>

                    <Button
                        type="submit"
                        size="xl"
                        radius="xl"
                        bg="#0C7C92"
                        fullWidth
                        loading={loading}
                        className="shadow-2xl font-black uppercase tracking-widest h-16"
                        leftSection={<Send size={20} strokeWidth={3} />}
                    >
                        Initiate Strategic Intake
                    </Button>
                </Stack>
            </form>
        </div>
    );
}
