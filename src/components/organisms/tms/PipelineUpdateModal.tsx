'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Stack, TextInput, NumberInput, Textarea, Group, Text, Title, Stepper, Select, Divider, Paper, Box, Badge, ScrollArea, SimpleGrid, rem } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
    Send,
    CheckCircle2,
    FileSignature,
    ClipboardCheck,
    DollarSign,
    Users,
    Maximize,
    Calendar,
    ArrowRight,
    X,
    ShieldCheck,
    Coins,
    Activity,
    Building2,
    Factory,
    Info,
    Fingerprint
} from 'lucide-react';
import { inquiriesService, Inquiry } from '@/services/inquiries.service';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { exchangeRateService } from '@/services/exchange-rate.service';
import { locationsService, LocationOption } from '@/services/locations.service';
import { toast } from '@/components/Toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PipelineUpdateModalProps {
    opened: boolean;
    onClose: () => void;
    inquiry?: Inquiry;
    onSuccess?: () => void;
    tenant?: any;
    onUpdate?: () => void;
}

export function PipelineUpdateModal({ opened, onClose, inquiry, onSuccess, tenant, onUpdate }: PipelineUpdateModalProps) {
    const targetInquiry = inquiry || tenant?.inquiries?.[0];
    const handleSuccess = onSuccess || onUpdate;

    const [loading, setLoading] = useState(false);

    // Track Context Configuration
    const isLand = targetInquiry?.inquiryType === 'LAND_SUBLEASE';
    const trackConfig = isLand ? {
        label: 'Land Sublease Track',
        color: 'teal',
        gradient: 'from-brand-teal via-[#0D8B9E] to-brand-navy',
        icon: Factory,
        spaceLabel: 'Land Area (m²)',
        rateLabel: 'Annual Lease Rate / m²',
        currency: 'USD',
        termLabel: 'Contract Term (Years)'
    } : {
        label: 'Office Rent Track',
        color: 'blue',
        gradient: 'from-brand-navy via-[#1B3664] to-brand-teal',
        icon: Building2,
        spaceLabel: 'Office Area (m²)',
        rateLabel: 'Monthly Rent / m²',
        currency: 'USD',
        termLabel: 'Contract Term (Months)'
    };

    // Initial state derived from targetInquiry
    const [capexFDI, setCapexFDI] = useState<number | string>(targetInquiry?.capexFDI || 0);
    const [estimatedJobs, setEstimatedJobs] = useState<number | string>(targetInquiry?.estimatedJobs || 0);

    // Offer State
    const [offeredSpace, setOfferedSpace] = useState<number | string>(targetInquiry?.offeredSpace || targetInquiry?.requestedSize || 0);
    const [offeredRate, setOfferedRate] = useState<number | string>(targetInquiry?.offeredRate || 0);
    const [offeredCurrency, setOfferedCurrency] = useState<string>(targetInquiry?.offeredCurrency || 'USD');
    const [validUntil, setValidUntil] = useState<Date | null>(targetInquiry?.offerValidUntil ? new Date(targetInquiry.offerValidUntil) : null);

    // Contract State
    const [duration, setDuration] = useState<number | string>(targetInquiry?.contractDuration || (isLand ? 50 : 12));
    const [startDate, setStartDate] = useState<Date | null>(targetInquiry?.contractStartDate ? new Date(targetInquiry.contractStartDate) : new Date());
    const [securityDeposit, setSecurityDeposit] = useState<number | string>(targetInquiry?.securityDeposit || 0);
    const [advancePayment, setAdvancePayment] = useState<number | string>(targetInquiry?.advancePayment || 0);
    const [residencyDate, setResidencyDate] = useState<Date | null>(targetInquiry?.residencyDate ? new Date(targetInquiry.residencyDate) : null);
    const [gracePeriod, setGracePeriod] = useState<number | string>(targetInquiry?.gracePeriod || 0);
    const [gracePeriodOffset, setGracePeriodOffset] = useState<number | string>(targetInquiry?.gracePeriodOffset || 0);
    const [gracePeriodRemarks, setGracePeriodRemarks] = useState<string>(targetInquiry?.gracePeriodRemarks || '');
    const [remarks, setRemarks] = useState<string>('');
    const [currencies, setCurrencies] = useState<SystemLookup[]>([]);
    const [constructionStatuses, setConstructionStatuses] = useState<SystemLookup[]>([]);

    // Land Specific
    const [landTitleRef, setLandTitleRef] = useState<string>(targetInquiry?.landTitleRef || '');
    const [constructionStatusId, setConstructionStatusId] = useState<number | string>(targetInquiry?.constructionStatusId || '');
    const [submissionDate, setSubmissionDate] = useState<Date | null>(targetInquiry?.proposalSubmissionDate ? new Date(targetInquiry.proposalSubmissionDate) : new Date());
    const [offeredRateEtb, setOfferedRateEtb] = useState<number | string>(targetInquiry?.offeredRateEtb || 0);
    const [landPriceEtb, setLandPriceEtb] = useState<number | string>(targetInquiry?.landPriceEtb || 0);
    const [phase, setPhase] = useState<string>(targetInquiry?.phase || 'Phase 1');
    const [exchangeRate, setExchangeRate] = useState<number>(targetInquiry?.exchangeRate || 1);
    const [rateType, setRateType] = useState<string>(targetInquiry?.rateType || (isLand ? 'land_price' : 'monthly_rent'));

    // Spatial State (Form B)
    const [assignedZoneId, setAssignedZoneId] = useState<number | string>(targetInquiry?.assignedZoneId || '');
    const [assignedBlockId, setAssignedBlockId] = useState<number | string>(targetInquiry?.assignedBlockId || '');
    const [assignedPlotId, setAssignedPlotId] = useState<number | string>(targetInquiry?.assignedPlotId || '');
    const [assignedBuildingId, setAssignedBuildingId] = useState<number | string>(targetInquiry?.assignedBuildingId || '');
    const [assignedFloorId, setAssignedFloorId] = useState<number | string>(targetInquiry?.assignedFloorId || '');
    const [assignedRoomId, setAssignedRoomId] = useState<number | string>(targetInquiry?.assignedRoomId || '');
    const [assignedLandResourceId, setAssignedLandResourceId] = useState<number | string>(targetInquiry?.assignedLandResourceId || '');

    const [zones, setZones] = useState<LocationOption[]>([]);
    const [blocks, setBlocks] = useState<LocationOption[]>([]);
    const [plots, setPlots] = useState<LocationOption[]>([]);
    const [buildings, setBuildings] = useState<LocationOption[]>([]);
    const [floors, setFloors] = useState<LocationOption[]>([]);
    const [rooms, setRooms] = useState<LocationOption[]>([]);


    useEffect(() => {
        loadLookups();
    }, []);

    const loadLookups = async () => {
        try {
            const [curRes, constRes, rateRes, zoneRes] = await Promise.all([
                lookupsService.getByCategory('CURRENCY_TYPES'),
                lookupsService.getByCategory('LEASE_CONSTRUCTION_STATUS'),
                exchangeRateService.getLatest(),
                locationsService.getZones()
            ]);
            setCurrencies((curRes as any).data || curRes);
            setConstructionStatuses((constRes as any).data || constRes);
            setZones(zoneRes);
            if (rateRes && rateRes.rate) {
                setExchangeRate(rateRes.rate);
            }
        } catch (e) {
            console.error('Failed to load specialized lookups');
        }
    };

    useEffect(() => {
        if (targetInquiry) {
            setCapexFDI(targetInquiry.capexFDI || 0);
            setEstimatedJobs(targetInquiry.estimatedJobs || 0);
            setOfferedSpace(targetInquiry.offeredSpace || targetInquiry.requestedSize || 0);
            setOfferedRate(targetInquiry.offeredRate || 0);
            setOfferedCurrency(targetInquiry.offeredCurrency || 'USD');
            setValidUntil(targetInquiry.offerValidUntil ? new Date(targetInquiry.offerValidUntil) : null);
            setDuration(targetInquiry.contractDuration || (isLand ? 50 : 12));
            setStartDate(targetInquiry.contractStartDate ? new Date(targetInquiry.contractStartDate) : new Date());
            setSecurityDeposit(targetInquiry.securityDeposit || 0);
            setAdvancePayment(targetInquiry.advancePayment || 0);
            setResidencyDate(targetInquiry.residencyDate ? new Date(targetInquiry.residencyDate) : null);
            setGracePeriod(targetInquiry.gracePeriod || 0);
            setGracePeriodOffset(targetInquiry.gracePeriodOffset || 0);
            setGracePeriodRemarks(targetInquiry.gracePeriodRemarks || '');
            setLandTitleRef(targetInquiry.landTitleRef || '');
            setConstructionStatusId(targetInquiry.constructionStatusId || '');
            setSubmissionDate(targetInquiry.proposalSubmissionDate ? new Date(targetInquiry.proposalSubmissionDate) : new Date());
            setOfferedRateEtb(targetInquiry.offeredRateEtb || 0);
            setLandPriceEtb(targetInquiry.landPriceEtb || 0);
            setPhase(targetInquiry.phase || 'Phase 1');
            setExchangeRate(targetInquiry.exchangeRate || exchangeRate || 1);
            setRateType(targetInquiry.rateType || (isLand ? 'land_price' : 'monthly_rent'));
            setAssignedZoneId(targetInquiry.assignedZoneId || '');
            setAssignedBlockId(targetInquiry.assignedBlockId || '');
            setAssignedPlotId(targetInquiry.assignedPlotId || '');
            setAssignedBuildingId(targetInquiry.assignedBuildingId || '');
            setAssignedFloorId(targetInquiry.assignedFloorId || '');
            setAssignedRoomId(targetInquiry.assignedRoomId || '');
            setAssignedLandResourceId(targetInquiry.assignedLandResourceId || '');
            setRemarks(''); // Reset remarks on inquiry change
        }
    }, [targetInquiry?.id, targetInquiry?.status, isLand]);

    // Cascading Spatial Fetchers
    useEffect(() => {
        if (assignedZoneId) {
            locationsService.getBlocks(Number(assignedZoneId)).then(setBlocks);
        } else {
            setBlocks([]);
        }
    }, [assignedZoneId]);

    useEffect(() => {
        if (assignedBlockId) {
            locationsService.getPlots(Number(assignedBlockId)).then(setPlots);
        } else {
            setPlots([]);
        }
    }, [assignedBlockId]);

    useEffect(() => {
        if (assignedPlotId) {
            locationsService.getBuildings({ plotId: Number(assignedPlotId) }).then(setBuildings);
        } else {
            setBuildings([]);
        }
    }, [assignedPlotId]);

    useEffect(() => {
        if (assignedBuildingId) {
            locationsService.getFloors(Number(assignedBuildingId)).then(setFloors);
        } else {
            setFloors([]);
        }
    }, [assignedBuildingId]);

    useEffect(() => {
        if (assignedFloorId) {
            locationsService.getRooms(Number(assignedFloorId)).then(setRooms);
        } else {
            setRooms([]);
        }
    }, [assignedFloorId]);

    // --- Dynamic Pricing Engine ---
    const handleOfferedRateChange = (val: number | string) => {
        const numVal = Number(val);
        setOfferedRate(numVal);
        if (exchangeRate > 0) {
            setOfferedRateEtb((numVal * exchangeRate).toFixed(4));
        }
    };

    const handleOfferedRateEtbChange = (val: number | string) => {
        const numVal = Number(val);
        setOfferedRateEtb(numVal);
        if (exchangeRate > 0) {
            setOfferedRate((numVal / exchangeRate).toFixed(4));
        }
    };

    const handleLandPriceEtbChange = (val: number | string) => {
        setLandPriceEtb(val);
    };

    const totalLandValue = (Number(landPriceEtb) * Number(offeredSpace));

    if (!targetInquiry) return null;

    const handleProposalSubmit = async () => {
        setLoading(true);
        try {
            await inquiriesService.submitProposal(targetInquiry.id, {
                capexFDI: Number(capexFDI),
                estimatedJobs: Number(estimatedJobs),
                remarks: remarks,
                submissionDate: submissionDate?.toISOString()
            });
            toast.success('Proposal submitted successfully');
            handleSuccess && handleSuccess();
            onClose();
        } catch (e) {
            toast.error('Failed to submit proposal');
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluation = async (decision: string) => {
        setLoading(true);
        try {
            await inquiriesService.evaluateProposal(targetInquiry.id, { decision, remarks: remarks || 'Administrative evaluation completed.' });
            toast.success(`Proposal ${decision.toLowerCase()}ed`);
            handleSuccess && handleSuccess();
            onClose();
        } catch (e) {
            toast.error('Failed to evaluate proposal');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateOffer = async () => {
        setLoading(true);
        try {
            await inquiriesService.generateOffer(targetInquiry.id, {
                offeredSpace: Number(offeredSpace),
                offeredRate: Number(offeredRate),
                offeredRateEtb: Number(offeredRateEtb),
                landPriceEtb: Number(landPriceEtb),
                totalLandValue: totalLandValue,
                exchangeRate: Number(exchangeRate),
                rateType: rateType,
                offeredCurrency,
                validUntil: validUntil?.toISOString(),
                remarks: remarks,
                assignedZoneId: assignedZoneId ? Number(assignedZoneId) : undefined,
                assignedBlockId: assignedBlockId ? Number(assignedBlockId) : undefined,
                assignedPlotId: assignedPlotId ? Number(assignedPlotId) : undefined,
                assignedBuildingId: assignedBuildingId ? Number(assignedBuildingId) : undefined,
                assignedFloorId: assignedFloorId ? Number(assignedFloorId) : undefined,
                assignedRoomId: assignedRoomId ? Number(assignedRoomId) : undefined,
                assignedLandResourceId: assignedLandResourceId ? Number(assignedLandResourceId) : undefined,
            });
            toast.success('Official offer letter generated');
            handleSuccess && handleSuccess();
            onClose();
        } catch (e) {
            toast.error('Failed to generate offer');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOffer = async () => {
        setLoading(true);
        try {
            await inquiriesService.acceptOffer(targetInquiry.id);
            toast.success('Offer acceptance recorded');
            handleSuccess && handleSuccess();
            onClose();
        } catch (e) {
            toast.error('Failed to record acceptance');
        } finally {
            setLoading(false);
        }
    };

    const handleFulfillContract = async () => {
        setLoading(true);
        try {
            await inquiriesService.fulfillContract(targetInquiry.id, {
                duration: targetInquiry.inquiryType === 'LAND_SUBLEASE' ? Number(duration) * 12 : Number(duration),
                startDate: startDate?.toISOString(),
                securityDeposit: Number(securityDeposit),
                advancePayment: Number(advancePayment),
                remarks: remarks,
                residencyDate: residencyDate?.toISOString(),
                gracePeriod: Number(gracePeriod),
                gracePeriodOffset: Number(gracePeriodOffset),
                gracePeriodRemarks: gracePeriodRemarks,
                landTitleRef,
                phase,
                exchangeRate: Number(exchangeRate),
                rateType: rateType,
                offeredRateEtb: Number(offeredRateEtb),
                landPriceEtb: Number(landPriceEtb),
                totalLandValue: totalLandValue,
                constructionStatusId: constructionStatusId ? Number(constructionStatusId) : undefined
            });
            toast.success('Contract fulfilled & lease activated');
            handleSuccess && handleSuccess();
            onClose();
        } catch (e) {
            toast.error('Failed to fulfill contract');
        } finally {
            setLoading(false);
        }
    };

    const renderStageContent = () => {
        switch (targetInquiry.status) {
            case 'LOI':
                return (
                    <Stack gap={32}>
                        <Stack gap={8}>
                            <Group gap="xs">
                                <Activity size={20} className="text-[#0C7C92]" />
                                <Title order={4} className="text-slate-800 tracking-tight">1. Strategic Intake Assessment</Title>
                            </Group>
                            <Text size="sm" c="dimmed">Initialize the formal application process by validating institutional interest and investment potential.</Text>
                        </Stack>

                        <Group grow align="stretch">
                            <Paper withBorder p="xl" radius="2rem" className="bg-slate-50/50">
                                <Stack gap="md">
                                    <Group gap="xs">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <DollarSign size={16} className="text-[#0C7C92]" />
                                        </div>
                                        <Text size="xs" fw={900} className="uppercase tracking-widest text-slate-500">Economic Impact</Text>
                                    </Group>
                                    <NumberInput
                                        label="FDI Investment (USD)"
                                        description="Projected capital expenditure"
                                        placeholder="Enter amount"
                                        value={capexFDI}
                                        onChange={setCapexFDI}
                                        radius="md"
                                        size="md"
                                        styles={{ input: { fontWeight: 900 } }}
                                    />
                                </Stack>
                            </Paper>

                            <Paper withBorder p="xl" radius="2rem" className="bg-slate-50/50 border-slate-100 shadow-sm">
                                <Stack gap="md">
                                    <Group gap="xs">
                                        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                                            <Users size={16} className="text-brand-teal" />
                                        </div>
                                        <Text size="xs" fw={800} className="uppercase tracking-wide text-brand-navy/60 font-primary">Personnel Impact</Text>
                                    </Group>
                                    <NumberInput
                                        label="Projected Employment"
                                        description="Estimated headcount generation"
                                        placeholder="Enter headcount"
                                        value={estimatedJobs}
                                        onChange={setEstimatedJobs}
                                        radius="md"
                                        size="md"
                                        styles={{ input: { fontWeight: 700 } }}
                                    />
                                </Stack>
                            </Paper>
                        </Group>

                        <Textarea
                            label="Administrative Internal Notes"
                            placeholder="Record findings from initial screening..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.currentTarget.value)}
                            radius="xl"
                            minRows={4}
                            size="md"
                        />
                    </Stack>
                );

            case 'PROPOSAL_PENDING':
                return (
                    <Stack gap={32}>
                        <Stack gap={8}>
                            <Group gap="xs">
                                <ShieldCheck size={20} className="text-blue-600" />
                                <Title order={4} className="text-slate-800 tracking-tight">2. Strategic Proposal Review</Title>
                            </Group>
                            <Text size="sm" c="dimmed">Perform an in-depth audit of document compliance and identify misalignment with Park Master Plan.</Text>
                        </Stack>

                        <Paper withBorder p="xl" radius="2rem" className="bg-slate-50/30">
                            <Stack gap="md">
                                <DateInput
                                    label="Proposal Submission Date"
                                    description="Official date recorded on application"
                                    value={submissionDate}
                                    onChange={setSubmissionDate}
                                    radius="md"
                                    size="md"
                                    leftSection={<Calendar size={16} />}
                                    mb="md"
                                />
                                <Textarea
                                    label="Administrative Evaluation Verdict"
                                    placeholder="Explain the technical and commercial justification for approval or rejection..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.currentTarget.value)}
                                    radius="xl"
                                    minRows={6}
                                    size="md"
                                />
                            </Stack>
                        </Paper>
                    </Stack>
                );

            case 'PROPOSAL_APPROVED':
                return (
                    <Stack gap={32}>
                        <Stack gap={8}>
                            <Group gap="xs">
                                <Coins size={20} className="text-[#0C7C92]" />
                                <Title order={4} className="text-slate-800 tracking-tight">3. Strategic Term Configuration</Title>
                            </Group>
                            <Text size="sm" c="dimmed">Define the allocated spatial resources and commercial parameters for the official institutional offer.</Text>
                        </Stack>

                        <Paper withBorder p="xl" radius="2rem" className="bg-slate-50/50">
                            <Stack gap="xl">
                                {/* Institutional Space Guardian */}
                                {(targetInquiry as any).availableArea !== undefined && (
                                    <Paper p="md" radius="lg" withBorder style={{ borderStyle: 'dashed', backgroundColor: (targetInquiry as any).isSingleTenantOccupied || ((offeredSpace || 0) > (targetInquiry as any).availableArea) ? '#fef2f2' : '#f0fdf4' }}>
                                        <Group justify="space-between" align="start">
                                            <Stack gap={2}>
                                                <Group gap="xs">
                                                    <Info size={14} className="text-slate-500" />
                                                    <Title order={3} fw={800} className="text-brand-navy font-primary mt-2">Spatial Capacity Monitoring</Title>
                                                </Group>
                                                <Text size="sm" fw={700} c={(targetInquiry as any).isSingleTenantOccupied || ((offeredSpace || 0) > (targetInquiry as any).availableArea) ? 'red.9' : 'teal.9'}>
                                                    {(targetInquiry as any).isSingleTenantOccupied
                                                        ? "RESOURCE FULLY OCCUPIED: Single-tenant unit"
                                                        : `FREE SPACE: ${(targetInquiry as any).availableArea} m² available for new tenancy`}
                                                </Text>
                                            </Stack>
                                            {(targetInquiry as any).totalResourceArea && (
                                                <Text size="xs" fw={600} c="dimmed">
                                                    Total Unit: {(targetInquiry as any).totalResourceArea} m²
                                                </Text>
                                            )}
                                        </Group>
                                    </Paper>
                                )}

                                <Group grow>
                                    <NumberInput
                                        label={trackConfig.spaceLabel}
                                        description="Final spatial commitment"
                                        value={offeredSpace}
                                        onChange={setOfferedSpace}
                                        radius="md"
                                        size="md"
                                        leftSection={<Maximize size={16} />}
                                    />
                                </Group>

                                <Divider label="Spatial Allocation (Form B)" labelPosition="center" />

                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                    <Select
                                        label="Target Zone"
                                        placeholder="Select Zone"
                                        data={zones.map(z => ({ value: z.id.toString(), label: z.name }))}
                                        value={assignedZoneId.toString()}
                                        onChange={(val) => {
                                            setAssignedZoneId(val || '');
                                            setAssignedBlockId('');
                                            setAssignedPlotId('');
                                        }}
                                        radius="md"
                                    />
                                    <Select
                                        label="Strategic Block"
                                        placeholder="Select Block"
                                        data={blocks.map(b => ({ value: b.id.toString(), label: b.name }))}
                                        value={assignedBlockId.toString()}
                                        onChange={(val) => {
                                            setAssignedBlockId(val || '');
                                            setAssignedPlotId('');
                                        }}
                                        disabled={!assignedZoneId}
                                        radius="md"
                                    />
                                    <Select
                                        label={isLand ? "Industrial Plot" : "Building Plot"}
                                        placeholder="Select Plot"
                                        data={plots.map(p => ({ value: p.id.toString(), label: p.code }))}
                                        value={assignedPlotId.toString()}
                                        onChange={(val) => {
                                            setAssignedPlotId(val || '');
                                            setAssignedBuildingId('');
                                        }}
                                        disabled={!assignedBlockId}
                                        radius="md"
                                    />
                                    {!isLand && (
                                        <Select
                                            label="Building Registry"
                                            placeholder="Select Building"
                                            data={buildings.map(b => ({ value: b.id.toString(), label: b.name }))}
                                            value={assignedBuildingId.toString()}
                                            onChange={(val) => {
                                                setAssignedBuildingId(val || '');
                                                setAssignedFloorId('');
                                            }}
                                            disabled={!assignedPlotId}
                                            radius="md"
                                        />
                                    )}
                                    {!isLand && (
                                        <Select
                                            label="Target Level / Floor"
                                            placeholder="Select Floor"
                                            data={floors.map(f => ({ value: f.id.toString(), label: `Floor ${f.floorNumber}` }))}
                                            value={assignedFloorId.toString()}
                                            onChange={(val) => {
                                                setAssignedFloorId(val || '');
                                                setAssignedRoomId('');
                                            }}
                                            disabled={!assignedBuildingId}
                                            radius="md"
                                        />
                                    )}
                                    {!isLand && (
                                        <Select
                                            label="Specific Unit / Room"
                                            placeholder="Select Unit"
                                            data={rooms.map(r => ({ value: r.id.toString(), label: r.code }))}
                                            value={assignedRoomId.toString()}
                                            onChange={(val) => setAssignedRoomId(val || '')}
                                            disabled={!assignedFloorId}
                                            radius="md"
                                        />
                                    )}
                                </SimpleGrid>

                                <Group grow>
                                    <NumberInput
                                        label={trackConfig.rateLabel}
                                        description={isLand ? "Institutional annual rate" : "Standard commercial rate"}
                                        value={offeredRate}
                                        onChange={handleOfferedRateChange}
                                        radius="md"
                                        size="md"
                                        leftSection={<DollarSign size={16} />}
                                    />
                                </Group>

                                <Group grow>
                                    <Select
                                        label="Operational Currency"
                                        data={currencies.map(c => ({ value: c.lookupCode, label: c.lookupValue.en }))}
                                        value={offeredCurrency}
                                        onChange={(val) => setOfferedCurrency(val || 'USD')}
                                        radius="md"
                                        size="md"
                                    />
                                    <DateInput
                                        label="Offer Validity Expiry"
                                        description="Acceptance deadline"
                                        value={validUntil}
                                        onChange={setValidUntil}
                                        radius="md"
                                        size="md"
                                        leftSection={<Calendar size={16} />}
                                    />
                                </Group>

                                <Group grow>
                                    <NumberInput
                                        label="Rate in ETB (Indicative)"
                                        description={`Live at 1 USD = ${exchangeRate.toFixed(2)} ETB`}
                                        value={offeredRateEtb}
                                        onChange={handleOfferedRateEtbChange}
                                        radius="md"
                                        size="md"
                                        leftSection={<Coins size={16} />}
                                    />
                                    {isLand && (
                                        <NumberInput
                                            label="Land Price per m² (ETB)"
                                            description="Institutional lease base rate"
                                            value={landPriceEtb}
                                            onChange={handleLandPriceEtbChange}
                                            radius="md"
                                            size="md"
                                            leftSection={<Factory size={16} />}
                                        />
                                    )}
                                </Group>

                                {isLand && (
                                    <Paper p="md" radius="lg" bg="slate.0" withBorder>
                                        <Group justify="space-between">
                                            <Text size="sm" fw={700}>Projected Total Land Value (ETB):</Text>
                                            <Text size="lg" fw={900} c="brand-navy">
                                                {(Number(landPriceEtb) * Number(offeredSpace)).toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                                            </Text>
                                        </Group>
                                    </Paper>
                                )}
                            </Stack>
                        </Paper>

                        <Textarea
                            label="Negotiated Clauses & Rate Adjustments"
                            placeholder="Specify special terms, fit-out credits, or rate escalation clauses..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.currentTarget.value)}
                            radius="xl"
                            minRows={4}
                            size="md"
                        />
                    </Stack>
                );

            case 'OFFER_SENT':
                return (
                    <Stack gap={32} ta="center">
                        <Stack gap={8}>
                            <Group gap="xs" justify="center">
                                <CheckCircle2 size={20} className="text-green-500" />
                                <Title order={4} className="text-slate-800 tracking-tight">4. Acceptance Verification</Title>
                            </Group>
                            <Text size="sm" c="dimmed">The institutional offer has been dispatched. Waiting for formal acceptance/signature.</Text>
                        </Stack>

                        <Paper withBorder p={40} radius="2.5rem" className="bg-blue-50/20 border-blue-100 flex flex-col items-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Send size={32} className="text-blue-600" />
                            </div>
                            <Title order={3} className="text-[#16284F] tracking-tight mb-2">Offer Dispatched</Title>
                            <Text size="sm" c="dimmed" max-w={400}>
                                The proposal is currently under review by the tenant. Legal execution can proceed once the signed offer is received.
                            </Text>

                            <Group gap="xl" mt={32}>
                                <Stack gap={2} align="center">
                                    <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wide">Valid Until</Text>
                                    <Text fw={700}>{validUntil?.toLocaleDateString() || 'N/A'}</Text>
                                </Stack>
                                <Divider orientation="vertical" />
                                <Stack gap={2} align="center">
                                    <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wide">Offered Space</Text>
                                    <Text fw={700}>{offeredSpace} m²</Text>
                                </Stack>
                            </Group>
                        </Paper>
                    </Stack>
                );

            case 'OFFER_ACCEPTED':
                return (
                    <Stack gap={32}>
                        <Stack gap={8}>
                            <Group gap="xs">
                                <FileSignature size={20} className="text-[#16284F]" />
                                <Title order={4} className="text-slate-800 tracking-tight">5. Final Legal Execution</Title>
                            </Group>
                            <Text size="sm" c="dimmed">Finalize the official lease registry entry and define the residency timeline.</Text>
                        </Stack>

                        <Paper withBorder p="xl" radius="2rem" className="bg-slate-50/50">
                            <Stack gap="xl">
                                <Group grow>
                                    <NumberInput
                                        label={trackConfig.termLabel}
                                        description={isLand ? "Duration of land lease" : "Duration of the residency"}
                                        value={duration}
                                        onChange={setDuration}
                                        radius="md"
                                        size="md"
                                    />
                                    <DateInput
                                        label="Commencement Date"
                                        description="Legal start of billing"
                                        value={startDate}
                                        onChange={setStartDate}
                                        radius="md"
                                        size="md"
                                        leftSection={<Calendar size={16} />}
                                    />
                                </Group>

                                <Group grow>
                                    <NumberInput
                                        label="Security Deposit"
                                        description="Escrowed collateral"
                                        value={securityDeposit}
                                        onChange={setSecurityDeposit}
                                        radius="md"
                                        size="md"
                                        leftSection={<DollarSign size={16} />}
                                    />
                                    <NumberInput
                                        label="Advance Rent Payment"
                                        description="Initial collection"
                                        value={advancePayment}
                                        onChange={setAdvancePayment}
                                        radius="md"
                                        size="md"
                                        leftSection={<DollarSign size={16} />}
                                    />
                                </Group>
                            </Stack>
                            <Stack gap="xs" className="p-4 bg-[#16284F]/5 rounded-2xl border border-[#16284F]/10">
                                <Group gap="xs">
                                    <Fingerprint size={16} className="text-[#0C7C92]" />
                                    <Text size="xs" fw={900} className="text-[#16284F] uppercase tracking-widest">Institutional Registry Identity</Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm" fw={700} className="text-slate-600">Generated Resident ID:</Text>
                                    <Badge variant="filled" color="cyan" radius="sm" size="lg" className="font-mono">
                                        EITP-RES-REN-REG-XXXXXX
                                    </Badge>
                                </Group>
                            </Stack>

                            {targetInquiry.inquiryType === 'LAND_SUBLEASE' && (
                                <Stack gap="xs" mt="md" className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                                    <Group gap="xs">
                                        <Info size={16} className="text-orange-600" />
                                        <Text size="xs" fw={900} className="text-orange-800 uppercase tracking-widest">Specialized Land Assets</Text>
                                    </Group>
                                    <Group grow>
                                        <TextInput
                                            label="Land Title Reference"
                                            placeholder="Enter Title Certificate #"
                                            value={landTitleRef}
                                            onChange={(e) => setLandTitleRef(e.currentTarget.value)}
                                            radius="md"
                                        />
                                        <Select
                                            label="Construction Milestone"
                                            description="Current physical progress"
                                            placeholder="Select status"
                                            data={constructionStatuses.map(s => ({ value: s.id.toString(), label: s.lookupValue.en }))}
                                            value={constructionStatusId.toString()}
                                            onChange={(val) => setConstructionStatusId(val || '')}
                                            radius="md"
                                        />
                                    </Group>
                                    <Select
                                        label="Target Phase"
                                        data={['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4']}
                                        value={phase}
                                        onChange={(val) => setPhase(val || 'Phase 1')}
                                        radius="md"
                                        mt="md"
                                    />
                                </Stack>
                            )}
                        </Paper>

                        <Paper withBorder p="xl" radius="2rem" className="bg-teal-50/30 border-teal-100">
                            <Stack gap="xl">
                                <Group grow>
                                    <DateInput
                                        label="Official Residency / Handover Date"
                                        placeholder="Physical occupancy start"
                                        description="Institutional cut-off date"
                                        value={residencyDate}
                                        onChange={setResidencyDate}
                                        radius="md"
                                        size="md"
                                    />
                                    <NumberInput
                                        label={`Grace Period (${isLand ? 'Years' : 'Months'})`}
                                        description="Duration of rent-free"
                                        value={gracePeriod}
                                        onChange={setGracePeriod}
                                        radius="md"
                                        size="md"
                                    />
                                </Group>
                                <Textarea
                                    label="Strategic Incentive Clauses"
                                    placeholder="Specify terms for the grace period or fit-out incentives..."
                                    value={gracePeriodRemarks}
                                    onChange={(e) => setGracePeriodRemarks(e.currentTarget.value)}
                                    radius="lg"
                                />
                            </Stack>
                        </Paper>

                        <Textarea
                            label="Final Registry Remarks"
                            placeholder="Add final commentary for the permanent lease record..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.currentTarget.value)}
                            radius="xl"
                            minRows={3}
                        />
                    </Stack>
                );

            default:
                return (
                    <Stack gap="xl">
                        <Paper withBorder p={40} radius="2rem" className="bg-slate-50 border-dashed border-2">
                            <Stack align="center" gap="md" ta="center">
                                <div className="p-4 bg-green-100 rounded-full">
                                    <CheckCircle2 size={48} className="text-green-600" />
                                </div>
                                <Box>
                                    <Text fw={900} size="xl" className="text-slate-800 tracking-tight">Lifecycle Verified & Operational</Text>
                                    <Text size="sm" c="dimmed" className="max-w-md mx-auto mt-1">
                                        This strategic milestone is secured. The resident is now active in the system registry, and all commercial parameters are synchronized.
                                    </Text>
                                </Box>
                                <Divider w="100%" label="Operational Baseline" labelPosition="center" />
                                <Group grow w="100%">
                                    <Paper withBorder p="md" radius="lg" className="bg-white">
                                        <Text size="xs" fw={900} c="dimmed" className="uppercase tracking-widest">Allocation</Text>
                                        <Text size="lg" fw={900}>{targetInquiry.offeredSpace || targetInquiry.requestedSize} m²</Text>
                                    </Paper>
                                    <Paper withBorder p="md" radius="lg" className="bg-white">
                                        <Text size="xs" fw={900} c="dimmed" className="uppercase tracking-widest">Lease Rate</Text>
                                        <Text size="lg" fw={900}>{targetInquiry.offeredRate} {targetInquiry.offeredCurrency}/m²</Text>
                                    </Paper>
                                    <Paper withBorder p="md" radius="lg" className="bg-white">
                                        <Text size="xs" fw={900} c="dimmed" className="uppercase tracking-widest">Residency</Text>
                                        <Text size="lg" fw={900}>{targetInquiry.residencyDate ? new Date(targetInquiry.residencyDate).toLocaleDateString() : 'N/A'}</Text>
                                    </Paper>
                                </Group>
                            </Stack>
                        </Paper>
                    </Stack>
                );
        }
    };

    const renderStageActions = () => {
        switch (targetInquiry.status) {
            case 'LOI':
                return (
                    <Button
                        fullWidth
                        radius="xl"
                        size="lg"
                        bg="#0C7C92"
                        h={54}
                        loading={loading}
                        onClick={handleProposalSubmit}
                        leftSection={<Send size={18} />}
                        className="shadow-xl shadow-[#0C7C92]/20 hover:scale-[1.01] transition-transform font-black"
                    >
                        Authorize & Transition to Strategic Review
                    </Button>
                );
            case 'PROPOSAL_PENDING':
                return (
                    <Group grow>
                        <Button
                            variant="outline"
                            color="red"
                            radius="xl"
                            size="lg"
                            h={54}
                            loading={loading}
                            onClick={() => handleEvaluation('REJECTED')}
                            className="border-2 font-black"
                        >
                            Decline Application
                        </Button>
                        <Button
                            radius="xl"
                            size="lg"
                            h={54}
                            bg="green.7"
                            loading={loading}
                            onClick={() => handleEvaluation('APPROVED')}
                            leftSection={<CheckCircle2 size={18} />}
                            className="shadow-lg shadow-green-200 font-black"
                        >
                            Approve Strategic Eligibility
                        </Button>
                    </Group>
                );
            case 'PROPOSAL_APPROVED':
                return (
                    <Button
                        fullWidth
                        radius="xl"
                        size="lg"
                        h={54}
                        bg="#0C7C92"
                        loading={loading}
                        onClick={handleGenerateOffer}
                        leftSection={<Send size={18} />}
                        className="shadow-xl font-black"
                    >
                        Generate & Dispatch Official Offer
                    </Button>
                );
            case 'OFFER_SENT':
                return (
                    <Stack gap="xs" w="100%">
                        <Button
                            fullWidth
                            radius="xl"
                            size="lg"
                            h={54}
                            color="green"
                            loading={loading}
                            onClick={handleAcceptOffer}
                            leftSection={<CheckCircle2 size={20} />}
                            className="shadow-xl shadow-green-200 font-black"
                        >
                            Record Official Signature & Proceed
                        </Button>
                        <Text size="xs" c="dimmed" fw={700} ta="center">ONLY record signature after physical or digital receipt of the signed offer.</Text>
                    </Stack>
                );
            case 'OFFER_ACCEPTED':
                return (
                    <Button
                        fullWidth
                        radius="xl"
                        size="lg"
                        h={54}
                        bg="#16284F"
                        loading={loading}
                        onClick={handleFulfillContract}
                        leftSection={<FileSignature size={20} />}
                        className="shadow-xl font-black"
                    >
                        Sync to Registry & Execute Residency
                    </Button>
                );
            default:
                return (
                    <Button
                        variant="light"
                        fullWidth
                        radius="xl"
                        size="md"
                        color="gray"
                        onClick={onClose}
                    >
                        Close Mission Control
                    </Button>
                );
        }
    }

    const currentStep = targetInquiry.status === 'LOI' ? 0 :
        targetInquiry.status === 'PROPOSAL_PENDING' ? 1 :
            targetInquiry.status === 'PROPOSAL_APPROVED' ? 2 :
                targetInquiry.status === 'OFFER_SENT' ? 3 :
                    targetInquiry.status === 'OFFER_ACCEPTED' ? 4 : 5;

    const steps = [
        { label: 'Intent', icon: Activity },
        { label: 'Intelligence', icon: ShieldCheck },
        { label: 'Decision', icon: Coins },
        { label: 'Agreement', icon: CheckCircle2 },
        { label: 'Residency', icon: FileSignature },
    ];

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="1100px"
            radius="2.5rem"
            withCloseButton={false}
            padding={0}
            centered
            styles={{
                root: {
                    overflow: 'hidden'
                },
                content: {
                    boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.4)',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '90vh',
                    height: '90vh'
                },
                body: {
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    overflow: 'hidden'
                }
            }}
        >
            {/* Mission Control Header - Condensed */}
            <Box h={110} style={{ flexShrink: 0 }} className={cn("relative bg-gradient-to-br p-8 overflow-hidden", trackConfig.gradient)}>
                {/* Decorative Elements */}
                <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10px] left-[5%] w-24 h-24 bg-white/10 rounded-full blur-2xl font-black" />

                <Group justify="space-between" align="center" className="relative z-10 w-full">
                    <Stack gap={0}>
                        <Group gap="xs">
                            <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                                <trackConfig.icon size={18} className="text-white" />
                            </div>
                            <Badge variant="filled" color="white" size="xs" radius="sm" className={cn("font-black tracking-widest px-1.5", isLand ? "text-teal-900" : "text-blue-900")}>
                                {isLand ? 'LAND SUBLEASE' : 'OFFICE RENT'}
                            </Badge>
                        </Group>
                        <Title className="text-2xl font-extrabold text-white tracking-tight leading-tight mt-1">
                            Pipeline Lifecycle
                        </Title>
                    </Stack>

                    <Button
                        variant="subtle"
                        color="gray.0"
                        onClick={onClose}
                        className="hover:bg-white/10 rounded-full w-10 h-10 p-0 flex items-center justify-center border border-white/10 backdrop-blur-md"
                    >
                        <X size={20} />
                    </Button>
                </Group>
            </Box>

            {/* Workflow Navigation Bar - Condensed */}
            <Box style={{ flexShrink: 0 }} className="bg-slate-50 border-b border-slate-200 px-10 py-3">
                <Group gap={0} justify="space-between" className="relative">
                    {/* Progress Track Background */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0" />
                    <div
                        className={cn("absolute top-1/2 left-0 h-1 -translate-y-1/2 transition-all duration-700 z-0", isLand ? "bg-teal-600" : "bg-blue-600")}
                        style={{ width: `${(currentStep / 5) * 100}%` }}
                    />

                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index < currentStep;
                        const isActive = index === currentStep;

                        return (
                            <Stack key={step.label} gap={4} align="center" className="relative z-10">
                                <div className={cn(
                                    "w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                    isCompleted ? "bg-[#0C7C92] border-white text-white shadow-lg shadow-[#0C7C92]/30" :
                                        isActive ? "bg-white border-[#0C7C92] text-[#0C7C92] scale-110 shadow-xl" :
                                            "bg-[#F1F5F9] border-slate-200 text-slate-400"
                                )}>
                                    {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                                </div>
                                <Text
                                    size="9px"
                                    fw={800}
                                    className={cn(
                                        "uppercase tracking-wider transition-colors duration-500",
                                        isActive ? "text-[#0C7C92]" : isCompleted ? "text-slate-600" : "text-slate-400"
                                    )}
                                >
                                    {step.label}
                                </Text>
                            </Stack>
                        );
                    })}
                </Group>
            </Box>

            <ScrollArea
                style={{ flex: 1, minHeight: 0 }}
                type="auto"
                offsetScrollbars
                scrollbarSize={10}
                className="bg-white"
            >
                <Box p={32}>
                    <Stack gap={32}>
                        {/* Prospect Identity Pass */}
                        <Paper shadow="xs" p="xl" radius="2rem" className="bg-[#16284F]/5 border border-[#16284F]/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#16284F]/5 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:scale-110" />
                            <Group justify="space-between" align="center" className="relative z-10">
                                <Group gap="xl">
                                    <div className="w-16 h-16 rounded-2xl bg-[#16284F] flex items-center justify-center shadow-lg">
                                        <Text size="xl" fw={900} className="text-white tracking-tighter">
                                            {targetInquiry.tenant?.name?.substring(0, 2).toUpperCase()}
                                        </Text>
                                    </div>
                                    <Stack gap={2}>
                                        <Text size="xs" fw={900} className="text-[#16284F] opacity-60 uppercase tracking-[0.2em]">Validated Prospect</Text>
                                        <Text size="2xl" fw={900} className="text-[#16284F] tracking-tighter leading-none">
                                            {targetInquiry.tenant?.name}
                                        </Text>
                                    </Stack>
                                </Group>

                                <div className="text-right border-l border-[#16284F]/10 pl-10">
                                    <Text size="xs" fw={900} className="text-[#16284F] opacity-60 uppercase tracking-widest mb-1">Inquiry Identifier</Text>
                                    <Text size="xl" fw={900} className="text-[#16284F] font-mono leading-none">
                                        {targetInquiry.inquiryNumber || `INQ-${targetInquiry.id}`}
                                    </Text>
                                </div>
                            </Group>
                        </Paper>

                        <div className="animate-fade-in-up">
                            {renderStageContent()}
                        </div>
                    </Stack>
                </Box>
            </ScrollArea>

            {/* Fixed Action Footer */}
            <Box p="xl" style={{ flexShrink: 0 }} className="bg-slate-50 border-t border-slate-200">
                {renderStageActions()}
            </Box>
        </Modal>
    );
}
