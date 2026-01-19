'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Container, Title, Text, Group, Button, Paper, Stack, Grid, Badge,
    Box, LoadingOverlay, Breadcrumbs, Anchor, Tabs, Divider, SimpleGrid,
    Progress, Table, rem
} from '@mantine/core';
import {
    Building2, Globe, Mail, Phone, MapPin, Calculator, FileCheck,
    History, ArrowLeft, Settings, ShieldCheck, Users, ArrowRightLeft,
    Briefcase, FileText, LayoutDashboard, Plus
} from 'lucide-react';
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

    // Area Calculations
    const totalLeasedArea = tenant.leases?.reduce((acc: number, l: any) => acc + Number(l.actualAreaM2), 0) || 0;
    const totalVariance = tenant.leases?.reduce((acc: number, l: any) => acc + (Number(l.actualAreaM2) - Number(l.contractAreaM2)), 0) || 0;

    return (
        <Container size="xl" py="xl" className="animate-fade-in">
            {/* Breadcrumbs & Header */}
            <Box mb="xl">
                <Breadcrumbs mb="xs">
                    <Anchor href="/admin" size="xs">Admin</Anchor>
                    <Anchor href="/admin/tms/tenants" size="xs">Tenant Directory</Anchor>
                    <Text size="xs" c="dimmed">{tenant.companyRegNumber}</Text>
                </Breadcrumbs>

                <Group justify="space-between" align="flex-start">
                    <Box>
                        <Group gap="md">
                            <Button
                                variant="subtle"
                                color="gray"
                                component={Link}
                                href="/admin/tms/tenants"
                                leftSection={<ArrowLeft size={16} />}
                                p={0}
                            />
                            <Title order={1} fw={900} className="text-[#16284F] tracking-tight">{tenant.nameEn}</Title>
                            <Badge size="lg" variant="dot" color={tenant.statusId === 1 ? 'teal' : 'orange'} className="glass border shadow-sm">
                                {tenant.status?.name || 'Active'}
                            </Badge>
                        </Group>
                        <Group gap="xs" mt={4} ml={40}>
                            <Text c="dimmed" size="sm" fw={600}>{tenant.businessCategory?.name || 'General Business'}</Text>
                            <Text c="dimmed" size="sm">•</Text>
                            <Text c="dimmed" size="sm">Partner since {new Date(tenant.createdAt!).toLocaleDateString()}</Text>
                        </Group>
                    </Box>
                    <Group>
                        <Button variant="light" color="blue" leftSection={<Settings size={18} />} className="hover-lift rounded-xl glass">Account Settings</Button>
                        <Button variant="filled" color="teal" leftSection={<Plus size={18} />} className="shadow-lg hover-lift rounded-xl">Add Lease</Button>
                    </Group>
                </Group>
            </Box>

            {/* Stats Overview */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
                <Paper withBorder p="xl" radius="lg" className="glass shadow-sm hover-glow transition-base">
                    <Group justify="space-between" mb="xs">
                        <Text size="xs" c="dimmed" fw={800} tt="uppercase">Allocated Area</Text>
                        <Box p={6} bg="blue.0" style={{ borderRadius: '8px' }}><MapPin size={14} className="text-blue-600" /></Box>
                    </Group>
                    <Group gap="xs" align="flex-end">
                        <Title order={2} fw={900}>{totalLeasedArea.toLocaleString()}</Title>
                        <Text size="sm" c="dimmed" mb={4}>m²</Text>
                    </Group>
                    <Progress value={85} size="xs" mt="md" radius="xl" color="blue" />
                </Paper>

                <Paper withBorder p="xl" radius="lg" className="glass shadow-sm hover-glow transition-base">
                    <Group justify="space-between" mb="xs">
                        <Text size="xs" c="dimmed" fw={800} tt="uppercase">Area Variance</Text>
                        <Box p={6} bg="orange.0" style={{ borderRadius: '8px' }}><ArrowRightLeft size={14} className="text-orange-600" /></Box>
                    </Group>
                    <Title order={2} fw={900} c={Math.abs(totalVariance) > 5 ? 'red.7' : 'teal.7'}>
                        {totalVariance.toFixed(2)} m²
                    </Title>
                    <Text size="xs" c="dimmed" mt={4}>Cumulative Deviation</Text>
                </Paper>

                <Paper withBorder p="xl" radius="lg" className="glass shadow-sm hover-glow transition-base">
                    <Group justify="space-between" mb="xs">
                        <Text size="xs" c="dimmed" fw={800} tt="uppercase">Active Permits</Text>
                        <Box p={6} bg="teal.0" style={{ borderRadius: '8px' }}><Building2 size={14} className="text-teal-600" /></Box>
                    </Group>
                    <Title order={2} fw={900}>{tenant.leases?.length || 0}</Title>
                    <Text size="xs" c="dimmed" mt={4}>Valid lease agreements</Text>
                </Paper>

                <Paper withBorder p="xl" radius="lg" className="glass shadow-sm hover-glow transition-base">
                    <Group justify="space-between" mb="xs">
                        <Text size="xs" c="dimmed" fw={800} tt="uppercase">KYC Health</Text>
                        <Box p={6} bg="green.0" style={{ borderRadius: '8px' }}><ShieldCheck size={14} className="text-green-600" /></Box>
                    </Group>
                    <Title order={2} fw={900}>98%</Title>
                    <Text size="xs" c="dimmed" mt={4}>Compliance Score</Text>
                </Paper>
            </SimpleGrid>

            {/* Content Tabs */}
            <Tabs defaultValue="intel" variant="pills" radius="xl">
                <Tabs.List className="glass p-1 border shadow-sm inline-flex mb-xl">
                    <Tabs.Tab value="intel" leftSection={<Briefcase size={14} />}>Company Intel</Tabs.Tab>
                    <Tabs.Tab value="registry" leftSection={<FileText size={14} />}>Lease Registry</Tabs.Tab>
                    <Tabs.Tab value="vault" leftSection={<FileCheck size={14} />}>Document Vault</Tabs.Tab>
                    <Tabs.Tab value="ledger" leftSection={<LayoutDashboard size={14} />}>Financial Ledger</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="intel">
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 7 }}>
                            <Paper withBorder p="xl" radius="xl" className="glass shadow-md">
                                <Title order={4} mb="xl" className="text-[#16284F]">Organizational Identity</Title>
                                <SimpleGrid cols={2} spacing="xl">
                                    <Box>
                                        <Text size="xs" fw={800} c="dimmed" tt="uppercase">Registration ID</Text>
                                        <Text fw={700} mt={4} size="sm">{tenant.companyRegNumber}</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" fw={800} c="dimmed" tt="uppercase">Tax Identification #</Text>
                                        <Text fw={700} mt={4} size="sm">{tenant.tinNumber || 'Not provided'}</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" fw={800} c="dimmed" tt="uppercase">Operational Email</Text>
                                        <Group gap="xs" mt={4}>
                                            <Mail size={14} className="text-blue-500" />
                                            <Text fw={600} size="sm">{tenant.email || '—'}</Text>
                                        </Group>
                                    </Box>
                                    <Box>
                                        <Text size="xs" fw={800} c="dimmed" tt="uppercase">Direct Line</Text>
                                        <Group gap="xs" mt={4}>
                                            <Phone size={14} className="text-teal-500" />
                                            <Text fw={600} size="sm">{tenant.phone || '—'}</Text>
                                        </Group>
                                    </Box>
                                </SimpleGrid>

                                <Divider my="xl" label="Corporate Headquarters" labelPosition="center" />
                                <Paper withBorder p="md" radius="lg" bg="gray.0" className="border-dashed">
                                    <Group gap="md">
                                        <Box p={8} bg="white" style={{ borderRadius: '10px' }} className="shadow-sm"><MapPin size={18} className="text-red-500" /></Box>
                                        <Text size="sm" fw={500}>{tenant.address || 'Address information not registered'}</Text>
                                    </Group>
                                </Paper>
                            </Paper>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 5 }}>
                            <Paper withBorder p="xl" radius="xl" className="glass shadow-md">
                                <Group justify="space-between" mb="xl">
                                    <Title order={4} className="text-[#16284F]">Authorized Personnel</Title>
                                    <Button variant="subtle" size="xs" leftSection={<Plus size={14} />}>Manage Contacts</Button>
                                </Group>
                                <TenantContactList tenantId={id} />
                            </Paper>
                        </Grid.Col>
                    </Grid>
                </Tabs.Panel>

                <Tabs.Panel value="registry">
                    <Paper withBorder p="xl" radius="xl" className="glass shadow-md">
                        <Group justify="space-between" mb="lg">
                            <Title order={4} className="text-[#16284F]">Active Space Agreements</Title>
                            <Badge variant="light" color="teal">{tenant.leases?.length || 0} Entries</Badge>
                        </Group>
                        <Table verticalSpacing="md" highlightOnHover>
                            <Table.Thead className="bg-gray-50/50">
                                <Table.Tr>
                                    <Table.Th h={rem(40)}>Contract Number</Table.Th>
                                    <Table.Th>Spatial Reference</Table.Th>
                                    <Table.Th>Verified Area</Table.Th>
                                    <Table.Th>Commencement</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {tenant.leases?.length === 0 ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={5} style={{ textAlign: 'center' }} py="xl">
                                            <Text c="dimmed" size="sm">No spatial agreements found for this entity.</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    tenant.leases?.map((l: any) => (
                                        <Table.Tr key={l.id} className="transition-colors">
                                            <Table.Td><Text fw={800} size="sm" c="blue.8">{l.contractNumber}</Text></Table.Td>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <Box p={6} bg="teal.0" style={{ borderRadius: '6px' }}><Building2 size={12} className="text-teal-600" /></Box>
                                                    <Text size="sm" fw={600}>{l.room?.code || l.landResource?.code}</Text>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap={4}>
                                                    <Text fw={700} size="sm">{l.actualAreaM2}</Text>
                                                    <Text size="xs" c="dimmed">m²</Text>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="xs" fw={500}>{new Date(l.startDate).toLocaleDateString()}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge size="xs" variant="light" color="teal">Active</Badge>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))
                                )}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="vault">
                    <Paper withBorder p="xl" radius="xl" className="glass shadow-md">
                        <Group justify="space-between" mb="xl">
                            <Box>
                                <Title order={4} className="text-[#16284F]">Compliance Records</Title>
                                <Text size="xs" c="dimmed">Encrypted storage for legal and KM artifacts</Text>
                            </Box>
                            <Button variant="light" size="xs" leftSection={<Plus size={14} />} className="rounded-xl">Upload Artifact</Button>
                        </Group>

                        {tenant.documents?.length === 0 ? (
                            <Box py={60} style={{ textAlign: 'center' }}>
                                <FileCheck size={48} className="mx-auto text-gray-200 mb-4" strokeWidth={1} />
                                <Text c="dimmed" size="sm" fw={500}>The vault is empty. Upload registration documents for verification.</Text>
                            </Box>
                        ) : (
                            <Stack gap="md">
                                {tenant.documents?.map((doc: any) => (
                                    <Paper key={doc.id} withBorder p="md" radius="lg" bg="white/50" className="hover-lift transition-base shadow-sm">
                                        <Group justify="space-between">
                                            <Group>
                                                <Box p={10} bg="blue.0" style={{ borderRadius: '12px' }}>
                                                    <FileCheck size={20} className="text-blue-600" />
                                                </Box>
                                                <Box>
                                                    <Text fw={700} size="sm">{doc.name}</Text>
                                                    <Group gap="xs">
                                                        <Badge size="xs" variant="outline" radius="sm" color="gray">{doc.category || 'General'}</Badge>
                                                        {doc.expiryDate && (
                                                            <Text size="xs" c="dimmed" fw={500}>Validity until: {new Date(doc.expiryDate).toLocaleDateString()}</Text>
                                                        )}
                                                    </Group>
                                                </Box>
                                            </Group>
                                            <Group>
                                                <Button variant="subtle" size="xs">View</Button>
                                                <Button variant="subtle" size="xs" color="red">Revoke</Button>
                                            </Group>
                                        </Group>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="ledger">
                    <Paper withBorder p="xl" radius="xl" className="glass shadow-md" style={{ textAlign: 'center' }}>
                        <Box py={60}>
                            <LayoutDashboard size={48} className="mx-auto text-gray-200 mb-4" strokeWidth={1} />
                            <Title order={4} fw={800} className="text-gray-400">Ledger Offline</Title>
                            <Text c="dimmed" size="sm" mt="xs" maw={400} mx="auto">The financial ledger is being provisioned. Payment history and invoicing will be synchronized in the next service update.</Text>
                        </Box>
                    </Paper>
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
