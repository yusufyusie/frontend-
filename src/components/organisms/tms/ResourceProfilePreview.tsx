'use client';

import React from 'react';
import { Paper, Stack, Group, Box, Text, Avatar, Badge, Divider, ThemeIcon, rem } from '@mantine/core';
import { Building2, MapPin, ShieldCheck, CheckCircle2, QrCode, Award, Ruler, Layers, DoorOpen, Landmark } from 'lucide-react';

interface ResourceProfilePreviewProps {
    data: any;
    type: string; // ZONE, BLOCK, PLOT, BUILDING, FLOOR, ROOM
}

export const ResourceProfilePreview = ({ data, type }: ResourceProfilePreviewProps) => {
    const isLand = type === 'PLOT' || type === 'ZONE' || type === 'BLOCK';
    const isBuilding = type === 'BUILDING';
    const isRoom = type === 'ROOM';

    const getIcon = () => {
        if (isLand) return <MapPin size={rem(48)} className="text-[#0C7C92]" />;
        if (isBuilding) return <Building2 size={rem(48)} className="text-[#0C7C92]" />;
        if (isRoom) return <DoorOpen size={rem(48)} className="text-[#0C7C92]" />;
        return <Landmark size={rem(48)} className="text-[#0C7C92]" />;
    };

    const getRank = () => {
        if (isLand) return 'STRATEGIC LAND';
        if (isBuilding) return 'FACILITY ASSET';
        if (isRoom) return 'RENTABLE UNIT';
        return 'ORGANIZATIONAL NODE';
    };

    return (
        <Paper
            radius="2.5rem"
            p={0}
            bg="white"
            shadow="2xl"
            style={{
                border: '1px solid rgba(12, 124, 146, 0.1)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: '#fff',
                position: 'relative'
            }}
        >
            {/* Top Decorative Banner */}
            <Box h={120} style={{ background: 'linear-gradient(135deg, #16284F 0%, #0C7C92 100%)', position: 'relative' }}>
                <Box pos="absolute" top={20} right={20}>
                    <Badge variant="white" size="lg" radius="xl" color="blue" fw={900}>
                        {data.status?.name || data.isActive ? 'OPERATIONAL' : 'INACTIVE'}
                    </Badge>
                </Box>
                <Box
                    pos="absolute"
                    inset={0}
                    style={{
                        opacity: 0.1,
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '24px 24px'
                    }}
                />
            </Box>

            <Stack gap={0} p="2.5rem" mt={-60} style={{ flex: 1 }}>
                {/* Profile Header */}
                <Group align="flex-end" justify="space-between" mb="xl">
                    <Box style={{ position: 'relative' }}>
                        <Avatar
                            size={rem(120)}
                            radius="3rem"
                            bg="white"
                            p={4}
                            style={{ boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
                        >
                            <Box
                                w="100%"
                                h="100%"
                                style={{
                                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                    borderRadius: '2.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {getIcon()}
                            </Box>
                        </Avatar>
                        <Box
                            pos="absolute"
                            bottom={5}
                            right={5}
                            bg="blue"
                            p={6}
                            style={{ borderRadius: '50%', border: '4px solid white' }}
                        >
                            <ShieldCheck size={20} className="text-white" />
                        </Box>
                    </Box>

                    <Stack align="flex-end" gap={4}>
                        <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="2px">Asset Classification</Text>
                        <Group gap={8}>
                            <Award size={18} className="text-blue-500" />
                            <Text size="md" fw={900} c="#16284F">{getRank()}</Text>
                        </Group>
                    </Stack>
                </Group>

                {/* Main Content */}
                <Stack gap="xl">
                    <Box>
                        <Text size={rem(28)} fw={900} c="#16284F" lts="-1px" style={{ lineHeight: 1.1 }}>
                            {data.name || data.code}
                        </Text>
                        <Group gap="xs" mt={8}>
                            <Badge color="cyan" variant="dot" size="sm" fw={700}>{type}</Badge>
                            <Text size="xs" c="dimmed" fw={600}>CODE: {data.code}</Text>
                        </Group>
                    </Box>

                    <Divider size="xs" color="gray.1" label="Asset Metrics" labelPosition="center" />

                    <div className="grid grid-cols-2 gap-4">
                        <Paper p="lg" radius="1.5rem" bg="slate.50" style={{ border: '1px solid #f1f5f9' }}>
                            <Group gap="xs" mb={4}>
                                <Ruler size={14} className="text-teal-600" />
                                <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">Total Area</Text>
                            </Group>
                            <Text size="sm" fw={800} c="#16284F">{data.area || data.totalArea || data.contractArea || '0.00'} m²</Text>
                        </Paper>
                        <Paper p="lg" radius="1.5rem" bg="slate.50" style={{ border: '1px solid #f1f5f9' }}>
                            <Group gap="xs" mb={4}>
                                <Layers size={14} className="text-orange-600" />
                                <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">Hierarchy</Text>
                            </Group>
                            <Text size="sm" fw={800} c="#16284F" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {type === 'ROOM' ? `Floor ${data.floor?.floorNumber}` : type === 'BUILDING' ? data.plot?.name : data.block?.name || 'MASTER'}
                            </Text>
                        </Paper>
                    </div>

                    <Stack gap="md">
                        <Group justify="space-between">
                            <Group gap="md">
                                <ThemeIcon size="xl" radius="xl" variant="light" color="blue">
                                    <MapPin size={18} />
                                </ThemeIcon>
                                <Box>
                                    <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">GPS Alignment</Text>
                                    <Text size="sm" fw={700}>
                                        {data.gpsLat ? `${data.gpsLat}, ${data.gpsLng}` : 'NO COORDINATES'}
                                    </Text>
                                </Box>
                            </Group>
                            {data.gpsLat && <CheckCircle2 size={16} className="text-teal-500" />}
                        </Group>

                        <Group justify="space-between">
                            <Group gap="md">
                                <ThemeIcon size="xl" radius="xl" variant="light" color="indigo">
                                    <Landmark size={18} />
                                </ThemeIcon>
                                <Box>
                                    <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">Usage Type</Text>
                                    <Text size="sm" fw={700}>{data.usageType?.name || data.itpcBuildingType || 'GENERAL'}</Text>
                                </Box>
                            </Group>
                            <CheckCircle2 size={16} className="text-teal-500" />
                        </Group>
                    </Stack>

                    {/* Bottom Security Section */}
                    <Box mt="auto" p="xl" bg="#F1F5F9" style={{ borderRadius: '2rem', position: 'relative' }}>
                        <Group justify="space-between">
                            <Stack gap={4}>
                                <Text size="xs" fw={900} c="#16284F" tt="uppercase" lts="2px">Asset QR Token</Text>
                                <Text size="xs" c="dimmed" fw={600}>ID: {type}-{data.id}</Text>
                            </Stack>
                            <Box
                                p={8}
                                bg="white"
                                style={{ borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                            >
                                <QrCode size={40} className="text-slate-800" />
                            </Box>
                        </Group>
                    </Box>
                </Stack>
            </Stack>
        </Paper>
    );
};
