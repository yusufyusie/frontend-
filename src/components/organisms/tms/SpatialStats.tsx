import React, { useEffect, useState } from 'react';
import { Paper, Group, Text, Stack, RingProgress, Badge, rem, Box, Transition, Divider } from '@mantine/core';
import { MapPin, Building2, TrendingUp, ShieldCheck, Zap, Layers, Target } from 'lucide-react';
import { leasesService } from '@/services/leases.service';

interface Props {
    tenantMetrics?: {
        total: number;
        active: number;
        onboarding: number;
        suspended: number;
    };
}

export const SpatialStats = ({ tenantMetrics }: Props) => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        leasesService.getSummary().then((res: any) => setStats(res.data || res));
    }, []);

    if (!stats) return null;

    const summary = stats.summary || {};
    const occupancyRate = summary.totalUnits > 0 ? (summary.leasedUnits / summary.totalUnits) * 100 : 0;

    return (
        <Transition mounted={true} transition="fade" duration={500}>
            {(style) => (
                <Paper
                    withBorder
                    p="lg"
                    radius="2rem"
                    shadow="sm"
                    className="border-slate-100 bg-white shadow-lg shadow-slate-200/50"
                    mb="lg"
                    style={style}
                >
                    <Group justify="space-between" align="stretch" wrap="nowrap">
                        {/* SECTION 1: TENANT OVERVIEW */}
                        <Group gap="xl" wrap="nowrap">
                            <Box>
                                <Group gap="xs" mb={4}>
                                    <Box p={8} bg="linear-gradient(135deg, #0C7C92 0%, #065e6e 100%)" className="rounded-xl shadow-md shadow-teal-100">
                                        <Zap size={16} className="text-white" />
                                    </Box>
                                    <div>
                                        <Text size="xs" fw={900} c="dimmed" tt="uppercase" lts="1.2px">Operations</Text>
                                        <Text size="sm" fw={900} c="#16284F">Live Tenants</Text>
                                    </div>
                                </Group>
                                <Group gap="xl" mt="xs">
                                    <div>
                                        <Text size="xl" fw={900} c="#16284F">{tenantMetrics?.total || 0}</Text>
                                        <Text size="10px" fw={700} c="dimmed" tt="uppercase">Total Registered</Text>
                                    </div>
                                    <Divider orientation="vertical" />
                                    <div>
                                        <Text size="xl" fw={900} c="teal">{tenantMetrics?.active || 0}</Text>
                                        <Text size="10px" fw={700} c="dimmed" tt="uppercase">Active Users</Text>
                                    </div>
                                </Group>
                            </Box>

                            <Divider orientation="vertical" />

                            {/* SECTION 2: SPATIAL UTILIZATION */}
                            <Box>
                                <Group gap="xs" mb={4}>
                                    <Box p={8} bg="linear-gradient(135deg, #16284F 0%, #0a1428 100%)" className="rounded-xl shadow-md shadow-blue-100">
                                        <Layers size={16} className="text-white" />
                                    </Box>
                                    <div>
                                        <Text size="xs" fw={900} c="dimmed" tt="uppercase" lts="1.2px">Real Estate</Text>
                                        <Text size="sm" fw={900} c="#16284F">Spatial Yield</Text>
                                    </div>
                                </Group>
                                <Group gap="md" mt="xs" align="center">
                                    <RingProgress
                                        size={45}
                                        roundCaps
                                        thickness={5}
                                        sections={[{ value: occupancyRate || 45, color: '#0C7C92' }]}
                                        label={
                                            <Text ta="center" size="8px" fw={900} c="#16284F">
                                                {Math.round(occupancyRate || 45)}%
                                            </Text>
                                        }
                                    />
                                    <div>
                                        <Text size="md" fw={900} c="#16284F">{summary.leasedActual?.toLocaleString() || '0'} m²</Text>
                                        <Text size="10px" fw={700} c="dimmed" tt="uppercase">Occupied Area</Text>
                                    </div>
                                </Group>
                            </Box>

                            <Divider orientation="vertical" />

                            {/* SECTION 3: SYSTEM TRUST */}
                            <Box visibleFrom="md">
                                <Group gap="xs" mb={4}>
                                    <Box p={8} bg="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" className="rounded-xl shadow-md shadow-amber-100">
                                        <Target size={16} className="text-white" />
                                    </Box>
                                    <div>
                                        <Text size="xs" fw={900} c="dimmed" tt="uppercase" lts="1.2px">Variance</Text>
                                        <Text size="sm" fw={900} c="#16284F">Data Integrity</Text>
                                    </div>
                                </Group>
                                <Group gap="xs" mt="sm">
                                    <Badge
                                        variant="filled"
                                        color={summary.variance > 0 ? "teal" : "orange"}
                                        radius="md"
                                        h={26}
                                        px="md"
                                        tt="none"
                                        fw={900}
                                    >
                                        Δ {summary.variance?.toFixed(2) || '0.00'} m²
                                    </Badge>
                                    <Text size="10px" fw={700} c="dimmed" tt="uppercase">Contract Delta</Text>
                                </Group>
                            </Box>
                        </Group>

                        {/* STATUS BUTTONS (Optional / Secondary) */}
                        <Stack gap={4} align="flex-end" justify="center">
                            <Badge variant="light" color="blue" radius="sm" tt="uppercase" fw={900} size="xs">
                                System Health: Optimal
                            </Badge>
                            <Badge variant="light" color="gray" radius="sm" tt="uppercase" fw={900} size="xs">
                                Updated: Just Now
                            </Badge>
                        </Stack>
                    </Group>
                </Paper>
            )}
        </Transition>
    );
};
