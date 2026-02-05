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
    Briefcase, FileText, LayoutDashboard, Plus, Factory
} from 'lucide-react';
import { tenantsService, Tenant } from '@/services/tenants.service';
import { TenantContactList } from '@/components/organisms/tms/TenantContactList';
import { TenantJourneyMap } from '@/components/organisms/tms/TenantJourneyMap';
import { VentureIntelCard } from '@/components/organisms/tms/VentureIntelCard';
import { LifecycleTimeline } from '@/components/organisms/tms/LifecycleTimeline';
import { PipelineUpdateModal } from '@/components/organisms/tms/PipelineUpdateModal';
import { PaymentEntryModal } from '@/components/organisms/tms/PaymentEntryModal';
import { DocumentUploadModal } from '@/components/organisms/tms/DocumentUploadModal';
import { format } from 'date-fns';
import { TenantProfilePreview } from '@/components/organisms/tms/TenantProfilePreview';
import { toast } from '@/components/Toast';
import Link from 'next/link';

export default function TenantDetailPage() {
    const params = useParams();
    const id = parseInt(params.id as string);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string | null>('overview');
    const [pipelineOpened, setPipelineOpened] = useState(false);
    const [paymentOpened, setPaymentOpened] = useState(false);
    const [docOpened, setDocOpened] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

    useEffect(() => {
        if (id) loadTenant();
    }, [id]);

    const loadTenant = async () => {
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

    const totalLeasedArea = tenant.leases?.reduce((acc: number, l: any) => acc + Number(l.actualArea), 0) || 0;
    const totalVariance = tenant.leases?.reduce((acc: number, l: any) => acc + (Number(l.actualArea) - Number(l.contractArea)), 0) || 0;

    const isLand = tenant.leases?.some((l: any) => l.plotId || l.landResourceId) ||
        tenant.inquiries?.some((i: any) => i.inquiryType === 'LAND_SUBLEASE');

    const track = isLand ? {
        label: 'Land Sublease Track',
        color: 'teal',
        icon: Factory,
        areaLabel: 'Allocated Land Size',
        varianceLabel: 'Plot Variance',
        portfolioLabel: 'Land Sublease Portfolio'
    } : {
        label: 'Office Rent Track',
        color: 'blue',
        icon: Building2,
        areaLabel: 'Total Office Area',
        varianceLabel: 'Space Variance',
        portfolioLabel: 'Office Rent Registry'
    };

    return (
        <Container size="xl" py="xl" className="animate-fade-in">
            {/* Breadcrumbs & Header */}
            <Box mb="xl">
                <Breadcrumbs mb="xs">
                    <Anchor href="/admin" size="xs" fw={700}>Admin</Anchor>
                    <Anchor href="/admin/tms/tenants" size="xs" fw={700}>Tenant Directory</Anchor>
                    <Text size="xs" c="dimmed" fw={800}>{tenant.companyRegNumber}</Text>
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
                            <Title order={1} fw={800} className="text-brand-navy tracking-tight font-primary">{tenant.name}</Title>
                            <Badge size="lg" variant="dot" color={tenant.statusId === 1 ? 'teal' : 'orange'} className="glass border shadow-sm">
                                {tenant.status?.name || 'Active'}
                            </Badge>
                            <Badge
                                size="lg"
                                variant="light"
                                color={track.color}
                                leftSection={<track.icon size={14} />}
                                className="font-bold uppercase tracking-wider border shadow-sm px-4"
                            >
                                {track.label}
                            </Badge>
                        </Group>
                        <Group gap="xs" mt={4} ml={40}>
                            <Text c="dimmed" size="xs" fw={700} className="uppercase tracking-wide">{tenant.industry?.name || tenant.businessCategory?.name || 'Authorized Tenant'}</Text>
                            <Text c="dimmed" size="xs">•</Text>
                            <Text c="dimmed" size="xs">Resident since {new Date(tenant.createdAt!).toLocaleDateString()}</Text>
                        </Group>
                    </Box>
                    <Group>
                        <Button variant="filled" color="teal" leftSection={<Plus size={18} />} className="shadow-lg hover-lift rounded-xl font-bold bg-brand-teal font-primary">New Agreement</Button>
                    </Group>
                </Group>
            </Box>

            {/* Main Stage Grid (TMS 4.0 Split-Pane) */}
            <Grid gutter="xl" grow>
                {/* LEFT CONTEXT PANEL: Personal Identity Artifact */}
                <Grid.Col span={{ base: 12, lg: 4 }} visibleFrom="lg">
                    <Box h="100%" style={{ position: 'sticky', top: '1rem' }}>
                        <TenantProfilePreview
                            data={tenant}
                            bizCategoryLabel={tenant.industry?.name || tenant.businessCategory?.name}
                            statusLabel={tenant.status?.name}
                        />
                    </Box>
                </Grid.Col>

                {/* RIGHT STAGE: Tactical Intelligence & Management */}
                <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Stack gap="xl">
                        {/* Stats Overview (Refined for Horizontal Flow) */}
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                            <Paper withBorder p="lg" radius="1.5rem" className="glass shadow-sm hover-glow transition-base border-slate-100" style={{ background: 'white' }}>
                                <Group justify="space-between" mb="xs">
                                    <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">{track.areaLabel}</Text>
                                    <Box p={6} bg="blue.0" style={{ borderRadius: '8px' }}><MapPin size={14} className="text-blue-600" /></Box>
                                </Group>
                                <Group gap="xs" align="flex-end">
                                    <Title order={3} fw={900} c="#16284F">{totalLeasedArea.toLocaleString()}</Title>
                                    <Text size="xs" c="dimmed" mb={4} fw={700}>m²</Text>
                                </Group>
                            </Paper>

                            <Paper withBorder p="lg" radius="1.5rem" className="glass shadow-sm hover-glow transition-base border-slate-100" style={{ background: 'white' }}>
                                <Group justify="space-between" mb="xs">
                                    <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">{track.varianceLabel}</Text>
                                    <Box p={6} bg="orange.0" style={{ borderRadius: '8px' }}><ArrowRightLeft size={14} className="text-orange-600" /></Box>
                                </Group>
                                <Title order={3} fw={900} c={Math.abs(totalVariance) > 5 ? 'red.7' : '#0C7C92'}>
                                    {totalVariance.toFixed(2)} m²
                                </Title>
                            </Paper>

                            <Paper withBorder p="lg" radius="1.5rem" className="glass shadow-sm hover-glow transition-base border-slate-100" style={{ background: 'white' }}>
                                <Group justify="space-between" mb="xs">
                                    <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">Agreements</Text>
                                    <Box p={6} bg="teal.0" style={{ borderRadius: '8px' }}><track.icon size={14} className={`text-${track.color}-600`} /></Box>
                                </Group>
                                <Title order={3} fw={900} c="#16284F">{tenant.leases?.length || 0}</Title>
                            </Paper>

                            <Paper withBorder p="lg" radius="1.5rem" className="glass shadow-sm hover-glow transition-base border-slate-100" style={{ background: 'white' }}>
                                <Group justify="space-between" mb="xs">
                                    <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">Identity Health</Text>
                                    <Box p={6} bg="green.0" style={{ borderRadius: '8px' }}><ShieldCheck size={14} className="text-green-600" /></Box>
                                </Group>
                                <Title order={3} fw={900} c="#16284F">ELITE</Title>
                            </Paper>
                        </SimpleGrid>

                        {/* Content Tabs */}
                        <Tabs defaultValue="pipeline" variant="pills" radius="xl">
                            <Tabs.List className="glass p-1 border shadow-xs inline-flex mb-lg" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
                                <Tabs.Tab h={rem(40)} value="pipeline" leftSection={<History size={14} />}>Pipeline</Tabs.Tab>
                                <Tabs.Tab h={rem(40)} value="intel" leftSection={<Briefcase size={14} />}>Identity</Tabs.Tab>
                                <Tabs.Tab h={rem(40)} value="registry" leftSection={<track.icon size={14} />}>Portfolio</Tabs.Tab>
                                <Tabs.Tab h={rem(40)} value="vault" leftSection={<FileCheck size={14} />}>Vault</Tabs.Tab>
                                <Tabs.Tab h={rem(40)} value="ledger" leftSection={<LayoutDashboard size={14} />}>Ledger</Tabs.Tab>
                            </Tabs.List>

                            {/* ... (Existing Tab Panels, now nested in Grid.Col) ... */}

                            <Tabs.Panel value="pipeline">
                                <Stack gap="xl">
                                    <Group justify="space-between">
                                        <Box>
                                            <Title order={3} className="text-brand-navy tracking-tight font-primary">Pipeline Analysis</Title>
                                            <Text size="sm" c="dimmed">Lifecycle tracking and venture economics evaluation</Text>
                                        </Box>
                                        <Button
                                            variant="light"
                                            color="indigo"
                                            leftSection={<Calculator size={16} />}
                                            onClick={() => setPipelineOpened(true)}
                                            className="rounded-xl glass shadow-sm"
                                        >
                                            Manage Lifecycle Data
                                        </Button>
                                    </Group>

                                    <TenantJourneyMap
                                        currentStage={(tenant.metadata?.pipeline?.stage as any) || (tenant.status?.lookupCode === 'ACTIVE' ? 'OPERATIONAL' : 'LOI')}
                                    />
                                    <Grid gutter="xl">
                                        <Grid.Col span={{ base: 12, md: 7 }}>
                                            <VentureIntelCard
                                                metadata={tenant.metadata}
                                                businessCategory={tenant.businessCategory?.name}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 12, md: 5 }}>
                                            <LifecycleTimeline
                                                metadata={tenant.metadata}
                                                status={tenant.status?.name}
                                            />
                                        </Grid.Col>
                                    </Grid>
                                </Stack>
                            </Tabs.Panel>

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
                                                    <Text size="xs" fw={800} c="dimmed" tt="uppercase">Trading Name</Text>
                                                    <Text fw={700} mt={4} size="sm">{tenant.tradingName || '—'}</Text>
                                                </Box>
                                                <Box>
                                                    <Text size="xs" fw={800} c="dimmed" tt="uppercase">Primary Contact</Text>
                                                    <Text fw={700} mt={4} size="sm">{tenant.contactPerson || '—'}</Text>
                                                </Box>
                                                <Box>
                                                    <Text size="xs" fw={800} c="dimmed" tt="uppercase">Business Type</Text>
                                                    <Text fw={700} mt={4} size="sm" className="capitalize">{tenant.businessType || '—'}</Text>
                                                </Box>
                                                <Box>
                                                    <Text size="xs" fw={800} c="dimmed" tt="uppercase">Active Phase</Text>
                                                    <Text fw={700} mt={4} size="sm">{tenant.phase || 'Phase 1'}</Text>
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

                                            <Divider my="xl" label="Business Activities" labelPosition="center" />
                                            <Paper withBorder p="md" radius="lg" bg="slate.0" className="border-dashed bg-slate-50/50">
                                                <Text size="sm" fw={500} italic={!tenant.activities} c={!tenant.activities ? 'dimmed' : 'slate.8'}>
                                                    {tenant.activities || 'No specific business activities registered.'}
                                                </Text>
                                            </Paper>

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
                                        <Title order={4} className="text-[#16284F]">{track.portfolioLabel}</Title>
                                        <Badge variant="light" color={track.color} size="lg" radius="md" className="font-black px-4">{tenant.leases?.length || 0} Entries</Badge>
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
                                            <Title order={4} className="text-[#16284F]">Operational Documents</Title>
                                            <Text size="xs" c="dimmed">LoI, Proposals, Contracts, and Investment Permits</Text>
                                        </Box>
                                        <Button
                                            variant="light"
                                            color="blue"
                                            leftSection={<FileText size={14} />}
                                            className="rounded-xl"
                                            onClick={() => setDocOpened(true)}
                                        >
                                            Upload Document
                                        </Button>
                                    </Group>

                                    {tenant.documents?.length === 0 ? (
                                        <Box py={60} style={{ textAlign: 'center' }}>
                                            <FileText size={48} className="mx-auto text-gray-200 mb-4" strokeWidth={1} />
                                            <Title order={4} fw={800} className="text-gray-400">Vault Empty</Title>
                                            <Text c="dimmed" size="sm" mt="xs" maw={400} mx="auto">No document records found. Upload regulatory or contract files to track compliance.</Text>
                                        </Box>
                                    ) : (
                                        <Table verticalSpacing="md" highlightOnHover>
                                            <Table.Thead className="bg-gray-50/50">
                                                <Table.Tr>
                                                    <Table.Th h={rem(40)}>Document Name</Table.Th>
                                                    <Table.Th>Type</Table.Th>
                                                    <Table.Th>Added On</Table.Th>
                                                    <Table.Th>Expiry</Table.Th>
                                                    <Table.Th>Action</Table.Th>
                                                </Table.Tr>
                                            </Table.Thead>
                                            <Table.Tbody>
                                                {tenant.documents?.map((doc: any) => (
                                                    <Table.Tr key={doc.id}>
                                                        <Table.Td>
                                                            <Group gap="sm">
                                                                <FileText size={16} className="text-blue-600" />
                                                                <Text fw={700} size="sm">{doc.name}</Text>
                                                            </Group>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Badge size="xs" variant="outline" color="gray">
                                                                {doc.metadata?.type || 'OTHER'}
                                                            </Badge>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Text size="xs" c="dimmed">{doc.createdAt ? format(new Date(doc.createdAt), 'MMM dd, yyyy') : 'N/A'}</Text>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            {doc.expiryDate ? (
                                                                <Text size="xs" fw={700} color={new Date(doc.expiryDate) < new Date() ? 'red' : 'green'}>
                                                                    {format(new Date(doc.expiryDate), 'MMM dd, yyyy')}
                                                                </Text>
                                                            ) : (
                                                                <Text size="xs" c="dimmed">No Expiry</Text>
                                                            )}
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Group gap="xs">
                                                                <Button component="a" href={doc.fileUrl} target="_blank" variant="subtle" size="compact-xs">View</Button>
                                                                <Button variant="subtle" size="compact-xs" color="red">Revoke</Button>
                                                            </Group>
                                                        </Table.Td>
                                                    </Table.Tr>
                                                ))}
                                            </Table.Tbody>
                                        </Table>
                                    )}
                                </Paper>
                            </Tabs.Panel>

                            <Tabs.Panel value="ledger">
                                <Paper withBorder p="xl" radius="xl" className="glass shadow-md">
                                    <Group justify="space-between" mb="lg">
                                        <Box>
                                            <Title order={4} className="text-[#16284F]">Financial Ledger & Payment Schedules</Title>
                                            <Text size="xs" c="dimmed">Automated monthly/annual due tracking vs physical collections</Text>
                                        </Box>
                                        <Button
                                            variant="light"
                                            color="blue"
                                            leftSection={<Plus size={14} />}
                                            className="rounded-xl"
                                            onClick={() => {
                                                setSelectedSchedule(null);
                                                setPaymentOpened(true);
                                            }}
                                        >
                                            Record Partial Payment
                                        </Button>
                                    </Group>

                                    {tenant.leases?.[0]?.paymentSchedules?.length === 0 || !tenant.leases?.[0]?.paymentSchedules ? (
                                        <Box py={60} style={{ textAlign: 'center' }}>
                                            <LayoutDashboard size={48} className="mx-auto text-gray-200 mb-4" strokeWidth={1} />
                                            <Title order={4} fw={800} className="text-gray-400">Ledger Empty</Title>
                                            <Text c="dimmed" size="sm" mt="xs" maw={400} mx="auto">No payment schedules have been generated yet. Complete the contract setup to activate the financial tracker.</Text>
                                        </Box>
                                    ) : (
                                        <Table verticalSpacing="md" highlightOnHover>
                                            <Table.Thead className="bg-gray-50/50">
                                                <Table.Tr>
                                                    <Table.Th h={rem(40)}>Period</Table.Th>
                                                    <Table.Th>Due Date</Table.Th>
                                                    <Table.Th>Amount Due</Table.Th>
                                                    <Table.Th>Amount Paid</Table.Th>
                                                    <Table.Th>Status</Table.Th>
                                                    <Table.Th>Action</Table.Th>
                                                </Table.Tr>
                                            </Table.Thead>
                                            <Table.Tbody>
                                                {tenant.leases?.[0]?.paymentSchedules?.map((ps: any) => (
                                                    <Table.Tr key={ps.id}>
                                                        <Table.Td><Text fw={800} size="sm">{ps.month} {ps.year}</Text></Table.Td>
                                                        <Table.Td><Text size="xs" fw={700} c="dimmed">{new Date(ps.dueDate).toLocaleDateString()}</Text></Table.Td>
                                                        <Table.Td><Text fw={800} size="sm" c="blue.9">{Number(ps.amountDue).toLocaleString()} {tenant.leases?.[0]?.currency || 'USD'}</Text></Table.Td>
                                                        <Table.Td><Text fw={700} size="sm" c="teal.8">{Number(ps.amountPaid).toLocaleString()}</Text></Table.Td>
                                                        <Table.Td>
                                                            <Badge
                                                                size="xs"
                                                                variant="filled"
                                                                color={ps.status === 'PAID' ? 'teal' : ps.status === 'OVERDUE' ? 'red' : 'blue'}
                                                            >
                                                                {ps.status}
                                                            </Badge>
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Button
                                                                variant="filled"
                                                                color="teal"
                                                                size="compact-xs"
                                                                radius="xl"
                                                                onClick={() => {
                                                                    setSelectedSchedule(ps);
                                                                    setPaymentOpened(true);
                                                                }}
                                                            >
                                                                Pay
                                                            </Button>
                                                        </Table.Td>
                                                    </Table.Tr>
                                                ))}
                                            </Table.Tbody>
                                        </Table>
                                    )}
                                </Paper>
                            </Tabs.Panel>
                        </Tabs>
                    </Stack>
                </Grid.Col>
            </Grid>

            <PipelineUpdateModal
                opened={pipelineOpened}
                onClose={() => setPipelineOpened(false)}
                tenant={tenant}
                onUpdate={loadTenant}
            />

            {tenant && tenant.leases?.[0] && (
                <PaymentEntryModal
                    opened={paymentOpened}
                    onClose={() => setPaymentOpened(false)}
                    leaseId={tenant.leases[0].id}
                    scheduleId={selectedSchedule?.id}
                    amountDue={selectedSchedule ? (Number(selectedSchedule.amountDue) - Number(selectedSchedule.amountPaid)) : 0}
                    period={selectedSchedule ? `${selectedSchedule.month} ${selectedSchedule.year}` : ''}
                    onSuccess={loadTenant}
                />
            )}

            {tenant && (
                <DocumentUploadModal
                    opened={docOpened}
                    onClose={() => setDocOpened(false)}
                    tenantId={tenant.id}
                    onSuccess={loadTenant}
                />
            )}
        </Container>
    );
}
