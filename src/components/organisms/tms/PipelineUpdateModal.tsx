'use client';

import { useState, useEffect } from 'react';
import { Modal, TextInput, NumberInput, SimpleGrid, Group, Button, Stack, Title, Divider, Select, Tabs, Box, Text, Checkbox } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { History, ShieldCheck, Settings, LogOut, Briefcase, FileText, MapPin, Wrench } from 'lucide-react';
import { tenantsService } from '@/services/tenants.service';
import { toast } from '@/components/Toast';

interface PipelineUpdateModalProps {
    opened: boolean;
    onClose: () => void;
    tenant: any;
    onUpdate: () => void;
}

export function PipelineUpdateModal({ opened, onClose, tenant, onUpdate }: PipelineUpdateModalProps) {
    const [loading, setLoading] = useState(false);
    const [metadata, setMetadata] = useState<any>({});

    useEffect(() => {
        if (tenant?.metadata) {
            setMetadata(tenant.metadata);
        }
    }, [tenant]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await tenantsService.update(tenant.id, { metadata });
            toast.success('Strategy Intelligence & Pipeline updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            toast.error('Failed to update intelligence data');
        } finally {
            setLoading(false);
        }
    };

    const updateNested = (section: string, field: string, value: any) => {
        setMetadata((prev: any) => ({
            ...prev,
            [section]: {
                ...(prev[section] || {}),
                [field]: value
            }
        }));
    };

    const p = metadata.pipeline || {};
    const l = metadata.legal_permits || {};
    const o = metadata.operational || {};
    const e = metadata.exit || {};

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Box>
                    <Title order={4} className="text-[#16284F]">Master Lifecycle Intelligence</Title>
                    <Text size="xs" c="dimmed" fw={600}>Authority Management Console • {tenant.name}</Text>
                </Box>
            }
            size="70%"
            radius="2rem"
            overlayProps={{ blur: 10, opacity: 0.55 }}
            transitionProps={{ transition: 'slide-up' }}
            styles={{ header: { padding: '1.5rem 2rem' }, body: { padding: '0 2rem 2rem' } }}
        >
            <Tabs defaultValue="pipeline" variant="pills" radius="xl" color="blue">
                <Tabs.List className="bg-gray-50 p-1 border rounded-full mb-xl">
                    <Tabs.Tab value="pipeline" leftSection={<History size={16} />}>Strategic Pipeline</Tabs.Tab>
                    <Tabs.Tab value="legal" leftSection={<ShieldCheck size={16} />}>Legal & Permits</Tabs.Tab>
                    <Tabs.Tab value="operational" leftSection={<Settings size={16} />}>Operational Stage</Tabs.Tab>
                    <Tabs.Tab value="exit" leftSection={<LogOut size={16} />} color="red">Exit Tracking</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="pipeline">
                    <Stack gap="lg">
                        <Box>
                            <Title order={6} mb="xs" tt="uppercase" c="blue.8" lts="1px">LoI & Proposal Assessment</Title>
                            <SimpleGrid cols={3} spacing="md">
                                <DateInput label="LoI Date" value={p.loiDate ? new Date(p.loiDate) : null} onChange={(v) => updateNested('pipeline', 'loiDate', v)} />
                                <TextInput label="LoI Purpose" value={p.purpose || ''} onChange={(ev) => updateNested('pipeline', 'purpose', ev.currentTarget.value)} />
                                <NumberInput label="Requested Size (m²)" value={p.requestedSize || 0} onChange={(v) => updateNested('pipeline', 'requestedSize', v)} />
                                <DateInput label="Proposal Submission" value={p.submissionDate ? new Date(p.submissionDate) : null} onChange={(v) => updateNested('pipeline', 'submissionDate', v)} />
                                <NumberInput label="CapEx (FDI USD)" prefix="$" value={p.capex || 0} onChange={(v) => updateNested('pipeline', 'capex', v)} />
                                <NumberInput label="Target Jobs" value={p.jobs || 0} onChange={(v) => updateNested('pipeline', 'jobs', v)} />
                            </SimpleGrid>
                        </Box>

                        <Divider variant="dashed" />

                        <Box>
                            <Title order={6} mb="xs" tt="uppercase" c="indigo.8" lts="1px">Decision & Official Offer</Title>
                            <SimpleGrid cols={3} spacing="md">
                                <Select label="Board Decision" data={['APPROVED', 'UNDER_REVIEW', 'REJECTED', 'PENDING']} value={p.decision || 'PENDING'} onChange={(v) => updateNested('pipeline', 'decision', v)} />
                                <DateInput label="Decision Date" value={p.decisionDate ? new Date(p.decisionDate) : null} onChange={(v) => updateNested('pipeline', 'decisionDate', v)} />
                                <TextInput label="Offer Number" value={p.offerNo || ''} onChange={(ev) => updateNested('pipeline', 'offerNo', ev.currentTarget.value)} />
                                <DateInput label="Offer Date" value={p.offerDate ? new Date(p.offerDate) : null} onChange={(v) => updateNested('pipeline', 'offerDate', v)} />
                                <TextInput label="Decision Remark" className="col-span-2" value={p.remark || ''} onChange={(ev) => updateNested('pipeline', 'remark', ev.currentTarget.value)} />
                            </SimpleGrid>
                        </Box>
                    </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="legal">
                    <Stack gap="lg">
                        <Box>
                            <Title order={6} mb="xs" tt="uppercase" c="teal.8" lts="1px">Land Sub-Lease & Registry</Title>
                            <SimpleGrid cols={3} spacing="md">
                                <TextInput label="Resident ID" value={l.residentId || ''} onChange={(ev) => updateNested('legal_permits', 'residentId', ev.currentTarget.value)} />
                                <TextInput label="Company Registry Name" value={l.residentName || tenant.name} onChange={(ev) => updateNested('legal_permits', 'residentName', ev.currentTarget.value)} />
                                <TextInput label="Business Sector" value={l.sector || ''} onChange={(ev) => updateNested('legal_permits', 'sector', ev.currentTarget.value)} />
                            </SimpleGrid>
                        </Box>

                        <Divider variant="dashed" label="Construction & Zoning Permits" labelPosition="center" />

                        <Box>
                            <SimpleGrid cols={3} spacing="md">
                                <TextInput label="Permission No" value={l.permissionNo || ''} onChange={(ev) => updateNested('legal_permits', 'permissionNo', ev.currentTarget.value)} />
                                <DateInput label="Permission Date" value={l.permissionDate ? new Date(l.permissionDate) : null} onChange={(v) => updateNested('legal_permits', 'permissionDate', v)} />
                                <TextInput label="Permission Duration" placeholder="e.g. 5 Years" value={l.permissionDuration || ''} onChange={(ev) => updateNested('legal_permits', 'permissionDuration', ev.currentTarget.value)} />
                                <DateInput label="Permission Expiry" value={l.permissionEndDate ? new Date(l.permissionEndDate) : null} onChange={(v) => updateNested('legal_permits', 'permissionEndDate', v)} />
                                <Select label="Permission Status" data={['VALID', 'EXPIRED', 'SUSPENDED']} value={l.permissionStatus || 'VALID'} onChange={(v) => updateNested('legal_permits', 'permissionStatus', v)} />
                            </SimpleGrid>
                        </Box>
                    </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="operational">
                    <Stack gap="lg">
                        <Box>
                            <Title order={6} mb="xs" tt="uppercase" c="orange.8" lts="1px">Handover & Project Readiness</Title>
                            <SimpleGrid cols={3} spacing="md">
                                <Checkbox label="Handover Checklist Done" mt="xl" checked={o.handoverChecklist || false} onChange={(ev) => updateNested('operational', 'handoverChecklist', ev.currentTarget.checked)} />
                                <DateInput label="Handover Date" value={o.handoverDate ? new Date(o.handoverDate) : null} onChange={(v) => updateNested('operational', 'handoverDate', v)} />
                                <TextInput label="Grace Period" placeholder="e.g. 6 Months" value={o.gracePeriod || ''} onChange={(ev) => updateNested('operational', 'gracePeriod', ev.currentTarget.value)} />
                                <DateInput label="Agreement Date" value={o.agreementDate ? new Date(o.agreementDate) : null} onChange={(v) => updateNested('operational', 'agreementDate', v)} />
                                <TextInput label="Agreement Duration" value={o.agreementDuration || ''} onChange={(ev) => updateNested('operational', 'agreementDuration', ev.currentTarget.value)} />
                                <DateInput label="Payment Start" value={o.paymentStartDate ? new Date(o.paymentStartDate) : null} onChange={(v) => updateNested('operational', 'paymentStartDate', v)} />
                            </SimpleGrid>
                        </Box>

                        <Divider variant="dashed" label="Focal Personnel & Follow-up" labelPosition="center" />

                        <Box>
                            <SimpleGrid cols={3} spacing="md">
                                <TextInput label="Focal Person (Owner)" value={o.ownerName || ''} onChange={(ev) => updateNested('operational', 'ownerName', ev.currentTarget.value)} />
                                <TextInput label="Focal Person (Manager)" value={o.managerName || ''} onChange={(ev) => updateNested('operational', 'managerName', ev.currentTarget.value)} />
                                <TextInput label="Assigned Follow-up Employee" placeholder="Authority staff name" value={o.assignedEmployee || ''} onChange={(ev) => updateNested('operational', 'assignedEmployee', ev.currentTarget.value)} />
                            </SimpleGrid>
                        </Box>
                    </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="exit">
                    <Stack gap="lg">
                        <Box p="xl" bg="red.0" style={{ borderRadius: '1.5rem', border: '1px solid #fee2e2' }}>
                            <Title order={6} mb="md" tt="uppercase" c="red.8" lts="1px">Departure & Exit Protocol</Title>
                            <SimpleGrid cols={2} spacing="md">
                                <DateInput label="Exit Date" value={e.exitDate ? new Date(e.exitDate) : null} onChange={(v) => updateNested('exit', 'exitDate', v)} />
                                <Select label="Exit Status" data={['VOLUNTARY', 'TERMINATED', 'CONTRACT_END', 'EVICTED']} value={e.status || ''} onChange={(v) => updateNested('exit', 'status', v)} />
                                <TextInput label="Departure Reason" className="col-span-2" value={e.reason || ''} onChange={(ev) => updateNested('exit', 'reason', ev.currentTarget.value)} />
                                <TextInput label="Final Closing Remarks" className="col-span-2" value={e.remark || ''} onChange={(ev) => updateNested('exit', 'remark', ev.currentTarget.value)} />
                            </SimpleGrid>
                        </Box>
                    </Stack>
                </Tabs.Panel>
            </Tabs>

            <Group justify="flex-end" mt="xl" pt="xl" style={{ borderTop: '1px solid #f1f5f9' }}>
                <Button variant="subtle" color="gray" radius="xl" onClick={onClose}>Discard Changes</Button>
                <Button
                    size="md"
                    radius="xl"
                    bg="#16284F"
                    loading={loading}
                    onClick={handleSave}
                    leftSection={<Briefcase size={18} />}
                    className="shadow-lg hover-lift"
                >
                    Commit Intelligence Updates
                </Button>
            </Group>
        </Modal>
    );
}
