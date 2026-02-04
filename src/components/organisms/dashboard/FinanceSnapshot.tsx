'use client';

import React, { useEffect, useState } from 'react';
import { Paper, Stack, Group, Text, Box, Grid, Badge, Skeleton, Title } from '@mantine/core';
import { TrendingUp, Target, Activity, Briefcase } from 'lucide-react';
import { TradingViewChart } from '../reports/TradingViewChart';
import { financeReportsService, KPISummary, RevenueTrend } from '@/services/finance-reports.service';

export function FinanceSnapshot() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<KPISummary | null>(null);
    const [trends, setTrends] = useState<RevenueTrend[]>([]);

    useEffect(() => {
        const loadSnapshotData = async () => {
            try {
                const [summary, trendData] = await Promise.all([
                    financeReportsService.getFinanceSummary({ fiscalYear: new Date().getFullYear() }),
                    financeReportsService.getRevenueTrends({ fiscalYear: new Date().getFullYear() }, 6)
                ]);
                setStats(summary.data);
                setTrends(trendData.data);
            } catch (error) {
                console.error('Failed to load dashboard snapshot:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSnapshotData();
    }, []);

    const getChartData = () => {
        const monthMap: { [key: string]: string } = {
            'January': '01', 'February': '02', 'March': '03', 'April': '04',
            'May': '05', 'June': '06', 'July': '07', 'August': '08',
            'September': '09', 'October': '10', 'November': '11', 'December': '12'
        };

        return (trends || []).map(t => ({
            time: `${t.year}-${monthMap[t.month] || '01'}-01`,
            value: t.amountUsd
        })).sort((a, b) => a.time.localeCompare(b.time));
    };

    if (loading) {
        return <Skeleton height={400} radius="2.5rem" />;
    }

    return (
        <Paper
            p={30}
            radius="2.5rem"
            className="bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-700 group relative"
        >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0C7C92]/5 rounded-full blur-3xl group-hover:bg-[#0C7C92]/10 transition-all duration-700 pointer-events-none" />

            <Stack gap="xl">
                <Group justify="space-between" align="center">
                    <Stack gap={2}>
                        <Group gap="xs">
                            <Box className="bg-[#0C7C92]/10 p-2 rounded-xl text-[#0C7C92]">
                                <Activity size={18} />
                            </Box>
                            <Text fw={900} size="xs" className="uppercase tracking-[0.25em] text-[#0C7C92]">
                                Global Portfolio Pulse
                            </Text>
                        </Group>
                        <Title order={3} className="text-2xl font-[950] text-slate-900 tracking-tight mt-1">
                            Current Financial Performance
                        </Title>
                    </Stack>
                    <Badge variant="filled" color="teal" size="lg" radius="xl" className="bg-emerald-500 font-black shadow-lg shadow-emerald-500/20">OPERATIONAL</Badge>
                </Group>

                <Grid grow gutter="lg">
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <Stack gap="md">
                            <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-[#0C7C92]/20 hover:shadow-xl transition-all duration-500">
                                <Group justify="space-between" mb={4}>
                                    <Text size="xs" fw={900} className="text-slate-400 uppercase tracking-widest">MTD Collections</Text>
                                    <TrendingUp size={14} className="text-emerald-500" />
                                </Group>
                                <Group align="flex-end" gap={8}>
                                    <Text size="3xl" fw={950} className="text-slate-900 font-mono tracking-tighter leading-none">
                                        ${stats?.totalCollectionsUsd?.toLocaleString() || '0'}
                                    </Text>
                                    <div className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-[10px] mb-1">
                                        {(stats?.monthlyGrowthRate || 0) > 0 ? '▲' : '▼'} {Math.abs(stats?.monthlyGrowthRate || 0).toFixed(1)}%
                                    </div>
                                </Group>
                            </div>

                            <Grid gutter="md">
                                <Grid.Col span={6}>
                                    <div className="p-4 h-full rounded-[2rem] bg-indigo-50/50 border border-indigo-100/50 text-indigo-900 flex flex-col justify-center">
                                        <Text size="xs" fw={900} className="uppercase tracking-widest mb-1 opacity-60">Capacity</Text>
                                        <Text size="xl" fw={950} className="font-mono tracking-tighter leading-none mb-1">{stats?.activeLeaseCount || 0}</Text>
                                        <Text size="xs" fw={800} className="opacity-50 text-[10px] uppercase tracking-tight">Active Units</Text>
                                    </div>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <div className="p-4 h-full rounded-[2rem] bg-amber-50/50 border border-amber-100/50 text-amber-900 flex flex-col justify-center">
                                        <Text size="xs" fw={900} className="uppercase tracking-widest mb-1 opacity-60">Overdue</Text>
                                        <Text size="xl" fw={950} className="font-mono tracking-tighter leading-none mb-1">${(((stats?.overdueAmountUsd || 0)) / 1000).toFixed(1)}K</Text>
                                        <Text size="xs" fw={800} className="opacity-50 text-amber-600 text-[10px] uppercase tracking-tight">Action Req.</Text>
                                    </div>
                                </Grid.Col>
                            </Grid>

                            <div className="p-5 rounded-[2rem] bg-[#16284F] text-white relative overflow-hidden">
                                <Box className="relative z-10">
                                    <Group justify="space-between" mb={8}>
                                        <Text size="xs" fw={800} className="text-slate-400">COLLECTION EFFICIENCY</Text>
                                        <Text size="xs" fw={950} className="text-[#FFD700]">{stats?.collectionRate?.toFixed(1) || '0.0'}%</Text>
                                    </Group>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#0C7C92] to-teal-400 rounded-full transition-all duration-1000"
                                            style={{ width: `${stats?.collectionRate || 0}%` }}
                                        />
                                    </div>
                                </Box>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Target size={40} />
                                </div>
                            </div>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <Box className="h-full min-h-[280px] rounded-[2rem] overflow-hidden border border-slate-100 bg-white shadow-inner p-4">
                            <TradingViewChart
                                data={getChartData()}
                                type="Baseline"
                                height={240}
                                title="Revenue Trajectory (USD)"
                                colors={{
                                    upColor: '#10b981',
                                    downColor: '#ef4444',
                                    textColor: '#94A3B8'
                                }}
                            />
                        </Box>
                    </Grid.Col>
                </Grid>
            </Stack>
        </Paper>
    );
}
