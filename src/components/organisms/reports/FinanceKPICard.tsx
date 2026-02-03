'use client';

import { Paper, Stack, Group, Text, Box } from '@mantine/core';
import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FinanceKPICardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    trend?: number;
    icon: LucideIcon;
    color: string;
    iconBgColor: string;
    format?: 'currency' | 'percentage' | 'number';
    currency?: string;
}

export function FinanceKPICard({
    title,
    value,
    subtitle,
    trend,
    icon: Icon,
    color,
    iconBgColor,
    format = 'number',
    currency = 'USD'
}: FinanceKPICardProps) {
    const [animatedValue, setAnimatedValue] = useState<number>(0);

    useEffect(() => {
        if (typeof value === 'number') {
            const duration = 1000; // 1 second animation
            const steps = 60;
            const increment = value / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= value) {
                    setAnimatedValue(value);
                    clearInterval(timer);
                } else {
                    setAnimatedValue(current);
                }
            }, duration / steps);

            return () => clearInterval(timer);
        }
    }, [value]);

    const formatValue = (val: number | string) => {
        if (typeof val === 'string') return val;

        switch (format) {
            case 'currency':
                return `${currency === 'USD' ? '$' : 'Br '}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            case 'percentage':
                return `${val.toFixed(1)}%`;
            case 'number':
            default:
                return val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        }
    };

    const getTrendColor = () => {
        if (!trend) return 'text-slate-400';
        return trend > 0 ? 'text-green-500' : 'text-red-500';
    };

    const getTrendIcon = () => {
        if (!trend) return null;
        return trend > 0 ? '↑' : '↓';
    };

    return (
        <Paper
            shadow="xl"
            className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"
            p="xl"
        >
            {/* Dynamic Background Sparkle */}
            <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                style={{ background: color }}
            />

            <Stack gap="lg" className="relative z-10">
                <Group justify="space-between" align="center">
                    <Box className={`p-3.5 rounded-2xl ${iconBgColor} shadow-xl shadow-${color}/20 group-hover:scale-110 transition-transform duration-500`}>
                        <Icon size={24} className="text-white" />
                    </Box>
                    {trend !== undefined && (
                        <div className={`px-3 py-1.5 rounded-xl ${trend > 0 ? 'bg-emerald-50' : 'bg-rose-50'} border ${trend > 0 ? 'border-emerald-100' : 'border-rose-100'} flex items-center gap-1.5`}>
                            <span className={`text-xs font-black ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'} uppercase tracking-tighter`}>
                                {trend > 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </Group>

                <Stack gap={2}>
                    <Text size="xs" fw={900} className="text-slate-400 uppercase tracking-[0.2em] mb-1">
                        {title}
                    </Text>
                    <div className="flex items-baseline gap-1">
                        <Text className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">
                            {formatValue(typeof value === 'number' ? animatedValue : value)}
                        </Text>
                        {format === 'currency' && (
                            <Text size="xs" fw={900} className="text-slate-400">{currency}</Text>
                        )}
                    </div>
                    {subtitle && (
                        <Text size="xs" fw={700} className="text-slate-500/80">
                            {subtitle}
                        </Text>
                    )}
                </Stack>

                {/* Micro Sparkline Visualization */}
                <div className="mt-2 h-10 w-full opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                    <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible">
                        <path
                            d={trend && trend > 0
                                ? "M 0 15 Q 25 10 50 12 T 100 5"
                                : "M 0 5 Q 25 15 50 10 T 100 18"
                            }
                            fill="none"
                            stroke={color}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            className="drop-shadow-sm"
                        />
                    </svg>
                </div>
            </Stack>
        </Paper>
    );
}
