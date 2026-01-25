import React, { useEffect, useState } from 'react';
import { Paper, Group, Text, Stack, ThemeIcon, Box, SimpleGrid, RingProgress, Badge } from '@mantine/core';
import { Map, MapPin, Building2, Trees, Landmark, Gauge, AlertCircle } from 'lucide-react';
import { leasesService } from '@/services/leases.service';

export const AuditSummaryCards = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        leasesService.getSummary().then((res: any) => setStats(res.data || res));
    }, []);

    if (!stats?.reportSummary) return null;

    const { reportSummary, summary } = stats;

    const cards = [
        {
            title: 'Sub-Leased Area',
            value: `${reportSummary.subLeasedArea.toLocaleString()} m²`,
            sub: 'Active Industrial Tenants',
            icon: Landmark,
            color: 'teal'
        },
        {
            title: 'Vacant Space',
            value: `${reportSummary.vacantSpace.toLocaleString()} m²`,
            sub: 'Immediately Leasable',
            icon: Map,
            color: 'blue'
        },
        {
            title: 'Infrastructure',
            value: `${(reportSummary.roads + reportSummary.greenArea + reportSummary.utilities).toLocaleString()} m²`,
            sub: 'Roads, Green & Utilities',
            icon: Trees,
            color: 'green'
        }
    ];

    return (
        <Stack gap="lg" mb="xl" className="animate-fade-in">
            <Group justify="space-between" mb={-10}>
                <div>
                    <Text size="xs" fw={900} c="dimmed" tt="uppercase" lts="1.5px">Official ITPC Record Status</Text>
                    <Title order={4} className="text-slate-800 font-black">September 2025 Audit Baseline</Title>
                </div>
                <Badge variant="light" color="gray" size="sm" radius="md">Source: CEO Assigned Committee Report</Badge>
            </Group>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                {cards.map((card, index) => (
                    <Paper key={index} p="xl" radius="2rem" withBorder className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <Group justify="space-between" wrap="nowrap">
                            <Stack gap={4}>
                                <Text size="xs" fw={800} c="dimmed" tt="uppercase" lts="1px">{card.title}</Text>
                                <Text size="xl" fw={900} className="text-slate-800">{card.value}</Text>
                                <Text size="xs" c="dimmed" fw={600}>{card.sub}</Text>
                            </Stack>
                            <ThemeIcon size={58} radius="xl" variant="light" color={card.color}>
                                <card.icon size={26} strokeWidth={2.5} />
                            </ThemeIcon>
                        </Group>
                    </Paper>
                ))}
            </SimpleGrid>

            {summary.variance !== 0 && (
                <Paper p="md" radius="1.2rem" bg="orange.0" className="border border-orange-100">
                    <Group gap="sm">
                        <AlertCircle size={20} className="text-orange-600" />
                        <Text size="xs" fw={700} c="orange.9">
                            System Alert: Detected Spatial Variance of <span className="font-black underline">{summary.variance.toFixed(2)} m²</span> between Contractual Agreements and Physical Measurements.
                            <span className="ml-2 font-bold opacity-75">(Requires Management Investigation)</span>
                        </Text>
                    </Group>
                </Paper>
            )}
        </Stack>
    );
};

import { Title } from '@mantine/core';
