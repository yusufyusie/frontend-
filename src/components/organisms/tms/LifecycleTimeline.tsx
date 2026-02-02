'use client';

import { Timeline, Text, Group, Paper, Badge, Stack, ThemeIcon } from '@mantine/core';
import {
    FileText,
    Search,
    CheckCircle2,
    Send,
    ThumbsUp,
    FileSignature,
    Home,
    LogOut,
    Clock,
    XCircle
} from 'lucide-react';
import { InquiryTimeline } from '@/services/inquiries.service';
import { format } from 'date-fns';

interface LifecycleTimelineProps {
    timeline?: InquiryTimeline[];
    currentStatus?: string;
    metadata?: any;
    status?: string;
}

const STAGE_CONFIG: Record<string, { icon: any, color: string, label: string }> = {
    'LOI': { icon: FileText, color: 'blue', label: 'Intake Assessment' },
    'PROPOSAL_PENDING': { icon: Search, color: 'yellow', label: 'Strategic Review' },
    'PROPOSAL_APPROVED': { icon: CheckCircle2, color: 'green', label: 'Eligibility Authorized' },
    'PROPOSAL_REJECTED': { icon: XCircle, color: 'red', label: 'Application Declined' },
    'OFFER_SENT': { icon: Send, color: 'blue', label: 'Offer Dispatched' },
    'OFFER_ACCEPTED': { icon: ThumbsUp, color: 'green', label: 'Acceptance Recorded' },
    'CONTRACT_DRAFT': { icon: FileSignature, color: 'orange', label: 'Legal Preparation' },
    'ACTIVE': { icon: Home, color: 'teal', label: 'Operational Activation' },
    'EXIT_PENDING': { icon: LogOut, color: 'orange', label: 'Exiting' },
    'EXITED': { icon: LogOut, color: 'gray', label: 'Exited' },
    'STATUS_UPDATE': { icon: Clock, color: 'gray', label: 'Status Update' }
};

export function LifecycleTimeline({ timeline, currentStatus, metadata, status }: LifecycleTimelineProps) {
    if (!timeline || timeline.length === 0) {
        return (
            <Paper p="xl" radius="xl" withBorder className="bg-slate-50/50 border-dashed border-2 flex items-center justify-center min-h-[200px]">
                <Stack gap="xs" align="center">
                    <Clock className="text-slate-300" size={32} />
                    <Text c="dimmed" fw={700} size="sm">No timeline records found</Text>
                </Stack>
            </Paper>
        );
    }

    return (
        <Timeline active={0} bulletSize={36} lineWidth={3} color="teal">
            {timeline.map((entry, index) => {
                const config = STAGE_CONFIG[entry.stage] || STAGE_CONFIG['STATUS_UPDATE'];
                const Icon = config.icon;

                return (
                    <Timeline.Item
                        key={entry.id}
                        bullet={
                            <ThemeIcon size={36} radius="xl" color={config.color} variant={index === 0 ? 'filled' : 'light'}>
                                <Icon size={18} />
                            </ThemeIcon>
                        }
                        title={
                            <Group justify="space-between">
                                <Text fw={900} size="sm" className="text-slate-800 uppercase tracking-tight">
                                    {config.label}
                                </Text>
                                <Badge variant="light" color="gray" size="xs">
                                    {format(new Date(entry.createdAt), 'MMM dd, yyyy HH:mm')}
                                </Badge>
                            </Group>
                        }
                    >
                        <Stack gap={4} mt={4}>
                            <Text size="xs" fw={700} className="text-slate-600">
                                Action: <span className="text-slate-900">{entry.action}</span>
                            </Text>
                            {entry.remarks && (
                                <Paper p="xs" radius="md" className="bg-slate-50 border border-slate-100 italic">
                                    <Text size="xs" c="dimmed" fw={600}>"{entry.remarks}"</Text>
                                </Paper>
                            )}
                            <Group gap="xs" mt={2}>
                                <Text size="xs" c="dimmed" fw={800}>Performed by:</Text>
                                <Badge variant="transparent" p={0} size="xs" color="blue" fw={900}>
                                    {entry.user?.username || 'System Administrator'}
                                </Badge>
                            </Group>
                        </Stack>
                    </Timeline.Item>
                );
            })}
        </Timeline>
    );
}
