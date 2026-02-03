import { useState } from 'react';
import {
    Stack,
    TextInput,
    Button,
    Group,
    Paper,
    Box,
    Text,
    ActionIcon,
    Avatar,
    Badge,
    Card,
    Divider,
    rem,
    Tooltip,
    Title,
} from '@mantine/core';
import { Plus, Trash2, User, Users, Mail, Phone, Briefcase, Star, ShieldCheck, UserPlus } from 'lucide-react';

export interface TenantContact {
    id?: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    department?: string;
    isPrimary: boolean;
}

interface ContactsStepProps {
    contacts: TenantContact[];
    onChange: (contacts: TenantContact[]) => void;
}

export const ContactsStep = ({ contacts, onChange }: ContactsStepProps) => {
    const [newContact, setNewContact] = useState<TenantContact>({
        name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        isPrimary: false,
    });

    const addContact = () => {
        if (newContact.name && newContact.email) {
            const updated = [...contacts, { ...newContact, id: Date.now().toString() }];
            onChange(updated);
            setNewContact({ name: '', email: '', phone: '', position: '', department: '', isPrimary: false });
        }
    };

    const removeContact = (index: number) => {
        onChange(contacts.filter((_, i) => i !== index));
    };

    const setPrimary = (index: number) => {
        const updated = contacts.map((c, i) => ({ ...c, isPrimary: i === index }));
        onChange(updated);
    };

    const inputStyles = {
        label: {
            fontWeight: 800,
            color: '#16284F',
            fontSize: rem(11),
            marginBottom: rem(8),
            textTransform: 'uppercase' as const,
            letterSpacing: rem(1.5),
            opacity: 0.8
        },
        input: {
            borderRadius: rem(12),
            height: rem(54),
            fontSize: rem(15),
            border: '2px solid #E2E8F0',
            backgroundColor: '#fff',
            fontWeight: 600,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            paddingLeft: rem(48),
            '&:focus': {
                borderColor: '#0C7C92',
                boxShadow: '0 0 0 4px rgba(12, 124, 146, 0.05)'
            }
        },
        section: {
            width: rem(48),
            justifyContent: 'center'
        }
    };

    return (
        <Stack gap="2.5rem">
            {/* PERSON CARDS: LinkedIn Style */}
            <Box>
                <Group justify="space-between" mb="2.5rem">
                    <Group gap="md">
                        <Box p={10} bg="#16284F" style={{ borderRadius: '1rem' }}>
                            <Users size={20} className="text-white" />
                        </Box>
                        <div>
                            <Badge color="blue" variant="light" size="sm" radius="sm" fw={900} mb={4} className="tracking-widest">TEAM DIRECTORY</Badge>
                            <Title order={3} fw={900} c="#16284F">Focal Persons</Title>
                        </div>
                    </Group>
                    <Badge color="#16284F" variant="filled" size="xl" radius="md" p="md" fw={900}>{contacts.length} REGISTERED</Badge>
                </Group>

                <div className="grid grid-cols-1 gap-6">
                    {contacts.map((contact, index) => (
                        <Card
                            key={contact.id || index}
                            p="2rem"
                            radius="2rem"
                            style={{
                                border: '1px solid #E2E8F0',
                                background: contact.isPrimary ? 'linear-gradient(135deg, #ffffff 0%, #f7fee7 100%)' : 'white',
                                boxShadow: contact.isPrimary ? '0 20px 40px -10px rgba(132, 204, 22, 0.08)' : '0 10px 30px -5px rgba(0,0,0,0.02)',
                                transition: 'all 0.3s ease'
                            }}
                            className="group hover:translate-y-[-4px]"
                        >
                            <Group justify="space-between" wrap="nowrap">
                                <Group gap="2rem" wrap="nowrap">
                                    <Box pos="relative">
                                        <Avatar
                                            size={rem(80)}
                                            radius="2.5rem"
                                            styles={{
                                                root: {
                                                    background: contact.isPrimary ? 'linear-gradient(135deg, #84cc16 0%, #16284F 100%)' : 'linear-gradient(135deg, #0C7C92 0%, #16284F 100%)',
                                                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                                },
                                            }}
                                        >
                                            <Text fw={900} size="xl" c="white">{contact.name.substring(0, 2).toUpperCase()}</Text>
                                        </Avatar>
                                        {contact.isPrimary && (
                                            <Box pos="absolute" bottom={-5} right={-5} bg="white" p={4} style={{ borderRadius: '50%', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                                                <ShieldCheck size={18} className="text-lime-600" />
                                            </Box>
                                        )}
                                    </Box>

                                    <div>
                                        <Group gap="xs" mb={4}>
                                            <Text size="xl" fw={900} c="#16284F">{contact.name}</Text>
                                            {contact.isPrimary && (
                                                <Badge size="xs" variant="filled" color="lime.7">PRIMARY</Badge>
                                            )}
                                        </Group>
                                        <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="2px" mb="lg" className="opacity-60">
                                            {contact.position || 'Executive Personnel'} {contact.department ? `| ${contact.department}` : ''}
                                        </Text>
                                        <Group gap="xl">
                                            <Group gap={8}>
                                                <Box p={6} bg="slate.50" style={{ borderRadius: '8px' }}>
                                                    <Mail size={14} className="text-[#0C7C92]" />
                                                </Box>
                                                <Text size="sm" fw={700} c="slate.8">{contact.email}</Text>
                                            </Group>
                                            <Group gap={8}>
                                                <Box p={6} bg="slate.50" style={{ borderRadius: '8px' }}>
                                                    <Phone size={14} className="text-[#0C7C92]" />
                                                </Box>
                                                <Text size="sm" fw={700} c="slate.8">{contact.phone || '---'}</Text>
                                            </Group>
                                        </Group>
                                    </div>
                                </Group>

                                <Group gap="md">
                                    {!contact.isPrimary && (
                                        <Button
                                            variant="light"
                                            color="lime"
                                            radius="xl"
                                            size="sm"
                                            fw={900}
                                            onClick={() => setPrimary(index)}
                                            leftSection={<Star size={16} />}
                                            className="hover:scale-105 transition-transform"
                                        >
                                            SET AS PRIMARY
                                        </Button>
                                    )}
                                    <ActionIcon
                                        variant="subtle"
                                        color="red"
                                        size="xl"
                                        radius="xl"
                                        onClick={() => removeContact(index)}
                                        className="opacity-20 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={22} />
                                    </ActionIcon>
                                </Group>
                            </Group>
                        </Card>
                    ))}
                    {contacts.length === 0 && (
                        <Box p="5rem" style={{ border: '3px dashed #E2E8F0', borderRadius: '3rem', textAlign: 'center', background: 'transparent' }}>
                            <Box w={80} h={80} bg="white" p={20} mx="auto" mb="xl" style={{ borderRadius: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                                <Users size={40} className="text-slate-300" />
                            </Box>
                            <Title order={4} fw={900} c="#16284F" mb="xs">No Personnel Registered</Title>
                            <Text size="sm" c="dimmed" fw={600} maw={400} mx="auto">Establish the human connection for this account by adding your first liaison below.</Text>
                        </Box>
                    )}
                </div>
            </Box>

            {/* ADD FORM: Floating Card */}
            <Paper p="3rem" radius="3rem" bg="white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.06)' }}>
                <Group gap="xl" mb="2.5rem">
                    <Box p={16} bg="#F1F5F9" className="text-[#0C7C92]" style={{ borderRadius: '1.5rem' }}>
                        <UserPlus size={26} />
                    </Box>
                    <div>
                        <Badge color="blue" variant="outline" size="sm" radius="sm" fw={900} mb={4} className="tracking-widest">REGISTRATION</Badge>
                        <Title order={3} fw={900} c="#16284F">Add New Contact</Title>
                    </div>
                </Group>

                <Stack gap="2.5rem">
                    <TextInput
                        label="Full Legal Identity"
                        placeholder="e.g. Abebe Bikila"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.currentTarget.value })}
                        styles={inputStyles}
                        required
                        className="[&_.mantine-TextInput-input]:!pl-[20px]" // No icon here
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <TextInput
                            label="Direct Business Email"
                            placeholder="abebe@tech-corp.com"
                            leftSection={<Mail size={18} className="text-[#0C7C92]" />}
                            leftSectionWidth={48}
                            leftSectionPointerEvents="none"
                            value={newContact.email}
                            onChange={(e) => setNewContact({ ...newContact, email: e.currentTarget.value })}
                            styles={inputStyles}
                            required
                        />
                        <TextInput
                            label="Mobile Contact Line"
                            placeholder="+251 --- ---"
                            leftSection={<Phone size={18} className="text-[#0C7C92]" />}
                            leftSectionWidth={48}
                            leftSectionPointerEvents="none"
                            value={newContact.phone}
                            onChange={(e) => setNewContact({ ...newContact, phone: e.currentTarget.value })}
                            styles={inputStyles}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <TextInput
                            label="Official Designation / Role"
                            placeholder="e.g. Chief Technical Officer"
                            leftSection={<Briefcase size={18} className="text-[#0C7C92]" />}
                            leftSectionWidth={48}
                            leftSectionPointerEvents="none"
                            value={newContact.position}
                            onChange={(e) => setNewContact({ ...newContact, position: e.currentTarget.value })}
                            styles={inputStyles}
                        />
                        <TextInput
                            label="Department / Office"
                            placeholder="e.g. IT & Engineering"
                            leftSection={<Users size={18} className="text-[#0C7C92]" />}
                            leftSectionWidth={48}
                            leftSectionPointerEvents="none"
                            value={newContact.department}
                            onChange={(e) => setNewContact({ ...newContact, department: e.currentTarget.value })}
                            styles={inputStyles}
                        />
                    </div>
                    <Button
                        size="xl"
                        radius="xl"
                        fw={900}
                        onClick={addContact}
                        disabled={!newContact.name || !newContact.email}
                        style={{
                            background: '#16284F',
                            height: rem(64),
                            boxShadow: '0 10px 30px rgba(22, 40, 79, 0.2)'
                        }}
                        leftSection={<Plus size={22} />}
                        className="hover:scale-[1.02] transition-transform active:scale-95"
                    >
                        REGISTER FOCAL PERSON
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    );
};
