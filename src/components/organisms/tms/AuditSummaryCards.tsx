import React, { useEffect, useState } from 'react';
import { Paper, Group, Text, Stack, ThemeIcon, Box, Badge, Divider, Title } from '@mantine/core';
import { Map as MapIcon, MapPin, Building2, Trees, Landmark, Gauge, AlertCircle, Grid3x3, Layers, DoorOpen, TrendingUp } from 'lucide-react';
import { leasesService } from '../../../services/leases.service';

interface Props {
    structuralMetrics?: {
        zones: number;
        blocks: number;
        plots: number;
        buildings: number;
        floors: number;
        rooms: number;
        totalArea: number;
    };
    onLevelClick?: (level: 'ZONE' | 'BLOCK' | 'PLOT' | 'BUILDING' | 'FLOOR' | 'ROOM') => void;
}

export const AuditSummaryCards = ({ structuralMetrics, onLevelClick }: Props) => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        leasesService.getSummary().then((res: any) => setStats(res.data || res));
    }, []);

    if (!stats?.reportSummary) return null;

    const { reportSummary, summary } = stats;

    return (
        <Stack gap={4} mb="md" className="animate-fade-in">
            <Paper px="md" py={8} radius="1.5rem" withBorder className="bg-white border-slate-100 shadow-sm">
                <Stack gap={4}>
                    {/* Line 1: Primary Metrics & Total Area */}
                    <Group justify="space-between" align="center" wrap="nowrap">
                        <Group gap="lg" wrap="nowrap">
                            <Group gap={6}>
                                <ThemeIcon size="xs" variant="light" color="teal" radius="xl"><Landmark size={10} /></ThemeIcon>
                                <Text size="11px" fw={700} c="dimmed" tt="uppercase">Leased:</Text>
                                <Text size="11px" fw={900} c="teal.8">{reportSummary.subLeasedArea.toLocaleString()} m²</Text>
                            </Group>

                            <Group gap={6}>
                                <ThemeIcon size="xs" variant="light" color="blue" radius="xl"><MapIcon size={10} /></ThemeIcon>
                                <Text size="11px" fw={700} c="dimmed" tt="uppercase">Vacant:</Text>
                                <Text size="11px" fw={900} c="blue.8">{reportSummary.vacantSpace.toLocaleString()} m²</Text>
                            </Group>

                            <Group gap={6}>
                                <ThemeIcon size="xs" variant="light" color="green" radius="xl"><Trees size={10} /></ThemeIcon>
                                <Text size="11px" fw={700} c="dimmed" tt="uppercase">Infra:</Text>
                                <Text size="11px" fw={900} c="green.8">{(reportSummary.roads + reportSummary.greenArea + reportSummary.utilities).toLocaleString()} m²</Text>
                            </Group>
                        </Group>

                        <Group gap={6}>
                            <Badge variant="outline" color="gray" size="xs" radius="sm">Baseline</Badge>
                            <Text size="13px" fw={900} c="#16284F">
                                {structuralMetrics?.totalArea.toLocaleString() || reportSummary.totalArea.toLocaleString()} m²
                            </Text>
                            <TrendingUp size={12} className="text-slate-400" />
                        </Group>
                    </Group>

                    <Divider color="slate.0" opacity={0.3} />

                    {/* Line 2: Structural Counts & Integrated Alert */}
                    <Group justify="space-between" align="center" wrap="nowrap">
                        <Group gap={4}>
                            {[
                                { count: structuralMetrics?.zones, label: 'Zones', key: 'ZONE' },
                                { count: structuralMetrics?.blocks, label: 'Blocks', key: 'BLOCK' },
                                { count: structuralMetrics?.plots, label: 'Plots', key: 'PLOT' },
                                { count: structuralMetrics?.buildings, label: 'Buildings', key: 'BUILDING' },
                                { count: structuralMetrics?.floors, label: 'Floors', key: 'FLOOR' },
                                { count: structuralMetrics?.rooms, label: 'Rooms', key: 'ROOM' },
                            ].map((item, idx) => (
                                <React.Fragment key={item.label}>
                                    <button
                                        onClick={() => onLevelClick?.(item.key as any)}
                                        className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-slate-50 transition-all rounded-md group"
                                    >
                                        <Text size="11px" fw={900} c="#16284F">{item.count}</Text>
                                        <Text size="9px" fw={800} tt="uppercase" c="dimmed" lts="0.2px">{item.label}</Text>
                                    </button>
                                    {idx < 5 && <div className="w-[1px] h-3 bg-slate-100" />}
                                </React.Fragment>
                            ))}
                        </Group>

                        {summary.variance !== 0 ? (
                            <Group gap={6} px={10} py={2} bg="orange.0" style={{ borderRadius: '10px', border: '1px solid #ffedd5' }}>
                                <AlertCircle size={10} className="text-orange-600" />
                                <Text size="9px" fw={800} c="orange.9" tt="uppercase">
                                    Variance: {summary.variance.toFixed(2)} m²
                                </Text>
                            </Group>
                        ) : (
                            <Badge variant="dot" color="teal" size="xs">Data Synchronized</Badge>
                        )}
                    </Group>
                </Stack>
            </Paper>
        </Stack>

    );
};
