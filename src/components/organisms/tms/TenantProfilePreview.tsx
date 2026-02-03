import React from 'react';
import { Paper, Stack, Group, Box, Text, Avatar, Badge, Divider, ThemeIcon, rem, RingProgress } from '@mantine/core';
import { Building2, Globe, Mail, Phone, MapPin, ShieldCheck, CheckCircle2, QrCode, Award, Zap, Landmark, Rocket, Sparkles } from 'lucide-react';
import { Tenant } from '@/services/tenants.service';

interface TenantProfilePreviewProps {
    data: Partial<Tenant>;
    bizCategoryLabel?: string;
    statusLabel?: string;
}

export const TenantProfilePreview = ({ data, bizCategoryLabel, statusLabel }: TenantProfilePreviewProps) => {
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
                    <Badge variant="white" size="lg" radius="xl" color="teal" fw={900}>
                        AUTHORIZED TENANT
                    </Badge>
                </Box>
                {/* Abstract pattern overlay */}
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

            <Stack gap={0} p="2.5rem" mt={-50} style={{ flex: 1 }}>
                {/* Profile Header */}
                <Group align="flex-end" justify="space-between" mb="xl">
                    <Box style={{ position: 'relative' }}>
                        <Avatar
                            size={rem(120)}
                            radius="2rem"
                            bg="white"
                            p={6}
                            style={{ boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
                        >
                            <Box
                                w="100%"
                                h="100%"
                                style={{
                                    background: 'linear-gradient(135deg, #0C7C92 0%, #065e6e 100%)',
                                    borderRadius: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Sparkles size={rem(48)} className="text-white" />
                            </Box>
                        </Avatar>
                        <Box
                            pos="absolute"
                            bottom={0}
                            right={0}
                            bg="teal.6"
                            p={8}
                            style={{ borderRadius: '50%', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        >
                            <ShieldCheck size={20} className="text-white" />
                        </Box>
                    </Box>

                    <Stack align="flex-end" gap={4}>
                        <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">Verification Status</Text>
                        <Group gap={8}>
                            <Award size={18} className="text-yellow-500" />
                            <Text size="md" fw={900} c="#16284F">VERIFIED COMPANY</Text>
                        </Group>
                    </Stack>
                </Group>

                {/* Main Content */}
                <Stack gap="xl">
                    <Box>
                        <Text size="xs" fw={900} c="#0C7C92" tt="uppercase" lts="1.5px" mb={4}>Organization Profile</Text>
                        <Text size={rem(32)} fw={900} c="#16284F" lts="-1px" style={{ lineHeight: 1.05 }}>
                            {data.name || 'Company Name'}
                        </Text>
                        <Group gap="xs" mt="lg">
                            <Badge color="#16284F" variant="filled" size="sm" radius="xs" fw={900} className="tracking-widest">CERTIFIED</Badge>
                            <Badge color="blue" variant="dot" size="sm" fw={800}>{bizCategoryLabel || 'GENERAL SECTOR'}</Badge>
                            {data.metadata?.originId && (
                                <Badge color="indigo" variant="light" size="sm" fw={800} leftSection={<Globe size={10} />}>
                                    INVESTMENT ORIGIN
                                </Badge>
                            )}
                            {data.metadata?.isStartup && (
                                <Badge color="orange" variant="light" size="sm" fw={800} leftSection={<Rocket size={10} />}>
                                    STARTUP
                                </Badge>
                            )}
                        </Group>
                    </Box>

                    <Divider size="xs" color="gray.1" label="Entity Statistics" labelPosition="center" />

                    <div className="grid grid-cols-1 gap-4">
                        <Paper p="lg" radius="1.5rem" bg="slate.50" style={{ border: '1px solid #f1f5f9' }}>
                            <Group gap="xs" mb={4}>
                                <Zap size={14} className="text-teal-600" />
                                <Group gap={4} wrap="nowrap">
                                    <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">TIN Status</Text>
                                    {data.tinNumber && <CheckCircle2 size={10} className="text-teal-500" />}
                                </Group>
                            </Group>
                            <Text size="sm" fw={800} c="#16284F">{data.tinNumber || 'PENDING'}</Text>
                        </Paper>
                    </div>

                    <Stack gap="sm">
                        <Text size="xs" fw={900} c="dimmed" tt="uppercase" lts="1px" mb={4}>Primary Contacts</Text>
                        <Paper p="md" radius="md" bg="#F8FAFC" style={{ border: '1px solid #E2E8F0' }}>
                            <Group justify="space-between" mb="xs">
                                <Group gap="md">
                                    <Mail size={16} className="text-[#0C7C92]" />
                                    <Text size="sm" fw={800} c="#16284F">{data.email || 'not-assigned@tms.com'}</Text>
                                </Group>
                                <CheckCircle2 size={14} className="text-teal-500" />
                            </Group>
                            <Divider color="gray.2" my="xs" />
                            <Group justify="space-between">
                                <Group gap="md">
                                    <Globe size={16} className="text-[#0C7C92]" />
                                    <Text size="sm" fw={800} c="#16284F">{data.website || 'corporate-portal.com'}</Text>
                                </Group>
                                <CheckCircle2 size={14} className="text-teal-500" />
                            </Group>
                        </Paper>
                    </Stack>

                    {/* Bottom Security Section */}
                    <Box mt="auto" p="1.5rem" bg="#F8FAFC" style={{ borderRadius: '1.5rem', border: '1px solid #E2E8F0', position: 'relative', overflow: 'hidden' }}>
                        <Box pos="absolute" top={0} left={0} w="100%" h={4} style={{ background: 'linear-gradient(90deg, #16284F 0%, #0C7C92 100%)' }} />
                        <Group justify="space-between">
                            <Stack gap={2}>
                                <Text size="10px" fw={900} c="#16284F" tt="uppercase" lts="1px">System Tracking ID</Text>
                                <Text size="11px" c="dimmed" fw={700}>REF: {data.companyRegNumber ? `${data.companyRegNumber}` : 'TEMP-001'}</Text>
                            </Stack>
                            <Box
                                p={10}
                                bg="white"
                                style={{ borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}
                            >
                                <QrCode size={36} className="text-[#16284F]" />
                            </Box>
                        </Group>
                    </Box>
                </Stack>
            </Stack>
        </Paper>
    );
};
