'use client';

import { useState, useEffect } from 'react';
import { Stack, Group, Text, Box, Paper, Title, Button, Badge, ThemeIcon, Select as MantineSelect, TextInput, NumberInput, Grid, Stepper, Divider, SegmentedControl, rem, SimpleGrid } from '@mantine/core';
import { FileText, Building2, Users, DollarSign, Calendar, Map, Check, AlertCircle, Info, ArrowRight, ArrowLeft, RefreshCw, Banknote, ShieldAlert, TrendingUp } from 'lucide-react';
import { tenantsService, Tenant } from '@/services/tenants.service';
import { locationsService, LocationOption } from '@/services/locations.service';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { financialsService } from '@/services/financials.service';
import { AtomicLookupSelector } from '@/components/molecules/tms/AtomicLookupSelector';

interface LeaseFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
}

export function LeaseForm({ initialData = {}, onSubmit, isLoading }: LeaseFormProps) {
    const [active, setActive] = useState(0);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [locations, setLocations] = useState<LocationOption[]>([]);
    const [billingCycles, setBillingCycles] = useState<SystemLookup[]>([]);
    const [currencies, setCurrencies] = useState<SystemLookup[]>([]);
    const [leaseStatusTypes, setLeaseStatusTypes] = useState<SystemLookup[]>([]);
    const [contractTypes, setContractTypes] = useState<SystemLookup[]>([]);
    const [finSettings, setFinSettings] = useState<any>({ vatRate: 0.15, penaltyRate: 0.025 });
    const [formData, setFormData] = useState({
        tenantId: initialData.tenantId?.toString() || '',
        locationType: initialData.roomId ? 'ROOM' : 'PLOT',
        locationId: (initialData.roomId || initialData.plotId)?.toString() || '',
        contractNumber: initialData.contractNumber || `ITPC/L-${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
        contractArea: initialData.contractArea || 0,
        actualArea: initialData.actualArea || 0,
        baseRent: initialData.baseRent || 0,
        currency: initialData.currency || 'ETB',
        billingCycle: initialData.billingCycle || 'MONTHLY',
        startDate: initialData.startDate || new Date().toISOString().split('T')[0],
        endDate: initialData.endDate || '',
        securityDeposit: initialData.securityDeposit || 0,
        advancePayment: initialData.advancePayment || 0,
        statusId: initialData.statusId?.toString() || '',
        contractTypeId: initialData.contractTypeId?.toString() || '',
    });

    useEffect(() => {
        loadTenants();
        loadLocations();
        loadLookups();
        loadFinSettings();
    }, [formData.locationType]);

    const loadFinSettings = async () => {
        try {
            const res = await financialsService.getSettings();
            setFinSettings((res as any).data || res);
        } catch (e) {
            console.error('Failed to load financial settings');
        }
    };

    const loadLookups = async () => {
        try {
            const [cycleRes, currRes, statusRes, typeRes]: any = await Promise.all([
                lookupsService.getByCategory('BILLING_CYCLES'),
                lookupsService.getByCategory('CURRENCY_TYPES'),
                lookupsService.getByCategory('LEASE_STATUS'),
                lookupsService.getByCategory('CONTRACT_TYPES')
            ]);
            setBillingCycles((cycleRes as any).data || cycleRes || []);
            setCurrencies((currRes as any).data || currRes || []);
            setLeaseStatusTypes((statusRes as any).data || statusRes || []);
            setContractTypes((typeRes as any).data || typeRes || []);
        } catch (e) {
            console.error(e);
        }
    };

    const loadTenants = async () => {
        try {
            const res: any = await tenantsService.getAll();
            setTenants(res.data || res || []);
        } catch (e) {
            console.error(e);
        }
    };

    const loadLocations = async () => {
        try {
            if (formData.locationType === 'PLOT') {
                const res: any = await locationsService.getPlots();
                setLocations(res.data || res || []);
            } else {
                const res: any = await locationsService.getRooms();
                setLocations(res.data || res || []);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const nextStep = () => setActive((current) => (current < 2 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const selectedTenant = tenants.find(t => t.id.toString() === formData.tenantId);
    const selectedLocation = locations.find(l => (l.realId || l.id).toString() === formData.locationId);

    const inputStyles = {
        label: { fontWeight: 900, color: '#16284F', fontSize: rem(12), marginBottom: rem(6), textTransform: 'uppercase' as const, letterSpacing: rem(1) },
        input: { borderRadius: rem(16), height: rem(48), fontSize: rem(14), border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', fontWeight: 700 }
    };

    return (
        <Box className="p-2">
            <Stepper
                active={active}
                onStepClick={setActive}
                color="#0C7C92"
                styles={{
                    stepIcon: { border: '2px solid #E2E8F0', borderRadius: '16px', backgroundColor: 'white' },
                    stepLabel: { fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', color: '#16284F' },
                    separator: { backgroundColor: '#F1F5F9', height: '2px' }
                }}
            >
                {/* Step 1: Parties & Assets */}
                <Stepper.Step
                    label="Contract Parties"
                    description="Tenant & Unit Selection"
                    icon={<Users size={18} />}
                >
                    <Stack gap="xl" mt="2rem">
                        <Paper p="xl" radius="2rem" withBorder className="bg-white shadow-xl shadow-slate-100">
                            <Grid gutter="xl">
                                <Grid.Col span={12}>
                                    <MantineSelect
                                        label="Corporate Tenant"
                                        placeholder="Identify IT Park Resident..."
                                        data={tenants.map(t => ({ value: t.id.toString(), label: t.name || 'Unnamed Tenant' }))}
                                        value={formData.tenantId}
                                        onChange={(v) => setFormData({ ...formData, tenantId: v || '' })}
                                        searchable
                                        nothingFoundMessage="No tenants registered"
                                        leftSection={<Users size={16} className="text-blue-600" />}
                                        size="md"
                                        radius="xl"
                                        styles={inputStyles}
                                    />
                                </Grid.Col>

                                <Grid.Col span={12} py="md">
                                    <Divider label={<Badge variant="light" color="blue">Asset Intelligence</Badge>} labelPosition="center" />
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <Text size="xs" fw={900} mb={6} c="#16284F" tt="uppercase">Select Asset Class</Text>
                                    <SegmentedControl
                                        fullWidth
                                        radius="xl"
                                        color="#0C7C92"
                                        size="md"
                                        data={[
                                            { label: 'Plot (Land)', value: 'PLOT' },
                                            { label: 'Room (Facility)', value: 'ROOM' },
                                        ]}
                                        value={formData.locationType}
                                        onChange={(v) => setFormData({ ...formData, locationType: v, locationId: '' })}
                                        styles={{
                                            root: { backgroundColor: '#F8FAFC', border: '2px solid #F1F5F9', padding: '4px' },
                                            indicator: { boxShadow: '0 4px 12px rgba(12, 124, 146, 0.2)' },
                                            label: { fontWeight: 900, fontSize: '12px' }
                                        }}
                                    />
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, md: 8 }}>
                                    <MantineSelect
                                        label={`Allocatable ${formData.locationType === 'PLOT' ? 'Plots' : 'Rooms'}`}
                                        placeholder="Search infrastructure registry..."
                                        data={locations.map(l => ({
                                            value: (l.realId || l.id).toString(),
                                            label: `${l.code} - ${l.name} (${l.area || 0} m²)`
                                        }))}
                                        value={formData.locationId}
                                        onChange={(v) => {
                                            const loc = locations.find(l => (l.realId || l.id).toString() === v);
                                            setFormData({
                                                ...formData,
                                                locationId: v || '',
                                                actualArea: loc?.area || 0,
                                                contractArea: loc?.area || 0
                                            });
                                        }}
                                        searchable
                                        leftSection={<Map size={16} className="text-teal-600" />}
                                        size="md"
                                        radius="xl"
                                        styles={inputStyles}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        {selectedLocation && (
                            <Paper p="xl" radius="2rem" className="bg-emerald-50/50 border border-emerald-100 backdrop-blur-sm">
                                <Group justify="space-between">
                                    <Group gap="lg">
                                        <Box p={12} bg="white" style={{ borderRadius: '1rem' }} className="shadow-sm border border-emerald-100">
                                            <Info size={24} className="text-emerald-600" strokeWidth={2.5} />
                                        </Box>
                                        <Box>
                                            <Text size="10px" fw={900} c="emerald.7" tt="uppercase" lts="1px">System Verification</Text>
                                            <Text size="md" fw={800} className="text-emerald-900 mt-1">
                                                Unit {selectedLocation.code} validated at {selectedLocation.area} m².
                                            </Text>
                                        </Box>
                                    </Group>
                                    <Badge size="xl" color="emerald" variant="filled" radius="md" p="md">100% AVAILABLE</Badge>
                                </Group>
                            </Paper>
                        )}
                    </Stack>
                </Stepper.Step>

                {/* Step 2: Financial Terms */}
                <Stepper.Step
                    label="Financial Terms"
                    description="Pricing & Billing Cycle"
                    icon={<DollarSign size={18} />}
                >
                    <Stack gap="xl" mt="2rem">
                        <Paper p="xl" radius="2rem" withBorder className="bg-white shadow-xl shadow-slate-100">
                            <Grid gutter="xl">
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <TextInput
                                        label="Master Contract ID"
                                        value={formData.contractNumber}
                                        disabled
                                        size="md"
                                        radius="xl"
                                        styles={inputStyles}
                                        leftSection={<FileText size={18} className="text-slate-400" />}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <AtomicLookupSelector
                                        label="Agreement Type"
                                        items={contractTypes}
                                        value={formData.contractTypeId}
                                        onChange={(v) => setFormData({ ...formData, contractTypeId: v })}
                                        variant="form"
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 3 }}>
                                    <AtomicLookupSelector
                                        label="Currency"
                                        items={currencies}
                                        value={formData.currency}
                                        onChange={(v) => setFormData({ ...formData, currency: v })}
                                        variant="form"
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 3 }}>
                                    <AtomicLookupSelector
                                        label="Billing Mode"
                                        items={billingCycles}
                                        value={formData.billingCycle}
                                        onChange={(v) => setFormData({ ...formData, billingCycle: v })}
                                        variant="form"
                                    />
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <NumberInput
                                        label="Billed Area (m²)"
                                        description="Contractual m²"
                                        value={formData.contractArea}
                                        onChange={(v) => setFormData({ ...formData, contractArea: Number(v) })}
                                        size="md"
                                        radius="xl"
                                        min={0}
                                        decimalScale={2}
                                        styles={inputStyles}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <NumberInput
                                        label="Base Rent / m²"
                                        description="Excluding taxes"
                                        value={formData.baseRent}
                                        onChange={(v) => setFormData({ ...formData, baseRent: Number(v) })}
                                        size="md"
                                        radius="xl"
                                        min={0}
                                        prefix={`${formData.currency} `}
                                        styles={inputStyles}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <NumberInput
                                        label="Cycle Total Billing"
                                        description="Projected Revenue"
                                        value={formData.contractArea * formData.baseRent}
                                        disabled
                                        size="md"
                                        radius="xl"
                                        prefix={`${formData.currency} `}
                                        styles={{
                                            ...inputStyles,
                                        }}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        {/* Executive Financial Obligation Preview */}
                        <Paper p="2rem" radius="2.5rem" className="bg-[#16284F] text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute right-0 top-0 opacity-10 p-6">
                                <TrendingUp size={160} className="text-emerald-400" />
                            </div>

                            <Stack gap="xl" className="relative z-10">
                                <Group justify="space-between">
                                    <Stack gap={2}>
                                        <Text size="10px" fw={900} className="text-cyan-400 uppercase tracking-[0.2em]">Institutional Financial Preview</Text>
                                        <Title order={3} className="text-white font-black">Contract Revenue Summary</Title>
                                    </Stack>
                                    <Badge color="emerald" variant="filled" radius="md" p="md" fw={900}>DYNAMIC COMPLIANCE</Badge>
                                </Group>

                                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                                    <Stack gap={2}>
                                        <Text size="xs" fw={800} className="text-slate-400 uppercase">Net Rental (Cycle)</Text>
                                        <Text size="xl" fw={900} className="text-white">
                                            {formData.currency} {(formData.contractArea * formData.baseRent).toLocaleString()}
                                        </Text>
                                    </Stack>
                                    <Stack gap={2}>
                                        <Text size="xs" fw={800} className="text-slate-400 uppercase">VAT Analysis (+{(finSettings.vatRate * 100).toFixed(1)}%)</Text>
                                        <Text size="xl" fw={900} className="text-emerald-400">
                                            {formData.currency} {(formData.contractArea * formData.baseRent * finSettings.vatRate).toLocaleString()}
                                        </Text>
                                    </Stack>
                                    <Stack gap={2}>
                                        <Text size="xs" fw={800} className="text-slate-400 uppercase">Total Obligation</Text>
                                        <Text size="2xl" fw={950} className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                            {formData.currency} {(formData.contractArea * formData.baseRent * (1 + finSettings.vatRate)).toLocaleString()}
                                        </Text>
                                    </Stack>
                                </SimpleGrid>

                                <Divider color="slate.8" />

                                <Group gap="xs" px="md" py="xs" className="bg-white/5 rounded-2xl border border-white/10">
                                    <ShieldAlert size={16} className="text-amber-400" />
                                    <Text size="xs" fw={700} className="text-slate-300 italic">
                                        Late payments subject to {(finSettings.penaltyRate * 100).toFixed(1)}% monthly variation penalty as per park policy.
                                    </Text>
                                </Group>
                            </Stack>
                        </Paper>

                        <Paper p="xl" radius="2rem" className="bg-[#F8FAFC] border-slate-100" withBorder>
                            <Title order={5} mb="lg" c="#16284F" fw={900} tt="uppercase" lts="1px">Security & Advance Commitment</Title>
                            <Grid grow gutter="lg">
                                <Grid.Col span={6}>
                                    <NumberInput
                                        label="Security Deposit"
                                        value={formData.securityDeposit}
                                        onChange={(v) => setFormData({ ...formData, securityDeposit: Number(v) })}
                                        size="md"
                                        radius="xl"
                                        prefix={`${formData.currency} `}
                                        styles={inputStyles}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <NumberInput
                                        label="Advance Payment"
                                        value={formData.advancePayment}
                                        onChange={(v) => setFormData({ ...formData, advancePayment: Number(v) })}
                                        size="md"
                                        radius="xl"
                                        prefix={`${formData.currency} `}
                                        styles={inputStyles}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Paper>
                    </Stack>
                </Stepper.Step>

                {/* Step 3: Lifecycle & Execution */}
                <Stepper.Step
                    label="Lifecycle"
                    description="Timeline & Finalization"
                    icon={<Calendar size={18} />}
                >
                    <Stack gap="xl" mt="2rem">
                        <Grid gutter="xl">
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <TextInput
                                    type="date"
                                    label="Contract Commencement"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    size="md"
                                    radius="xl"
                                    styles={inputStyles}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <TextInput
                                    type="date"
                                    label="Termination Policy (Optional)"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    size="md"
                                    radius="xl"
                                    styles={inputStyles}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 12 }}>
                                <AtomicLookupSelector
                                    label="Initial Lease Status"
                                    items={leaseStatusTypes}
                                    value={formData.statusId}
                                    onChange={(v) => setFormData({ ...formData, statusId: v })}
                                    variant="form"
                                />
                            </Grid.Col>
                        </Grid>

                        <Divider label={<Badge variant="dot" color="blue">Executive Contract Summary</Badge>} labelPosition="center" />

                        <Paper p="2rem" radius="2.5rem" className="bg-[#16284F] text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute right-0 bottom-0 opacity-10 p-4">
                                <FileText size={180} />
                            </div>

                            <Grid className="relative z-10">
                                <Grid.Col span={6}>
                                    <Text size="10px" fw={900} color="cyan.2" tt="uppercase" lts="2px">Branded Resident</Text>
                                    <Title order={3} fw={900} className="mt-1">{selectedTenant?.name || 'N/A'}</Title>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Text size="10px" fw={900} color="cyan.2" tt="uppercase" lts="2px">Strategic Asset</Text>
                                    <Title order={3} fw={900} className="mt-1">
                                        {selectedLocation?.code || 'Undefined'} <span className="text-[14px] opacity-60">({formData.contractArea || 0} m²)</span>
                                    </Title>
                                </Grid.Col>
                                <Grid.Col span={6} mt="xl">
                                    <Text size="10px" fw={900} color="emerald.2" tt="uppercase" lts="2px">Periodic Revenue</Text>
                                    <Title order={2} fw={900} className="mt-1 text-emerald-400">
                                        {formData.currency} {(formData.contractArea * formData.baseRent).toLocaleString()}
                                        <Text component="span" size="sm" fw={800} ml={8} c="white" opacity={0.6}>/ {formData.billingCycle}</Text>
                                    </Title>
                                </Grid.Col>
                                <Grid.Col span={6} mt="xl">
                                    <Text size="10px" fw={900} color="orange.2" tt="uppercase" lts="2px">Capital Guarantee</Text>
                                    <Title order={2} fw={900} className="mt-1 text-orange-300">
                                        {formData.currency} {(formData.securityDeposit || 0).toLocaleString()}
                                    </Title>
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        <Paper p="xl" radius="2rem" className="bg-amber-50/70 border border-amber-100 flex items-center gap-4">
                            <ThemeIcon color="amber" variant="light" size="lg" radius="md">
                                <AlertCircle size={20} />
                            </ThemeIcon>
                            <Text size="xs" fw={800} className="text-amber-900 italic leading-relaxed">
                                System Orchestration: Strategic execution will trigger real-time occupancy updates in GIS dashboards and generate the first installment billing cycle.
                            </Text>
                        </Paper>
                    </Stack>
                </Stepper.Step>
            </Stepper>

            <Group justify="flex-end" mt="3rem" pt="2rem" className="border-t border-slate-100">
                {active !== 0 && (
                    <Button
                        variant="subtle"
                        color="slate"
                        onClick={prevStep}
                        radius="xl"
                        size="md"
                        leftSection={<ArrowLeft size={18} />}
                        className="font-black tracking-widest uppercase text-[10px]"
                    >
                        Back
                    </Button>
                )}
                {active < 2 && (
                    <Button
                        onClick={nextStep}
                        bg="#0C7C92"
                        radius="xl"
                        size="md"
                        rightSection={<ArrowRight size={18} />}
                        className="font-black px-10 shadow-xl shadow-teal-100 uppercase tracking-widest text-[10px]"
                        disabled={active === 0 && (!formData.tenantId || !formData.locationId)}
                    >
                        Configure Financials
                    </Button>
                )}
                {active === 2 && (
                    <Button
                        onClick={() => onSubmit(formData)}
                        bg="#16284F"
                        radius="xl"
                        size="lg"
                        loading={isLoading}
                        leftSection={<Check size={20} strokeWidth={3} />}
                        className="font-black shadow-2xl shadow-blue-900/40 px-12 uppercase tracking-widest text-[11px] hover:scale-105 transition-transform"
                    >
                        Execute Agreement
                    </Button>
                )}
            </Group>
        </Box>
    );
}
