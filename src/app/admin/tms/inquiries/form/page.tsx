'use client';

import { useState, useEffect } from 'react';
import { Group, Stack, Text, Box, Paper, Title, Button, TextInput, Select, NumberInput, Textarea, Alert, Badge, Divider } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Mail, Calendar, MapPin, Building2, LayoutGrid, DollarSign, Clock, Send, Sparkles, Factory, Home, Info, Users, Target, CheckCircle2, Fingerprint } from 'lucide-react';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { tenantsService, Tenant } from '@/services/tenants.service';
import { inquiriesService } from '@/services/inquiries.service';
import { toast } from '@/components/Toast';
import { useRouter } from 'next/navigation';

export default function InquiryFormPage() {
    const router = useRouter();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        tenantId: '',
        propertyTypeId: '',
        requestedSize: 0,
        minBaseRent: 0,
        preferredMoveIn: '',
        furnitureStatusId: '',
        officeSpreadId: '',
        inquiryType: 'OFFICE',
        leaseTermMonths: 12,
        note: '',
        capexFDI: 0,
        estimatedJobs: 0,
        purpose: '',
        industry: '',
        sector: '',
        legalName: '',
        registrationNumber: '',
        tradingName: '',
        contactPerson: '',
        email: '',
        phone: '',
        activities: '',
        applicationDate: new Date().toISOString().split('T')[0],
        phase: 'Phase 1',
        landPriceEtb: 0,
    });

    useEffect(() => {
        tenantsService.getAll().then(res => setTenants((res as any).data || res));
    }, []);

    // Determine if form is for Office or Land Sublease
    const isOfficeType = formData.inquiryType === 'OFFICE' || formData.inquiryType === 'PROJECT_OFFICE';
    const isLandType = formData.inquiryType === 'LAND_SUBLEASE';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await inquiriesService.create({
                ...formData,
                minArea: formData.requestedSize, // Map to minArea for backend compatibility if needed
                maxArea: formData.requestedSize,
                tenantId: formData.tenantId ? Number(formData.tenantId) : undefined,
                propertyTypeId: formData.propertyTypeId ? Number(formData.propertyTypeId) : undefined,
                furnitureStatusId: formData.furnitureStatusId ? Number(formData.furnitureStatusId) : undefined,
                officeSpreadId: formData.officeSpreadId ? Number(formData.officeSpreadId) : undefined,
                preferredMoveIn: formData.preferredMoveIn || undefined,
            });
            toast.success('🚀 Inquiry submitted successfully! Moving to pipeline analysis.');
            router.push('/admin/tms/inquiries');
        } catch (e) {
            toast.error('Failed to submit inquiry');
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = {
        label: { fontWeight: 800, color: '#16284F', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.8px', fontFamily: 'OOOK, system-ui, sans-serif' },
        input: { borderRadius: '14px', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '14px', fontWeight: 600, height: '50px', transition: 'all 0.2s' }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="text-center space-y-2">
                <Title order={1} className="text-4xl font-extrabold text-brand-navy tracking-tight font-primary">
                    New Space Inquiry
                </Title>
                <Text fw={700} c="dimmed" size="md">
                    Formalize your space requirement for matching & allocation
                </Text>
            </div>

            <form onSubmit={handleSubmit}>
                <Stack gap="xl">
                    {/* SECTION 1: Tenant & Contract Type */}
                    <Paper p="xl" radius="2rem" withBorder className="border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
                        <Group gap="sm" mb="xl">
                            <Box p={10} bg="blue.0" className="rounded-full">
                                <Sparkles size={20} className="text-blue-600" />
                            </Box>
                            <div>
                                <Text size="sm" fw={800} className="text-brand-navy uppercase tracking-wide font-primary" lts="1px">Tenant & Agreement Type</Text>
                                <Text size="xs" c="dimmed" fw={600}>Who is requesting and what type of contract</Text>
                            </div>
                        </Group>

                        <Stack gap="lg">
                            <Select
                                label="Requesting Organization (Existing)"
                                description="Select if the tenant already exists in the system registry"
                                placeholder="Choose tenant from registry"
                                data={tenants.map(t => ({ value: t.id.toString(), label: `${t.name} (${t.companyRegNumber})` }))}
                                value={formData.tenantId}
                                onChange={(val) => {
                                    const tenant = tenants.find(t => t.id.toString() === val);
                                    setFormData({
                                        ...formData,
                                        tenantId: val || '',
                                        legalName: tenant?.legalName || '',
                                        registrationNumber: tenant?.registrationNumber || '',
                                        tradingName: tenant?.tradingName || tenant?.name || '',
                                        contactPerson: tenant?.contactPerson || '',
                                        email: tenant?.email || '',
                                        phone: tenant?.phone || '',
                                        activities: tenant?.activities || '',
                                    });
                                }}
                                styles={inputStyles}
                                searchable
                                clearable
                                leftSection={<Building2 size={16} className="text-slate-400" />}
                            />

                            <div>
                                <Text size="xs" fw={900} c="#16284F" tt="uppercase" lts="0.8px" mb={8}>
                                    Commercial Track & Purpose
                                </Text>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { value: 'OFFICE', label: 'Office Rent Track', icon: Building2, desc: 'Building residency & corporate units', color: 'blue' },
                                        { value: 'LAND_SUBLEASE', label: 'Land Sublease Track', icon: Factory, desc: 'Industrial plots & developments', color: 'teal' },
                                        { value: 'PROJECT_OFFICE', label: 'Project Office', icon: Target, desc: 'Temporary strategic workspace', color: 'orange' },
                                    ].map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = formData.inquiryType === type.value;
                                        const colorMap: Record<string, string> = {
                                            blue: 'border-blue-500 bg-blue-50/30 text-blue-600',
                                            teal: 'border-teal-500 bg-teal-50/30 text-teal-600',
                                            orange: 'border-orange-500 bg-orange-50/30 text-orange-600'
                                        };

                                        return (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, inquiryType: type.value })}
                                                className={`p-6 rounded-[2rem] border-2 transition-all text-left group relative overflow-hidden ${isSelected
                                                    ? colorMap[type.color]
                                                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg'
                                                    }`}
                                            >
                                                {isSelected && <Box pos="absolute" top={16} right={16}><CheckCircle2 size={20} /></Box>}
                                                <Icon size={32} className={`transition-transform group-hover:rotate-12 ${isSelected ? '' : 'text-slate-400'}`} />
                                                <Text fw={900} size="md" mt={12} className={isSelected ? 'text-slate-900' : 'text-slate-700'}>
                                                    {type.label}
                                                </Text>
                                                <Text size="xs" c="dimmed" fw={600} mt={4}>
                                                    {type.desc}
                                                </Text>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <Divider label="Identity & Contact Information" labelPosition="center" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <TextInput
                                    label="Legal Company Name"
                                    placeholder="Enter full legal name"
                                    value={formData.legalName}
                                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                                    styles={inputStyles}
                                    required={!formData.tenantId}
                                    leftSection={<Info size={16} className="text-slate-400" />}
                                />
                                <TextInput
                                    label="Registration Number"
                                    placeholder="e.g. EITP-REG-001"
                                    value={formData.registrationNumber}
                                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                    styles={inputStyles}
                                    required={!formData.tenantId}
                                    leftSection={<Fingerprint size={16} className="text-slate-400" />}
                                />
                                <TextInput
                                    label="Trading Name"
                                    placeholder="Enter commercial name"
                                    value={formData.tradingName}
                                    onChange={(e) => setFormData({ ...formData, tradingName: e.target.value })}
                                    styles={inputStyles}
                                />
                                <TextInput
                                    label="Contact Person Name"
                                    placeholder="Mr/Ms. Full Name"
                                    value={formData.contactPerson}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                    styles={inputStyles}
                                    required
                                    leftSection={<Users size={16} className="text-slate-400" />}
                                />
                                <TextInput
                                    label="Phone Number"
                                    placeholder="e.g. 0912501791"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    styles={inputStyles}
                                    required
                                    leftSection={<Clock size={16} className="text-slate-400" />}
                                />
                                <TextInput
                                    label="Email Address"
                                    placeholder="company@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    styles={inputStyles}
                                    required
                                    leftSection={<Mail size={16} className="text-slate-400" />}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="Target Phase"
                                    data={['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4']}
                                    value={formData.phase}
                                    onChange={(val) => setFormData({ ...formData, phase: val || 'Phase 1' })}
                                    styles={inputStyles}
                                />
                                <DateInput
                                    label="Application Date"
                                    placeholder="Pick date"
                                    value={formData.applicationDate ? new Date(formData.applicationDate) : null}
                                    onChange={(val) => setFormData({ ...formData, applicationDate: val?.toISOString().split('T')[0] || '' })}
                                    styles={inputStyles}
                                    leftSection={<Calendar size={16} />}
                                />
                            </div>

                            <Textarea
                                label="Business Activities"
                                description="Specify primary commercial or manufacturing operations"
                                placeholder="Software development, Manufacturing of..."
                                value={formData.activities}
                                onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                                styles={inputStyles}
                                rows={3}
                            />
                        </Stack>
                    </Paper>

                    {/* SECTION 2: Space & Layout Requirements (DYNAMIC) */}
                    <Paper p="xl" radius="2rem" withBorder className="border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
                        <Group gap="sm" mb="xl">
                            <Box p={10} bg="teal.0" className="rounded-full">
                                <LayoutGrid size={20} className="text-teal-600" />
                            </Box>
                            <div>
                                <Text size="sm" fw={800} className="text-brand-navy uppercase tracking-wide font-primary">
                                    {isOfficeType ? 'Office Space Requirements' : 'Land/Plot Requirements'}
                                </Text>
                                <Text size="xs" c="dimmed" fw={600}>
                                    {isOfficeType ? 'Specify your workspace dimensions and preferences' : 'Define land area and usage specifications'}
                                </Text>
                            </div>
                        </Group>

                        <Stack gap="xl">
                            {/* Area Requirements */}
                            <NumberInput
                                label={isOfficeType ? "Office Area (m²)" : "Land Area (m²)"}
                                description="Total space required as per official agreement"
                                placeholder="e.g., 50"
                                value={formData.requestedSize}
                                onChange={(val) => setFormData({ ...formData, requestedSize: Number(val) })}
                                styles={inputStyles}
                                min={0}
                                required
                            />

                            {/* Conditional Fields Based on Type */}
                            {isLandType && (
                                <Group grow>
                                    <TextInput
                                        label="Intended Purpose / Activity"
                                        description="e.g., Manufacturing, Warehousing, R&D Facility"
                                        placeholder="Describe land use purpose"
                                        value={formData.purpose}
                                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                        styles={inputStyles}
                                    />
                                    <NumberInput
                                        label="Total Land Value (ETB)"
                                        description="Calculated based on price per m²"
                                        placeholder="Auto-calculated"
                                        value={formData.landPriceEtb * formData.requestedSize}
                                        disabled
                                        styles={inputStyles}
                                        leftSection={<DollarSign size={16} />}
                                    />
                                </Group>
                            )}

                            {isLandType && (
                                <Group grow>
                                    <NumberInput
                                        label="Land Price per m² (ETB)"
                                        description="Institutional ground rate"
                                        placeholder="e.g. 221.22"
                                        value={formData.landPriceEtb}
                                        onChange={(val) => setFormData({ ...formData, landPriceEtb: Number(val) })}
                                        styles={inputStyles}
                                        leftSection={<DollarSign size={16} />}
                                    />
                                    <div /> {/* Spacer */}
                                </Group>
                            )}

                            <Divider />

                            {/* Financial & Timeline */}
                            <Group align="flex-end" gap="xs">
                                <NumberInput
                                    label="Target Rent/Lease Rate (Monthly)"
                                    description={isOfficeType ? "Budget per month in USD/ETB" : "Expected ground rent per month"}
                                    placeholder="e.g., 5000"
                                    leftSection={<DollarSign size={16} />}
                                    value={formData.minBaseRent}
                                    onChange={(val) => setFormData({ ...formData, minBaseRent: Number(val) })}
                                    styles={inputStyles}
                                    min={0}
                                    className="flex-1"
                                />
                                <Group align="flex-end" gap={0} className="flex-[1.2]">
                                    <NumberInput
                                        label={`Contract Duration (${formData.leaseTermMonths >= 12 && formData.leaseTermMonths % 12 === 0 ? 'Years' : 'Months'})`}
                                        description="Preferred lease term length"
                                        placeholder="e.g., 12"
                                        value={formData.leaseTermMonths >= 12 && formData.leaseTermMonths % 12 === 0 ? formData.leaseTermMonths / 12 : formData.leaseTermMonths}
                                        onChange={(val) => {
                                            const v = Number(val);
                                            // If we're currently in "Year mode" (determined by the badge/value), we'd want to stick to it.
                                            // But for simplicity, we'll just treat input <= 10 as years IF it was already years? 
                                            // No, let's just make it a simple "Years" input if it's >= 12 and multiple of 12.
                                            setFormData({ ...formData, leaseTermMonths: v });
                                        }}
                                        styles={{
                                            ...inputStyles,
                                            input: { ...inputStyles.input, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 0 }
                                        }}
                                        min={1}
                                        className="flex-1"
                                    />
                                    <Box pb={0}>
                                        <Button
                                            variant="filled"
                                            color="#16284F"
                                            h={50}
                                            px="xl"
                                            radius="0 14px 14px 0"
                                            className="font-black"
                                            onClick={() => {
                                                // Toggle logic: if months, convert to years (if possible) or just show months
                                                // This is just a visual badge now, but let's make it more interactive if needed.
                                            }}
                                        >
                                            {formData.leaseTermMonths >= 12
                                                ? `${(formData.leaseTermMonths / 12).toFixed(1).replace('.0', '')} YEARS`
                                                : `${formData.leaseTermMonths} MO`}
                                        </Button>
                                    </Box>
                                </Group>
                            </Group>

                            <Group grow>
                                <TextInput
                                    label="Preferred Move-in / Start Date"
                                    description="When do you need occupancy"
                                    type="date"
                                    value={formData.preferredMoveIn}
                                    onChange={(e) => setFormData({ ...formData, preferredMoveIn: e.target.value })}
                                    styles={inputStyles}
                                    leftSection={<Calendar size={16} />}
                                />
                                {isLandType && (
                                    <NumberInput
                                        label="Job Creation Estimate"
                                        description="Expected employment generation"
                                        placeholder="Number of jobs"
                                        value={formData.estimatedJobs}
                                        onChange={(val) => setFormData({ ...formData, estimatedJobs: Number(val) })}
                                        styles={inputStyles}
                                        leftSection={<Users size={16} />}
                                        min={0}
                                    />
                                )}
                            </Group>
                        </Stack>
                    </Paper>

                    {/* SECTION 3: Additional Details */}
                    <Paper p="xl" radius="2rem" withBorder className="border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
                        <Group gap="sm" mb="xl">
                            <Box p={10} bg="orange.0" className="rounded-full">
                                <Info size={20} className="text-orange-600" />
                            </Box>
                            <div>
                                <Text size="sm" fw={900} c="#16284F" tt="uppercase" lts="2px">Supplementary Information</Text>
                                <Text size="xs" c="dimmed" fw={600}>Any specific requirements or operational notes</Text>
                            </div>
                        </Group>

                        <Textarea
                            label="Additional Requirements & Notes"
                            description={isOfficeType
                                ? "Specify amenities like parking, security, proximity requirements, etc."
                                : "Construction plans, infrastructure needs, utility requirements, etc."}
                            placeholder={isOfficeType
                                ? "e.g., Need 24/7 access, dedicated parking for 5 vehicles, near public transport..."
                                : "e.g., Requires 3-phase power, water access, proximity to highway..."}
                            rows={6}
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            styles={inputStyles}
                        />
                    </Paper>

                    {/* Context Alert */}
                    {formData.inquiryType && (
                        <Alert
                            icon={<Info size={20} />}
                            color={isOfficeType ? 'blue' : 'green'}
                            title={`${isOfficeType ? 'Office Lease' : 'Land Sublease'} Workflow`}
                            className="border-2"
                        >
                            <Text size="sm" fw={600}>
                                {isOfficeType
                                    ? 'Your inquiry will enter the Office Allocation Pipeline. The system will match available office spaces based on your requirements and guide you through proposal review, offer negotiation, and contract signing.'
                                    : 'Your inquiry will enter the Land Sublease Pipeline. This involves proposal submission, board approval, site allocation, construction permissions, and formal lease agreement execution.'}
                            </Text>
                        </Alert>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        size="xl"
                        radius="xl"
                        bg="#0C7C92"
                        fullWidth
                        loading={loading}
                        className="shadow-2xl font-black uppercase tracking-widest h-16 hover:scale-[1.02] transition-transform"
                        leftSection={<Send size={22} strokeWidth={3} />}
                    >
                        Submit Inquiry to Pipeline
                    </Button>
                </Stack>
            </form>
        </div>
    );
}
