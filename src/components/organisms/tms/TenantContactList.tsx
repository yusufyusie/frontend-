import { useState, useEffect } from 'react';
import { Paper, Group, Stack, Text, Button, ActionIcon, Avatar, Badge, Box, Modal, TextInput, Checkbox } from '@mantine/core';
import { Users, Plus, Trash2, Mail, Phone, Crown, Briefcase } from 'lucide-react';
import { tenantsService, TenantContact } from '@/services/tenants.service';
import { useDisclosure } from '@mantine/hooks';
import { toast } from '@/components/Toast';

interface Props {
    tenantId: number;
}

export const TenantContactList = ({ tenantId }: Props) => {
    const [contacts, setContacts] = useState<TenantContact[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);

    const [newContact, setNewContact] = useState({
        firstName: '',
        lastName: '',
        position: '',
        email: '',
        phone: '',
        isPrimary: false
    });

    const fetchContacts = async () => {
        setIsLoading(true);
        try {
            const res: any = await tenantsService.getContacts(tenantId);
            setContacts(res.data || res);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (tenantId) fetchContacts();
    }, [tenantId]);

    const handleAdd = async () => {
        try {
            await tenantsService.addContact(tenantId, newContact);
            toast.success('Contact added');
            setNewContact({ firstName: '', lastName: '', position: '', email: '', phone: '', isPrimary: false });
            close();
            fetchContacts();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed to add contact');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Remove this representative?')) {
            try {
                await tenantsService.deleteContact(id);
                toast.success('Contact removed');
                fetchContacts();
            } catch (e) {
                toast.error('Failed to remove contact');
            }
        }
    };

    return (
        <Stack gap="lg">
            <Group justify="space-between">
                <Box>
                    <Title order={4} mb={4}>Authorized Representatives</Title>
                    <Text size="xs" c="dimmed">Key personnel authorized for lease communications</Text>
                </Box>
                <Button
                    size="xs"
                    variant="light"
                    leftSection={<Plus size={14} />}
                    onClick={open}
                >
                    Add Liaison
                </Button>
            </Group>

            <Stack gap="md">
                {contacts.map(c => (
                    <Paper key={c.id} withBorder p="md" radius="md">
                        <Group justify="space-between">
                            <Group gap="md">
                                <Avatar size="lg" color={c.isPrimary ? 'blue' : 'gray'} radius="xl">
                                    {c.firstName[0]}{c.lastName[0]}
                                </Avatar>
                                <Stack gap={2}>
                                    <Group gap="xs">
                                        <Text fw={700}>{c.firstName} {c.lastName}</Text>
                                        {c.isPrimary && (
                                            <Badge variant="filled" size="xs" color="blue" leftSection={<Crown size={10} />}>
                                                Primary
                                            </Badge>
                                        )}
                                    </Group>
                                    <Group gap={8}>
                                        <Group gap={4}>
                                            <Briefcase size={12} className="text-gray-400" />
                                            <Text size="xs" c="dimmed">{c.position || 'Representative'}</Text>
                                        </Group>
                                        <Group gap={4}>
                                            <Mail size={12} className="text-gray-400" />
                                            <Text size="xs" c="dimmed">{c.email}</Text>
                                        </Group>
                                        {c.phone && (
                                            <Group gap={4}>
                                                <Phone size={12} className="text-gray-400" />
                                                <Text size="xs" c="dimmed">{c.phone}</Text>
                                            </Group>
                                        )}
                                    </Group>
                                </Stack>
                            </Group>
                            <ActionIcon variant="light" color="red" onClick={() => handleDelete(c.id)}>
                                <Trash2 size={16} />
                            </ActionIcon>
                        </Group>
                    </Paper>
                ))}
                {contacts.length === 0 && (
                    <Paper p="xl" withBorder bg="gray.0" style={{ textAlign: 'center', borderStyle: 'dashed' }}>
                        <Text size="sm" c="dimmed">No authorized contacts defined yet.</Text>
                    </Paper>
                )}
            </Stack>

            <Modal opened={opened} onClose={close} title="Add New Representative" centered radius="md">
                <Stack gap="md">
                    <Group grow>
                        <TextInput
                            label="First Name" required
                            value={newContact.firstName}
                            onChange={e => setNewContact({ ...newContact, firstName: e.target.value })}
                        />
                        <TextInput
                            label="Last Name" required
                            value={newContact.lastName}
                            onChange={e => setNewContact({ ...newContact, lastName: e.target.value })}
                        />
                    </Group>
                    <TextInput
                        label="Email" required
                        value={newContact.email}
                        onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                    />
                    <Group grow>
                        <TextInput
                            label="Position"
                            value={newContact.position}
                            onChange={e => setNewContact({ ...newContact, position: e.target.value })}
                        />
                        <TextInput
                            label="Phone"
                            value={newContact.phone}
                            onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                        />
                    </Group>
                    <Checkbox
                        label="Set as Primary Business Contact"
                        checked={newContact.isPrimary}
                        onChange={e => setNewContact({ ...newContact, isPrimary: e.currentTarget.checked })}
                    />
                    <Button mt="md" fullWidth onClick={handleAdd} bg="blue">Add Representative</Button>
                </Stack>
            </Modal>
        </Stack>
    );
};

import { Title } from '@mantine/core';
