'use client';

import { useState } from 'react';
import { Modal, Button, Stack, TextInput, NumberInput, Textarea, Group, Text, Title, Stepper, Select, Divider, Paper, Box } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
    Send,
    CheckCircle2,
    FileSignature,
    ClipboardCheck,
    DollarSign,
    Users,
    Maximize,
    Calendar
} from 'lucide-react';
import { inquiriesService, Inquiry } from '@/services/inquiries.service';
import { toast } from '@/components/Toast';

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

    // Initial state derived from targetInquiry
    const [capexFDI, setCapexFDI] = useState<number | string>(targetInquiry?.capexFDI || 0);
    const [estimatedJobs, setEstimatedJobs] = useState<number | string>(targetInquiry?.estimatedJobs || 0);

    // Offer State
    const [offeredSpace, setOfferedSpace] = useState<number | string>(targetInquiry?.offeredSpace || targetInquiry?.requestedSize || 0);
    const [offeredRate, setOfferedRate] = useState<number | string>(targetInquiry?.offeredRate || 0);
    const [offeredCurrency, setOfferedCurrency] = useState<string>(targetInquiry?.offeredCurrency || 'USD');
    const [validUntil, setValidUntil] = useState<Date | null>(targetInquiry?.offerValidUntil ? new Date(targetInquiry.offerValidUntil) : null);

    // Contract State
    const [duration, setDuration] = useState<number | string>(targetInquiry?.contractDuration || 12);
    const [startDate, setStartDate] = useState<Date | null>(targetInquiry?.contractStartDate ? new Date(targetInquiry.contractStartDate) : new Date());
    const [securityDeposit, setSecurityDeposit] = useState<number | string>(targetInquiry?.securityDeposit || 0);
    const [advancePayment, setAdvancePayment] = useState<number | string>(targetInquiry?.advancePayment || 0);
    const [residencyDate, setResidencyDate] = useState<Date | null>(targetInquiry?.residencyDate ? new Date(targetInquiry.residencyDate) : null);
    const [gracePeriod, setGracePeriod] = useState<number | string>(targetInquiry?.gracePeriod || 0);
    const [gracePeriodRemarks, setGracePeriodRemarks] = useState<string>(targetInquiry?.gracePeriodRemarks || '');
    const [remarks, setRemarks] = useState<string>('');

    if (!targetInquiry) return null;

    const handleProposalSubmit = async () => {
        setLoading(true);
        try {
            await inquiriesService.submitProposal(targetInquiry.id, {
                capexFDI: Number(capexFDI),
                estimatedJobs: Number(estimatedJobs),
                remarks: remarks
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
                offeredCurrency,
                validUntil: validUntil?.toISOString(),
                remarks: remarks
            });
            toast.success('Offer letter generated');
            handleSuccess && handleSuccess();
            onClose();
        } catch (e) {
            toast.error('Failed to generate offer');
        } finally {
            setLoading(false);
        }
    };

    const handleFulfillContract = async () => {
        setLoading(true);
        try {
            await inquiriesService.fulfillContract(targetInquiry.id, {
                duration: Number(duration),
                startDate: startDate?.toISOString(),
                securityDeposit: Number(securityDeposit),
                advancePayment: Number(advancePayment),
                remarks: remarks,
                residencyDate: residencyDate?.toISOString(),
                gracePeriod: Number(gracePeriod),
                gracePeriodRemarks: gracePeriodRemarks
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
                    <Stack gap="xl">
                        <Stack gap="xs">
                            <Title order={4} className="text-slate-800">Submit Business Proposal</Title>
                            <Text size="sm" c="dimmed">Finalize initial assessment and request detailed proposal from applicant.</Text>
                        </Stack>
                        <Group grow>
                            <NumberInput
                                label="Estimated Investment (USD)"
                                placeholder="CapEx / FDI"
                                leftSection={<DollarSign size={16} />}
                                value={capexFDI}
                                onChange={setCapexFDI}
                                radius="md"
                            />
                            <NumberInput
                                label="Estimated Jobs"
                                placeholder="Direct employment"
                                leftSection={<Users size={16} />}
                                value={estimatedJobs}
                                onChange={setEstimatedJobs}
                                radius="md"
                            />
                        </Group>
                        <Textarea
                            label="Initial Evaluation Remarks"
                            placeholder="Add registry notes..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.currentTarget.value)}
                            radius="md"
                        />
                        <Button
                            fullWidth
                            radius="xl"
                            size="md"
                            bg="#0C7C92"
                            loading={loading}
                            onClick={handleProposalSubmit}
                            leftSection={<Send size={18} />}
                        >
                            Move to Proposal Review
                        </Button>
                    </Stack>
                );

            case 'PROPOSAL_PENDING':
                return (
                    <Stack gap="xl">
                        <Stack gap="xs">
                            <Title order={4} className="text-slate-800">Proposal Evaluation</Title>
                            <Text size="sm" c="dimmed">Review the submitted business documents and decide eligibility.</Text>
                        </Stack>
                        <Group grow>
                            <Button
                                variant="outline"
                                color="red"
                                radius="xl"
                                size="md"
                                loading={loading}
                                onClick={() => handleEvaluation('REJECTED')}
                            >
                                Reject Proposal
                            </Button>
                            <Button
                                radius="xl"
                                size="md"
                                color="green"
                                loading={loading}
                                onClick={() => handleEvaluation('APPROVED')}
                                leftSection={<CheckCircle2 size={18} />}
                            >
                                Approve Proposal
                            </Button>
                        </Group>
                    </Stack>
                );

            case 'PROPOSAL_APPROVED':
                return (
                    <Stack gap="xl">
                        <Stack gap="xs">
                            <Title order={4} className="text-slate-800">Generate Official Offer</Title>
                            <Text size="sm" c="dimmed">Draft terms and assign spatial resources for the prospective tenant.</Text>
                        </Stack>
                        <Group grow>
                            <NumberInput
                                label="Offered Space (sqm)"
                                value={offeredSpace}
                                onChange={setOfferedSpace}
                                radius="md"
                                leftSection={<Maximize size={16} />}
                            />
                            <NumberInput
                                label="Rate (USD/sqm/mo)"
                                value={offeredRate}
                                onChange={setOfferedRate}
                                radius="md"
                                leftSection={<DollarSign size={16} />}
                            />
                        </Group>
                        <Group grow>
                            <Select
                                label="Currency"
                                data={['USD', 'ETB', 'EUR']}
                                value={offeredCurrency}
                                onChange={(val) => setOfferedCurrency(val || 'USD')}
                                radius="md"
                            />
                            <DateInput
                                label="Offer Valid Until"
                                value={validUntil}
                                onChange={setValidUntil}
                                radius="md"
                                leftSection={<Calendar size={16} />}
                            />
                        </Group>
                        <Textarea
                            label="Offer Remarks / Special Terms"
                            placeholder="Specify currency conditions or validity remarks..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.currentTarget.value)}
                            radius="md"
                        />
                        <Button
                            fullWidth
                            radius="xl"
                            size="md"
                            bg="#0C7C92"
                            loading={loading}
                            onClick={handleGenerateOffer}
                            leftSection={<Send size={18} />}
                        >
                            Send Offer Letter
                        </Button>
                    </Stack>
                );

            case 'OFFER_ACCEPTED':
                return (
                    <Stack gap="xl">
                        <Stack gap="xs">
                            <Title order={4} className="text-slate-800">Contract Fulfillment</Title>
                            <Text size="sm" c="dimmed">Finalize lease dates and financial terms to activate the residency.</Text>
                        </Stack>
                        <Group grow>
                            <NumberInput
                                label="Lease Duration (Months)"
                                value={duration}
                                onChange={setDuration}
                                radius="md"
                            />
                            <DateInput
                                label="Contract Start Date"
                                value={startDate}
                                onChange={setStartDate}
                                radius="md"
                            />
                        </Group>
                        <Group grow>
                            <NumberInput
                                label="Security Deposit"
                                value={securityDeposit}
                                onChange={setSecurityDeposit}
                                radius="md"
                                leftSection={<DollarSign size={16} />}
                            />
                            <NumberInput
                                label="Advance Payment"
                                value={advancePayment}
                                onChange={setAdvancePayment}
                                radius="md"
                                leftSection={<DollarSign size={16} />}
                            />
                        </Group>
                        <Divider label="Residency & Operational Terms" labelPosition="center" />
                        <Group grow>
                            <DateInput
                                label="Residency Date"
                                value={residencyDate}
                                onChange={setResidencyDate}
                                radius="md"
                            />
                            <NumberInput
                                label="Grace Period (Days)"
                                value={gracePeriod}
                                onChange={setGracePeriod}
                                radius="md"
                            />
                        </Group>
                        <Textarea
                            label="Grace Period Remarks"
                            placeholder="Terms for utility/fit-out..."
                            value={gracePeriodRemarks}
                            onChange={(e) => setGracePeriodRemarks(e.currentTarget.value)}
                            radius="md"
                        />
                        <Textarea
                            label="Contract / Registry Remarks"
                            placeholder="Internal tracking notes..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.currentTarget.value)}
                            radius="md"
                        />
                        <Button
                            fullWidth
                            radius="xl"
                            size="md"
                            bg="#16284F"
                            loading={loading}
                            onClick={handleFulfillContract}
                            leftSection={<FileSignature size={18} />}
                        >
                            Sign & Activate Lease
                        </Button>
                    </Stack>
                );

            default:
                return (
                    <Paper p="xl" radius="xl" withBorder className="bg-slate-50 border-dashed border-2 flex items-center justify-center min-h-[150px]">
                        <Text c="dimmed" fw={700} size="sm">No pending actions for this lifecycle stage.</Text>
                    </Paper>
                );
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="lg"
            radius="2rem"
            title={
                <Box>
                    <Group gap="sm">
                        <ClipboardCheck size={24} className="text-[#0C7C92]" />
                        <Title order={3} className="font-black text-slate-800">Workflow: {targetInquiry.status}</Title>
                    </Group>
                </Box>
            }
            padding="xl"
            styles={{
                header: { paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' },
                content: { boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }
            }}
        >
            <Stack gap="xl">
                <Box p="md" radius="xl" className="bg-[#16284F]/5 border border-[#16284F]/10">
                    <Group justify="space-between">
                        <Stack gap={0}>
                            <Text size="xs" fw={900} className="text-[#16284F] opacity-60 uppercase tracking-widest">Prospect</Text>
                            <Text size="lg" fw={900} className="text-[#16284F]">{targetInquiry.tenant?.name}</Text>
                        </Stack>
                        <Stack gap={0} align="flex-end">
                            <Text size="xs" fw={900} className="text-[#16284F] opacity-60 uppercase tracking-widest">Inquiry ID</Text>
                            <Text size="sm" fw={900} className="text-[#16284F]">{targetInquiry.inquiryNumber || targetInquiry.id}</Text>
                        </Stack>
                    </Group>
                </Box>

                {renderStageContent()}
            </Stack>
        </Modal>
    );
}
