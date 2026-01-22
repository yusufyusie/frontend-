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
    Briefcase,
    MapPin,
} from 'lucide-react';
import { Tenant } from '@/services/tenants.service';
import { TenantForm } from './TenantForm';
import { ContactsStep, TenantContact } from './ContactsStep';
import { DocumentsStep, TenantDocument } from './DocumentsStep';
import { TenantProfilePreview } from './TenantProfilePreview';

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
    const [tenantData, setTenantData] = useState<Partial<Tenant>>({});
    const [contacts, setContacts] = useState<TenantContact[]>([]);
    const [documents, setDocuments] = useState<TenantDocument[]>([]);
    const [stepValidity, setStepValidity] = useState({
        0: false,  // Company info
        1: true,   // Contacts (optional)
        2: true,   // Documents (optional)
        3: true,   // Review
    });

    const wizardSteps: WizardStep[] = [
        {
            step: 0,
            label: 'Company Info',
            description: 'Legal & registration',
            icon: <Building2 size={20} />,
            help: {
                title: 'Corporate Registration',
                content: 'Accurate legal information is required for contract generation and system access.',
                tips: ['Use official company name', 'TIN must be 10 digits', 'Enter valid physical address']
            }
        },
        {
            step: 1,
            label: 'Contact Points',
            description: 'Personnel & liaisons',
            icon: <Users size={20} />,
            help: {
                title: 'Administrative Liaison',
                content: 'Identify the key individuals who will manage this account and handle technical queries.',
                tips: ['Designate a primary contact', 'Ensure email accuracy', 'Add multiple roles']
            }
        },
        {
            step: 2,
            label: 'Documents',
            description: 'Legal docs & certs',
            icon: <FileText size={20} />,
            help: {
                title: 'Compliance Vault',
                content: 'Securely upload verification documents. These will be reviewed by the IT Park Authority.',
                tips: ['Prefer PDF format', 'Scan both sides of ID', 'Clear legibility required']
            }
        },
        {
            step: 3,
            label: 'Review',
            description: 'Final verification',
            icon: <CheckCircle2 size={20} />,
            help: {
                title: 'Final Audit',
                content: 'Carefully review the generated digital profile before submitting to the system.',
                tips: ['Verify contact emails', 'Check registration syntax', 'Confirm document links']
            }
        },
    ];

    const nextStep = useCallback(() => {
        if (active < wizardSteps.length - 1) {
            setActive((current) => current + 1);
        }
    }, [active, wizardSteps.length]);

    const prevStep = useCallback(() => setActive((current) => (current > 0 ? current - 1 : current)), []);

    const handleSubmit = useCallback(async () => {
        await onSubmit({
            ...tenantData,
        });
    }, [onSubmit, tenantData]);

    const handleCompanyInfoChange = useCallback((isValid: boolean) => {
        setStepValidity(prev => ({ ...prev, 0: isValid }));
    }, []);

    const handleTenantFormSubmit = useCallback(async (data: Partial<Tenant>) => {
        setTenantData(prev => ({ ...prev, ...data }));
        return Promise.resolve();
    }, []);

    const canProceed = stepValidity[active as keyof typeof stepValidity];
    const isLastStep = active === wizardSteps.length - 1;
    const progress = ((active + 1) / wizardSteps.length) * 100;

    const renderStepContent = () => {
        switch (active) {
            case 0:
                return (
                    <div className="space-y-6">
                        <TenantForm
                            initialData={tenantData}
                            onSubmit={handleTenantFormSubmit}
                            isLoading={false}
                            onValidityChange={handleCompanyInfoChange}
                        />
                    </div>
                );
            case 1:
                return <ContactsStep contacts={contacts} onChange={setContacts} />;
            case 2:
                return <DocumentsStep documents={documents} onChange={setDocuments} />;
            case 3:
                return (
                    <Stack gap="xl">
                        <Box>
                            <Text size="lg" fw={900} c="#16284F" mb="xs">Review & Submit</Text>
                            <Text size="sm" c="dimmed" fw={600}>Please verify all information is accurate.</Text>
                        </Box>

                        <Paper withBorder p="2rem" radius="2rem" shadow="sm">
                            <Stack gap="lg">
                                <Group justify="space-between">
                                    <Group gap="md">
                                        <Badge size="xl" variant="dot" color="teal">Digital Certificate Generated</Badge>
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

                        {!tenantData.name && (
                            <Paper p="md" radius="xl" bg="red.0" className="border border-red-200">
                                <Group gap="sm">
                                    <AlertCircle size={20} className="text-red-600" />
                                    <Text size="sm" c="red.9" fw={700}>Incomplete Profile Detected</Text>
                                </Group>
                            </Paper>
                        )}
                    </Stack>
                );
            default:
                return null;
        }
    };

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
                * { scrollbar-width: thin; scrollbar-color: #0C7C9244 transparent; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #0C7C9244; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #0C7C9288; }
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
                    w={{ base: 0, md: 400 }}
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
                                    <Text c="white" fw={900} size="xl" lts="-1px">TMS PORTAL</Text>
                                    <Text c="rgba(255,255,255,0.4)" fw={800} size="10px" tt="uppercase" lts="2px">Auth Version 4.0</Text>
                                </Box>
                            </Group>

                            <Stepper
                                active={active}
                                orientation="vertical"
                                size="sm"
                                iconSize={44}
                                color="#6EC9C4"
                                styles={{
                                    step: { marginBottom: rem(30) },
                                    stepIcon: {
                                        borderWidth: 2,
                                        background: 'rgba(255,255,255,0.03)',
                                        color: 'white',
                                        borderColor: 'rgba(255,255,255,0.15)',
                                        transition: 'all 0.3s ease'
                                    },
                                    stepCompletedIcon: {
                                        background: '#6EC9C4',
                                        color: '#16284F'
                                    },
                                    stepLabel: { color: 'white', fontWeight: 900, fontSize: rem(16), lts: '-0.3px' },
                                    stepDescription: { color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: rem(12) },
                                    separator: { backgroundColor: 'rgba(255,255,255,0.05)', minHeight: rem(25) }
                                }}
                            >
                                {wizardSteps.map((s) => (
                                    <Stepper.Step key={s.step} label={s.label} description={s.description} />
                                ))}
                            </Stepper>
                        </Stack>

                        <Stack gap="md">
                            <Paper
                                p="1.5rem"
                                radius="2rem"
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                <Group wrap="nowrap" gap="md">
                                    <Box p={10} bg="rgba(255,255,255,0.05)" style={{ borderRadius: '1rem' }}>
                                        <Briefcase size={20} className="text-[#6EC9C4]" />
                                    </Box>
                                    <Box>
                                        <Text c="white" fw={800} size="sm">B2B Integration</Text>
                                        <Text c="rgba(255,255,255,0.4)" size="xs" fw={500}>System ready for data sync</Text>
                                    </Box>
                                </Group>
                            </Paper>

                            <Group justify="space-between" px="md">
                                <Text c="rgba(255,255,255,0.3)" size="xs" fw={700}>POLICIES: v2.1</Text>
                                <Text c="rgba(255,255,255,0.3)" size="xs" fw={700}>BUILD: XP-2026</Text>
                            </Group>
                        </Stack>
                    </Stack>
                </Box>

                {/* MAIN CONTENT: "The Interactive Stage" */}
                <div className="flex-1 flex flex-col bg-white">
                    {/* Stage Header */}
                    <Box px="3rem" py="2rem" style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <Group justify="space-between">
                            <Group gap="xl">
                                <Box className="md:hidden" w={80}>
                                    <Progress
                                        value={progress}
                                        color="#0C7C92"
                                        size="xs"
                                        radius="xl"
                                        striped
                                        animated
                                    />
                                    <Text size="10px" fw={900} mt={4}>STAGE {active + 1}/4</Text>
                                </Box>
                                <div>
                                    <Group gap="xs">
                                        <Text size="xs" fw={900} c="#0C7C92" tt="uppercase" lts="2px">Onboarding Step {active + 1}</Text>
                                        <Badge size="xs" variant="light" color="blue">Enterprise</Badge>
                                    </Group>
                                    <Title order={2} fw={900} c="#16284F" lts="-1.5px" mt={4}>
                                        {wizardSteps[active].label}
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
                                <ActionIcon variant="light" color="gray" size="xl" radius="xl" onClick={onClose}>
                                    <X size={22} />
                                </ActionIcon>
                            </Group>
                        </Group>
                    </Box>

                    {/* Stage Content */}
                    <div className="flex-1 flex overflow-hidden">
                        <ScrollArea className="flex-1" viewportProps={{ style: { padding: '4rem 3rem' } }}>
                            <div className="max-w-[750px] mx-auto">
                                <Transition mounted transition="slide-up" duration={400} timingFunction="ease">
                                    {(styles) => <div style={styles}>{renderStepContent()}</div>}
                                </Transition>
                            </div>
                        </ScrollArea>

                        {/* RIGHT CONTEXT PANEL: Previews & Help Hub */}
                        <Transition mounted={showHelp} transition="slide-left" duration={300}>
                            {(styles) => (
                                <Box w={480} p="3rem" style={{ ...styles, background: '#F8FAFC', borderLeft: '1px solid #f1f5f9' }} className="hidden lg:block overflow-y-auto">
                                    <Stack gap="2.5rem">
                                        {/* Digital Certificate Preview */}
                                        <Box>
                                            <Text size="xs" fw={900} c="dimmed" tt="uppercase" lts="2px" mb="lg">Identity Artifact Preview</Text>
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
                                                        <Text size="xs" c="blue.9" fw={800}>Authoritative System Help</Text>
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
                    <Box px="3rem" py="2rem" style={{ background: 'white', borderTop: '1px solid #f1f5f9' }}>
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
                                REVERT <Text span visibleFrom="sm" ml={4}>STEP</Text>
                            </Button>

                            <Group gap="xl">
                                <Box visibleFrom="sm">
                                    <Text size="xs" fw={900} c="dimmed" ta="right">SYSTEM COMPLIANCE</Text>
                                    <Text size="xs" fw={900} c="#16284F" ta="right">VERIFIED PROGRESS: {Math.round(progress)}%</Text>
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
                                            minWidth: rem(240),
                                            boxShadow: '0 10px 30px rgba(22, 40, 79, 0.2)'
                                        }}
                                        className={canProceed ? 'pulse-nav' : ''}
                                    >
                                        AUTORIZE & CONTINUE
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
                                            minWidth: rem(260),
                                            boxShadow: '0 10px 30px rgba(12, 124, 146, 0.3)'
                                        }}
                                    >
                                        FINALIZE ENTRY
                                    </Button>
                                )}
                            </Group>
                        </div>
                    </Box>
                </div>
            </div>
        </Modal>
    );
};
