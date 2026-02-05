'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList, Label } from 'recharts';
import { Paper, Text, Stack, Group } from '@mantine/core';

interface ITPCAreaChartProps {
    data: { name: string;[key: string]: any }[];
    title: string;
    description?: string;
    dataKeys: { key: string; color: string; label: string }[];
    height?: number;
    stacked?: boolean;
}

export const ITPCAreaChart: React.FC<ITPCAreaChartProps> = ({
    data,
    title,
    description,
    dataKeys,
    height = 300,
    stacked = false,
}) => {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <Paper p="sm" radius="lg" shadow="xl" className="border border-slate-200 bg-white/95 backdrop-blur-md">
                    <Stack gap={6}>
                        <Text size="xs" fw={900} className="text-slate-600 uppercase tracking-wider">
                            {label}
                        </Text>
                        {payload.map((entry: any, index: number) => (
                            <Group key={index} gap={8} justify="space-between">
                                <Group gap={6}>
                                    <div
                                        className="w-3 h-3 rounded"
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <Text size="xs" fw={700} className="text-slate-600">
                                        {entry.name}
                                    </Text>
                                </Group>
                                <Text size="sm" fw={950} className="text-slate-900 font-mono">
                                    {entry.value.toLocaleString()}
                                </Text>
                            </Group>
                        ))}
                    </Stack>
                </Paper>
            );
        }
        return null;
    };

    return (
        <Paper
            p={24}
            radius="2rem"
            className="bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-500 h-full"
        >
            <Stack gap="md" className="h-full">
                <Group justify="space-between" align="center">
                    <Stack gap={2}>
                        <Text size="lg" fw={950} className="text-slate-900 leading-none">
                            {title}
                        </Text>
                        {description && (
                            <Text size="xs" className="text-slate-500 max-w-xs leading-relaxed mt-1">
                                {description}
                            </Text>
                        )}
                    </Stack>
                    <div className="h-0.5 w-8 bg-[#0C7C92] rounded-full" />
                </Group>

                <ResponsiveContainer width="100%" height={height}>
                    <AreaChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 40, bottom: 30 }}
                    >
                        <defs>
                            {dataKeys.map((item) => (
                                <linearGradient key={`grad-${item.key}`} id={`color-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={item.color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={item.color} stopOpacity={0.01} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.5)" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
                            axisLine={{ stroke: 'rgba(226, 232, 240, 0.5)' }}
                            dy={5}
                        >
                            <Label value="Timeline" offset={-5} position="insideBottom" fill="#94A3B8" fontSize={11} fontWeight={700} />
                        </XAxis>
                        <YAxis
                            tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
                            axisLine={{ stroke: 'rgba(226, 232, 240, 0.5)' }}
                            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                        >
                            <Label value="Capital Flow (USD)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} offset={10} />
                        </YAxis>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        {dataKeys.map((item) => (
                            <Area
                                key={item.key}
                                type="monotone"
                                dataKey={item.key}
                                stackId={stacked ? "1" : undefined}
                                stroke={item.color}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill={`url(#color-${item.key})`}
                                name={item.label}
                                animationDuration={1500}
                            >
                                <LabelList dataKey={item.key} position="top" style={{ fontSize: '9px', fontWeight: 900, fill: item.color }} formatter={(v: any) => Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(1)}k` : v} />
                            </Area>
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </Stack>
        </Paper>
    );
};
