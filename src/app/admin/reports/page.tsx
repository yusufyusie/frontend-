'use client';

import { Paper, Stack, Title, Text, Group, Box } from '@mantine/core';
import Link from 'next/link';
import { BarChart3, FileText, Building, Users, TrendingUp, Activity } from 'lucide-react';

export default function ReportsPage() {
    const reportModules = [
        {
            title: 'Finance Reports',
            description: 'Comprehensive financial analytics, revenue tracking, payment monitoring, and exchange rate analysis',
            icon: BarChart3,
            href: '/admin/reports/finance',
            color: 'from-[#0C7C92] to-[#16284F]',
            bgColor: 'bg-[#0C7C92]',
            stats: 'KPIs, Trends, Analytics'
        },
        {
            title: 'Occupancy Reports',
            description: 'Space utilization, vacancy rates, and tenant occupancy analytics',
            icon: Building,
            href: '/admin/reports/occupancy',
            color: 'from-purple-600 to-purple-900',
            bgColor: 'bg-purple-600',
            stats: 'Coming Soon',
            disabled: true
        },
        {
            title: 'Tenant Reports',
            description: 'Tenant demographics, industry analysis, and lifecycle tracking',
            icon: Users,
            href: '/admin/reports/tenants',
            color: 'from-blue-600 to-blue-900',
            bgColor: 'bg-blue-600',
            stats: 'Coming Soon',
            disabled: true
        },
        {
            title: 'Performance Reports',
            description: 'Operational metrics, SLA tracking, and performance indicators',
            icon: TrendingUp,
            href: '/admin/reports/performance',
            color: 'from-green-600 to-green-900',
            bgColor: 'bg-green-600',
            stats: 'Coming Soon',
            disabled: true
        }
    ];

    return (
        <Stack gap={32} className="p-8 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Hero Header */}
            <Paper
                shadow="xl"
                className="relative overflow-hidden bg-gradient-to-r from-[#16284F] to-[#0C7C92] rounded-[2.5rem]"
                p={40}
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0C7C92] opacity-20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

                <Stack gap="lg" className="relative z-10">
                    <Group gap="xs">
                        <Box className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                            <FileText size={28} className="text-white" />
                        </Box>
                        <Stack gap={0}>
                            <Text size="xs" fw={900} className="text-[#FFD700] uppercase tracking-[0.3em]">
                                Business Intelligence
                            </Text>
                            <Title className="text-5xl font-black text-white tracking-tighter">
                                REPORTS & ANALYTICS
                            </Title>
                        </Stack>
                    </Group>
                    <Text className="text-slate-300 font-medium text-lg max-w-3xl">
                        Access comprehensive reports across finance, operations, and tenant management.
                        Real-time analytics and data-driven insights for strategic decision-making.
                    </Text>
                </Stack>
            </Paper>

            {/* Report Module Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reportModules.map((module) => {
                    const Icon = module.icon;
                    const content = (
                        <Paper
                            shadow="md"
                            className={`relative overflow-hidden rounded-[2rem] border border-slate-200 transition-all duration-300 ${module.disabled
                                    ? 'opacity-60 cursor-not-allowed'
                                    : 'hover:shadow-2xl hover:scale-[1.02] cursor-pointer'
                                }`}
                            p="xl"
                        >
                            {/* Background Gradient */}
                            <div
                                className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${module.color} opacity-5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3`}
                            />

                            <Stack gap="lg" className="relative z-10">
                                <Group justify="space-between" align="flex-start">
                                    <Box className={`${module.bgColor} p-4 rounded-2xl shadow-lg`}>
                                        <Icon size={32} className="text-white" />
                                    </Box>
                                    {module.disabled && (
                                        <div className="px-4 py-2 bg-slate-200 rounded-full">
                                            <Text size="xs" fw={800} className="text-slate-600 uppercase">
                                                {module.stats}
                                            </Text>
                                        </div>
                                    )}
                                    {!module.disabled && (
                                        <div className="px-4 py-2 bg-green-50 rounded-full">
                                            <Text size="xs" fw={800} className="text-green-600 uppercase flex items-center gap-1">
                                                <Activity size={12} className="animate-pulse" />
                                                {module.stats}
                                            </Text>
                                        </div>
                                    )}
                                </Group>

                                <Stack gap={8}>
                                    <Title order={3} className="text-slate-900 font-black text-2xl">
                                        {module.title}
                                    </Title>
                                    <Text className="text-slate-600 leading-relaxed">
                                        {module.description}
                                    </Text>
                                </Stack>

                                {!module.disabled && (
                                    <div className="pt-4 border-t border-slate-100">
                                        <Group gap="xs">
                                            <div className={`w-2 h-2 rounded-full ${module.bgColor}`} />
                                            <Text size="sm" fw={700} className="text-slate-500">
                                                Click to view detailed reports
                                            </Text>
                                        </Group>
                                    </div>
                                )}
                            </Stack>

                            {!module.disabled && (
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-slate-100 to-transparent rounded-tl-full opacity-50" />
                            )}
                        </Paper>
                    );

                    return module.disabled ? (
                        <div key={module.title}>{content}</div>
                    ) : (
                        <Link key={module.title} href={module.href} className="no-underline">
                            {content}
                        </Link>
                    );
                })}
            </div>

            {/* Info Footer */}
            <Paper shadow="sm" p="xl" className="rounded-[2rem] border border-slate-100 bg-white">
                <Stack gap="md">
                    <Group gap="xs">
                        <Box className="bg-blue-500 p-2 rounded-lg">
                            <FileText size={18} className="text-white" />
                        </Box>
                        <Text size="lg" fw={900} className="text-slate-900">
                            Report Access Information
                        </Text>
                    </Group>
                    <Text size="sm" className="text-slate-600 leading-relaxed">
                        All reports are generated in real-time based on current system data. Export functionality
                        is available for Excel and PDF formats. Access to specific reports may be restricted based
                        on your role and permissions. Contact your system administrator for access requests.
                    </Text>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                        <Paper p="md" className="bg-slate-50 rounded-xl">
                            <Stack gap={4}>
                                <Text size="xs" fw={900} className="text-slate-400 uppercase">Update Frequency</Text>
                                <Text size="sm" fw={800} className="text-slate-700">Real-time</Text>
                            </Stack>
                        </Paper>
                        <Paper p="md" className="bg-slate-50 rounded-xl">
                            <Stack gap={4}>
                                <Text size="xs" fw={900} className="text-slate-400 uppercase">Export Formats</Text>
                                <Text size="sm" fw={800} className="text-slate-700">Excel, PDF, CSV</Text>
                            </Stack>
                        </Paper>
                        <Paper p="md" className="bg-slate-50 rounded-xl">
                            <Stack gap={4}>
                                <Text size="xs" fw={900} className="text-slate-400 uppercase">Data Retention</Text>
                                <Text size="sm" fw={800} className="text-slate-700">Unlimited</Text>
                            </Stack>
                        </Paper>
                    </div>
                </Stack>
            </Paper>
        </Stack>
    );
}
