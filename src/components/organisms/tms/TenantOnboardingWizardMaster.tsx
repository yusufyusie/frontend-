import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Modal,
    Stepper,
    Button,
    Group,
    Stack,
    Box,
    Text,
    Progress,
    Paper,
    ActionIcon,
    Badge,
    Transition,
    rem,
    Divider,
    Title,
    ScrollArea,
    Tooltip,
} from '@mantine/core';
import { RingProgress } from '@mantine/core';
import {
    Building2,
    Users,
    FileText,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    X,
    Sparkles,
    AlertCircle,
    Info,
    LayoutDashboard,
    HelpCircle,
    Lightbulb,
    ShieldCheck,
    MapPin,
    Factory,
} from 'lucide-react';
import { Tenant } from '@/services/tenants.service';
import { TenantForm } from './TenantForm';
import { ContactsStep, TenantContact } from './ContactsStep';
import { DocumentsStep, TenantDocument } from './DocumentsStep';
import { TenantProfilePreview } from './TenantProfilePreview';
import { cn } from '@/lib/utils';

interface WizardStep {
    step: number;
    label: string;
    description: string;
    icon: React.ReactNode;
    help: {
        title: string;
        content: string;
        tips: string[];
    };
}

interface TenantOnboardingWizardProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Tenant>) => Promise<void>;
    isLoading?: boolean;
}

export const TenantOnboardingWizard = ({
    opened,
    onClose,
    onSubmit,
    isLoading = false,
}: TenantOnboardingWizardProps) => {
    const [active, setActive] = useState(0);
    const [showHelp, setShowHelp] = useState(true);
    const [commercialTrack, setCommercialTrack] = useState<'OFFICE' | 'LAND' | null>(null);
    const [tenantData, setTenantData] = useState<Partial<Tenant>>({});
    const [contacts, setContacts] = useState<TenantContact[]>([]);
    const [documents, setDocuments] = useState<TenantDocument[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);
    const [stepValidity, setStepValidity] = useState({
        0: false,  // Track Selection
        1: false,  // Company info
        2: true,   // Contacts (optional)
        3: true,   // Documents (optional)
        4: true,   // Review
    });

    const wizardSteps: WizardStep[] = useMemo(() => {
        const baseSteps: WizardStep[] = [
            {
                step: 0,
                label: 'Lease Model',
                description: 'Select rental category',
                icon: <LayoutDashboard size={18} />,
                help: {
                    title: 'Classification Model',
                    content: 'Specify the lease structure for this organization to apply correct administrative rules.',
                    tips: ['Office Rental: For building occupants', 'Land Sublease: For plot developments', 'Selection affects legal templates']
                }
            }
        ];

        const contextualSteps: WizardStep[] = [
            {
                step: 1,
                label: commercialTrack === 'LAND' ? 'Plot Specification' : 'Organization Identity',
                description: 'Legal & Tax registration',
                icon: commercialTrack === 'LAND' ? <Factory size={18} /> : <Building2 size={18} />,
                help: {
                    title: 'Registration Compliance',
                    content: commercialTrack === 'LAND' ? 'Define land utilization and investment scope for the plot.' : 'Ensure legal name matches official trade license documents.',
                    tips: ['Verify Trade License details', 'Check TIN digits carefully', 'Match corporate address']
                }
            },
            {
                step: 2,
                label: 'Key Contacts',
                description: 'Liaison & representative details',
                icon: <Users size={18} />,
                help: {
                    title: 'Assigned Liaisons',
                    content: 'Designate the primary individuals responsible for administrative and technical communication.',
                    tips: ['Assign a head contact', 'Check email syntax', 'Define specific roles']
                }
            },
            {
                step: 3,
                label: 'Documentation',
                description: 'Licenses & legal certificates',
                icon: <FileText size={18} />,
                help: {
                    title: 'Identity Verification',
                    content: 'Upload high-resolution scans of your trade license and relevant registration certificates.',
                    tips: ['Clear PDF scans', 'Include all pages', 'Verify expiration dates']
                }
            },
            {
                step: 4,
                label: 'Review & Confirm',
                description: 'Final verification',
                icon: <CheckCircle2 size={18} />,
                help: {
                    title: 'Profile Verification',
                    content: 'Perform a final audit of the company profile before committing to the official registry.',
                    tips: ['Check for contact typos', 'Ensure TIN is correct', 'Preview uploaded files']
                }
            }
        ];

        return [...baseSteps, ...contextualSteps];
    }, [commercialTrack]);

    const nextStep = useCallback(() => {
        if (active < wizardSteps.length - 1) {
            setActive((current) => current + 1);
        }
    }, [active, wizardSteps.length]);

    const prevStep = useCallback(() => setActive((current) => (current > 0 ? current - 1 : current)), []);

    const handleSubmit = useCallback(async () => {
        setSubmissionError(null);
        // Map wizard contacts to backend schema
        const mappedContacts = contacts.map(c => {
            const parts = (c.name || '').trim().split(' ');
            return {
                firstName: parts[0] || 'Member',
                lastName: parts.slice(1).join(' ') || 'User',
                email: c.email,
                phone: c.phone,
                position: c.position,
                isPrimary: c.isPrimary,
                metadata: { department: c.department }
            };
        });

        const submissionData = {
            ...tenantData,
            metadata: {
                ...(tenantData.metadata as any || {}),
                track: commercialTrack,
                contacts: mappedContacts,
                documents: documents.map(d => ({
                    name: d.name,
                    type: d.type,
                    size: d.size,
                    status: d.status || 'PENDING'
                })),
            }
        };

        try {
            await onSubmit(submissionData);
            setIsSubmitted(true);
        } catch (error: any) {
            setSubmissionError(error.response?.data?.message || error.message || 'System registry handshake failed');
        }
    }, [onSubmit, tenantData, contacts, documents, commercialTrack]);

    const handleCompanyInfoChange = useCallback((isValid: boolean) => {
        setStepValidity(prev => ({ ...prev, 1: isValid }));
    }, []);

    const handleTenantFormSubmit = useCallback(async (data: Partial<Tenant>) => {
        setTenantData(prev => ({ ...prev, ...data }));
        return Promise.resolve();
    }, []);

    const handleDataChange = useCallback((data: Partial<Tenant>) => {
        setTenantData(prev => {
            const newMetadata = {
                ...(prev.metadata as any || {}),
                ...(data.metadata as any || {})
            };
            return { ...prev, ...data, metadata: newMetadata };
        });
    }, []);

    const canProceed = stepValidity[active as keyof typeof stepValidity];
    const isLastStep = active === wizardSteps.length - 1;
    const progress = ((active + 1) / wizardSteps.length) * 100;

    const renderStepContent = () => {
        switch (active) {
            case 0:
                return (
                    <Stack gap="1.5rem" py="lg">
                        <Box ta="center">
                            <Title order={2} fw={800} className="text-brand-navy mb-xs font-primary">Lease Category Selection</Title>
                            <Text size="lg" c="dimmed" fw={600}>Specify the primary resource allocation model</Text>
                        </Box>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Paper
                                withBorder
                                p="2rem"
                                radius="2rem"
                                className={cn(
                                    "cursor-pointer transition-all duration-500 hover:scale-[1.01] relative overflow-hidden group",
                                    commercialTrack === 'OFFICE' ? "border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/10" : "hover:border-slate-300"
                                )}
                                onClick={() => {
                                    setCommercialTrack('OFFICE');
                                    setStepValidity(prev => ({ ...prev, 0: true }));
                                }}
                            >
                                {commercialTrack === 'OFFICE' && <Box pos="absolute" top={16} right={16}><CheckCircle2 className="text-blue-600" size={24} /></Box>}
                                <Stack align="center" gap="lg">
                                    <Box p={20} bg="blue.1" className="rounded-2xl text-blue-600 group-hover:rotate-6 transition-transform">
                                        <Building2 size={40} />
                                    </Box>
                                    <Box ta="center">
                                        <Text size="lg" fw={800} c="blue.9" mb={4}>Office Rental</Text>
                                        <Text size="xs" c="dimmed" fw={600} className="px-4">Standard residency in corporate buildings and retail blocks.</Text>
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper
                                withBorder
                                p="2rem"
                                radius="2rem"
                                className={cn(
                                    "cursor-pointer transition-all duration-500 hover:scale-[1.01] relative overflow-hidden group",
                                    commercialTrack === 'LAND' ? "border-teal-500 bg-teal-50/30 ring-2 ring-teal-500/10" : "hover:border-slate-300"
                                )}
                                onClick={() => {
                                    setCommercialTrack('LAND');
                                    setStepValidity(prev => ({ ...prev, 0: true }));
                                }}
                            >
                                {commercialTrack === 'LAND' && <Box pos="absolute" top={16} right={16}><CheckCircle2 className="text-teal-600" size={24} /></Box>}
                                <Stack align="center" gap="lg">
                                    <Box p={20} bg="teal.1" className="rounded-2xl text-teal-600 group-hover:rotate-6 transition-transform">
                                        <Factory size={40} />
                                    </Box>
                                    <Box ta="center">
                                        <Text size="lg" fw={800} c="teal.9" mb={4}>Land Sublease</Text>
                                        <Text size="xs" c="dimmed" fw={600} className="px-4">Industrial plots, specialized zones, and ground-lease ventures.</Text>
                                    </Box>
                                </Stack>
                            </Paper>
                        </div>
                    </Stack>
                );
            case 1:
                return (
                    <div className="space-y-6">
                        <TenantForm
                            initialData={tenantData}
                            onSubmit={handleTenantFormSubmit}
                            onChange={handleDataChange}
                            isLoading={false}
                            onValidityChange={handleCompanyInfoChange}
                            track={commercialTrack}
                        />
                    </div>
                );
            case 2:
                return <ContactsStep contacts={contacts} onChange={setContacts} />;
            case 3:
                return <DocumentsStep documents={documents} onChange={setDocuments} />;
            case 4:
                return (
                    <Stack gap="xl">
                        <Box>
                            <Text size="lg" fw={900} c="#16284F" mb="xs">Final Confirmation</Text>
                            <Text size="sm" c="dimmed" fw={600}>Please verify all business details before submission.</Text>
                        </Box>

                        <Paper withBorder p="2rem" radius="2rem" shadow="sm">
                            <Stack gap="lg">
                                <Group justify="space-between">
                                    <Group gap="md">
                                        <Badge size="xl" variant="dot" color="teal">System Authorization Generated</Badge>
                                    </Group>
                                    <ShieldCheck size={28} className="text-teal-600" />
                                </Group>
                                <Divider />
                                <div className="grid grid-cols-2 gap-8">
                                    <Box>
                                        <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">Company Name</Text>
                                        <Text size="md" fw={700} c="#16284F">{tenantData.name || 'N/A'}</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">Registration</Text>
                                        <Text size="md" fw={700} c="#16284F">{tenantData.companyRegNumber || 'N/A'}</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">Investment Origin</Text>
                                        <Text size="md" fw={700} c="#16284F">{(tenantData as any).metadata?.originId ? 'REGISTERED' : 'NOT SPECIFIED'}</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">Email</Text>
                                        <Text size="md" fw={700} c="#16284F">{tenantData.email || 'N/A'}</Text>
                                    </Box>
                                    <Box>
                                        <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px">Contacts</Text>
                                        <Text size="md" fw={700} c="#16284F">{contacts.length} Registered</Text>
                                    </Box>
                                </div>
                            </Stack>
                        </Paper>

                        {submissionError && (
                            <Paper p="md" radius="xl" bg="red.0" className="border border-red-200 animate-pulse">
                                <Stack gap="xs">
                                    <Group gap="sm">
                                        <AlertCircle size={20} className="text-red-800" />
                                        <Text size="sm" c="red.9" fw={900}>REGISTRY REJECTION</Text>
                                    </Group>
                                    <Text size="xs" c="red.8" fw={600} ml={28}>{submissionError}</Text>
                                </Stack>
                            </Paper>
                        )}

                        {!tenantData.name && !submissionError && (
                            <Paper p="md" radius="xl" bg="orange.0" className="border border-orange-200">
                                <Group gap="sm">
                                    <Info size={20} className="text-orange-600" />
                                    <Text size="sm" c="orange.9" fw={700}>Draft Profile Detected</Text>
                                </Group>
                            </Paper>
                        )}
                    </Stack>
                );
            default:
                return null;
        }
    };

    const renderSuccessState = () => (
        <Stack align="center" gap="2.5rem" py="5rem" className="animate-fade-in-up">
            <Box pos="relative">
                <Box
                    w={140}
                    h={140}
                    bg="#F0FDF4"
                    style={{
                        borderRadius: '4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #DCFCE7'
                    }}
                >
                    <CheckCircle2 size={80} className="text-teal-600" />
                </Box>
                <div className="absolute -top-4 -right-4 animate-bounce">
                    <Badge size="xl" variant="filled" color="teal" radius="xl" p="md" style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>DONE</Badge>
                </div>
            </Box>

            <Stack gap={2} ml="xl">
                <Title order={1} fw={800} className="text-3xl font-extrabold text-brand-navy tracking-tight font-primary">Onboarding Wizard</Title>
                <Text size="sm" c="dimmed" fw={600}>Formal 5-stage setup for new authorized residents</Text>
            </Stack>
            <Box ta="center">
                <Title order={1} fw={900} c="#16284F" mb="md" lts="-2px" className="text-4xl">System Integration Confirmed</Title>
                <Text size="lg" c="dimmed" fw={600} maw={500} mx="auto" style={{ lineHeight: 1.6 }}>
                    Organization <Text span fw={900} c="#16284F">{tenantData.name}</Text> has been successfully integrated into the ITPC Tenant Management System.
                </Text>
            </Box>

            <Group gap="xl">
                <Button
                    variant="outline"
                    color="gray"
                    size="xl"
                    radius="xl"
                    onClick={onClose}
                    fw={900}
                    px="3rem"
                >
                    BACK TO REGISTRY
                </Button>
                <Button
                    variant="filled"
                    size="xl"
                    radius="xl"
                    onClick={() => {
                        window.location.reload(); // Refresh to show new tenant
                    }}
                    fw={900}
                    px="3rem"
                    style={{ background: '#16284F' }}
                >
                    ENTER SYSTEM PULSE
                </Button>
            </Group>
        </Stack>
    );

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            fullScreen
            padding={0}
            withCloseButton={false}
            transitionProps={{ transition: 'slide-up', duration: 400 }}
            styles={{
                content: { overflow: 'hidden' },
                body: { height: '100vh', display: 'flex' }
            }}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                .pulse-nav { animation: shadow-pulse 2s infinite; }
                @keyframes shadow-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(110, 201, 196, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(110, 201, 196, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(110, 201, 196, 0); }
                }
            ` }} />

            <div className="flex w-full h-full overflow-hidden">
                {/* LEFT SIDEBAR: "The Hub" */}
                <Box
                    w={{ base: 0, md: 320 }}
                    style={{
                        background: '#16284F',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative'
                    }}
                    p="2.5rem"
                    className="hidden md:flex relative overflow-hidden"
                >
                    {/* Immersive background decoration */}
                    <Box
                        pos="absolute"
                        top={-100}
                        left={-100}
                        w={400}
                        h={400}
                        style={{
                            background: 'radial-gradient(circle, rgba(10, 126, 148, 0.3) 0%, transparent 70%)',
                            borderRadius: '50%'
                        }}
                    />

                    <Stack h="100%" justify="space-between" pos="relative" style={{ zIndex: 1 }}>
                        <Stack gap="3rem">
                            <Group gap="md">
                                <Box p={12} bg="#0C7C92" style={{ borderRadius: '1.25rem', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
                                    <LayoutDashboard size={24} className="text-white" />
                                </Box>
                                <Box>
                                    <Text c="white" fw={900} size="lg" lts="-0.5px">TMS PORTAL</Text>
                                    <Text c="rgba(255,255,255,0.4)" fw={800} size="9px" tt="uppercase" lts="1px">Business Registry</Text>
                                </Box>
                            </Group>

                            <Stepper
                                active={active}
                                orientation="vertical"
                                size="sm"
                                iconSize={44}
                                color="#6EC9C4"
                                styles={{
                                    step: { marginBottom: rem(40) },
                                    stepIcon: {
                                        borderWidth: 2,
                                        background: 'rgba(255,255,255,0.03)',
                                        color: 'white',
                                        borderColor: 'rgba(255,255,255,0.15)',
                                        transition: 'all 0.3s ease',
                                        width: rem(48),
                                        height: rem(48),
                                    },
                                    stepCompletedIcon: {
                                        background: '#6EC9C4',
                                        color: '#16284F'
                                    },
                                    stepLabel: { color: 'white', fontWeight: 900, fontSize: rem(15), lts: '-0.2px', textTransform: 'uppercase' },
                                    stepDescription: { color: 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: rem(11), marginTop: rem(4) },
                                    separator: { backgroundColor: 'rgba(255,255,255,0.08)', minHeight: rem(30), marginInlineStart: rem(23) }
                                }}
                            >
                                {wizardSteps.map((s) => (
                                    <Stepper.Step key={s.step} label={s.label} description={s.description} />
                                ))}
                            </Stepper>
                        </Stack>

                        <Box />
                    </Stack>
                </Box>

                {/* MAIN CONTENT: "The Interactive Stage" */}
                <div className="flex-1 flex flex-col bg-slate-50/30">
                    {/* Stage Header */}
                    <Box px="3rem" py="1.75rem" bg="white" style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <Group justify="space-between">
                            <Group gap="xl">
                                <Box className="md:hidden" w={80}>
                                    <Progress
                                        value={progress}
                                        color="brand.teal"
                                        size="xs"
                                        radius="xl"
                                        striped
                                        animated
                                    />
                                    <Text size="10px" fw={800} mt={4}>STAGE {active + 1}/4</Text>
                                </Box>
                                <div>
                                    <Title order={3} fw={800} className="text-brand-navy mt-2 font-primary">
                                        Step {active + 1}: {wizardSteps[active].label}
                                    </Title>
                                </div>
                            </Group>

                            <Group gap="md">
                                <Tooltip label="Toggle Guidance Panel">
                                    <ActionIcon
                                        variant={showHelp ? 'filled' : 'light'}
                                        color="blue"
                                        size="xl"
                                        radius="xl"
                                        onClick={() => setShowHelp(!showHelp)}
                                    >
                                        <HelpCircle size={22} />
                                    </ActionIcon>
                                </Tooltip>
                                <ActionIcon variant="light" color="gray" size="xl" radius="xl" onClick={onClose} className="hover:text-teal-600 hover:bg-teal-50 transition-all">
                                    <X size={22} />
                                </ActionIcon>
                            </Group>
                        </Group>
                    </Box>

                    {/* Stage Content */}
                    <div className="flex-1 flex overflow-hidden">
                        <ScrollArea className="flex-1 scrollbar-custom" viewportProps={{ style: { padding: '2.5rem 2rem' } }} scrollbarSize={12}>
                            <div className="max-w-[750px] mx-auto">
                                <Transition mounted transition="slide-up" duration={400} timingFunction="ease">
                                    {(styles) => (
                                        <div style={styles}>
                                            {isSubmitted ? renderSuccessState() : renderStepContent()}
                                        </div>
                                    )}
                                </Transition>
                            </div>
                        </ScrollArea>

                        {/* RIGHT CONTEXT PANEL: Previews & Help Hub */}
                        <Transition mounted={showHelp} transition="slide-left" duration={300}>
                            {(styles) => (
                                <Box w={400} p="2rem" style={{ ...styles, background: '#F8FAFC', borderLeft: '1px solid #f1f5f9' }} className="hidden lg:block overflow-y-auto">
                                    <Stack gap="2.5rem">
                                        {/* Digital Certificate Preview */}
                                        <Box>
                                            <Text size="xs" fw={900} c="dimmed" tt="uppercase" lts="1.5px" mb="lg">Profile Verification</Text>
                                            <TenantProfilePreview data={tenantData} />
                                        </Box>

                                        {/* Help Hub Panel */}
                                        <Paper p="2rem" radius="2rem" bg="white" shadow="sm" style={{ border: '1px solid #e2e8f0' }}>
                                            <Stack gap="lg">
                                                <Group gap="sm">
                                                    <Box p={8} bg="blue.0" style={{ borderRadius: '50%' }}>
                                                        <Lightbulb size={20} className="text-blue-600" />
                                                    </Box>
                                                    <Text size="md" fw={900} c="#16284F">{wizardSteps[active].help.title}</Text>
                                                </Group>

                                                <Text size="sm" c="dimmed" fw={500} style={{ lineHeight: 1.6 }}>
                                                    {wizardSteps[active].help.content}
                                                </Text>

                                                <Stack gap="xs">
                                                    {wizardSteps[active].help.tips.map((tip, i) => (
                                                        <Group key={i} gap="sm" wrap="nowrap" align="flex-start">
                                                            <Box mt={6} w={6} h={6} bg="teal" style={{ borderRadius: '50%' }} />
                                                            <Text size="xs" fw={700} c="slate.7">{tip}</Text>
                                                        </Group>
                                                    ))}
                                                </Stack>

                                                <Box p="md" bg="blue.0" style={{ borderRadius: '1.25rem' }}>
                                                    <Group gap="md">
                                                        <Info size={16} className="text-blue-600" />
                                                        <Text size="xs" c="blue.9" fw={800}>Support Knowledge Base</Text>
                                                    </Group>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </Stack>
                                </Box>
                            )}
                        </Transition>
                    </div>

                    {/* Stage Controls */}
                    {!isSubmitted && (
                        <Box px="3rem" py="1.5rem" style={{ background: 'white', borderTop: '1px solid #f8fafc', boxShadow: '0 -10px 40px rgba(0,0,0,0.02)' }}>
                            <div className="max-w-[1200px] mx-auto flex justify-between items-center">
                                <Button
                                    variant="subtle"
                                    color="gray"
                                    size="lg"
                                    radius="xl"
                                    leftSection={<ArrowLeft size={20} />}
                                    onClick={prevStep}
                                    disabled={active === 0 || isLoading}
                                    fw={900}
                                    px="xl"
                                >
                                    PREVIOUS STAGE
                                </Button>

                                <Group gap="xl">
                                    <Box visibleFrom="sm">
                                        <Text size="xs" fw={900} c="#16284F" ta="right">PROGRESS: {Math.round(progress)}%</Text>
                                    </Box>

                                    {!isLastStep ? (
                                        <Button
                                            variant="filled"
                                            size="xl"
                                            radius="xl"
                                            rightSection={<ArrowRight size={22} />}
                                            onClick={nextStep}
                                            disabled={!canProceed || isLoading}
                                            fw={900}
                                            style={{
                                                background: '#16284F',
                                                minWidth: rem(200),
                                            }}
                                        >
                                            NEXT STEP
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="filled"
                                            size="xl"
                                            radius="xl"
                                            rightSection={<Sparkles size={22} />}
                                            onClick={handleSubmit}
                                            loading={isLoading}
                                            disabled={!canProceed}
                                            fw={900}
                                            style={{
                                                background: 'linear-gradient(135deg, #0C7C92 0%, #16284F 100%)',
                                                minWidth: rem(220),
                                            }}
                                        >
                                            COMPLETE SETUP
                                        </Button>
                                    )}
                                </Group>
                            </div>
                        </Box>
                    )}
                </div>
            </div>
        </Modal>
    );
};
