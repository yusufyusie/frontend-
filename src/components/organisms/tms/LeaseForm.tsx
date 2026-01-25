'use client';

import { useState, useEffect } from 'react';
import { Stack, Group, Text, Box, Paper, Title, Button, Badge, ThemeIcon, Select, TextInput, NumberInput, Grid, Stepper, JsonInput, ColorInput, Divider, SegmentedControl, ActionIcon, Tooltip } from '@mantine/core';
import { FileText, Building2, Users, DollarSign, Calendar, Map, Check, AlertCircle, Info, ArrowRight, ArrowLeft } from 'lucide-react';
import { tenantsService, Tenant } from '@/services/tenants.service';
import { locationsService, LocationOption } from '@/services/locations.service';
import { lookupsService } from '@/services/lookups.service';

interface LeaseFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
}

export function LeaseForm({ initialData = {}, onSubmit, isLoading }: LeaseFormProps) {
    const [active, setActive] = useState(0);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [locations, setLocations] = useState<LocationOption[]>([]);
    const [billingCycles, setBillingCycles] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);
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
    });

    useEffect(() => {
        loadTenants();
        loadLocations();
        loadLookups();
    }, [formData.locationType]);

    const loadLookups = async () => {
        try {
            const [cycleRes, currRes]: any = await Promise.all([
                lookupsService.getByCategory('BILLING_CYCLES'),
                lookupsService.getByCategory('CURRENCY_TYPES')
            ]);
            setBillingCycles(cycleRes.data || cycleRes || []);
            setCurrencies(currRes.data || currRes || []);
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

    return (
        <Box className="p-2">
            <Stepper
                active={active}
                onStepClick={setActive}
                color="#0C7C92"
                styles={{
                    stepIcon: { border: '2px solid #E2E8F0', borderRadius: '12px' },
                    stepLabel: { fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10px' }
                }}
            >
                {/* Step 1: Parties & Assets */}
                <Stepper.Step
                    label="Contract Parties"
                    description="Tenant & Unit Selection"
                    icon={<Users size={18} />}
                >
                    <Stack gap="xl" mt="xl">
                        <Paper p="xl" radius="xl" withBorder className="bg-slate-50/30">
                            <Grid gutter="xl">
                                <Grid.Col span={12}>
                                    <Select
                                        label="Select Corporate Tenant"
                                        placeholder="Choose IT Park Resident"
                                        data={tenants.map(t => ({ value: t.id.toString(), label: t.name }))}
                                        value={formData.tenantId}
                                        onChange={(v) => setFormData({ ...formData, tenantId: v || '' })}
                                        searchable
                                        nothingFoundMessage="No tenants registered"
                                        leftSection={<Users size={16} className="text-[#0C7C92]" />}
                                        size="md"
                                        radius="md"
                                    />
                                </Grid.Col>

                                <Grid.Col span={12}>
                                    <Divider label="Unit Allocation Intelligence" labelPosition="center" />
                                </Grid.Col>

                                <Grid.Col span={4}>
                                    <SegmentedControl
                                        fullWidth
                                        radius="xl"
                                        color="#0C7C92"
                                        data={[
                                            { label: 'Plot (Land)', value: 'PLOT' },
                                            { label: 'Room (Facility)', value: 'ROOM' },
                                        ]}
                                        value={formData.locationType}
                                        onChange={(v) => setFormData({ ...formData, locationType: v, locationId: '' })}
                                    />
                                </Grid.Col>

                                <Grid.Col span={8}>
                                    <Select
                                        label={`Available ${formData.locationType === 'PLOT' ? 'Plots' : 'Rooms'}`}
                                        placeholder="Select infrastructure unit"
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
                                        leftSection={<Map size={16} className="text-[#0C7C92]" />}
                                        size="md"
                                        radius="md"
                                    />
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        {selectedLocation && (
                            <Paper p="md" radius="lg" bg="teal.50" withBorder className="border-teal-200">
                                <Group justify="space-between">
                                    <Group>
                                        <ThemeIcon color="teal" size="lg" radius="md">
                                            <Info size={18} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text size="xs" fw={900} c="teal.7" tt="uppercase">System Validation</Text>
                                            <Text size="sm" fw={800} className="text-teal-900">
                                                Unit {selectedLocation.code} has a verified area of {selectedLocation.area} m².
                                            </Text>
                                        </Box>
                                    </Group>
                                    <Badge color="teal" variant="filled">AVAILABLE</Badge>
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
                    <Stack gap="xl" mt="xl">
                        <Paper p="xl" radius="xl" withBorder className="bg-slate-50/30">
                            <Grid gutter="xl">
                                <Grid.Col span={{ base: 12, md: 6 }}>
                                    <TextInput
                                        label="Contract Number"
                                        placeholder="e.g. ITPC/L-2024/001"
                                        value={formData.contractNumber}
                                        onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                                        disabled
                                        size="md"
                                        radius="md"
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <Select
                                        label="Currency"
                                        placeholder="Select currency"
                                        data={currencies.map(c => ({ value: c.lookupCode, label: `${c.lookupCode} - ${c.lookupValue.en || c.lookupValue}` }))}
                                        value={formData.currency}
                                        onChange={(v) => setFormData({ ...formData, currency: v || 'ETB' })}
                                        size="md"
                                        radius="md"
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 8 }}>
                                    <Select
                                        label="Billing Cycle"
                                        placeholder="Select cycle"
                                        data={billingCycles.map(c => ({ value: c.lookupCode, label: c.lookupValue.en || c.lookupValue }))}
                                        value={formData.billingCycle}
                                        onChange={(v) => setFormData({ ...formData, billingCycle: v || 'MONTHLY' })}
                                        size="md"
                                        radius="md"
                                    />
                                </Grid.Col>

                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <NumberInput
                                        label="Contract Area (m²)"
                                        description="Billed space"
                                        value={formData.contractArea}
                                        onChange={(v) => setFormData({ ...formData, contractArea: Number(v) })}
                                        size="md"
                                        radius="md"
                                        min={0}
                                        decimalScale={2}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <NumberInput
                                        label="Base Rent / m²"
                                        description="Excluding VAT"
                                        value={formData.baseRent}
                                        onChange={(v) => setFormData({ ...formData, baseRent: Number(v) })}
                                        size="md"
                                        radius="md"
                                        min={0}
                                        prefix={`${formData.currency} `}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <NumberInput
                                        label="Total Monthly Billing"
                                        description="Auto-calculated"
                                        value={formData.contractArea * formData.baseRent}
                                        disabled
                                        size="md"
                                        radius="md"
                                        prefix={`${formData.currency} `}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        <Paper p="md" radius="lg" className="bg-[#16284F]/5" withBorder>
                            <Grid grow>
                                <Grid.Col span={6}>
                                    <NumberInput
                                        label="Security Deposit"
                                        value={formData.securityDeposit}
                                        onChange={(v) => setFormData({ ...formData, securityDeposit: Number(v) })}
                                        size="sm"
                                        prefix={`${formData.currency} `}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <NumberInput
                                        label="Advance Payment"
                                        value={formData.advancePayment}
                                        onChange={(v) => setFormData({ ...formData, advancePayment: Number(v) })}
                                        size="sm"
                                        prefix={`${formData.currency} `}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Paper>
                    </Stack>
                </Stepper.Step>

                {/* Step 3: Lifecycle & Review */}
                <Stepper.Step
                    label="Lifecycle"
                    description="Timeline & Finalization"
                    icon={<Calendar size={18} />}
                >
                    <Stack gap="xl" mt="xl">
                        <Grid gutter="xl">
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <TextInput
                                    type="date"
                                    label="Contract Commencement"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    size="md"
                                    radius="md"
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <TextInput
                                    type="date"
                                    label="Contract Termination (Optional)"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    size="md"
                                    radius="md"
                                />
                            </Grid.Col>
                        </Grid>

                        <Divider label="Executive Review Summary" labelPosition="center" />

                        <Paper p="xl" radius="2.5rem" className="bg-[#16284F] text-white overflow-hidden relative">
                            <ThemeIcon
                                className="absolute right-[-20px] bottom-[-20px] opacity-10"
                                size={120}
                                color="white"
                                variant="transparent"
                            >
                                <FileText size={120} />
                            </ThemeIcon>

                            <Grid>
                                <Grid.Col span={6}>
                                    <Text size="xs" fw={800} color="cyan.2" tt="uppercase" className="tracking-widest">Selected Tenant</Text>
                                    <Title order={4} className="font-black mt-1">{selectedTenant?.name || 'N/A'}</Title>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Text size="xs" fw={800} color="cyan.2" tt="uppercase" className="tracking-widest">Unit Specification</Text>
                                    <Title order={4} className="font-black mt-1">
                                        {selectedLocation?.code || 'None'} <span className="text-[14px] opacity-60">({formData.contractArea || 0} m²)</span>
                                    </Title>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Text size="xs" fw={800} color="emerald.2" tt="uppercase" className="tracking-widest">Contractual Income</Text>
                                    <Title order={4} className="font-black mt-1 text-emerald-400">
                                        {formData.currency} {(formData.contractArea * formData.baseRent).toLocaleString()}
                                        <span className="text-[12px] opacity-60 ml-2">/ {formData.billingCycle}</span>
                                    </Title>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Text size="xs" fw={800} color="orange.2" tt="uppercase" className="tracking-widest">Security Lock-up</Text>
                                    <Title order={4} className="font-black mt-1 text-orange-300">
                                        {formData.currency} {(formData.securityDeposit || 0).toLocaleString()}
                                    </Title>
                                </Grid.Col>
                            </Grid>
                        </Paper>

                        <Paper p="md" radius="lg" className="bg-amber-50 border border-amber-100">
                            <Group gap="sm" align="flex-start" wrap="nowrap">
                                <AlertCircle size={18} className="text-amber-600 mt-1 flex-shrink-0" />
                                <Text size="xs" fw={700} className="text-amber-800 italic leading-relaxed">
                                    Confirmation: Strategic execution of this contract will automatically update unit status in the Spatial Registry and trigger initial deposit billing.
                                </Text>
                            </Group>
                        </Paper>
                    </Stack>
                </Stepper.Step>
            </Stepper>

            <Group justify="flex-end" mt="xl" pt="xl" className="border-t border-slate-100">
                {active !== 0 && (
                    <Button
                        variant="subtle"
                        color="gray"
                        onClick={prevStep}
                        radius="xl"
                        leftSection={<ArrowLeft size={18} />}
                        className="font-bold"
                    >
                        Previous Step
                    </Button>
                )}
                {active < 2 && (
                    <Button
                        onClick={nextStep}
                        bg="#0C7C92"
                        radius="xl"
                        size="md"
                        rightSection={<ArrowRight size={18} />}
                        className="font-bold shadow-lg shadow-teal-100"
                        disabled={active === 0 && (!formData.tenantId || !formData.locationId)}
                    >
                        Configure Financials
                    </Button>
                )}
                {active === 2 && (
                    <Button
                        onClick={() => onSubmit(formData)}
                        bg="#0C7C92"
                        radius="xl"
                        size="md"
                        loading={isLoading}
                        leftSection={<Check size={18} />}
                        className="font-bold shadow-lg shadow-teal-500/20 px-8"
                    >
                        Execute Lease Agreement
                    </Button>
                )}
            </Group>
        </Box>
    );
}
