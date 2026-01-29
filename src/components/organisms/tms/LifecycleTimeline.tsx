'use client';

import { Timeline, Text, Paper, Title, Group, Badge, ScrollArea } from '@mantine/core';
import { FileText, CheckCircle2, Send, ShieldAlert, History, LogOut } from 'lucide-react';

interface LifecycleTimelineProps {
    metadata: any;
    status?: string;
}

export function LifecycleTimeline({ metadata, status }: LifecycleTimelineProps) {
    const p = metadata?.pipeline || {};
    const l = metadata?.legal_permits || {};
    const o = metadata?.operational || {};
    const e = metadata?.exit || {};

    return (
        <Paper withBorder p="xl" radius="xl" className="glass shadow-md h-full">
            <Group justify="space-between" mb="xl">
                <Title order={4} className="text-[#16284F]">Milestone Registry</Title>
                <Badge variant="dot" color={e.status ? 'red' : 'teal'}>
                    {e.status ? 'Status: Exit Protocol' : 'Health: Stable'}
                </Badge>
            </Group>

            <ScrollArea h={400} offsetScrollbars>
                <Timeline active={e.status ? 5 : 4} bulletSize={32} lineWidth={2}>
                    {/* LOI Stage */}
                    <Timeline.Item
                        bullet={<FileText size={16} />}
                        title="Letter of Intent (LoI)"
                        lineVariant="dashed"
                    >
                        <Text c="dimmed" size="xs">Submitted on {p.loiDate ? new Date(p.loiDate).toLocaleDateString() : 'TBD'}</Text>
                        <Text size="sm" mt={4} fw={500}>System initialized for engagement.</Text>
                    </Timeline.Item>

                    {/* Proposal Stage */}
                    <Timeline.Item
                        bullet={<Send size={16} />}
                        title="Technical Proposal"
                    >
                        <Text c="dimmed" size="xs">Evaluated {p.decisionDate ? new Date(p.decisionDate).toLocaleDateString() : 'N/A'}</Text>
                        <Text size="sm" mt={4} fw={600} c="blue.7">Result: {p.decision || 'Pending'}</Text>
                        {p.remark && <Text size="xs" fs="italic" mt={2}>"{p.remark}"</Text>}
                    </Timeline.Item>

                    {/* Offer Stage */}
                    <Timeline.Item
                        bullet={<CheckCircle2 size={16} />}
                        title="Official Offer Disposition"
                    >
                        <Text c="dimmed" size="xs">Reference: {p.offerNo || 'N/A'}</Text>
                        <Text size="sm" mt={4}>Offer extended on {p.offerDate ? new Date(p.offerDate).toLocaleDateString() : 'TBD'}.</Text>
                    </Timeline.Item>

                    {/* Operational Readiness */}
                    <Timeline.Item
                        bullet={<ShieldAlert size={16} />}
                        title="Project Handover & Readiness"
                    >
                        <Text c="dimmed" size="xs">Handover checklist: {o.handoverChecklist ? 'COMPLETE' : 'PENDING'}</Text>
                        <Text size="sm" mt={4} fw={700}>Grace Period: {o.gracePeriod || 'N/A'}</Text>
                        <Text size="xs" c="blue.6" fw={600}>Agreement Signature: {o.agreementDate ? new Date(o.agreementDate).toLocaleDateString() : 'TBD'}</Text>
                    </Timeline.Item>

                    {/* Active Milestone */}
                    {!e.status ? (
                        <Timeline.Item
                            bullet={<History size={16} />}
                            title="Active Operations"
                        >
                            <Text size="sm" mt={4} fw={600}>{status || 'Operational'}</Text>
                            <Text size="xs" c="dimmed">Payment Start: {o.paymentStartDate ? new Date(o.paymentStartDate).toLocaleDateString() : 'TBD'}</Text>
                            {l.permissionNo && <Text size="xs" bg="blue.0" p={6} mt={6} style={{ borderRadius: '8px' }}>Permit No: {l.permissionNo} ({l.permissionStatus})</Text>}
                        </Timeline.Item>
                    ) : (
                        <Timeline.Item
                            bullet={<LogOut size={16} />}
                            title="Exit & Final Settlement"
                            color="red"
                        >
                            <Text size="sm" mt={4} fw={600} c="red.7">Reason: {e.reason || 'Contract End'}</Text>
                            <Text size="xs" c="dimmed">Final departure on {e.exitDate ? new Date(e.exitDate).toLocaleDateString() : 'N/A'}</Text>
                            <Text size="xs" fs="italic" mt={4}>Remark: "{e.remark}"</Text>
                        </Timeline.Item>
                    )}
                </Timeline>
            </ScrollArea>
        </Paper>
    );
}
