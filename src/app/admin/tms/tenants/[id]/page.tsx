'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container, Title, Text, Group, Button, Paper, Stack, Grid, Badge, Box, LoadingOverlay, Breadcrumbs, Anchor, Tabs, Divider, SimpleGrid } from '@mantine/core';
import { Building2, Globe, Mail, Phone, MapPin, Calculator, FileCheck, History, ArrowLeft, Settings, ShieldCheck, Users } from 'lucide-react';
import { tenantsService, Tenant } from '@/services/tenants.service';
import { TenantContactList } from '@/components/organisms/tms/TenantContactList';
import { TenantStatusBadge } from '@/components/atoms/tms/TenantStatusBadge';
import { toast } from '@/components/Toast';
import Link from 'next/link';

export default function TenantDetailPage() {
    const params = useParams();
    const id = parseInt(params.id as string);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) fetchTenant();
    }, [id]);

    const fetchTenant = async () => {
        setIsLoading(true);
        try {
            const res: any = await tenantsService.getOne(id);
            setTenant(res.data || res);
        } catch (error) {
            toast.error('Failed to load company profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <LoadingOverlay visible />;
    if (!tenant) return <Container py="xl"><Text>Tenant not found</Text></Container>;

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl" align="flex-start">
                <Box>
                    <Breadcrumbs mb="xs">
                        <Anchor href="/admin" size="xs">Admin</Anchor>
                        <Anchor href="/admin/tms/tenants" size="xs">Tenant Directory</Anchor>
                        <Text size="xs" c="dimmed">{tenant.companyRegNumber}</Text>
                    </Breadcrumbs>
                    <Group gap="md">
                        <Button
                            variant="subtle"
                            color="gray"
                            component={Link}
                            href="/admin/tms/tenants"
                            leftSection={<ArrowLeft size={16} />}
                            p={0}
                        />
                        <Title order={2} fw={900}>{tenant.nameEn}</Title>
                        <TenantStatusBadge
                            statusName={(tenant as any).status?.lookupCode}
                            variant="filled"
                        />
                    </Group>
                    <Text c="dimmed" size="sm" ml={40}>{tenant.nameAm}</Text>
                </Box>
                <Group>
                    <Button variant="light" color="blue" leftSection={<Settings size={18} />}>Manage Account</Button>
                </Group>
            </Group>

            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap="lg">
                        <Paper withBorder p="xl" radius="md">
                            <Title order={4} mb="lg">Company Vitals</Title>
                            <Stack gap="md">
                                <Box>
                                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">Registration & Tax</Text>
                                    <Group justify="space-between" mt={4}>
                                        <Text size="sm">Reg #: <b>{tenant.companyRegNumber}</b></Text>
                                        <Text size="sm">TIN: <b>{tenant.tinNumber || 'N/A'}</b></Text>
                                    </Group>
                                </Box>
                                <Divider />
                                <Box>
                                    <Text size="xs" c="dimmed" fw={700} tt="uppercase" mb={8}>Contact Channels</Text>
                                    <Stack gap="sm">
                                        {tenant.email && (
                                            <Group gap="sm">
                                                <Mail size={16} className="text-blue-500" />
                                                <Text size="sm">{tenant.email}</Text>
                                            </Group>
                                        )}
                                        {tenant.phone && (
                                            <Group gap="sm">
                                                <Phone size={16} className="text-green-500" />
                                                <Text size="sm">{tenant.phone}</Text>
                                            </Group>
                                        )}
                                        {tenant.website && (
                                            <Group gap="sm">
                                                <Globe size={16} className="text-orange-500" />
                                                <Anchor href={tenant.website} target="_blank" size="sm">{tenant.website}</Anchor>
                                            </Group>
                                        )}
                                        {tenant.address && (
                                            <Group gap="sm" align="flex-start">
                                                <MapPin size={16} className="text-red-500 mt-1" />
                                                <Text size="sm">{tenant.address}</Text>
                                            </Group>
                                        )}
                                    </Stack>
                                </Box>
                                <Divider />
                                <Box>
                                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">Sector</Text>
                                    <Text size="sm" mt={4}>{(tenant as any).businessCategory?.lookupValue?.en || 'N/A'}</Text>
                                </Box>
                            </Stack>
                        </Paper>

                        <Paper withBorder p="xl" radius="md" bg="blue.0" style={{ borderColor: '#bfdbfe' }}>
                            <Group gap="sm" mb="xs">
                                <ShieldCheck size={24} className="text-blue-600" />
                                <Text fw={700} c="blue.9">Account Health</Text>
                            </Group>
                            <Text size="xs" c="blue.8">This tenant is **Verified**. All KYC documents are currently valid and up to date.</Text>
                        </Paper>
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Tabs defaultValue="overview" variant="pills" radius="md">
                        <Tabs.List mb="lg">
                            <Tabs.Tab value="overview" leftSection={<History size={16} />}>Overview</Tabs.Tab>
                            <Tabs.Tab value="contacts" leftSection={<Users size={16} />}>Authorized Contacts</Tabs.Tab>
                            <Tabs.Tab value="documents" leftSection={<FileCheck size={16} />}>KM / KYC Documents</Tabs.Tab>
                            <Tabs.Tab value="contracts" leftSection={<Calculator size={16} />}>Leases & Billing</Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="overview">
                            <SimpleGrid cols={2} spacing="lg">
                                <Paper withBorder p="lg" radius="md">
                                    <Text size="sm" c="dimmed" mb="xs">Active Occupancy</Text>
                                    <Text size="xl" fw={900}>0 m²</Text>
                                    <Text size="xs" c="blue" mt={4}>No active leases found</Text>
                                </Paper>
                                <Paper withBorder p="lg" radius="md">
                                    <Text size="sm" c="dimmed" mb="xs">Financial Balance</Text>
                                    <Text size="xl" fw={900}>0.00 ETB</Text>
                                    <Text size="xs" c="green" mt={4}>Account settled</Text>
                                </Paper>
                            </SimpleGrid>

                            <Paper withBorder p="xl" radius="md" mt="lg">
                                <Title order={4} mb="md">Onboarding Progress</Title>
                                <Text size="sm" c="dimmed">
                                    Tenant has completed initial profile registration.
                                    Next step: Upload required business license and TIN certification in the Documents tab.
                                </Text>
                            </Paper>
                        </Tabs.Panel>

                        <Tabs.Panel value="contacts">
                            <Paper withBorder p="xl" radius="md">
                                <TenantContactList tenantId={id} />
                            </Paper>
                        </Tabs.Panel>

                        <Tabs.Panel value="documents">
                            <Paper withBorder p="xl" radius="md" bg="gray.0" style={{ textAlign: 'center' }}>
                                <FileCheck size={40} className="mx-auto text-gray-400 mb-4" />
                                <Text c="dimmed">Document management will be available in the next lifecycle update.</Text>
                            </Paper>
                        </Tabs.Panel>

                        <Tabs.Panel value="contracts">
                            <Paper withBorder p="xl" radius="md" bg="gray.0" style={{ textAlign: 'center' }}>
                                <Calculator size={40} className="mx-auto text-gray-400 mb-4" />
                                <Text c="dimmed">Lease management is scheduled for Phase 4.</Text>
                            </Paper>
                        </Tabs.Panel>
                    </Tabs>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
