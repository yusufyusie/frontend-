'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Paper, Text, Stack, Group } from '@mantine/core';

interface ITPCBarChartProps {
    data: { name: string;[key: string]: any }[];
    title: string;
    dataKeys: { key: string; color: string; label: string }[];
    height?: number;
}

export const ITPCBarChart: React.FC<ITPCBarChartProps> = ({
    data,
    title,
    dataKeys,
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
                        <Text size="xs" fw={900} className="text-[#0C7C92] uppercase tracking-[0.2em]">
                            Comparative Analysis
                        </Text>
                        <Text size="lg" fw={950} className="text-slate-900">
                            {title}
                        </Text>
                    </Stack>
                    <div className="h-0.5 w-8 bg-[#0C7C92] rounded-full" />
                </Group>

                <ResponsiveContainer width="100%" height={height}>
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.5)" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
                            axisLine={{ stroke: 'rgba(226, 232, 240, 0.5)' }}
                        />
                        <YAxis
                            tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
                            axisLine={{ stroke: 'rgba(226, 232, 240, 0.5)' }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(12, 124, 146, 0.05)' }} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        {dataKeys.map((item) => (
                            <Bar
                                key={item.key}
                                dataKey={item.key}
                                fill={item.color}
                                name={item.label}
                                radius={[8, 8, 0, 0]}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </Stack>
        </Paper>
    );
};
