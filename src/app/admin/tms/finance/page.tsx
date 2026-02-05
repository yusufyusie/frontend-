'use client';

import { useState, useEffect } from 'react';
import {
    Stack,
    Group,
    Text,
    Title,
    Paper,
    TextInput,
    Badge,
    Table,
    ActionIcon,
    Tooltip,
    LoadingOverlay,
    Box,
    Divider,
    ScrollArea,
    Select,
    NumberInput,
    Button
} from '@mantine/core';
import {
    Coins,
    Search,
    Download,
    Filter,
    ArrowUpRight,
    TrendingUp,
    Calendar,
    Receipt,
    History,
    FileSpreadsheet,
    Activity,
    ShieldCheck,
    AlertCircle,
    Info
} from 'lucide-react';
import { financialsService, LeasePayment, ExchangeRate } from '@/services/financials.service';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function FinanceLedgerPage() {
    const [availableYears, setAvailableYears] = useState<number[]>([2023, 2024, 2025, 2026]);
    const [fiscalYear, setFiscalYear] = useState<string>('2023');
    const [settings, setSettings] = useState<any>({ vatRate: 0.15, penaltyRate: 0.025, fiscalStartMonth: 7 });
    const [payments, setPayments] = useState<LeasePayment[]>([]);
    const [rates, setRates] = useState<ExchangeRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [mounted, setMounted] = useState(false);

    // Dynamic month order based on fiscal start
    const getMonthOrder = (startMonth: number) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const order = [];
        for (let i = 0; i < 12; i++) {
            const monthIdx = (startMonth - 1 + i) % 12;
            order.push({ name: months[monthIdx], index: monthIdx });
        }
        return order;
    };

    const monthOrder = getMonthOrder(settings.fiscalStartMonth || 7);

    useEffect(() => {
        setMounted(true);
        loadMetadata();
    }, []);

    useEffect(() => {
        loadData();
    }, [fiscalYear]);

    const loadMetadata = async () => {
        try {
            const [yearsRes, settingsRes] = await Promise.all([
                financialsService.getAvailableYears(),
                financialsService.getSettings()
            ]);
            if (yearsRes.data && yearsRes.data.length > 0) {
                setAvailableYears(yearsRes.data);
                if (fiscalYear === '2023' && !yearsRes.data.includes(2023)) {
                    setFiscalYear(yearsRes.data[0].toString());
                }
            }
            if (settingsRes.data) {
                setSettings(settingsRes.data);
            }
        } catch (error) {
            console.error('Failed to load ledger metadata:', error);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [paymentsRes, ratesRes] = await Promise.all([
                financialsService.getLedger(undefined, parseInt(fiscalYear)),
                financialsService.getExchangeRates()
            ]);
            setPayments(paymentsRes.data || []);
            setRates(ratesRes.data || []);
        } catch (error) {
            console.error('Failed to load financials:', error);
        } finally {
            setLoading(false);
        }
    };

    const latestRate = (Array.isArray(rates) ? rates : []).find(r => r.isActive)?.rate || 122.5989;

    // Grouping payments by Lease for the spreadsheet view
    const groupedPayments = payments.reduce((acc, p) => {
        const leaseId = p.leaseId;
        if (!acc[leaseId]) {
            acc[leaseId] = {
                lease: p.lease,
                months: {}
            };
        }
        const monthKey = new Date(p.month).getMonth();
        acc[leaseId].months[monthKey] = p;
        return acc;
    }, {} as Record<number, { lease: any, months: Record<number, LeasePayment> }>);

    const filteredLeases = Object.values(groupedPayments).filter(item =>
        (item.lease?.tenant?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.lease?.contractNumber || '').toLowerCase().includes(search.toLowerCase())
    ).map(item => {
        // Calculate fiscal sum for this lease
        const monthsSum = Object.values(item.months).reduce((sum, p) =>
            p.status === 'PAID' ? sum + Number(p.amountUsd) : sum, 0
        );
        const monthsSumLocal = Object.values(item.months).reduce((sum, p) =>
            p.status === 'PAID' ? sum + Number(p.amountLocal) : sum, 0
        );
        return { ...item, monthsSum, monthsSumLocal };
    });

    const totalFiscalCollectionsLocal = filteredLeases.reduce((sum, item) => sum + item.monthsSumLocal, 0);

    return (
        <Stack gap={32} className="p-8 min-h-screen bg-slate-50/50">
            {/* Mission Control Header */}
            <Paper
                shadow="md"
                className="relative overflow-hidden bg-[#16284F] rounded-[2rem] p-10 border-0"
            >
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#0C7C92]/30 to-transparent" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#0C7C92]/10 rounded-full blur-3xl" />

                <Stack gap="xl" className="relative z-10">
                    <Group justify="space-between" align="flex-start">
                        <Stack gap={4}>
                            <Group gap="xs">
                                <Box className="bg-[#0C7C92] p-2 rounded-xl shadow-lg shadow-[#0C7C92]/20">
                                    <Coins size={20} className="text-white" />
                                </Box>
                                <Text size="xs" fw={900} className="text-[#0C7C92] uppercase tracking-[0.25em]">Institutional Intelligence</Text>
                            </Group>
                            <Title className="text-4xl font-black text-white tracking-tighter">
                                MASTER <span className="text-[#0C7C92]">FINANCIAL</span> LEDGER
                            </Title>
                            <Text className="text-slate-400 font-medium max-w-lg">
                                Real-time monitoring of institutional revenue, currency fluctuations, and multi-year lease schedules.
                            </Text>
                        </Stack>

                        <Paper className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl min-w-[300px]">
                            <Stack gap="xs">
                                <Group justify="space-between">
                                    <Text size="xs" fw={800} className="text-slate-400 uppercase tracking-widest text-[10px]">Active Exchange Rate</Text>
                                    <Badge variant="dot" color="teal" size="xs">Live Sync</Badge>
                                </Group>
                                <Group align="baseline" gap={8}>
                                    <Text className="text-3xl font-black text-white">1 USD = {Number(latestRate).toFixed(4)}</Text>
                                    <Text size="sm" fw={900} className="text-[#0C7C92]">ETB</Text>
                                </Group>
                                <Text size="xs" className="text-slate-500 italic">
                                    Last updated: {mounted ? new Date().toLocaleDateString() : '--/--/----'}
                                </Text>
                            </Stack>
                        </Paper>
                    </Group>

                    <Divider color="white/10" />

                    <Group justify="space-between">
                        <Group gap="md">
                            <TextInput
                                id="finance-search-input"
                                placeholder="Search institutions or contract IDs..."
                                leftSection={<Search size={18} className="text-[#0C7C92]" />}
                                value={search}
                                onChange={(e) => setSearch(e.currentTarget.value)}
                                size="md"
                                className="w-80"
                                styles={{
                                    input: {
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white',
                                        borderRadius: '1rem',
                                        fontWeight: 600,
                                        '&:focus': { borderColor: '#0C7C92' }
                                    }
                                }}
                            />
                            <Select
                                id="finance-fiscal-year-select"
                                data={availableYears.map(y => y.toString())}
                                value={fiscalYear}
                                onChange={(val) => setFiscalYear(val || availableYears[0]?.toString() || '2023')}
                                size="md"
                                leftSection={<Calendar size={18} className="text-[#0C7C92]" />}
                                className="w-40"
                                styles={{
                                    input: {
                                        backgroundColor: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white',
                                        borderRadius: '1rem',
                                        fontWeight: 700
                                    }
                                }}
                            />
                        </Group>

                        <Group gap="sm">
                            <Button
                                variant="light"
                                color="cyan"
                                leftSection={<FileSpreadsheet size={16} />}
                                className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400"
                                radius="xl"
                            >
                                Export Fiscal Year
                            </Button>
                            <Button
                                leftSection={<TrendingUp size={16} />}
                                className="bg-[#0C7C92] hover:bg-[#0C7C92]/90 shadow-xl shadow-[#0C7C92]/30"
                                radius="xl"
                            >
                                Revenue Analytics
                            </Button>
                        </Group>
                    </Group>
                </Stack>
            </Paper>

            {/* Ledger Spreadsheet View */}
            <div className="relative">
                <LoadingOverlay visible={loading} overlayProps={{ blur: 2, radius: '2.5rem' }} />

                <Paper shadow="sm" className="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-white">
                    <ScrollArea offsetScrollbars>
                        <Table
                            verticalSpacing="md"
                            horizontalSpacing="xl"
                            className="min-w-[1500px]"
                        >
                            <thead className="bg-slate-50/80 sticky top-0 z-20">
                                <tr>
                                    <th className="py-6 pl-12 w-[300px] border-b border-slate-100">
                                        <Text size="xs" fw={900} className="text-slate-400 uppercase tracking-widest">Institution Identification</Text>
                                    </th>
                                    <th className="py-6 border-b border-slate-100 text-center w-[100px]">
                                        <Text size="xs" fw={900} className="text-slate-400 uppercase tracking-widest">Space (m²)</Text>
                                    </th>
                                    <th className="py-6 border-b border-slate-100 text-center w-[120px]">
                                        <Text size="xs" fw={900} className="text-slate-400 uppercase tracking-widest">Rate (USD)</Text>
                                    </th>
                                    <th className="py-6 border-b border-slate-100 text-center w-[150px]">
                                        <Text size="xs" fw={900} className="text-slate-400 uppercase tracking-widest">Exchange (Birr)</Text>
                                    </th>
                                    {monthOrder.map(m => (
                                        <th key={m.name} className="py-6 border-b border-slate-100 text-center w-[120px]">
                                            <Text size="xs" fw={900} className="text-slate-400 uppercase tracking-widest">{m.name}</Text>
                                        </th>
                                    ))}
                                    <th className="py-6 pr-12 border-b border-slate-100 text-right w-[150px]">
                                        <Text size="xs" fw={900} className="text-slate-400 uppercase tracking-widest">Annual Total</Text>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeases.map((item) => {
                                    let fiscalTotal = 0;
                                    return (
                                        <tr key={item.lease.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                            <td className="py-8 pl-12">
                                                <Stack gap={4}>
                                                    <Text fw={900} size="sm" className="text-slate-900 leading-tight">
                                                        {item.lease?.tenant?.name || 'Unknown Institution'}
                                                    </Text>
                                                    <Group gap={6}>
                                                        <Receipt size={12} className="text-[#0C7C92]" />
                                                        <Text size="xs" fw={800} className="text-slate-400 uppercase tabular-nums">
                                                            {item.lease?.contractNumber}
                                                        </Text>
                                                    </Group>
                                                </Stack>
                                            </td>
                                            <td className="py-8 text-center bg-slate-50/20">
                                                <Text size="sm" fw={800} className="text-slate-700 font-mono">
                                                    {(item.lease?.contractArea || 0).toLocaleString()}
                                                </Text>
                                            </td>
                                            <td className="py-8 text-center">
                                                <Text size="sm" fw={800} className="text-[#0C7C92] font-mono">
                                                    ${Number(item.lease?.inquiry?.agreedRate || 0).toFixed(2)}
                                                </Text>
                                            </td>
                                            <td className="py-8 text-center bg-slate-50/20">
                                                <Text size="sm" fw={800} className="text-amber-600 font-mono">
                                                    {Number(Object.values(item.months)[0]?.exchangeRate || 122.5989).toFixed(4)}
                                                </Text>
                                            </td>

                                            {monthOrder.map(m => {
                                                const payment = item.months[m.index];
                                                if (payment?.status === 'PAID') {
                                                    fiscalTotal += Number(payment.amountUsd);
                                                }

                                                return (
                                                    <td key={m.name} className="py-8 text-center border-l border-slate-50/50">
                                                        {payment ? (
                                                            <Tooltip
                                                                label={`${payment.status} - ${new Date(payment.month).toLocaleDateString()}`}
                                                                position="top"
                                                                withArrow
                                                            >
                                                                <div className={cn(
                                                                    "mx-auto w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer group hover:scale-110 shadow-sm",
                                                                    payment.status === 'PAID' ? "bg-teal-50 text-teal-600 shadow-teal-100/50" :
                                                                        payment.status === 'OVERDUE' ? "bg-rose-50 text-rose-600 shadow-rose-100/50" :
                                                                            "bg-slate-50 text-slate-300"
                                                                )}>
                                                                    {payment.status === 'PAID' ? (
                                                                        <ShieldCheck size={20} />
                                                                    ) : payment.status === 'OVERDUE' ? (
                                                                        <AlertCircle size={20} className="animate-pulse" />
                                                                    ) : (
                                                                        <History size={18} />
                                                                    )}
                                                                </div>
                                                            </Tooltip>
                                                        ) : (
                                                            <div className="mx-auto w-8 h-8 rounded-full border-2 border-dashed border-slate-100" />
                                                        )}
                                                    </td>
                                                );
                                            })}

                                            <td className="py-8 pr-12 text-right border-l border-slate-50/50">
                                                <Stack gap={2}>
                                                    <Text fw={950} className="text-[#0C7C92] tabular-nums">
                                                        ${fiscalTotal.toLocaleString()}
                                                    </Text>
                                                    <Text size="xs" fw={700} className="text-slate-400 uppercase tracking-tighter">
                                                        Collected USD
                                                    </Text>
                                                </Stack>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </ScrollArea>
                </Paper>
            </div>

            {/* Bottom Insight Section */}
            <Group grow align="stretch">
                <Paper shadow="sm" p="xl" className="rounded-[2.5rem] border border-slate-100">
                    <Stack gap="md">
                        <Group justify="space-between">
                            <Group gap="xs">
                                <Activity size={18} className="text-[#0C7C92]" />
                                <Text size="sm" fw={800} className="text-slate-900">System Liquidity</Text>
                            </Group>
                            <Badge color="cyan" variant="filled">Healthy</Badge>
                        </Group>
                        <Text size="xs" className="text-slate-500 leading-normal">
                            Aggregated fiscal health based on active lease payments and currency variance. Interest and penalties are automatically calculated at midnight (UTC+3).
                        </Text>
                        <Divider variant="dashed" />
                        <Group justify="space-between">
                            <Text size="xs" fw={700} className="text-slate-400 uppercase tracking-widest">Total Fiscal Collections (ETB)</Text>
                            <Text fw={900} size="xl" className="text-teal-600 font-mono">
                                {totalFiscalCollectionsLocal.toLocaleString()} Br
                            </Text>
                        </Group>
                    </Stack>
                </Paper>

                <Paper shadow="sm" p="xl" className="rounded-[2.5rem] border border-slate-100 bg-slate-50/50">
                    <Stack gap="xl">
                        <Group gap="xs">
                            <Info size={18} className="text-[#0C7C92]" />
                            <Text size="sm" fw={800} className="text-slate-900">Institutional Ledger Policy</Text>
                        </Group>
                        <div className="grid grid-cols-2 gap-4">
                            <Stack gap={4}>
                                <Text size="xs" fw={900} className="text-slate-400 uppercase">VAT Policy</Text>
                                <Text size="sm" fw={800} className="text-slate-700">{(settings.vatRate * 100).toFixed(2)}% Standard</Text>
                            </Stack>
                            <Stack gap={4}>
                                <Text size="xs" fw={900} className="text-slate-400 uppercase">Penalty Floor</Text>
                                <Text size="sm" fw={800} className="text-slate-700">{(settings.penaltyRate * 100).toFixed(1)}% Monthly</Text>
                            </Stack>
                        </div>
                    </Stack>
                </Paper>
            </Group>
        </Stack>
    );
}
