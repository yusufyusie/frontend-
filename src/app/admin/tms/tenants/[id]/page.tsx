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
                                    <Text size="xl" fw={900}>
                                        {(tenant.leases?.reduce((acc: number, l: any) => acc + Number(l.actualAreaM2), 0) || 0).toLocaleString()} m²
                                    </Text>
                                    <Text size="xs" c="blue" mt={4}>
                                        {tenant.leases?.length || 0} active spatial bindings
                                    </Text>
                                </Paper>
                                <Paper withBorder p="lg" radius="md">
                                    <Text size="sm" c="dimmed" mb="xs">Area Variance</Text>
                                    <Text size="xl" fw={900}>
                                        {(tenant.leases?.reduce((acc: number, l: any) => acc + (Number(l.actualAreaM2) - Number(l.contractAreaM2)), 0) || 0).toFixed(2)} m²
                                    </Text>
                                    <Text size="xs" c="orange" mt={4}>Cumulative delta across assets</Text>
                                </Paper>
                            </SimpleGrid>

                            <Paper withBorder p="xl" radius="md" mt="lg">
                                <Title order={4} mb="md">Company Asset Portfolio</Title>
                                {tenant.leases?.length === 0 ? (
                                    <Text size="sm" c="dimmed">No spatial assets assigned yet. Use the Onboarding Wizard to assign plots or rooms.</Text>
                                ) : (
                                    <Stack gap="md">
                                        {tenant.leases?.map((lease: any) => (
                                            <Paper key={lease.id} withBorder p="md" radius="md" bg="gray.0">
                                                <Group justify="space-between">
                                                    <Group>
                                                        <MapPin size={20} className="text-blue-600" />
                                                        <Box>
                                                            <Text fw={700}>{lease.landResource?.code || lease.room?.code}</Text>
                                                            <Text size="xs" c="dimmed">{lease.landResource?.nameEn || `${lease.room?.floor?.building?.nameEn} - Floor ${lease.room?.floor?.level}`}</Text>
                                                        </Box>
                                                    </Group>
                                                    <Box style={{ textAlign: 'right' }}>
                                                        <Text fw={900}>{Number(lease.actualAreaM2).toLocaleString()} m²</Text>
                                                        <Badge size="xs" variant="light">
                                                            {lease.contractNumber}
                                                        </Badge>
                                                    </Box>
                                                </Group>
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}
                            </Paper>
                        </Tabs.Panel>

                        <Tabs.Panel value="contacts">
                            <Paper withBorder p="xl" radius="md">
                                <TenantContactList tenantId={id} />
                            </Paper>
                        </Tabs.Panel>

                        <Tabs.Panel value="documents">
                            <Paper withBorder p="xl" radius="md">
                                <Group justify="space-between" mb="lg">
                                    <Box>
                                        <Title order={4}>KM / KYC Documents</Title>
                                        <Text size="xs" c="dimmed">Manage compliance and legal documentation</Text>
                                    </Box>
                                    <Button variant="light" size="xs">Upload Document</Button>
                                </Group>

                                {tenant.documents?.length === 0 ? (
                                    <Box py={40} style={{ textAlign: 'center' }}>
                                        <FileCheck size={40} className="mx-auto text-gray-400 mb-4" />
                                        <Text c="dimmed">No documents found for this company.</Text>
                                    </Box>
                                ) : (
                                    <Stack gap="md">
                                        {tenant.documents?.map((doc: any) => (
                                            <Paper key={doc.id} withBorder p="md" radius="md" bg="gray.0">
                                                <Group justify="space-between">
                                                    <Group>
                                                        <FileCheck size={20} className="text-blue-600" />
                                                        <Box>
                                                            <Text fw={700}>{doc.name}</Text>
                                                            <Group gap="xs">
                                                                <Badge size="xs" variant="outline">{doc.status}</Badge>
                                                                {doc.expiryDate && (
                                                                    <Text size="xs" c="dimmed">Expires: {new Date(doc.expiryDate).toLocaleDateString()}</Text>
                                                                )}
                                                            </Group>
                                                        </Box>
                                                    </Group>
                                                    <Group>
                                                        <Button variant="subtle" size="xs" component="a" href={doc.fileUrl} target="_blank">View</Button>
                                                        <Button variant="subtle" size="xs" color="red">Remove</Button>
                                                    </Group>
                                                </Group>
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}
                            </Paper>
                        </Tabs.Panel>

                        <Tabs.Panel value="contracts">
                            <Stack gap="lg">
                                <Group justify="space-between">
                                    <Title order={4}>Spatial Sublease Agreements</Title>
                                    <Button variant="light" size="xs" color="blue">New Contract</Button>
                                </Group>

                                {tenant.leases?.length === 0 ? (
                                    <Paper withBorder p="xl" radius="md" bg="gray.0" style={{ textAlign: 'center' }}>
                                        <Calculator size={40} className="mx-auto text-gray-400 mb-4" />
                                        <Text c="dimmed">No active lease contracts found for this tenant.</Text>
                                    </Paper>
                                ) : (
                                    <Stack gap="md">
                                        {tenant.leases?.map((lease: any) => (
                                            <Paper key={lease.id} withBorder p="xl" radius="lg" shadow="xs">
                                                <Group justify="space-between" mb="md">
                                                    <Group>
                                                        <Box p={10} bg="blue.0" style={{ borderRadius: '1rem' }}>
                                                            <FileCheck size={24} className="text-blue-600" />
                                                        </Box>
                                                        <Box>
                                                            <Text fw={900} size="lg">{lease.contractNumber}</Text>
                                                            <Text size="xs" c="dimmed" tt="uppercase" lts="1px">Execution Date: {new Date(lease.startDate).toLocaleDateString()}</Text>
                                                        </Box>
                                                    </Group>
                                                    <Badge size="xl" variant="dot" color="teal">ACTIVE LEASE</Badge>
                                                </Group>

                                                <SimpleGrid cols={3} spacing="md">
                                                    <Box>
                                                        <Text size="xs" c="dimmed" fw={700} tt="uppercase">Contract Area</Text>
                                                        <Text fw={700}>{Number(lease.contractAreaM2).toLocaleString()} m²</Text>
                                                    </Box>
                                                    <Box>
                                                        <Text size="xs" c="dimmed" fw={700} tt="uppercase">Actual Area</Text>
                                                        <Text fw={700}>{Number(lease.actualAreaM2).toLocaleString()} m²</Text>
                                                    </Box>
                                                    <Box>
                                                        <Text size="xs" c="dimmed" fw={700} tt="uppercase">Variance</Text>
                                                        <Text fw={700} c={Math.abs(Number(lease.actualAreaM2) - Number(lease.contractAreaM2)) > 5 ? 'red' : 'teal'}>
                                                            {(Number(lease.actualAreaM2) - Number(lease.contractAreaM2)).toFixed(2)} m²
                                                        </Text>
                                                    </Box>
                                                </SimpleGrid>
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}
                            </Stack>
                        </Tabs.Panel>
                    </Tabs>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
