'use client';

import React, { useState, useEffect } from 'react';
import {
    Stack,
    Grid,
    Paper,
    Title,
    Text,
    Group,
    Box,
    Badge,
    Button,
    ActionIcon,
    Skeleton,
    Progress,
    Avatar
} from '@mantine/core';
import {
    TrendingUp,
    ShieldCheck,
    RefreshCcw,
    Download,
    PieChart,
    Activity,
    DollarSign,
    Target,
    Zap,
    Briefcase
} from 'lucide-react';
import { TradingViewChart, ChartSeriesType } from '@/components/organisms/reports/TradingViewChart';
import { ITPCPieChart } from '@/components/organisms/reports/ITPCPieChart';
import { ITPCBarChart } from '@/components/organisms/reports/ITPCBarChart';
import { ITPCRadarChart } from '@/components/organisms/reports/ITPCRadarChart';
import { financeReportsService, KPISummary, RevenueTrend } from '@/services/finance-reports.service';

export default function FinancialOverviewPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<KPISummary | null>(null);
    const [trends, setTrends] = useState<RevenueTrend[]>([]);
    const [fiscalYear] = useState(new Date().getFullYear());
    const [chartSeriesType, setChartSeriesType] = useState<ChartSeriesType>('Area');

    const loadData = async () => {
        try {
            setLoading(true);
            const [summary, trendData] = await Promise.all([
                financeReportsService.getFinanceSummary({ fiscalYear }),
                financeReportsService.getRevenueTrends({ fiscalYear }, 6)
            ]);
            setStats(summary.data);
            setTrends(trendData.data);
        } catch (error) {
            console.error('Failed to load financial overview:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [fiscalYear]);

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

    if (loading && !stats) {
        return (
            <Stack gap="xl" className="p-8">
                <Skeleton height={200} radius="3rem" />
                <Grid>
                    <Grid.Col span={{ base: 12, lg: 8 }}><Skeleton height={450} radius="3rem" /></Grid.Col>
                    <Grid.Col span={{ base: 12, lg: 4 }}><Skeleton height={450} radius="3rem" /></Grid.Col>
                </Grid>
            </Stack>
        );
    }

    return (
        <Stack gap="xl" className="p-4 lg:p-8 bg-slate-50/50 min-h-screen">
            {/* Executive Header */}
            <div className="relative">
                <Paper
                    p={40}
                    radius="3rem"
                    className="bg-[#16284F] shadow-[0_35px_60px_-15px_rgba(22,40,79,0.3)] relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0C7C92] rounded-full blur-[150px] opacity-20 -mr-48 -mt-48 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFD700] rounded-full blur-[180px] opacity-[0.05] -ml-24 -mb-24" />

                    <Group justify="space-between" align="flex-start" className="relative z-10">
                        <Stack gap="xs">
                            <Group gap="xs">
                                <Box className="bg-[#FFD700] px-3 py-1 rounded-full">
                                    <Text size="xs" fw={950} className="text-[#16284F] tracking-[0.2em] uppercase">Executive Intelligence</Text>
                                </Box>
                                <Badge variant="dot" color="teal" size="lg" className="bg-white/5 border-white/10 text-white">Live Operations</Badge>
                            </Group>
                            <Title className="text-6xl font-[950] tracking-tighter text-white leading-none mt-2">
                                Financial <span className="text-[#FFD700]">Pulse</span>
                            </Title>
                            <Text className="text-slate-400 font-medium text-lg max-w-xl mt-2 leading-relaxed">
                                Real-time portfolio yield and revenue performance oversight for the
                                <span className="text-white ml-1">Ethiopian IT Park Management.</span>
                            </Text>
                        </Stack>

                        <Group className="mt-4 lg:mt-0">
                            <ActionIcon
                                variant="subtle"
                                size="54"
                                radius="xl"
                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                onClick={loadData}
                            >
                                <RefreshCcw size={22} className={loading ? 'animate-spin' : ''} />
                            </ActionIcon>
                            <Button
                                size="xl"
                                radius="2rem"
                                leftSection={<Download size={20} />}
                                className="bg-[#FFD700] hover:bg-yellow-400 text-[#16284F] font-black shadow-2xl shadow-yellow-500/20 px-8"
                            >
                                Export Executive Brief
                            </Button>
                        </Group>
                    </Group>
                </Paper>

                {/* KPI Overlay */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-10 -mt-10 relative z-20">
                    {[
                        { label: 'Total Revenue', value: `$${stats?.totalCollectionsUsd?.toLocaleString() || '0'}`, trend: '+12.5%', color: 'blue', icon: DollarSign },
                        { label: 'Collection Rate', value: `${stats?.collectionRate?.toFixed(1) || '0.0'}%`, trend: '+2.1%', color: 'teal', icon: Target },
                        { label: 'Active Leases', value: stats?.activeLeaseCount || 0, trend: '+3', color: 'indigo', icon: Briefcase },
                        { label: 'Portfolio Risk', value: 'LOW', trend: 'Stable', color: 'emerald', icon: ShieldCheck },
                    ].map((stat, i) => (
                        <Paper key={i} p="xl" radius="2rem" shadow="xl" className="border border-slate-100 hover:-translate-y-2 transition-transform duration-500 bg-white/95 backdrop-blur-md">
                            <Stack gap="xs">
                                <Group justify="space-between">
                                    <div className={`p-2 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <Text size="xs" fw={900} className="text-emerald-500 font-mono tracking-tighter">{stat.trend}</Text>
                                </Group>
                                <Text size="xs" fw={900} className="text-slate-400 uppercase tracking-widest mt-2">{stat.label}</Text>
                                <Text size="2xl" fw={950} className="text-slate-900 font-mono tracking-tighter truncate leading-none">{stat.value}</Text>
                            </Stack>
                        </Paper>
                    ))}
                </div>
            </div>

            {/* Content Body */}
            <Grid grow gutter="xl">
                <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Paper p={30} radius="3rem" className="bg-white border border-slate-100 shadow-xl min-h-[500px] flex flex-col">
                        <Group justify="space-between" mb="xl">
                            <Stack gap={0}>
                                <Text size="xs" fw={900} className="text-[#0C7C92] uppercase tracking-[0.2em]">Market Intelligence</Text>
                                <Title order={2} className="text-3xl font-black text-slate-900 tracking-tight">Revenue Trajectory</Title>
                            </Stack>
                            <Box className="bg-slate-50 p-1 rounded-xl">
                                <Button.Group>
                                    {(['Area', 'Line', 'Bar', 'Histogram', 'Baseline'] as const).map((t) => (
                                        <Button
                                            key={t}
                                            variant={chartSeriesType === t ? 'filled' : 'white'}
                                            bg={chartSeriesType === t ? '#0C7C92' : undefined}
                                            size="xs"
                                            radius="lg"
                                            onClick={() => setChartSeriesType(t)}
                                            className="transition-all duration-300"
                                        >
                                            {t}
                                        </Button>
                                    ))}
                                </Button.Group>
                            </Box>
                        </Group>

                        <Box className="flex-1 mt-4 relative rounded-3xl overflow-hidden border border-slate-50 bg-slate-50/20">
                            <TradingViewChart
                                data={getChartData()}
                                type={chartSeriesType}
                                height={320}
                                title={`${chartSeriesType} Performance (USD)`}
                                colors={{
                                    lineColor: '#0C7C92',
                                    areaTopColor: 'rgba(12, 124, 146, 0.4)',
                                    areaBottomColor: 'rgba(12, 124, 146, 0.05)',
                                    textColor: '#94A3B8'
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, lg: 4 }}>
                    <Stack gap="xl" h="100%">
                        <Paper p={30} radius="3rem" className="bg-gradient-to-br from-[#0C7C92] to-[#16284F] text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Activity size={120} />
                            </div>
                            <Stack gap="xl" className="relative z-10">
                                <Stack gap="xs">
                                    <Group gap="xs">
                                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                            <TrendingUp size={20} className="text-[#FFD700]" />
                                        </div>
                                        <Text size="xs" fw={900} className="uppercase tracking-widest text-slate-300">Strategy Engine</Text>
                                    </Group>
                                    <Title order={3} className="text-3xl font-black">Yield Analysis</Title>
                                </Stack>

                                <Box>
                                    <Group justify="space-between" mb={8}>
                                        <Text size="sm" fw={800} className="text-slate-300">Target Completion</Text>
                                        <Text size="sm" fw={900} className="text-[#FFD700]">82.4%</Text>
                                    </Group>
                                    <Progress value={82.4} color="yellow" size="xl" radius="xl" className="bg-white/10" />
                                </Box>

                                <Text size="sm" className="text-white/70 leading-relaxed font-medium">
                                    Strategic deployments are currently <span className="text-white font-black">exceeding 80%</span> efficiency in growth regions.
                                </Text>

                                <Button fullWidth size="lg" radius="xl" className="bg-white text-[#16284F] hover:bg-slate-100 font-black shadow-xl">
                                    Refine Strategy
                                </Button>
                            </Stack>
                        </Paper>

                        <Paper p={30} radius="3rem" className="bg-white border border-slate-100 shadow-xl flex-1 flex flex-col justify-between border-l-8 border-l-amber-400">
                            <Stack gap="lg">
                                <Group justify="space-between">
                                    <Text size="xs" fw={900} className="text-amber-600 uppercase tracking-widest">Action Required</Text>
                                    <Avatar color="amber" radius="xl"><PieChart size={20} /></Avatar>
                                </Group>
                                <Stack gap={4}>
                                    <Title order={4} className="text-2xl font-black text-slate-900">Capital Oversight</Title>
                                    <Text size="sm" className="text-slate-500 font-medium leading-relaxed">
                                        Outstanding collections identified for the current cycle.
                                    </Text>
                                </Stack>
                            </Stack>
                            <Box className="bg-amber-50 p-6 rounded-3xl mt-6">
                                <Group justify="space-between" align="flex-end">
                                    <Stack gap={0}>
                                        <Text size="xs" fw={900} className="text-amber-700 uppercase">Outstanding</Text>
                                        <Text fw={950} className="text-amber-900 font-mono text-3xl tracking-tighter leading-none">
                                            ${((stats?.pendingAmountUsd || 0) + (stats?.overdueAmountUsd || 0)).toLocaleString()}
                                        </Text>
                                    </Stack>
                                    <Zap size={24} className="text-amber-500 mb-1" />
                                </Group>
                            </Box>
                        </Paper>
                    </Stack>
                </Grid.Col>
            </Grid>

            {/* Strategic Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
                {[
                    { title: 'Revenue Target', val: `$${((stats?.totalCollectionsUsd || 0) * 1.2).toLocaleString()}`, icon: Target, desc: 'Projected FY End', color: 'indigo' },
                    { title: 'Portfolio Scale', val: stats?.activeLeaseCount || 0, icon: Briefcase, desc: 'Total Managed Units', color: 'blue' },
                    { title: 'Operational Health', val: 'PREMIUM', icon: Zap, desc: 'Current Stability Level', color: 'orange' },
                ].map((item, i) => (
                    <Paper key={i} p={30} radius="2.5rem" className="bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
                        <Group gap="lg">
                            <div className={`p-4 rounded-3xl bg-${item.color}-50 text-${item.color}-600`}>
                                <item.icon size={28} />
                            </div>
                            <Stack gap={2}>
                                <Text size="xs" fw={900} className="text-slate-400 uppercase tracking-widest">{item.title}</Text>
                                <Text size="2xl" fw={950} className="text-slate-900 font-mono italic leading-none">{item.val}</Text>
                                <Text size="xs" className="text-slate-500 font-medium">{item.desc}</Text>
                            </Stack>
                        </Group>
                    </Paper>
                ))}
            </div>

            {/* Comprehensive Chart Showcase */}
            <Stack gap="xl" className="mt-8">
                <Group justify="space-between" align="center">
                    <Stack gap={4}>
                        <Group gap="xs">
                            <Box className="bg-[#0C7C92]/10 p-3 rounded-2xl text-[#0C7C92]">
                                <PieChart size={24} />
                            </Box>
                            <Text fw={950} size="sm" className="uppercase tracking-[0.25em] text-[#0C7C92]">
                                Advanced Analytics Showcase
                            </Text>
                        </Group>
                        <Title order={2} className="text-4xl font-[950] text-slate-900 tracking-tight">
                            Multi-Series Chart Intelligence
                        </Title>
                        <Text size="sm" className="text-slate-500 font-medium max-w-3xl">
                            Comprehensive visualization suite showcasing all available chart types with ITPC branding for enhanced financial insights and data-driven decision making.
                        </Text>
                    </Stack>
                </Group>

                {/* TradingView Time-Series Charts */}
                <div>
                    <Group gap="xs" mb="lg">
                        <div className="h-1 w-1 rounded-full bg-[#0C7C92]" />
                        <Text size="xs" fw={900} className="text-slate-600 uppercase tracking-widest">TradingView Time-Series</Text>
                    </Group>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Area Chart */}
                        <Paper p={24} radius="2rem" className="bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-500">
                            <Stack gap="md">
                                <Group justify="space-between" align="center">
                                    <Stack gap={2}>
                                        <Text size="xs" fw={900} className="text-[#0C7C92] uppercase tracking-[0.2em]">Area Series</Text>
                                        <Text size="lg" fw={950} className="text-slate-900">Revenue Trends</Text>
                                    </Stack>
                                    <div className="h-0.5 w-8 bg-[#0C7C92] rounded-full" />
                                </Group>
                                <Box className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50/20">
                                    <TradingViewChart
                                        data={getChartData()}
                                        type="Area"
                                        height={200}
                                        showGrid={false}
                                        colors={{
                                            lineColor: '#0C7C92',
                                            areaTopColor: 'rgba(12, 124, 146, 0.4)',
                                            areaBottomColor: 'rgba(12, 124, 146, 0.05)',
                                            textColor: '#94A3B8'
                                        }}
                                    />
                                </Box>
                            </Stack>
                        </Paper>

                        {/* Line Chart */}
                        <Paper p={24} radius="2rem" className="bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-500">
                            <Stack gap="md">
                                <Group justify="space-between" align="center">
                                    <Stack gap={2}>
                                        <Text size="xs" fw={900} className="text-[#16284F] uppercase tracking-[0.2em]">Line Series</Text>
                                        <Text size="lg" fw={950} className="text-slate-900">Growth Trajectory</Text>
                                    </Stack>
                                    <div className="h-0.5 w-8 bg-[#16284F] rounded-full" />
                                </Group>
                                <Box className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50/20">
                                    <TradingViewChart
                                        data={getChartData()}
                                        type="Line"
                                        height={200}
                                        showGrid={false}
                                        colors={{
                                            lineColor: '#16284F',
                                            textColor: '#94A3B8'
                                        }}
                                    />
                                </Box>
                            </Stack>
                        </Paper>

                        {/* Bar (OHLC) Chart */}
                        <Paper p={24} radius="2rem" className="bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-500">
                            <Stack gap="md">
                                <Group justify="space-between" align="center">
                                    <Stack gap={2}>
                                        <Text size="xs" fw={900} className="text-[#1098AD] uppercase tracking-[0.2em]">Bar Series (OHLC)</Text>
                                        <Text size="lg" fw={950} className="text-slate-900">Price Action</Text>
                                    </Stack>
                                    <div className="h-0.5 w-8 bg-[#1098AD] rounded-full" />
                                </Group>
                                <Box className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50/20">
                                    <TradingViewChart
                                        data={(() => {
                                            const chartData = getChartData();
                                            return chartData.map((d, idx) => ({
                                                time: d.time,
                                                open: d.value * (0.95 + Math.random() * 0.05),
                                                high: d.value * (1.02 + Math.random() * 0.03),
                                                low: d.value * (0.93 + Math.random() * 0.02),
                                                close: d.value
                                            }));
                                        })()}
                                        type="Bar"
                                        height={200}
                                        showGrid={false}
                                        colors={{
                                            upColor: '#10b981',
                                            downColor: '#ef4444',
                                            textColor: '#94A3B8'
                                        }}
                                    />
                                </Box>
                            </Stack>
                        </Paper>

                        {/* Histogram Chart */}
                        <Paper p={24} radius="2rem" className="bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-500">
                            <Stack gap="md">
                                <Group justify="space-between" align="center">
                                    <Stack gap={2}>
                                        <Text size="xs" fw={900} className="text-[#10b981] uppercase tracking-[0.2em]">Histogram Series</Text>
                                        <Text size="lg" fw={950} className="text-slate-900">Volume Distribution</Text>
                                    </Stack>
                                    <div className="h-0.5 w-8 bg-[#10b981] rounded-full" />
                                </Group>
                                <Box className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50/20">
                                    <TradingViewChart
                                        data={getChartData().map(d => ({ time: d.time, value: d.value * 0.3 }))}
                                        type="Histogram"
                                        height={200}
                                        showGrid={false}
                                        colors={{
                                            lineColor: '#10b981',
                                            textColor: '#94A3B8'
                                        }}
                                    />
                                </Box>
                            </Stack>
                        </Paper>

                        {/* Baseline Chart */}
                        <Paper p={24} radius="2rem" className="bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-500">
                            <Stack gap="md">
                                <Group justify="space-between" align="center">
                                    <Stack gap={2}>
                                        <Text size="xs" fw={900} className="text-[#FFD700] uppercase tracking-[0.2em]">Baseline Series</Text>
                                        <Text size="lg" fw={950} className="text-slate-900">Variance Analysis</Text>
                                    </Stack>
                                    <div className="h-0.5 w-8 bg-[#FFD700] rounded-full" />
                                </Group>
                                <Box className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50/20">
                                    <TradingViewChart
                                        data={getChartData()}
                                        type="Baseline"
                                        height={200}
                                        showGrid={false}
                                        colors={{
                                            upColor: '#10b981',
                                            downColor: '#ef4444',
                                            textColor: '#94A3B8'
                                        }}
                                    />
                                </Box>
                            </Stack>
                        </Paper>
                    </div>
                </div>

                {/* Distribution Charts */}
                <div>
                    <Group gap="xs" mb="lg">
                        <div className="h-1 w-1 rounded-full bg-[#16284F]" />
                        <Text size="xs" fw={900} className="text-slate-600 uppercase tracking-widest">Distribution & Comparative Analytics</Text>
                    </Group>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Pie Chart */}
                        <ITPCPieChart
                            title="Lease Distribution by Type"
                            data={[
                                { name: 'Office Space', value: stats?.activeLeaseCount ? Math.floor(stats.activeLeaseCount * 0.45) : 18 },
                                { name: 'Retail Units', value: stats?.activeLeaseCount ? Math.floor(stats.activeLeaseCount * 0.25) : 10 },
                                { name: 'Co-Working', value: stats?.activeLeaseCount ? Math.floor(stats.activeLeaseCount * 0.20) : 8 },
                                { name: 'Conference', value: stats?.activeLeaseCount ? Math.floor(stats.activeLeaseCount * 0.10) : 4 },
                            ]}
                            height={250}
                        />

                        {/* Donut Chart */}
                        <ITPCPieChart
                            title="Revenue Sources"
                            data={[
                                { name: 'Lease Payments', value: Math.floor((stats?.totalCollectionsUsd || 50000) * 0.65) },
                                { name: 'Service Charges', value: Math.floor((stats?.totalCollectionsUsd || 50000) * 0.20) },
                                { name: 'Utilities', value: Math.floor((stats?.totalCollectionsUsd || 50000) * 0.10) },
                                { name: 'Other', value: Math.floor((stats?.totalCollectionsUsd || 50000) * 0.05) },
                            ]}
                            innerRadius={60}
                            height={250}
                        />

                        {/* Radar Chart */}
                        <ITPCRadarChart
                            title="Portfolio Health Index"
                            data={[
                                { name: 'Occupancy', value: 85, fullMark: 100 },
                                { name: 'Collection', value: stats?.collectionRate || 92, fullMark: 100 },
                                { name: 'Retention', value: 78, fullMark: 100 },
                                { name: 'Growth', value: stats?.monthlyGrowthRate ? Math.min(100, Math.max(0, 50 + stats.monthlyGrowthRate)) : 65, fullMark: 100 },
                                { name: 'Stability', value: 88, fullMark: 100 },
                            ]}
                            height={250}
                        />

                        {/* Bar Chart */}
                        <ITPCBarChart
                            title="Monthly Performance"
                            data={[
                                { name: 'Jan', revenue: 45000, target: 50000 },
                                { name: 'Feb', revenue: 52000, target: 50000 },
                                { name: 'Mar', revenue: 48000, target: 50000 },
                                { name: 'Apr', revenue: 61000, target: 55000 },
                                { name: 'May', revenue: 55000, target: 55000 },
                                { name: 'Jun', revenue: 67000, target: 60000 },
                            ]}
                            dataKeys={[
                                { key: 'revenue', color: '#0C7C92', label: 'Actual Revenue' },
                                { key: 'target', color: '#FFD700', label: 'Target' },
                            ]}
                            height={250}
                        />
                    </div>
                </div>
            </Stack>
        </Stack>
    );
}
