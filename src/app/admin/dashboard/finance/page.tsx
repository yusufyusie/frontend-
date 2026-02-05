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
    DollarSign,
    Target,
    Zap,
    Briefcase,
    LayoutDashboard,
    TrendingDown,
    Activity,
    Clock
} from 'lucide-react';

const SparklineBars = ({ color = 'white', seed = 0 }: { color?: string; seed?: number }) => (
    <div className="flex items-end gap-1 h-8">
        {[0.4, 0.6, 0.8, 1.0].map((opacity, i) => (
            <div
                key={i}
                className="w-1.5 bg-current rounded-t-[2px] transition-all duration-500"
                style={{
                    color,
                    opacity,
                    height: `${20 + (Math.sin(seed + i) * 10) + (i * 5)}px`
                }}
            />
        ))}
    </div>
);
import { motion, AnimatePresence } from 'framer-motion';
import { TradingViewChart, ChartSeriesType } from '@/components/organisms/reports/TradingViewChart';
import { ITPCPieChart } from '@/components/organisms/reports/ITPCPieChart';
import { ITPCBarChart } from '@/components/organisms/reports/ITPCBarChart';
import { ITPCRadarChart } from '@/components/organisms/reports/ITPCRadarChart';
import { ITPCAreaChart } from '@/components/organisms/reports/ITPCAreaChart';
import { ITPCComposedChart } from '@/components/organisms/reports/ITPCComposedChart';
import {
    financeReportsService,
    KPISummary,
    RevenueTrend,
    LeaseDistribution,
    RevenueSource,
    PortfolioHealth
} from '@/services/finance-reports.service';
export default function FinancialOverviewPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<KPISummary | null>(null);
    const [trends, setTrends] = useState<RevenueTrend[]>([]);
    const [leaseDist, setLeaseDist] = useState<LeaseDistribution[]>([]);
    const [revSources, setRevSources] = useState<RevenueSource[]>([]);
    const [healthMetrics, setHealthMetrics] = useState<PortfolioHealth[]>([]);
    const [chartSeriesType, setChartSeriesType] = useState<ChartSeriesType>('Area');
    const [isAutoCycling, setIsAutoCycling] = useState(true);
    const [cycleIndex, setCycleIndex] = useState(0);

    const chartTypes: ChartSeriesType[] = ['Area', 'Line', 'Bar', 'Histogram', 'Baseline'];

    useEffect(() => {
        if (!isAutoCycling) return;

        const timer = setInterval(() => {
            setCycleIndex((prev) => (prev + 1) % chartTypes.length);
        }, 6000);

        return () => clearInterval(timer);
    }, [isAutoCycling, chartTypes.length]);

    useEffect(() => {
        setChartSeriesType(chartTypes[cycleIndex]);
    }, [cycleIndex, chartTypes]);

    const handleManualTypeChange = (type: ChartSeriesType) => {
        setChartSeriesType(type);
        setCycleIndex(chartTypes.indexOf(type));
        setIsAutoCycling(false);
        // Resume auto-cycling after 30 seconds of inactivity
        setTimeout(() => setIsAutoCycling(true), 30000);
    };

    const [fiscalYear] = useState(() => {
        const now = new Date();
        return now.getMonth() < 6 ? now.getFullYear() - 1 : now.getFullYear();
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [summary, trendData, distData, sourceData, healthData] = await Promise.all([
                financeReportsService.getFinanceSummary({ fiscalYear }),
                financeReportsService.getRevenueTrends({ fiscalYear }, 6),
                financeReportsService.getLeaseDistribution({ fiscalYear }),
                financeReportsService.getRevenueSources({ fiscalYear }),
                financeReportsService.getPortfolioHealth({ fiscalYear })
            ]);
            setStats(summary.data);
            setTrends(trendData.data);
            setLeaseDist(distData.data);
            setRevSources(sourceData.data);
            setHealthMetrics(healthData.data);
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
            'September': '09', 'October': '10', 'November': '11', 'December': '12',
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09',
            'Oct': '10', 'Nov': '11', 'Dec': '12'
        };

        return (trends || []).map(t => ({
            time: `${t.year}-${monthMap[t.month] || '01'}-01`,
            value: t.amountUsd
        })).sort((a, b: any) => a.time.localeCompare(b.time));
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
        <Stack gap="xl" className="p-4 lg:pt-2 lg:px-8 lg:pb-8 bg-slate-50/50 min-h-screen">
            {/* Executive Header */}
            <div className="relative">
                <Paper
                    pt={12}
                    pb={48}
                    px={40}
                    radius="3rem"
                    className="bg-[#16284F] shadow-[0_35px_60px_-15px_rgba(22,40,79,0.3)] relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0C7C92] rounded-full blur-[150px] opacity-20 -mr-48 -mt-48 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFD700] rounded-full blur-[180px] opacity-[0.05] -ml-24 -mb-24" />

                    <Group justify="space-between" mb="xl">
                        <Stack gap={4}>
                            <Group gap="apart">
                                <Title order={1} className="text-4xl font-[1000] tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500">
                                    Finance <span className="text-[#0C7C92] font-black">Pulse</span>
                                </Title>
                                <ActionIcon variant="subtle" color="slate" radius="xl" onClick={loadData} loading={loading}>
                                    <RefreshCcw size={18} />
                                </ActionIcon>
                            </Group>
                            <Text size="sm" fw={800} className="text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-8 h-1 bg-[#0C7C92] rounded-full" />
                                Strategic Financial Pulse
                            </Text>
                        </Stack>

                        <Button
                            leftSection={<Download size={18} />}
                            variant="filled"
                            color="#0C7C92"
                            size="md"
                            radius="xl"
                            className="shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 fw-900"
                        >
                            Export Executive Brief
                        </Button>
                    </Group>
                </Paper>

                {/* Redesigned KPI Grid with Dynamic Entry */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } }
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-10 -mt-16 relative z-20"
                >
                    {[
                        {
                            label: 'Total Revenue',
                            value: `$${stats?.totalCollectionsUsd?.toLocaleString() || '0'}`,
                            bgColor: 'bg-[#0C7C92]',
                            footerColor: 'bg-[#0A6A7D]',
                            footer: `Growth: +${stats?.monthlyGrowthRate || 0}% Monthly`,
                            icon: TrendingUp
                        },
                        {
                            label: 'Capital Inflow',
                            value: `${stats?.collectionRate?.toFixed(1) || '0.0'}%`,
                            bgColor: 'bg-[#10B981]',
                            footerColor: 'bg-[#059669]',
                            footer: `Pending: $${stats?.pendingAmountUsd?.toLocaleString() || '0'}`,
                            icon: Zap
                        },
                        {
                            label: 'Revenue Assets',
                            value: stats?.activeLeaseCount || 0,
                            bgColor: 'bg-[#16284F]',
                            footerColor: 'bg-[#122142]',
                            footer: 'Status: Active Portfolio',
                            icon: LayoutDashboard
                        },
                        {
                            label: 'Capital Stability',
                            value: 'OPTIMAL',
                            bgColor: 'bg-[#FF9800]',
                            footerColor: 'bg-[#F57C00]',
                            footer: `Rate: ${stats?.currentExchangeRate || 0} ETB/USD`,
                            icon: Activity
                        },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            className={`rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-brand-teal/20 group relative box-border`}
                        >
                            {/* Main Section */}
                            <div className={`${stat.bgColor} p-6 text-white flex justify-between items-start h-[105px] relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                <Stack gap={2} className="relative z-10">
                                    <Text size="3xl" fw={950} className="font-mono tracking-tighter leading-none">
                                        {stat.value}
                                    </Text>
                                    <Text size="xs" fw={800} className="uppercase tracking-widest text-white mt-1 flex items-center gap-2">
                                        <stat.icon size={14} className="opacity-90" />
                                        {stat.label}
                                    </Text>
                                </Stack>
                                <div className="group-hover:scale-110 transition-transform duration-500 relative z-10">
                                    <SparklineBars seed={i * 10} />
                                </div>
                            </div>

                            {/* Footer Section */}
                            <div className={`${stat.footerColor} px-6 py-4 flex items-center gap-2 text-white text-[10px] fw-900 uppercase tracking-widest border-t border-white/10 relative z-10`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                                <span>{stat.footer}</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            <div className="px-10 mt-8 mb-4">
                <div className="h-px bg-slate-200 w-full opacity-50" />
            </div>

            {/* Content Body */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch px-10">
                <div className="sm:col-span-8 flex flex-col h-full">
                    <Paper p={30} radius="3rem" className="bg-white border border-slate-100 shadow-xl min-h-[500px] flex-1 flex flex-col relative overflow-hidden">
                        <Group justify="space-between" mb="xl">
                            <Stack gap={0}>
                                <Title order={2} className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    Monthly Revenue Flow
                                    {isAutoCycling && <Badge color="#0C7C92" variant="light" size="xs" className="animate-pulse">Live Cycle</Badge>}
                                </Title>
                            </Stack>
                            <Box className="bg-slate-50 p-1 rounded-xl">
                                <Button.Group>
                                    {chartTypes.map((t) => (
                                        <Button
                                            key={t}
                                            variant={chartSeriesType === t ? 'filled' : 'white'}
                                            bg={chartSeriesType === t ? '#0C7C92' : undefined}
                                            size="xs"
                                            radius="lg"
                                            onClick={() => handleManualTypeChange(t)}
                                            className="transition-all duration-300"
                                        >
                                            {t}
                                        </Button>
                                    ))}
                                </Button.Group>
                            </Box>
                        </Group>
                        <Box className="flex-1 mt-6 relative rounded-3xl overflow-hidden border border-slate-50 bg-slate-50/20 shadow-inner">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={chartSeriesType}
                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 1.02, y: -10 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                    className="h-full w-full"
                                >
                                    <TradingViewChart
                                        data={getChartData()}
                                        type={chartSeriesType}
                                        height={400}
                                        title={`${chartSeriesType} Performance (USD)`}
                                        colors={{
                                            lineColor: '#0C7C92',
                                            areaTopColor: 'rgba(12, 124, 146, 0.4)',
                                            areaBottomColor: 'rgba(12, 124, 146, 0.05)',
                                            textColor: '#94A3B8'
                                        }}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </Box>
                    </Paper>
                </div >

                <div className="sm:col-span-4 flex flex-col h-full">
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
                                    <Title order={3} className="text-3xl font-black">Performance Velocity</Title>
                                </Stack>

                                <Box>
                                    <Group justify="space-between" mb={8}>
                                        <Text size="sm" fw={800} className="text-slate-300">Target Completion</Text>
                                        <Text size="sm" fw={900} className="text-[#FFD700]">{stats?.collectionRate || 0}%</Text>
                                    </Group>
                                    <Progress value={stats?.collectionRate || 0} color="yellow" size="xl" radius="xl" className="bg-white/10" />
                                </Box>


                                <Button fullWidth size="lg" radius="xl" className="bg-white text-[#16284F] hover:bg-slate-100 font-black shadow-xl">
                                    Refine Strategy
                                </Button>
                            </Stack>
                        </Paper>

                        <Paper p={30} radius="3rem" className="bg-white border border-slate-100 shadow-xl flex-1 flex flex-col justify-between border-l-8 border-l-amber-400">
                            <Stack gap="lg">
                                <Stack gap={4}>
                                    <Title order={4} className="text-2xl font-black text-slate-900">Capital Oversight</Title>
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
                </div>
            </div >



            {/* Comprehensive Chart Showcase */}
            < Stack gap="xl" className="mt-8" >
                <Group justify="space-between" align="center">
                    <Stack gap={4}>
                        <Title order={2} className="text-4xl font-[950] text-slate-900 tracking-tight">
                            Consolidated Financial Data
                        </Title>
                    </Stack>
                </Group>

                {/* TradingView Time-Series Charts */}
                <div>
                    <Group gap="xs" mb="lg">
                        <Text size="xs" fw={900} className="text-slate-600 uppercase tracking-widest">Revenue Segmentation</Text>
                    </Group>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Area Chart */}
                        <Paper p={24} radius="2rem" className="bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-500">
                            <Stack gap="md">
                                <Box className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50/10 shadow-sm transition-all duration-300 hover:shadow-md">
                                    <TradingViewChart
                                        data={getChartData()}
                                        type="Area"
                                        height={220}
                                        showGrid={false}
                                        currency="USD"
                                        title="Revenue Volatility"
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
                                <Box className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50/10 shadow-sm transition-all duration-300 hover:shadow-md">
                                    <TradingViewChart
                                        data={getChartData()}
                                        type="Line"
                                        height={220}
                                        showGrid={false}
                                        currency="USD"
                                        title="Growth Momentum"
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
                                <Box className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50/10 shadow-sm transition-all duration-300 hover:shadow-md">
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
                                        height={220}
                                        showGrid={false}
                                        currency="USD"
                                        title="Comparative Yield"
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
                                <Box className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50/10 shadow-sm transition-all duration-300 hover:shadow-md">
                                    <TradingViewChart
                                        data={getChartData()}
                                        type="Baseline"
                                        height={220}
                                        showGrid={false}
                                        currency="USD"
                                        title="Yield Stability Index"
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

                {/* Analytical Perspectives */}
                <div className="mt-4">
                    <Group gap="xs" mb="lg">
                        <Text size="xs" fw={900} className="text-slate-600 uppercase tracking-widest">Operational Perspectives</Text>
                    </Group>
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, xs: 6 }}>
                            <ITPCPieChart
                                title="Revenue Stream distribution"
                                data={leaseDist.length > 0 ? leaseDist : [{ name: 'Pending', value: 1 }]}
                                height={350}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, xs: 6 }}>
                            <ITPCAreaChart
                                title="Gross vs Net Operational Yield"
                                data={trends.map(t => ({
                                    name: t.month.substring(0, 3),
                                    revenue: t.amountUsd,
                                    net: t.amountUsd * 0.85
                                }))}
                                dataKeys={[
                                    { key: 'revenue', color: '#0C7C92', label: 'Gross Revenue' },
                                    { key: 'net', color: '#10b981', label: 'Net Operations' }
                                ]}
                                height={350}
                                stacked
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, xs: 6 }}>
                            <ITPCBarChart
                                title="Revenue Source Matrix"
                                data={trends.map(t => ({
                                    name: t.month.substring(0, 3),
                                    lease: t.amountUsd * 0.7,
                                    service: t.amountUsd * 0.2,
                                    other: t.amountUsd * 0.1
                                }))}
                                dataKeys={[
                                    { key: 'lease', color: '#16284F', label: 'Leases' },
                                    { key: 'service', color: '#0C7C92', label: 'Services' },
                                    { key: 'other', color: '#FFD700', label: 'Other' }
                                ]}
                                height={350}
                                stacked
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, xs: 6 }}>
                            <ITPCComposedChart
                                title="Capital Efficiency Velocity"
                                data={trends.map(t => ({
                                    name: t.month.substring(0, 3),
                                    utilization: t.amountUsd,
                                    efficiency: t.amountUsd * (0.8 + Math.random() * 0.4)
                                }))}
                                barKey="utilization"
                                lineKey="efficiency"
                                height={350}
                            />
                        </Grid.Col>
                    </Grid>
                </div>

                {/* Finance Analytics Overview */}
                <div className="mt-8 border-t border-slate-100 pt-8">
                    <Group gap="xs" mb="lg">
                        <Text size="xs" fw={900} className="text-slate-600 uppercase tracking-widest">Finance Analytics Overview</Text>
                    </Group>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Pie Chart */}
                        <ITPCPieChart
                            title="Capital Asset Mix"
                            data={leaseDist.length > 0 ? leaseDist : [{ name: 'Pending', value: 1 }]}
                            height={320}
                        />

                        {/* Donut Chart */}
                        <ITPCPieChart
                            title="Revenue Source Profile"
                            data={revSources.length > 0 ? revSources : [{ name: 'Pending', value: 1 }]}
                            innerRadius={60}
                            height={320}
                        />

                        {/* Radar Chart */}
                        <ITPCRadarChart
                            title="Finance Stability Matrix"
                            data={
                                healthMetrics.length > 0 ? healthMetrics.map(m => {
                                    if (m.name === 'Occupancy') return { ...m, name: 'Asset ROI' };
                                    if (m.name === 'Retention') return { ...m, name: 'Revenue Retention' };
                                    if (m.name === 'Growth') return { ...m, name: 'Capital Growth' };
                                    if (m.name === 'Stability') return { ...m, name: 'Yield Stability' };
                                    if (m.name === 'Collection') return { ...m, name: 'Inflow Velocity' };
                                    return m;
                                }) : [
                                    { name: 'Asset ROI', value: 0, fullMark: 100 },
                                    { name: 'Inflow Velocity', value: 0, fullMark: 100 },
                                    { name: 'Revenue Retention', value: 0, fullMark: 100 },
                                    { name: 'Capital Growth', value: 0, fullMark: 100 },
                                    { name: 'Yield Stability', value: 0, fullMark: 100 },
                                ]
                            }
                            height={320}
                        />

                        {/* Bar Chart */}
                        <ITPCBarChart
                            title="Target vs Actual Performance"
                            data={
                                trends.map(t => ({
                                    name: t.month.substring(0, 3),
                                    revenue: t.amountUsd,
                                    target: trends.reduce((sum, item) => sum + item.amountUsd, 0) / trends.length
                                }))
                            }
                            dataKeys={
                                [
                                    { key: 'revenue', color: '#0C7C92', label: 'Actual' },
                                    { key: 'target', color: '#FFD700', label: 'FY Average' },
                                ]}
                            height={320}
                        />
                    </div>
                </div>
            </Stack >
        </Stack >
    );
}
