'use client';

import { useState } from 'react';
import { Modal, Button, Stack, TextInput, Select, Group, Title, Text, ActionIcon, Paper, Divider, Box } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { FileText, Calendar, Upload, X, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { tenantsService } from '@/services/tenants.service';
import { toast } from '@/components/Toast';

interface DocumentUploadModalProps {
    opened: boolean;
    onClose: () => void;
    tenantId: number;
    onSuccess: () => void;
}

const DOCUMENT_TYPES = [
    { value: 'LOI', label: 'Letter of Intent (LoI)' },
    { value: 'PROPOSAL', label: 'Project Proposal' },
    { value: 'CONTRACT', label: 'Lease Contract' },
    { value: 'PERMIT', label: 'Investment Permit' },
    { value: 'TAX', label: 'Tax/TIN Certificate' },
    { value: 'ID', label: 'Legal ID / Passport' },
    { value: 'OTHER', label: 'Other Document' }
];

export function DocumentUploadModal({ opened, onClose, tenantId, onSuccess }: DocumentUploadModalProps) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState<string | null>('OTHER');
    const [fileUrl, setFileUrl] = useState('');
    const [expiryDate, setExpiryDate] = useState<Date | null>(null);

    const handleSubmit = async () => {
        if (!name || !type || !fileUrl) {
            toast.error('Please fill in required fields (Name, Type, Link)');
            return;
        }

        setLoading(true);
        try {
            await tenantsService.addDocument(tenantId, {
                name,
                typeId: null, // We'll use the type string in metadata or maps for now
                fileUrl,
                expiryDate: expiryDate ? expiryDate.toISOString() : null,
                status: 'ACTIVE',
                metadata: { type }
            });
            toast.success('Document recorded successfully');
            onSuccess();
            onClose();
        } catch (e) {
            toast.error('Failed to record document');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Stack gap={0}>
                    <Title order={3} className="text-brand-navy font-primary">Vault Entry</Title>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts="1px">Form E: Document Management</Text>
                </Stack>
            }
            size="lg"
            radius="2rem"
            padding="xl"
            overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        >
            <Stack gap="xl">
                <Paper p="md" radius="lg" bg="gray.0" withBorder>
                    <Group gap="sm">
                        <ShieldCheck size={24} className="text-brand-navy" />
                        <Box style={{ flex: 1 }}>
                            <Text size="sm" fw={800} className="text-brand-navy">Secure Records Management</Text>
                            <Text size="xs" c="dimmed">All uploaded documents are tracked for compliance and regulatory purposes.</Text>
                        </Box>
                    </Group>
                </Paper>

                <Stack gap="md">
                    <Select
                        label="Document Category"
                        placeholder="Select type"
                        data={DOCUMENT_TYPES}
                        value={type}
                        onChange={setType}
                        radius="md"
                        size="md"
                        leftSection={<FileText size={16} />}
                        required
                    />

                    <TextInput
                        label="Document Name"
                        placeholder="e.g., Investment Permit 2026"
                        value={name}
                        onChange={(e) => setName(e.currentTarget.value)}
                        radius="md"
                        size="md"
                        required
                    />

                    <TextInput
                        label="File Reference (URL)"
                        placeholder="https://storage.itpc.gov.et/..."
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.currentTarget.value)}
                        radius="md"
                        size="md"
                        leftSection={<LinkIcon size={16} />}
                        description="Direct link to the document in secure storage"
                        required
                    />

                    <DateInput
                        label="Expiry Date"
                        placeholder="Optional"
                        value={expiryDate}
                        onChange={setExpiryDate}
                        radius="md"
                        size="md"
                        leftSection={<Calendar size={16} />}
                        clearable
                        description="If the document has a validity period"
                    />
                </Stack>

                <Divider variant="dashed" />

                <Group grow>
                    <Button variant="subtle" radius="xl" size="lg" color="gray" onClick={onClose} className="font-bold">
                        Discard
                    </Button>
                    <Button
                        radius="xl"
                        size="lg"
                        bg="#16284F"
                        loading={loading}
                        onClick={handleSubmit}
                        leftSection={<Upload size={18} />}
                        className="shadow-xl font-bold"
                    >
                        Register Document
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
