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
        isPrimary: false,
    });

    const addContact = () => {
        if (newContact.name && newContact.email) {
            const updated = [...contacts, { ...newContact, id: Date.now().toString() }];
            onChange(updated);
            setNewContact({ name: '', email: '', phone: '', position: '', isPrimary: false });
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
            fontSize: rem(12),
            marginBottom: rem(6),
            textTransform: 'uppercase' as const,
            letterSpacing: rem(1)
        },
        input: {
            borderRadius: rem(12),
            height: rem(50),
            fontSize: rem(14),
            border: '2px solid #f1f5f9',
            backgroundColor: '#fff',
            '&:focus': { borderColor: '#0C7C92' }
        }
    };

    return (
        <Stack gap="2.5rem">
            {/* PERSON CARDS: LinkedIn Style */}
            <Box>
                <Group justify="space-between" mb="xl">
                    <Group gap="sm">
                        <Box p={8} bg="blue.0" style={{ borderRadius: '50%' }}>
                            <Users size={18} className="text-blue-600" />
                        </Box>
                        <Text size="sm" fw={900} c="#16284F" tt="uppercase" lts="2px">Registered Liaisons</Text>
                    </Group>
                    <Badge color="blue" variant="light" size="xl" radius="md" fw={900}>{contacts.length}</Badge>
                </Group>

                <div className="grid grid-cols-1 gap-4">
                    {contacts.map((contact, index) => (
                        <Card
                            key={contact.id || index}
                            p="xl"
                            radius="2rem"
                            style={{
                                border: '1px solid #e2e8f0',
                                background: contact.isPrimary ? 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)' : 'white',
                                boxShadow: '0 10px 20px -5px rgba(0,0,0,0.02)'
                            }}
                        >
                            <Group justify="space-between">
                                <Group gap="xl">
                                    <Avatar
                                        size={rem(64)}
                                        radius="2rem"
                                        styles={{
                                            root: {
                                                background: 'linear-gradient(135deg, #0C7C92 0%, #16284F 100%)',
                                            },
                                        }}
                                    >
                                        <Text fw={900} c="white">{contact.name.substring(0, 2).toUpperCase()}</Text>
                                    </Avatar>
                                    <div>
                                        <Group gap="xs" mb={2}>
                                            <Text size="lg" fw={900} c="#16284F">{contact.name}</Text>
                                            {contact.isPrimary && (
                                                <Tooltip label="Primary Account Liaison">
                                                    <ShieldCheck size={20} className="text-teal-600 fill-teal-50" />
                                                </Tooltip>
                                            )}
                                        </Group>
                                        <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts="1px" mb="md">
                                            {contact.position || 'Executive Personnel'}
                                        </Text>
                                        <Group gap="xl">
                                            <Group gap={6}>
                                                <Mail size={14} className="text-slate-400" />
                                                <Text size="sm" fw={600} c="slate.6">{contact.email}</Text>
                                            </Group>
                                            <Group gap={6}>
                                                <Phone size={14} className="text-slate-400" />
                                                <Text size="sm" fw={600} c="slate.6">{contact.phone || '---'}</Text>
                                            </Group>
                                        </Group>
                                    </div>
                                </Group>

                                <Group gap="md">
                                    {!contact.isPrimary && (
                                        <Button
                                            variant="light"
                                            color="yellow"
                                            radius="xl"
                                            size="xs"
                                            fw={900}
                                            onClick={() => setPrimary(index)}
                                            leftSection={<Star size={14} />}
                                        >
                                            SET PRIMARY
                                        </Button>
                                    )}
                                    <ActionIcon
                                        variant="subtle"
                                        color="red"
                                        size="xl"
                                        radius="xl"
                                        onClick={() => removeContact(index)}
                                    >
                                        <Trash2 size={20} />
                                    </ActionIcon>
                                </Group>
                            </Group>
                        </Card>
                    ))}
                    {contacts.length === 0 && (
                        <Box p="4rem" style={{ border: '2px dashed #e2e8f0', borderRadius: '2rem', textAlign: 'center' }}>
                            <Users size={48} className="text-slate-200 mx-auto mb-4" />
                            <Text size="sm" c="dimmed" fw={600}>No liaisons registered yet. Begin by adding personnel below.</Text>
                        </Box>
                    )}
                </div>
            </Box>

            {/* ADD FORM: Floating Card */}
            <Paper p="2.5rem" radius="2.5rem" shadow="xl" style={{ border: '1px solid #f1f5f9' }}>
                <Group gap="sm" mb="xl">
                    <UserPlus size={22} className="text-[#0C7C92]" />
                    <Title order={4} fw={900} c="#16284F">New Personnel Entry</Title>
                </Group>

                <Stack gap="xl">
                    <TextInput
                        label="Full Legal Name"
                        placeholder="e.g. Abebe Bikila"
                        value={newContact.name}
                        onChange={(e) => setNewContact({ ...newContact, name: e.currentTarget.value })}
                        styles={inputStyles}
                    />
                    <Group grow gap="xl">
                        <TextInput
                            label="Email Address"
                            placeholder="abebe@tech-corp.com"
                            value={newContact.email}
                            onChange={(e) => setNewContact({ ...newContact, email: e.currentTarget.value })}
                            styles={inputStyles}
                        />
                        <TextInput
                            label="Mobile Number"
                            placeholder="+251 --- ---"
                            value={newContact.phone}
                            onChange={(e) => setNewContact({ ...newContact, phone: e.currentTarget.value })}
                            styles={inputStyles}
                        />
                    </Group>
                    <TextInput
                        label="Position in Company"
                        placeholder="e.g. Chief Technical Officer"
                        value={newContact.position}
                        onChange={(e) => setNewContact({ ...newContact, position: e.currentTarget.value })}
                        styles={inputStyles}
                    />
                    <Button
                        size="xl"
                        radius="xl"
                        fw={900}
                        onClick={addContact}
                        disabled={!newContact.name || !newContact.email}
                        style={{ background: '#16284F' }}
                        leftSection={<Plus size={20} />}
                    >
                        COMMIT PERSON TO LIST
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    );
};
