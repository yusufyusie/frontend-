'use client';

import { Paper, Title, SimpleGrid, Box, Text, Group, Divider, Badge, Stack, ThemeIcon } from '@mantine/core';
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
        <Paper
            radius="2rem"
            p="2.5rem"
            bg="white"
            style={{
                border: '1px solid rgba(12, 124, 146, 0.1)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
        >
            <Group justify="space-between" mb="xl">
                <Stack gap={2}>
                    <Text size="xs" fw={700} className="text-brand-teal uppercase tracking-wide font-primary" lts="1px">Evaluation Summary</Text>
                    <Title order={3} className="text-brand-navy tracking-tight font-primary">Venture Analytics</Title>
                </Stack>
                <Badge variant="filled" className="bg-brand-navy font-bold px-4" size="lg" radius="sm">{l.sector || 'Authorized Sector'}</Badge>
            </Group>

            <SimpleGrid cols={2} spacing="xl" mb="xl">
                <Paper p="xl" radius="1.5rem" bg="#F8FAFC" className="border border-slate-100 shadow-sm relative overflow-hidden">
                    <Box pos="absolute" top={0} left={0} w={4} h="100%" bg="blue.5" />
                    <Group gap="xs" mb={8}>
                        <ThemeIcon color="blue.1" variant="light" size="sm" radius="md"><Landmark size={12} className="text-blue-600" /></ThemeIcon>
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.5px">Capital Investment</Text>
                    </Group>
                    <Text fw={800} size="rem(28px)" className="text-blue-900 leading-tight">
                        {p.capex ? `$${Number(p.capex).toLocaleString()}` : 'TBD'}
                    </Text>
                    <Text size="11px" fw={600} c="blue.7" mt={4}>Foreign Direct Investment (Planned)</Text>
                </Paper>

                <Paper p="xl" radius="1.5rem" bg="#F8FAFC" className="border border-slate-100 shadow-sm relative overflow-hidden">
                    <Box pos="absolute" top={0} left={0} w={4} h="100%" bg="teal.5" />
                    <Group gap="xs" mb={8}>
                        <ThemeIcon color="teal.1" variant="light" size="sm" radius="md"><Users2 size={12} className="text-teal-600" /></ThemeIcon>
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts="0.5px">Employment Impact</Text>
                    </Group>
                    <Text fw={800} size="rem(28px)" className="text-teal-900 leading-tight">
                        {p.jobs ? Number(p.jobs).toLocaleString() : '0'}
                    </Text>
                    <Text size="11px" fw={600} c="teal.7" mt={4}>High-Value Technical Positions</Text>
                </Paper>
            </SimpleGrid>

            <Divider my="xl" color="gray.1" />

            <Stack gap="xl">
                <Box>
                    <Group gap="xs" mb={8}>
                        <ThemeIcon color="violet.1" variant="light" size="sm" radius="md"><Target size={12} className="text-violet-600" /></ThemeIcon>
                        <Text size="xs" fw={900} c="dimmed" tt="uppercase" lts="1.5px">Mission & Core Activities</Text>
                    </Group>
                    <Text size="sm" fw={700} c="slate.7" style={{ lineHeight: 1.6 }}>
                        {p.purpose || 'Comprehensive business activity details are currently being finalized by the institutional onboarding team.'}
                    </Text>
                </Box>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Box>
                        <Group gap="xs" mb={8}>
                            <ThemeIcon color="orange.1" variant="light" size="sm" radius="md"><Briefcase size={12} className="text-orange-600" /></ThemeIcon>
                            <Text size="xs" fw={900} c="dimmed" tt="uppercase" lts="1.5px">Focal Representatives</Text>
                        </Group>
                        <Group gap="xs">
                            {o.ownerName ? (
                                <Badge variant="light" color="blue" radius="md" fw={800}>OWNER: {o.ownerName}</Badge>
                            ) : (
                                <Text size="xs" c="dimmed" fw={600} italic>No Owner Registered</Text>
                            )}
                            {o.managerName && <Badge variant="light" color="orange" radius="md" fw={800}>MGR: {o.managerName}</Badge>}
                        </Group>
                    </Box>

                    <Paper p="lg" radius="xl" bg="slate.50" className="border-dashed border-2 border-slate-200">
                        <Group gap="md">
                            <ThemeIcon color="yellow.5" variant="filled" size="md" radius="lg" className="shadow-lg shadow-yellow-200"><Zap size={16} /></ThemeIcon>
                            <Box>
                                <Text size="10px" fw={900} tt="uppercase" c="dimmed" lts="1px">Strategic Liaison</Text>
                                <Text size="xs" fw={850} className="text-[#16284F]">{o.assignedEmployee || 'UNASSIGNED ROLE'}</Text>
                            </Box>
                        </Group>
                    </Paper>
                </div>
            </Stack>
        </Paper>
    );
}


