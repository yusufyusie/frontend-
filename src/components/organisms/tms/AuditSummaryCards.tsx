import React, { useEffect, useState } from 'react';
import { Paper, Group, Text, Stack, ThemeIcon, Box, Badge, Divider } from '@mantine/core';
import { Map, MapPin, Building2, Trees, Landmark, Gauge, AlertCircle, Grid3x3, Layers, DoorOpen, TrendingUp } from 'lucide-react';
import { leasesService } from '@/services/leases.service';
import { Title } from '@mantine/core';

interface Props {
    structuralMetrics?: {
        zones: number;
        blocks: number;
        plots: number;
        buildings: number;
        rooms: number;
        totalArea: number;
    };
    onLevelClick?: (level: 'ZONE' | 'BLOCK' | 'PLOT' | 'BUILDING' | 'ROOM') => void;
}

export const AuditSummaryCards = ({ structuralMetrics, onLevelClick }: Props) => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        leasesService.getSummary().then((res: any) => setStats(res.data || res));
    }, []);

    if (!stats?.reportSummary) return null;

    const { reportSummary, summary } = stats;

    return (
        <Stack gap="xs" mb="lg" className="animate-fade-in">
            <Paper p="md" radius="2rem" withBorder className="bg-white border-slate-100 shadow-sm">
                <Group justify="space-between" align="center" wrap="nowrap">
                    {/* Primary Audit Metrics */}
                    <Group gap="xl" wrap="nowrap">
                        <Box>
                            <Text size="10px" fw={900} c="dimmed" tt="uppercase" lts="1px" mb={4}>Sub-Leased</Text>
                            <Group gap="xs">
                                <ThemeIcon size="sm" variant="light" color="teal" radius="xl"><Landmark size={14} /></ThemeIcon>
                                <Text size="md" fw={900} c="teal">{reportSummary.subLeasedArea.toLocaleString()} m²</Text>
                            </Group>
                        </Box>

                        <Divider orientation="vertical" />

                        <Box>
                            <Text size="10px" fw={900} c="dimmed" tt="uppercase" lts="1px" mb={4}>Vacant Space</Text>
                            <Group gap="xs">
                                <ThemeIcon size="sm" variant="light" color="blue" radius="xl"><Map size={14} /></ThemeIcon>
                                <Text size="md" fw={900} c="blue">{reportSummary.vacantSpace.toLocaleString()} m²</Text>
                            </Group>
                        </Box>

                        <Divider orientation="vertical" />

                        <Box>
                            <Text size="10px" fw={900} c="dimmed" tt="uppercase" lts="1px" mb={4}>Infrastructure</Text>
                            <Group gap="xs">
                                <ThemeIcon size="sm" variant="light" color="green" radius="xl"><Trees size={14} /></ThemeIcon>
                                <Text size="md" fw={900} c="green">{(reportSummary.roads + reportSummary.greenArea + reportSummary.utilities).toLocaleString()} m²</Text>
                            </Group>
                        </Box>
                    </Group>

                    {/* Structural Counts (Compact & Clickable) */}
                    {structuralMetrics && (
                        <Group gap="xs" bg="slate.0" p={8} style={{ borderRadius: '1.25rem', border: '1px solid #f1f5f9' }}>
                            <button
                                onClick={() => onLevelClick?.('ZONE')}
                                className="flex flex-col items-center px-3 border-r border-slate-200 hover:bg-gradient-to-br hover:from-teal-50 hover:to-blue-50 transition-all rounded-lg cursor-pointer group"
                            >
                                <Text size="10px" fw={900} c="dimmed" className="group-hover:text-teal-700 transition-colors">{structuralMetrics.zones}</Text>
                                <Text size="8px" fw={700} tt="uppercase" c="dimmed" className="group-hover:text-teal-600 transition-colors">Zones</Text>
                            </button>
                            <button
                                onClick={() => onLevelClick?.('BLOCK')}
                                className="flex flex-col items-center px-3 border-r border-slate-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all rounded-lg cursor-pointer group"
                            >
                                <Text size="10px" fw={900} c="dimmed" className="group-hover:text-blue-700 transition-colors">{structuralMetrics.blocks}</Text>
                                <Text size="8px" fw={700} tt="uppercase" c="dimmed" className="group-hover:text-blue-600 transition-colors">Blocks</Text>
                            </button>
                            <button
                                onClick={() => onLevelClick?.('BUILDING')}
                                className="flex flex-col items-center px-3 border-r border-slate-200 hover:bg-gradient-to-br hover:from-violet-50 hover:to-purple-50 transition-all rounded-lg cursor-pointer group"
                            >
                                <Text size="10px" fw={900} c="dimmed" className="group-hover:text-violet-700 transition-colors">{structuralMetrics.buildings}</Text>
                                <Text size="8px" fw={700} tt="uppercase" c="dimmed" className="group-hover:text-violet-600 transition-colors">Bldgs</Text>
                            </button>
                            <button
                                onClick={() => onLevelClick?.('ROOM')}
                                className="flex flex-col items-center px-3 hover:bg-gradient-to-br hover:from-pink-50 hover:to-rose-50 transition-all rounded-lg cursor-pointer group"
                            >
                                <Text size="10px" fw={900} c="dimmed" className="group-hover:text-pink-700 transition-colors">{structuralMetrics.rooms}</Text>
                                <Text size="8px" fw={700} tt="uppercase" c="dimmed" className="group-hover:text-pink-600 transition-colors">Units</Text>
                            </button>
                        </Group>
                    )}

                    {/* Total Area / Compliance Baseline */}
                    <Box ta="right">
                        <Badge variant="light" color="gray" size="xs" radius="xl" mb={4}>Sept 2025 Baseline</Badge>
                        <Group gap="xs" justify="flex-end">
                            <Text size="xs" fw={900} c="#16284F">
                                {structuralMetrics?.totalArea.toLocaleString() || reportSummary.totalArea.toLocaleString()} m²
                            </Text>
                            <TrendingUp size={14} className="text-slate-400" />
                        </Group>
                    </Box>
                </Group>
            </Paper>

            {summary.variance !== 0 && (
                <Paper p="xs" radius="1rem" bg="orange.0" className="border border-orange-100">
                    <Group gap="xs">
                        <AlertCircle size={16} className="text-orange-600" />
                        <Text size="10px" fw={700} c="orange.9">
                            System Alert: Spatial Variance of <span className="font-black underline">{summary.variance.toFixed(2)} m²</span> detected.
                            <span className="ml-1 opacity-75 font-semibold">(Physical Survey ≠ Legal Contract)</span>
                        </Text>
                    </Group>
                </Paper>
            )}
        </Stack>
    );
};
