import { useState, useRef } from 'react';
import {
    Stack,
    Button,
    Group,
    Paper,
    Box,
    Text,
    ActionIcon,
    Card,
    Badge,
    rem,
    Title,
} from '@mantine/core';
import {
    Upload,
    FileText,
    Image as ImageIcon,
    Trash2,
    ShieldCheck,
    CloudUpload,
    FileCheck,
} from 'lucide-react';

export interface TenantDocument {
    id?: string;
    name: string;
    type: string;
    size: number;
    file?: File;
    uploadProgress?: number;
    status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

interface DocumentsStepProps {
    documents: TenantDocument[];
    onChange: (documents: TenantDocument[]) => void;
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const DocumentsStep = ({ documents, onChange }: DocumentsStepProps) => {
    const handleFileSelect = (files: File[] | null) => {
        if (!files) return;
        const newDocs: TenantDocument[] = Array.from(files).map((file) => ({
            id: `${Date.now()}-${file.name}`,
            name: file.name,
            type: file.type,
            size: file.size,
            file,
            uploadProgress: 100,
            status: 'PENDING',
        }));
        onChange([...documents, ...newDocs]);
    };

    const removeDocument = (index: number) => {
        onChange(documents.filter((_, i) => i !== index));
    };

    return (
        <Stack gap="3rem">
            {/* COMPLIANCE VAULT: High-Fidelity Dropzone */}
            <Box>
                <Group gap="md" mb="2.5rem">
                    <Box p={10} bg="#16284F" style={{ borderRadius: '1rem' }}>
                        <CloudUpload size={20} className="text-white" />
                    </Box>
                    <div>
                        <Badge color="blue" variant="light" size="sm" radius="sm" fw={900} mb={4} className="tracking-widest">OFFICIAL DOCS</Badge>
                        <Title order={3} fw={900} c="#16284F">Registration Documents</Title>
                    </div>
                </Group>

                <Paper
                    p="5rem 2rem"
                    radius="3rem"
                    className="border-2 border-dashed border-slate-200 bg-white hover:border-[#0C7C92] transition-all cursor-pointer group relative"
                    onClick={() => document.getElementById('masterpiece-upload')?.click()}
                    style={{
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.02)',
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        pos="absolute"
                        inset={0}
                        style={{
                            opacity: 0.02,
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
                            backgroundSize: '30px 30px'
                        }}
                    />

                    <Stack align="center" gap="xl" pos="relative">
                        <Box
                            w={100}
                            h={100}
                            bg="#F8FAFC"
                            style={{
                                borderRadius: '3rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #E2E8F0'
                            }}
                            className="group-hover:scale-110 transition-transform group-hover:bg-[#0C7C9210] group-hover:border-[#0C7C9240]"
                        >
                            <Upload size={40} className="text-slate-400 group-hover:text-[#0C7C92]" />
                        </Box>
                        <Box ta="center">
                            <Title order={3} fw={900} c="#16284F" lts="-1px">Secure Vault Upload</Title>
                            <Text size="md" c="dimmed" fw={600} mt={8} maw={400}>
                                Deposit official corporate registration and tax artifacts into our secure encrypted storage.
                            </Text>
                            <Group gap="md" justify="center" mt="2rem">
                                <Badge color="gray" variant="dot" size="md" fw={900} p="md">PDF FORMAT ONLY</Badge>
                                <Badge color="gray" variant="dot" size="md" fw={900} p="md">MAX 15.0 MB</Badge>
                            </Group>
                        </Box>
                    </Stack>

                    <input
                        id="masterpiece-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileSelect(Array.from(e.target.files || []))}
                    />
                </Paper>
            </Box>

            {/* ARTIFACT LIST: Masterpiece Grid */}
            {documents.length > 0 && (
                <Stack gap="xl">
                    <Group justify="space-between">
                        <Group gap="md">
                            <Box p={10} bg="#0C7C92" style={{ borderRadius: '0.75rem' }}>
                                <FileCheck size={18} className="text-white" />
                            </Box>
                            <Title order={4} fw={900} c="#16284F">Verifiable Artifact Registry</Title>
                        </Group>
                        <Badge variant="filled" color="#16284F" size="xl" radius="md" p="md" fw={900}>{documents.length} FILES PREPARED</Badge>
                    </Group>

                    <div className="grid grid-cols-1 gap-4">
                        {documents.map((doc, index) => (
                            <Card
                                key={doc.id || index}
                                p="1.5rem"
                                radius="1.5rem"
                                style={{ border: '1px solid #E2E8F0', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
                                className="group hover:border-[#0C7C9240] transition-colors"
                            >
                                <Group justify="space-between">
                                    <Group gap="xl">
                                        <Box p={14} bg="#F8FAFC" style={{ borderRadius: '1.25rem' }} className="group-hover:bg-[#0C7C9210] transition-colors">
                                            <FileText size={24} className="text-[#16284F] group-hover:text-[#0C7C92]" />
                                        </Box>
                                        <Box>
                                            <Text size="md" fw={800} c="#16284F" mb={2}>{doc.name}</Text>
                                            <Group gap="xs">
                                                <Badge size="xs" variant="outline" color="gray" fw={800}>{formatFileSize(doc.size)}</Badge>
                                                {doc.status === 'PENDING' && <Badge size="xs" variant="filled" color="orange.8" fw={900}>PENDING VERIFICATION</Badge>}
                                                {doc.status === 'VERIFIED' && <Badge size="xs" variant="filled" color="teal.8" fw={900}>SECURELY VERIFIED</Badge>}
                                                {doc.status === 'REJECTED' && <Badge size="xs" variant="filled" color="red.8" fw={900}>REJECTED / INVALID</Badge>}
                                            </Group>
                                        </Box>
                                    </Group>
                                    <ActionIcon variant="subtle" color="red" size="xl" radius="xl" onClick={() => removeDocument(index)}>
                                        <Trash2 size={20} />
                                    </ActionIcon>
                                </Group>
                            </Card>
                        ))}
                    </div>
                </Stack>
            )}

            {/* COMPLIANCE GUIDANCE: Masterpiece Alert */}
            <Paper p="2.5rem" radius="2.5rem" bg="#F1F5F9" style={{ border: '1px solid #E2E8F0' }}>
                <Group align="flex-start" gap="2rem" wrap="nowrap">
                    <Box p={16} bg="#16284F" style={{ borderRadius: '1.5rem' }} className="shadow-lg">
                        <ShieldCheck size={28} className="text-white" />
                    </Box>
                    <Box style={{ flex: 1 }}>
                        <Badge variant="outline" color="#16284F" size="sm" radius="sm" fw={900} mb="xs" className="tracking-widest">SUBMISSION POLICY</Badge>
                        <Title order={4} fw={900} c="#16284F" mb="xs">Mandatory Document Verification</Title>
                        <Text size="sm" c="slate.8" fw={600} style={{ lineHeight: 1.7 }}>
                            All uploaded certificates are stored in an encrypted environment. Ensure documents are high-resolution scans of original licenses or certificates.
                        </Text>
                    </Box>
                </Group>
            </Paper>
        </Stack>
    );
};
