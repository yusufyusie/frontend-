'use client';

import { Paper, Text, Group, Box, ThemeIcon, Skeleton } from '@mantine/core';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: {
        value: number;
        isUp: boolean;
    };
    isLoading?: boolean;
}

export const MetricCard = ({ title, value, icon, color, trend, isLoading }: MetricCardProps) => {
    if (isLoading) {
        return (
            <Paper p="md" radius="md" withBorder>
                <Skeleton height={20} width="60%" mb="md" />
                <Skeleton height={30} width="40%" />
            </Paper>
        );
    }

    return (
        <Paper
            p="md"
            radius="md"
            withBorder
            className="transition-all hover:shadow-md hover:-translate-y-1"
            style={{ borderLeft: `4px solid var(--mantine-color-${color}-filled)` }}
        >
            <Group justify="space-between">
                <Box>
                    <Text size="xs" color="dimmed" fw={700} tt="uppercase">
                        {title}
                    </Text>
                    <Text size="xl" fw={800} mt={4}>
                        {value}
                    </Text>
                </Box>
                <ThemeIcon
                    color={color}
                    variant="light"
                    size={48}
                    radius="md"
                >
                    {icon}
                </ThemeIcon>
            </Group>

            {trend && (
                <Group gap={4} mt="xs">
                    {trend.isUp ? (
                        <TrendingUp size={14} className="text-green-500" />
                    ) : (
                        <TrendingDown size={14} className="text-red-500" />
                    )}
                    <Text size="xs" c={trend.isUp ? 'green.6' : 'red.6'} fw={700}>
                        {trend.value}%
                    </Text>
                    <Text size="xs" c="dimmed">
                        from last month
                    </Text>
                </Group>
            )}
        </Paper>
    );
};
