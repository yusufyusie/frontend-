'use client';

import { Paper, Title, SimpleGrid, Box, Text, Group, Divider, Badge, Stack } from '@mantine/core';
import { Landmark, Users2, Target, Briefcase, Zap } from 'lucide-react';

interface VentureIntelCardProps {
    metadata: any;
    businessCategory?: string;
}

export function VentureIntelCard({ metadata, businessCategory }: VentureIntelCardProps) {
    const p = metadata?.pipeline || {};
    const l = metadata?.legal_permits || {};
    const o = metadata?.operational || {};

    return (
        <Paper withBorder p="xl" radius="xl" className="glass shadow-md h-full">
            <Group justify="space-between" mb="xl">
                <Title order={4} className="text-[#16284F]">Venture Economics</Title>
                <Badge variant="light" color="indigo" size="lg" radius="md">{l.sector || 'Strategic Asset'}</Badge>
            </Group>

            <SimpleGrid cols={2} spacing="xl" mb="xl">
                <Box>
                    <Group gap="xs" mb={4}>
                        <Landmark size={14} className="text-blue-500" />
                        <Text size="xs" fw={800} c="dimmed" tt="uppercase">Planned Capital (FDI)</Text>
                    </Group>
                    <Text fw={900} size="xl" className="text-blue-900">
                        {p.capex ? `$${Number(p.capex).toLocaleString()}` : 'TBD'}
                    </Text>
                    <Text size="xs" c="dimmed">Foreign Direct Investment</Text>
                </Box>

                <Box>
                    <Group gap="xs" mb={4}>
                        <Users2 size={14} className="text-teal-500" />
                        <Text size="xs" fw={800} c="dimmed" tt="uppercase">Employment Impact</Text>
                    </Group>
                    <Text fw={900} size="xl" className="text-teal-900">
                        {p.jobs ? Number(p.jobs).toLocaleString() : '0'}
                    </Text>
                    <Text size="xs" c="dimmed">Planned Workforce</Text>
                </Box>
            </SimpleGrid>

            <Divider my="xl" label="Strategic Intent" labelPosition="center" />

            <Stack gap="md">
                <Box>
                    <Group gap="xs" mb={4}>
                        <Target size={14} className="text-violet-500" />
                        <Text size="xs" fw={800} c="dimmed" tt="uppercase">Operation Purpose</Text>
                    </Group>
                    <Text size="sm" fw={600} c="gray.7" lineClamp={2}>
                        {p.purpose || 'Business activity details pending...'}
                    </Text>
                </Box>

                <Box>
                    <Group gap="xs" mb={4}>
                        <Briefcase size={14} className="text-orange-500" />
                        <Text size="xs" fw={800} c="dimmed" tt="uppercase">Focal Personnel</Text>
                    </Group>
                    <Group gap="xs">
                        {o.ownerName && <Badge variant="light" color="blue" radius="sm">Owner: {o.ownerName}</Badge>}
                        {o.managerName && <Badge variant="light" color="orange" radius="sm">Mgr: {o.managerName}</Badge>}
                    </Group>
                </Box>

                <Paper withBorder p="md" radius="lg" bg="gray.0" className="border-dashed">
                    <Group gap="sm">
                        <Zap size={18} className="text-yellow-500" />
                        <Box>
                            <Text size="xs" fw={800} tt="uppercase" c="dimmed">Operational Support</Text>
                            <Text size="xs" fw={600}>Follow-up: {o.assignedEmployee || 'Unassigned'}</Text>
                        </Box>
                    </Group>
                </Paper>
            </Stack>
        </Paper>
    );
}


