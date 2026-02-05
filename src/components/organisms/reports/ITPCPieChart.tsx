'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Paper, Text, Stack, Box, Group } from '@mantine/core';

interface ITPCPieChartProps {
    data: { name: string; value: number }[];
    title: string;
    colors?: string[];
    innerRadius?: number;
    height?: number;
    description?: string;
}

const ITPC_COLORS = [
    '#0C7C92', // Teal
    '#16284F', // Navy
    '#1098AD', // Mint
    '#10b981', // Emerald
    '#ef4444', // Rose
    '#FFD700', // Gold
    '#64748B', // Slate
    '#8B5CF6', // Purple
];

export const ITPCPieChart: React.FC<ITPCPieChartProps> = ({
    data,
    title,
    colors = ITPC_COLORS,
    innerRadius = 0,
    height = 300,
    description,
}) => {
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <Paper p="sm" radius="lg" shadow="xl" className="border border-slate-200 bg-white/95 backdrop-blur-md">
                    <Stack gap={4}>
                        <Text size="xs" fw={900} className="text-slate-600 uppercase tracking-wider">
                            {payload[0].name}
                        </Text>
                        <Text size="lg" fw={950} className="text-slate-900 font-mono">
                            {payload[0].value.toLocaleString()}
                        </Text>
                    </Stack>
                </Paper>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }: any) => {
        return (
            <Box className="flex flex-wrap justify-center gap-3 mt-4">
                {payload.map((entry: any, index: number) => (
                    <Group key={`legend-${index}`} gap={6} className="text-xs">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <Text size="xs" fw={700} className="text-slate-600">
                            {entry.value}
                        </Text>
                    </Group>
                ))}
            </Box>
        );
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
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={innerRadius}
                            outerRadius={innerRadius > 0 ? innerRadius + 60 : 80}
                            fill="#8884d8"
                            dataKey="value"
                            label={(props: any) => {
                                const { name, value, percent } = props;
                                return `${name}: ${(percent * 100).toFixed(1)}%`;
                            }}
                            labelLine={true}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={colors[index % colors.length]}
                                    className="hover:opacity-80 transition-opacity duration-300"
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<CustomLegend />} />
                    </PieChart>
                </ResponsiveContainer>
            </Stack>
        </Paper>
    );
};
