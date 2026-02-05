'use client';

import React from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Label,
} from 'recharts';
import { Paper, Text, Stack, Group } from '@mantine/core';

interface ITPCComposedChartProps {
    data: any[];
    title: string;
    barKey: string;
    lineKey: string;
    barColor?: string;
    lineColor?: string;
    height?: number;
}

export const ITPCComposedChart: React.FC<ITPCComposedChartProps> = ({
    data,
    title,
    barKey,
    lineKey,
    barColor = '#0C7C92',
    lineColor = '#FFD700',
    height = 300,
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
                    </Stack>
                    <div className="h-0.5 w-8 bg-[#0C7C92] rounded-full" />
                </Group>

                <ResponsiveContainer width="100%" height={height}>
                    <ComposedChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 40, bottom: 30 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.5)" />
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
                            <Label value="Value (USD)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} offset={10} />
                        </YAxis>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        <Bar
                            dataKey={barKey}
                            barSize={40}
                            fill={barColor}
                            radius={[8, 8, 0, 0]}
                            name="Utilization Vol"
                        />
                        <Line
                            type="monotone"
                            dataKey={lineKey}
                            stroke={lineColor}
                            strokeWidth={4}
                            dot={{ fill: lineColor, r: 6, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                            name="Efficiency Index"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </Stack>
        </Paper>
    );
};
