'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Stack,
    Group,
    Text,
    Title,
    Paper,
    Select,
    Button,
    LoadingOverlay,
    Divider,
    Tabs,
    Table,
    ScrollArea,
    Badge,
    Tooltip,
    Box,
    ActionIcon,
    NumberInput,
    Alert
} from '@mantine/core';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    AlertCircle,
    Calendar,
    Download,
    Filter,
    Coins,
    BarChart3,
    PieChart,
    Activity,
    Building2,
    MapPin,
    Receipt,
    Clock,
    CheckCircle2,
    XCircle,
    MinusCircle,
    ShieldCheck,
    FileSpreadsheet,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    LogIn
} from 'lucide-react';
import { FinanceKPICard } from '@/components/organisms/reports/FinanceKPICard';
import { TradingViewChart } from '@/components/organisms/reports/TradingViewChart';
import {
    financeReportsService,
    type KPISummary,
    type RevenueTrend,
    type PaymentStatusBreakdown,
    type TenantPaymentSummary,
    type RevenueByIndustry,
    type RevenueByZone,
    type RevenueByBuilding,
    type PaymentTracker,
    type DataCenterAgreement
} from '@/services/finance-reports.service';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title as ChartTitle,
    Tooltip as ChartTooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    ChartTitle,
    ChartTooltip,
    Legend,
    Filler
);

export default function FinanceReportsPage() {
    const router = useRouter();

    // State management
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(false);
    const [kpiSummary, setKpiSummary] = useState<KPISummary | null>(null);
    const [revenueTrends, setRevenueTrends] = useState<RevenueTrend[]>([]);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatusBreakdown[]>([]);
    const [tenantSummaries, setTenantSummaries] = useState<TenantPaymentSummary[]>([]);
    const [revenueByIndustry, setRevenueByIndustry] = useState<RevenueByIndustry[]>([]);
    const [revenueByZone, setRevenueByZone] = useState<RevenueByZone[]>([]);
    const [revenueByBuilding, setRevenueByBuilding] = useState<RevenueByBuilding[]>([]);
    const [paymentTracker, setPaymentTracker] = useState<PaymentTracker[]>([]);
    const [dataCenterAgreements, setDataCenterAgreements] = useState<DataCenterAgreement[]>([]);

    // Filter state
    const [fiscalYear, setFiscalYear] = useState<string>(new Date().getFullYear().toString());
    const [currencyView, setCurrencyView] = useState<'USD' | 'ETB'>('USD');
    const [activeTab, setActiveTab] = useState<string>('overview');

    // Exchange rate sensitivity
    const [showRateSensitivity, setShowRateSensitivity] = useState(false);
    const [simulatedRate, setSimulatedRate] = useState<number>(122.5989);
    const [rateSensitivity, setRateSensitivity] = useState<any>(null);

    useEffect(() => {
        // Check authentication before loading data
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setAuthError(true);
            setLoading(false);
            return;
        }
        loadAllData();
    }, [fiscalYear]);

    const loadAllData = async () => {
        try {
            setLoading(true);
            setAuthError(false);
            const filter = { fiscalYear: parseInt(fiscalYear) };

            const [
                summary,
                trends,
                status,
                tenants,
                industry,
                zone,
                building,
                tracker,
                datacenter
            ] = await Promise.all([
                financeReportsService.getFinanceSummary(filter),
                financeReportsService.getRevenueTrends(filter, 12),
                financeReportsService.getPaymentStatusBreakdown(filter),
                financeReportsService.getTenantPaymentSummaries(filter),
                financeReportsService.getRevenueByIndustry(filter),
                financeReportsService.getRevenueByZone(filter),
                financeReportsService.getRevenueByBuilding(filter),
                financeReportsService.getPaymentTracker(filter),
                financeReportsService.getDataCenterAgreements()
            ]);

            setKpiSummary(summary.data);
            setRevenueTrends(trends.data);
            setPaymentStatus(status.data);
            setTenantSummaries(tenants.data);
            setRevenueByIndustry(industry.data);
            setRevenueByZone(zone.data);
            setRevenueByBuilding(building.data);
            setPaymentTracker(tracker.data);
            setDataCenterAgreements(datacenter.data);
        } catch (error: any) {
            console.error('Failed to load finance reports:', error);

            // Check if it's an authentication error
            if (error.response?.status === 401 || error.code === 'ERR_BAD_REQUEST') {
                setAuthError(true);
                // Clear invalid token
                localStorage.removeItem('accessToken');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRateSimulation = async () => {
        try {
            const result = await financeReportsService.simulateExchangeRate(simulatedRate);
            setRateSensitivity(result.data);
        } catch (error) {
            console.error('Failed to simulate exchange rate:', error);
        }
    };

    // Format data for TradingView Lightweight Charts
    const getTradingViewData = () => {
        const monthMap: { [key: string]: string } = {
            'January': '01', 'February': '02', 'March': '03', 'April': '04',
            'May': '05', 'June': '06', 'July': '07', 'August': '08',
            'September': '09', 'October': '10', 'November': '11', 'December': '12'
        };

        return revenueTrends.map(t => ({
            time: `${t.year}-${monthMap[t.month] || '01'}-01`,
            value: currencyView === 'USD' ? t.amountUsd : t.amountEtb
        })).sort((a, b) => a.time.localeCompare(b.time));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'teal';
            case 'PENDING': return 'yellow';
            case 'OVERDUE': return 'red';
            case 'WAIVED': return 'gray';
            default: return 'blue';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return <CheckCircle2 size={18} />;
            case 'PENDING': return <Clock size={18} />;
            case 'OVERDUE': return <AlertCircle size={18} className="animate-pulse" />;
            case 'WAIVED': return <MinusCircle size={18} />;
            default: return <Receipt size={18} />;
        }
    };

    // Chart configurations
    const revenueTrendChartData = {
        labels: revenueTrends.map(t => `${t.month} ${t.year}`),
        datasets: [
            {
                label: currencyView === 'USD' ? 'Revenue (USD)' : 'Revenue (ETB)',
                data: revenueTrends.map(t => currencyView === 'USD' ? t.amountUsd : t.amountEtb),
                borderColor: '#0C7C92',
                backgroundColor: 'rgba(12, 124, 146, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: '#0C7C92',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8
            }
        ]
    };

    const paymentStatusChartData = {
        labels: paymentStatus.map(p => p.status),
        datasets: [{
            data: paymentStatus.map(p => p.count),
            backgroundColor: [
                'rgba(20, 184, 166, 0.8)',
                'rgba(251, 191, 36, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(148, 163, 184, 0.8)'
            ],
            borderWidth: 0
        }]
    };

    const industryChartData = {
        labels: revenueByIndustry.slice(0, 10).map(i => i.industry),
        datasets: [{
            label: currencyView === 'USD' ? 'Revenue (USD)' : 'Revenue (ETB)',
            data: revenueByIndustry.slice(0, 10).map(i => currencyView === 'USD' ? i.totalUsd : i.totalEtb),
            backgroundColor: '#0C7C92',
            borderRadius: 8
        }]
    };

    const fiscalYears = [
        (new Date().getFullYear() - 2).toString(),
        (new Date().getFullYear() - 1).toString(),
        new Date().getFullYear().toString(),
        (new Date().getFullYear() + 1).toString()
    ];

    if (loading) {
        return (
            <div className="relative h-screen">
                <LoadingOverlay visible={true} overlayProps={{ blur: 2 }} />
            </div>
        );
    }

    return (
        <Stack gap={32} className="p-8 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Hero Header */}
            <Paper
                shadow="xl"
                className="relative overflow-hidden bg-gradient-to-r from-[#16284F] to-[#0C7C92] rounded-[2.5rem] border-0"
                p={40}
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0C7C92] opacity-20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

                <Stack gap="xl" className="relative z-10">
                    <Group justify="space-between" align="flex-start">
                        <Stack gap={8}>
                            <Group gap="xs">
                                <Box className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20">
                                    <BarChart3 size={24} className="text-white" />
                                </Box>
                                <Text size="xs" fw={900} className="text-[#0C7C92] bg-white px-3 py-1 rounded-full uppercase tracking-[0.3em]">
                                    Executive Dashboard
                                </Text>
                            </Group>
                            <Title className="text-6xl font-black text-white tracking-tighter leading-none">
                                FINANCE <span className="text-[#FFD700]">REPORTS</span>
                            </Title>
                            <Text className="text-slate-300 font-medium text-xl max-w-2xl leading-relaxed">
                                Real-time financial analytics and strategic revenue tracking for the <span className="text-white font-bold underline decoration-[#FFD700] underline-offset-8">Ethiopian IT Park</span> Executive Board.
                            </Text>
                        </Stack>

                        <Paper className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl min-w-[280px]">
                            <Stack gap="xs">
                                <Group justify="space-between">
                                    <Text size="xs" fw={800} className="text-white/70 uppercase tracking-widest">
                                        Exchange Rate
                                    </Text>
                                    <Badge variant="dot" color="green" className="bg-green-500/20 text-green-300">
                                        Live
                                    </Badge>
                                </Group>
                                <Group align="baseline" gap={8}>
                                    <Text className="text-3xl font-black text-white">
                                        1 USD = {kpiSummary?.currentExchangeRate.toFixed(4)}
                                    </Text>
                                    <Text size="sm" fw={900} className="text-[#FFD700]">ETB</Text>
                                </Group>
                                <Text size="xs" className="text-slate-400 italic">
                                    Updated: {new Date().toLocaleString()}
                                </Text>
                            </Stack>
                        </Paper>
                    </Group>

                    <Divider color="white/20" />

                    <Group justify="space-between">
                        <Group gap="md">
                            <Select
                                data={fiscalYears}
                                value={fiscalYear}
                                onChange={(val) => setFiscalYear(val || fiscalYears[2])}
                                size="md"
                                leftSection={<Calendar size={18} className="text-[#0C7C92]" />}
                                className="w-40"
                                styles={{
                                    input: {
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'white',
                                        borderRadius: '1rem',
                                        fontWeight: 700,
                                        backdropFilter: 'blur(10px)'
                                    }
                                }}
                            />
                            <Select
                                data={[
                                    { value: 'USD', label: 'USD' },
                                    { value: 'ETB', label: 'ETB' }
                                ]}
                                value={currencyView}
                                onChange={(val) => setCurrencyView(val as 'USD' | 'ETB')}
                                size="md"
                                leftSection={<Coins size={18} className="text-[#0C7C92]" />}
                                className="w-32"
                                styles={{
                                    input: {
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'white',
                                        borderRadius: '1rem',
                                        fontWeight: 700,
                                        backdropFilter: 'blur(10px)'
                                    }
                                }}
                            />
                        </Group>

                        <Group gap="sm">
                            <Button
                                variant="light"
                                leftSection={<Filter size={16} />}
                                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                                radius="xl"
                            >
                                Advanced Filters
                            </Button>
                            <Button
                                leftSection={<Download size={16} />}
                                className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#16284F] shadow-xl shadow-[#FFD700]/30"
                                radius="xl"
                            >
                                Export Report
                            </Button>
                        </Group>
                    </Group>
                </Stack>
            </Paper>

            {/* Executive Intelligence Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Paper p="xl" className="col-span-1 lg:col-span-2 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <Badge variant="dot" color="blue" size="sm">System Insight</Badge>
                    </div>
                    <Stack gap="md">
                        <Group>
                            <div className="bg-indigo-50 p-2.5 rounded-xl">
                                <ShieldCheck size={20} className="text-indigo-600" />
                            </div>
                            <Text fw={900} size="sm" className="uppercase tracking-widest text-slate-400">Executive Summary</Text>
                        </Group>
                        <Text size="xl" fw={900} className="text-slate-900 leading-tight">
                            The portfolio is maintaining a <span className="text-[#0C7C92]">{kpiSummary?.collectionRate.toFixed(1)}%</span> collection efficiency.
                            Revenue is projected to grow by <span className="text-emerald-600">{(kpiSummary?.monthlyGrowthRate || 0).toFixed(1)}%</span> this quarter based on current occupancy trends and lease escalations.
                        </Text>
                        <Group gap="xl" mt="xs">
                            <Stack gap={0}>
                                <Text size="xs" fw={900} className="text-slate-400 uppercase">Risk Level</Text>
                                <Text fw={900} className="text-emerald-500">LOW (OPTIMIZED)</Text>
                            </Stack>
                            <Stack gap={0}>
                                <Text size="xs" fw={900} className="text-slate-400 uppercase">Compliance</Text>
                                <Text fw={900} className="text-[#0C7C92]">100% AUDITED</Text>
                            </Stack>
                            <Stack gap={0}>
                                <Text size="xs" fw={900} className="text-slate-400 uppercase">Data Quality</Text>
                                <Text fw={900} className="text-indigo-500">HIGH PRECISION</Text>
                            </Stack>
                        </Group>
                    </Stack>
                </Paper>

                <Paper p="xl" className="rounded-[2.5rem] bg-indigo-600 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                    <Stack gap="lg" h="100%" justify="space-between">
                        <Stack gap="xs">
                            <Group justify="space-between">
                                <Text fw={900} className="uppercase tracking-widest text-white/60 text-xs">Recommended Action</Text>
                                <ArrowUpRight size={20} className="text-white/60" />
                            </Group>
                            <Title order={3} className="font-black leading-tight">Review Dollar-Linked Leases</Title>
                            <Text size="sm" className="text-white/80 font-medium">
                                Current currency volatility suggests transitioning high-value office leases to USD-linked rates to protect annual yields.
                            </Text>
                        </Stack>
                        <Button variant="white" color="indigo" radius="xl" fullWidth fw={900} size="md">
                            Open Strategy Portal
                        </Button>
                    </Stack>
                </Paper>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FinanceKPICard
                    title={`Total Collections (${currencyView})`}
                    value={currencyView === 'USD' ? kpiSummary?.totalCollectionsUsd || 0 : kpiSummary?.totalCollectionsEtb || 0}
                    subtitle="Fiscal year to date"
                    trend={kpiSummary?.monthlyGrowthRate}
                    icon={DollarSign}
                    color="#10b981"
                    iconBgColor="bg-green-500"
                    format="currency"
                    currency={currencyView}
                />
                <FinanceKPICard
                    title="Collection Rate"
                    value={kpiSummary?.collectionRate || 0}
                    subtitle="Payment efficiency"
                    icon={TrendingUp}
                    color="#0C7C92"
                    iconBgColor="bg-[#0C7C92]"
                    format="percentage"
                />
                <FinanceKPICard
                    title="Active Leases"
                    value={kpiSummary?.activeLeaseCount || 0}
                    subtitle="Current contracts"
                    icon={Users}
                    color="#8b5cf6"
                    iconBgColor="bg-purple-500"
                    format="number"
                />
                <FinanceKPICard
                    title={`Outstanding (${currencyView})`}
                    value={currencyView === 'USD' ? (kpiSummary?.pendingAmountUsd || 0) + (kpiSummary?.overdueAmountUsd || 0) : (kpiSummary?.pendingAmountEtb || 0) + (kpiSummary?.overdueAmountEtb || 0)}
                    subtitle="Pending + Overdue"
                    icon={AlertCircle}
                    color="#ef4444"
                    iconBgColor="bg-red-500"
                    format="currency"
                    currency={currencyView}
                />
            </div>

            {/* Main Dashboard Tabs */}
            <Tabs value={activeTab} onChange={(val) => setActiveTab(val || 'overview')} className="bg-transparent">
                <Tabs.List className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
                    <Tabs.Tab value="overview" leftSection={<Activity size={16} />} className="rounded-xl">
                        Overview
                    </Tabs.Tab>
                    <Tabs.Tab value="office-rent" leftSection={<Building2 size={16} />} className="rounded-xl">
                        Office Rent
                    </Tabs.Tab>
                    <Tabs.Tab value="datacenter" leftSection={<Zap size={16} />} className="rounded-xl">
                        Data Centers
                    </Tabs.Tab>
                    <Tabs.Tab value="analytics" leftSection={<PieChart size={16} />} className="rounded-xl">
                        Analytics
                    </Tabs.Tab>
                    <Tabs.Tab value="tracker" leftSection={<Receipt size={16} />} className="rounded-xl">
                        Payment Tracker
                    </Tabs.Tab>
                </Tabs.List>

                {/* Overview Tab */}
                <Tabs.Panel value="overview" pt="xl">
                    <Stack gap="xl">
                        {/* Revenue Trend Chart */}
                        <Paper shadow="sm" p="xl" className="rounded-[2rem] border border-slate-100">
                            <Stack gap="lg">
                                <Group justify="space-between">
                                    <Stack gap={4}>
                                        <Text size="lg" fw={900} className="text-slate-900">
                                            Revenue Trends
                                        </Text>
                                        <Text size="sm" className="text-slate-500">
                                            Monthly revenue performance over the last 12 months
                                        </Text>
                                    </Stack>
                                    <Badge size="lg" variant="light" color="cyan">
                                        Last 12 Months
                                    </Badge>
                                </Group>
                                <Box className="h-96 w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-white">
                                    <TradingViewChart
                                        data={getTradingViewData()}
                                        height={380}
                                        title={currencyView === 'USD' ? 'Revenue Flow ($)' : 'Revenue Flow (Br)'}
                                        colors={{
                                            lineColor: '#0C7C92',
                                            areaTopColor: 'rgba(12, 124, 146, 0.4)',
                                            areaBottomColor: 'rgba(12, 124, 146, 0.05)',
                                        }}
                                    />
                                </Box>
                            </Stack>
                        </Paper>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Payment Status Breakdown */}
                            <Paper shadow="sm" p="xl" className="rounded-[2rem] border border-slate-100">
                                <Stack gap="lg">
                                    <Stack gap={4}>
                                        <Text size="lg" fw={900} className="text-slate-900">
                                            Payment Status Distribution
                                        </Text>
                                        <Text size="sm" className="text-slate-500">
                                            Breakdown by payment status
                                        </Text>
                                    </Stack>
                                    <Box className="h-64 flex items-center justify-center">
                                        <div className="w-full max-w-xs">
                                            <Doughnut
                                                data={paymentStatusChartData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: true,
                                                    plugins: {
                                                        legend: {
                                                            position: 'bottom',
                                                            labels: { padding: 15, font: { size: 12, weight: 'bold' } }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </Box>
                                    <Divider />
                                    <Group grow>
                                        {paymentStatus.map((status) => (
                                            <Stack key={status.status} gap={4} align="center">
                                                <Badge size="lg" color={getStatusColor(status.status)} variant="light">
                                                    {status.count}
                                                </Badge>
                                                <Text size="xs" fw={700} className="text-slate-600">
                                                    {status.status}
                                                </Text>
                                            </Stack>
                                        ))}
                                    </Group>
                                </Stack>
                            </Paper>

                            {/* Exchange Rate Sensitivity */}
                            <Paper shadow="sm" p="xl" className="rounded-[2rem] border border-slate-100 bg-gradient-to-br from-amber-50 to-white">
                                <Stack gap="lg">
                                    <Group>
                                        <Box className="bg-amber-500 p-2 rounded-xl">
                                            <Zap size={20} className="text-white" />
                                        </Box>
                                        <Stack gap={0}>
                                            <Text size="lg" fw={900} className="text-slate-900">
                                                Exchange Rate Sensitivity
                                            </Text>
                                            <Badge size="sm" variant="filled" color="amber">
                                                Pro Feature
                                            </Badge>
                                        </Stack>
                                    </Group>
                                    <Text size="sm" className="text-slate-600">
                                        Simulate exchange rate changes to understand revenue impact
                                    </Text>

                                    <NumberInput
                                        label="Simulated Rate (USD → ETB)"
                                        value={simulatedRate}
                                        onChange={(val) => setSimulatedRate(Number(val))}
                                        min={50}
                                        max={200}
                                        step={0.1}
                                        decimalScale={4}
                                        leftSection={<Coins size={16} />}
                                        className="w-full"
                                        styles={{
                                            input: {
                                                borderRadius: '0.75rem',
                                                fontWeight: 600
                                            }
                                        }}
                                    />

                                    <Button
                                        fullWidth
                                        size="md"
                                        className="bg-amber-500 hover:bg-amber-600"
                                        radius="xl"
                                        onClick={handleRateSimulation}
                                    >
                                        Calculate Impact
                                    </Button>

                                    {rateSensitivity && (
                                        <Paper p="md" className="bg-white rounded-xl border border-amber-200">
                                            <Stack gap="xs">
                                                <Group justify="space-between">
                                                    <Text size="xs" fw={700} className="text-slate-600">
                                                        Monthly Impact
                                                    </Text>
                                                    <Text size="sm" fw={900} className={rateSensitivity.monthlyImpactEtb >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                        {rateSensitivity.monthlyImpactEtb >= 0 ? '+' : ''}{rateSensitivity.monthlyImpactEtb.toLocaleString()} Br
                                                    </Text>
                                                </Group>
                                                <Group justify="space-between">
                                                    <Text size="xs" fw={700} className="text-slate-600">
                                                        Annual Impact
                                                    </Text>
                                                    <Text size="sm" fw={900} className={rateSensitivity.annualImpactEtb >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                        {rateSensitivity.annualImpactEtb >= 0 ? '+' : ''}{rateSensitivity.annualImpactEtb.toLocaleString()} Br
                                                    </Text>
                                                </Group>
                                                <Group justify="space-between">
                                                    <Text size="xs" fw={700} className="text-slate-600">
                                                        Rate Change
                                                    </Text>
                                                    <Badge color={rateSensitivity.percentageChange >= 0 ? 'green' : 'red'}>
                                                        {rateSensitivity.percentageChange >= 0 ? '+' : ''}{rateSensitivity.percentageChange.toFixed(2)}%
                                                    </Badge>
                                                </Group>
                                            </Stack>
                                        </Paper>
                                    )}
                                </Stack>
                            </Paper>
                        </div>
                    </Stack>
                </Tabs.Panel>

                {/* Office Rent Tab - Continue in next file due to length */}
                <Tabs.Panel value="office-rent" pt="xl">
                    <Paper shadow="sm" className="rounded-[2.5rem] overflow-hidden border border-slate-100">
                        <Box p="xl" className="bg-gradient-to-r from-slate-50 to-white">
                            <Group justify="space-between">
                                <Stack gap={4}>
                                    <Text size="xl" fw={900} className="text-slate-900">
                                        Office Rent Payment Tracker
                                    </Text>
                                    <Text size="sm" className="text-slate-500">
                                        Monthly payment status by tenant
                                    </Text>
                                </Stack>
                                <Button
                                    leftSection={<FileSpreadsheet size={16} />}
                                    variant="light"
                                    color="cyan"
                                    radius="xl"
                                >
                                    Export to Excel
                                </Button>
                            </Group>
                        </Box>

                        <ScrollArea>
                            <Table verticalSpacing="md" horizontalSpacing="lg" className="min-w-[1400px]">
                                <thead className="bg-slate-50/80 sticky top-0 z-10">
                                    <tr>
                                        <th className="py-4"><Text size="xs" fw={900} className="text-slate-400 uppercase">Tenant</Text></th>
                                        <th className="text-center"><Text size="xs" fw={900} className="text-slate-400 uppercase">Space (m²)</Text></th>
                                        <th className="text-center"><Text size="xs" fw={900} className="text-slate-400 uppercase">Rate (USD)</Text></th>
                                        <th className="text-center"><Text size="xs" fw={900} className="text-slate-400 uppercase">Industry</Text></th>
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                                            <th key={month} className="text-center"><Text size="xs" fw={900} className="text-slate-400 uppercase">{month}</Text></th>
                                        ))}
                                        <th className="text-right"><Text size="xs" fw={900} className="text-slate-400 uppercase">Annual Total</Text></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenantSummaries.map((tenant) => (
                                        <tr key={tenant.tenantId} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                                            <td className="py-4">
                                                <Stack gap={2}>
                                                    <Text fw={900} size="sm" className="text-slate-900">{tenant.tenantName}</Text>
                                                    <Text size="xs" className="text-slate-400">{tenant.companyRegNumber}</Text>
                                                </Stack>
                                            </td>
                                            <td className="text-center">
                                                <Text size="sm" fw={800} className="text-slate-700 font-mono">
                                                    {tenant.spaceM2.toLocaleString()}
                                                </Text>
                                            </td>
                                            <td className="text-center">
                                                <Text size="sm" fw={800} className="text-[#0C7C92] font-mono">
                                                    ${tenant.rateUsd.toFixed(2)}
                                                </Text>
                                            </td>
                                            <td className="text-center">
                                                <Badge size="sm" variant="light" color="blue">
                                                    {tenant.industry}
                                                </Badge>
                                            </td>
                                            {Array.from({ length: 12 }, (_, i) => {
                                                const payment = tenant.monthlyPayments.find(p => p.monthIndex === i);
                                                return (
                                                    <td key={i} className="text-center">
                                                        {payment ? (
                                                            <Tooltip label={`${payment.status} - $${payment.amountUsd.toLocaleString()}`}>
                                                                <div className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center ${payment.status === 'PAID' ? 'bg-teal-50 text-teal-600' :
                                                                    payment.status === 'OVERDUE' ? 'bg-red-50 text-red-600' :
                                                                        payment.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
                                                                            'bg-slate-50 text-slate-400'
                                                                    } hover:scale-110 transition-transform cursor-pointer`}>
                                                                    {getStatusIcon(payment.status)}
                                                                </div>
                                                            </Tooltip>
                                                        ) : (
                                                            <div className="mx-auto w-8 h-8 rounded-full border-2 border-dashed border-slate-100" />
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="text-right">
                                                <Stack gap={2} align="flex-end">
                                                    <Text fw={950} className="text-[#0C7C92] font-mono">
                                                        ${tenant.annualTotalUsd.toLocaleString()}
                                                    </Text>
                                                    <Text size="xs" fw={700} className="text-slate-400">
                                                        {tenant.paidMonths}/12 paid
                                                    </Text>
                                                </Stack>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </ScrollArea>
                    </Paper>
                </Tabs.Panel>

                {/* Data Center Tab */}
                <Tabs.Panel value="datacenter" pt="xl">
                    <Paper shadow="sm" p="xl" className="rounded-[2.5rem] border border-slate-100">
                        <Stack gap="xl">
                            <Group justify="space-between">
                                <Stack gap={4}>
                                    <Text size="xl" fw={900} className="text-slate-900">
                                        Data Center Agreements
                                    </Text>
                                    <Text size="sm" className="text-slate-500">
                                        Long-term contracts with advance payments
                                    </Text>
                                </Stack>
                                <Badge size="lg" variant="gradient" gradient={{ from: 'cyan', to: 'blue' }}>
                                    {dataCenterAgreements.length} Agreements
                                </Badge>
                            </Group>

                            <ScrollArea>
                                <Table verticalSpacing="lg">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th><Text size="xs" fw={900} className="text-slate-400 uppercase">Company</Text></th>
                                            <th className="text-center"><Text size="xs" fw={900} className="text-slate-400 uppercase">Space (m²)</Text></th>
                                            <th className="text-center"><Text size="xs" fw={900} className="text-slate-400 uppercase">Rate (USD)</Text></th>
                                            <th className="text-center"><Text size="xs" fw={900} className="text-slate-400 uppercase">Duration</Text></th>
                                            <th className="text-center"><Text size="xs" fw={900} className="text-slate-400 uppercase">Start Date</Text></th>
                                            <th className="text-right"><Text size="xs" fw={900} className="text-slate-400 uppercase">Advance Payment</Text></th>
                                            <th className="text-right"><Text size="xs" fw={900} className="text-slate-400 uppercase">Total Value</Text></th>
                                            <th className="text-center"><Text size="xs" fw={900} className="text-slate-400 uppercase">Status</Text></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataCenterAgreements.map((agreement) => (
                                            <tr key={agreement.tenantId} className="hover:bg-slate-50/50 transition-colors">
                                                <td>
                                                    <Text fw={900} size="sm" className="text-slate-900">
                                                        {agreement.companyName}
                                                    </Text>
                                                </td>
                                                <td className="text-center">
                                                    <Text size="sm" fw={800} className="text-slate-700 font-mono">
                                                        {agreement.spaceM2.toLocaleString()}
                                                    </Text>
                                                </td>
                                                <td className="text-center">
                                                    <Text size="sm" fw={800} className="text-[#0C7C92] font-mono">
                                                        ${agreement.priceUsd.toFixed(2)}
                                                    </Text>
                                                </td>
                                                <td className="text-center">
                                                    <Badge size="lg" variant="light" color="violet">
                                                        {agreement.durationYears} years
                                                    </Badge>
                                                </td>
                                                <td className="text-center">
                                                    <Text size="sm" className="text-slate-600">
                                                        {new Date(agreement.agreementStartDate).toLocaleDateString()}
                                                    </Text>
                                                </td>
                                                <td className="text-right">
                                                    <Text size="sm" fw={900} className="text-green-600 font-mono">
                                                        ${agreement.advancePaymentUsd.toLocaleString()}
                                                    </Text>
                                                </td>
                                                <td className="text-right">
                                                    <Text size="sm" fw={900} className="text-[#0C7C92] font-mono">
                                                        ${agreement.totalAgreementValueUsd.toLocaleString()}
                                                    </Text>
                                                </td>
                                                <td className="text-center">
                                                    <Badge
                                                        size="lg"
                                                        color={agreement.status === 'ACTIVE' ? 'green' : 'gray'}
                                                        variant="dot"
                                                    >
                                                        {agreement.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </ScrollArea>
                        </Stack>
                    </Paper>
                </Tabs.Panel>

                {/* Analytics Tab */}
                <Tabs.Panel value="analytics" pt="xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Paper shadow="sm" p="xl" className="rounded-[2rem] border border-slate-100">
                            <Stack gap="lg">
                                <Group>
                                    <Box className="bg-blue-500 p-2 rounded-xl">
                                        <BarChart3 size={20} className="text-white" />
                                    </Box>
                                    <Stack gap={0}>
                                        <Text size="lg" fw={900} className="text-slate-900">
                                            Revenue by Industry
                                        </Text>
                                        <Text size="sm" className="text-slate-500">
                                            Top performing sectors
                                        </Text>
                                    </Stack>
                                </Group>
                                <Box className="h-96">
                                    <Bar
                                        data={industryChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            indexAxis: 'y',
                                            plugins: {
                                                legend: { display: false }
                                            },
                                            scales: {
                                                x: {
                                                    beginAtZero: true,
                                                    ticks: {
                                                        callback: (value) => {
                                                            return currencyView === 'USD'
                                                                ? `$${(value as number).toLocaleString()}`
                                                                : `${(value as number).toLocaleString()} Br`;
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            </Stack>
                        </Paper>

                        <Paper shadow="sm" p="xl" className="rounded-[2rem] border border-slate-100">
                            <Stack gap="lg">
                                <Group>
                                    <Box className="bg-purple-500 p-2 rounded-xl">
                                        <MapPin size={20} className="text-white" />
                                    </Box>
                                    <Stack gap={0}>
                                        <Text size="lg" fw={900} className="text-slate-900">
                                            Revenue by Zone
                                        </Text>
                                        <Text size="sm" className="text-slate-500">
                                            Geographical distribution
                                        </Text>
                                    </Stack>
                                </Group>
                                <Stack gap="md">
                                    {revenueByZone.map((zone, index) => (
                                        <Paper key={zone.zoneId} p="md" className="bg-slate-50 rounded-xl hover:shadow-md transition-shadow">
                                            <Group justify="space-between">
                                                <Group>
                                                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <Stack gap={2}>
                                                        <Text fw={900} size="sm">{zone.zoneName}</Text>
                                                        <Text size="xs" className="text-slate-500">
                                                            {zone.tenantCount} tenants
                                                        </Text>
                                                    </Stack>
                                                </Group>
                                                <Text fw={950} className="text-purple-600 font-mono">
                                                    {currencyView === 'USD' ? `$${zone.totalUsd.toLocaleString()}` : `${zone.totalEtb.toLocaleString()} Br`}
                                                </Text>
                                            </Group>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Stack>
                        </Paper>
                    </div>
                </Tabs.Panel>

                {/* Payment Tracker Tab */}
                <Tabs.Panel value="tracker" pt="xl">
                    <Paper shadow="sm" p="xl" className="rounded-[2.5rem] border border-slate-100">
                        <Stack gap="xl">
                            <Group justify="space-between">
                                <Stack gap={4}>
                                    <Text size="xl" fw={900} className="text-slate-900">
                                        Detailed Payment Tracker
                                    </Text>
                                    <Text size="sm" className="text-slate-500">
                                        Complete payment history with penalties and interests
                                    </Text>
                                </Stack>
                                <Group gap="xs">
                                    <Badge size="lg" color="red" variant="light">
                                        {paymentTracker.filter(p => p.status === 'OVERDUE').length} Overdue
                                    </Badge>
                                    <Badge size="lg" color="yellow" variant="light">
                                        {paymentTracker.filter(p => p.status === 'PENDING').length} Pending
                                    </Badge>
                                    <Badge size="lg" color="green" variant="light">
                                        {paymentTracker.filter(p => p.status === 'PAID').length} Paid
                                    </Badge>
                                </Group>
                            </Group>

                            <ScrollArea>
                                <Table verticalSpacing="md">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th><Text size="xs" fw={900} className="text-slate-400 uppercase">Tenant</Text></th>
                                            <th className="text-center"><Text size="xs" fw={900} className="text-slate-400 uppercase">Invoice No</Text></th>
                                            <th className="text-center"><Text size="xs" fw={900} className="text-slate-400 uppercase">Status</Text></th>
                                            <th className="text-right"><Text size="xs" fw={900} className="text-slate-400 uppercase">Amount (USD)</Text></th>
                                            <th className="text-right"><Text size="xs" fw={900} className="text-slate-400 uppercase">VAT</Text></th>
                                            <th className="text-right"><Text size="xs" fw={900} className="text-slate-400 uppercase">Penalty</Text></th>
                                            <th className="text-right"><Text size="xs" fw={900} className="text-slate-400 uppercase">Interest</Text></th>
                                            <th className="text-center"><Text size="xs" fw={900} className="text-slate-400 uppercase">Due Date</Text></th>
                                            <th className="text-right"><Text size="xs" fw={900} className="text-slate-400 uppercase">Outstanding</Text></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentTracker.map((payment, index) => (
                                            <tr key={index} className={`hover:bg-slate-50/50 transition-colors ${payment.status === 'OVERDUE' ? 'bg-red-50/30' :
                                                payment.status === 'PAID' ? 'bg-green-50/20' : ''
                                                }`}>
                                                <td>
                                                    <Stack gap={2}>
                                                        <Text fw={900} size="sm">{payment.tenantName}</Text>
                                                        <Text size="xs" className="text-slate-400">{payment.contractNumber}</Text>
                                                    </Stack>
                                                </td>
                                                <td className="text-center">
                                                    <Text size="sm" className="font-mono text-slate-600">
                                                        {payment.invoiceNo || '-'}
                                                    </Text>
                                                </td>
                                                <td className="text-center">
                                                    <Badge
                                                        size="md"
                                                        color={getStatusColor(payment.status)}
                                                        variant="dot"
                                                        leftSection={getStatusIcon(payment.status)}
                                                    >
                                                        {payment.status}
                                                    </Badge>
                                                </td>
                                                <td className="text-right">
                                                    <Text size="sm" fw={800} className="font-mono">
                                                        ${payment.amountUsd.toLocaleString()}
                                                    </Text>
                                                </td>
                                                <td className="text-right">
                                                    <Text size="sm" className="font-mono text-slate-600">
                                                        ${payment.vatAmount ? payment.vatAmount.toLocaleString() : '-'}
                                                    </Text>
                                                </td>
                                                <td className="text-right">
                                                    <Text size="sm" fw={700} className={`font-mono ${payment.penalty && payment.penalty > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                                        {payment.penalty && payment.penalty > 0 ? `$${payment.penalty.toLocaleString()}` : '-'}
                                                    </Text>
                                                </td>
                                                <td className="text-right">
                                                    <Text size="sm" fw={700} className={`font-mono ${payment.interest && payment.interest > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                                                        {payment.interest && payment.interest > 0 ? `$${payment.interest.toLocaleString()}` : '-'}
                                                    </Text>
                                                </td>
                                                <td className="text-center">
                                                    <Stack gap={2} align="center">
                                                        <Text size="sm" className="text-slate-600">
                                                            {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : '-'}
                                                        </Text>
                                                        {payment.daysOverdue && payment.daysOverdue > 0 && (
                                                            <Badge size="xs" color="red" variant="filled">
                                                                {payment.daysOverdue} days overdue
                                                            </Badge>
                                                        )}
                                                    </Stack>
                                                </td>
                                                <td className="text-right">
                                                    <Text size="sm" fw={900} className={`font-mono ${payment.outstandingBalanceUsd > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                        ${payment.outstandingBalanceUsd.toLocaleString()}
                                                    </Text>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </ScrollArea>
                        </Stack>
                    </Paper>
                </Tabs.Panel>
            </Tabs>
        </Stack>
    );
}
