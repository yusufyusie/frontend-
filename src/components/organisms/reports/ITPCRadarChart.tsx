'use client';

import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { Paper, Text, Stack, Group, Box } from '@mantine/core';

interface ITPCRadarChartProps {
    data: { name: string; value: number; fullMark: number }[];
    title: string;
    height?: number;
}

export const ITPCRadarChart: React.FC<ITPCRadarChartProps> = ({
    data,
    title,
    height = 300,
}) => {
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <Paper p="sm" radius="lg" shadow="xl" className="border border-slate-200 bg-white/95 backdrop-blur-md">
                    <Stack gap={4}>
                        <Text size="xs" fw={900} className="text-slate-600 uppercase tracking-wider">
                            {payload[0].payload.name}
                        </Text>
                        <Text size="lg" fw={950} className="text-[#0C7C92] font-mono">
                            {payload[0].value.toLocaleString()} / {payload[0].payload.fullMark}
                        </Text>
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
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#E2E8F0" />
                        <PolarAngleAxis
                            dataKey="name"
                            tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                        />
                        <Radar
                            name={title}
                            dataKey="value"
                            stroke="#0C7C92"
                            strokeWidth={3}
                            fill="#0C7C92"
                            fillOpacity={0.4}
                        />
                        <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                </ResponsiveContainer>
            </Stack>
        </Paper>
    );
};
