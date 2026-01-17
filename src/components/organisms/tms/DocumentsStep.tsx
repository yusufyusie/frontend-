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
                <Group gap="sm" mb="xl">
                    <Box p={8} bg="blue.0" style={{ borderRadius: '50%' }}>
                        <CloudUpload size={18} className="text-blue-600" />
                    </Box>
                    <Text size="sm" fw={900} c="#16284F" tt="uppercase" lts="2px">Compliance Vault</Text>
                </Group>

                <Paper
                    p="4rem 2rem"
                    radius="3rem"
                    className="border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#0C7C92] transition-all cursor-pointer group"
                    onClick={() => document.getElementById('masterpiece-upload')?.click()}
                    style={{ position: 'relative', overflow: 'hidden' }}
                >
                    <Box
                        pos="absolute"
                        inset={0}
                        style={{
                            opacity: 0.03,
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
                            backgroundSize: '20px 20px'
                        }}
                    />

                    <Stack align="center" gap="xl" pos="relative">
                        <Box
                            w={80}
                            h={80}
                            bg="#F1F5F9"
                            style={{ borderRadius: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            className="group-hover:scale-110 transition-transform group-hover:bg-[#0C7C9210]"
                        >
                            <Upload size={32} className="text-slate-400 group-hover:text-[#0C7C92]" />
                        </Box>
                        <Box ta="center">
                            <Title order={3} fw={900} c="#16284F" lts="-1px">Secure Repository Upload</Title>
                            <Text size="sm" c="dimmed" fw={600} mt={8}>
                                Drag and drop official compliance artifacts here.
                            </Text>
                            <Group gap="xs" justify="center" mt="xl">
                                <Badge color="gray" variant="dot" size="sm" fw={800}>PDF PREFERRED</Badge>
                                <Badge color="gray" variant="dot" size="sm" fw={800}>MAX 15MB</Badge>
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
                <Stack gap="lg">
                    <Group justify="space-between">
                        <Group gap="sm">
                            <FileCheck size={18} className="text-teal-600" />
                            <Text size="sm" fw={900} c="#16284F" tt="uppercase" lts="2px">Verifiable Artifacts</Text>
                        </Group>
                        <Badge variant="filled" color="#16284F" size="lg" radius="md">{documents.length} FILES</Badge>
                    </Group>

                    <div className="grid grid-cols-1 gap-3">
                        {documents.map((doc, index) => (
                            <Card
                                key={doc.id || index}
                                p="lg"
                                radius="1.5rem"
                                style={{ border: '1px solid #f1f5f9', background: 'white' }}
                            >
                                <Group justify="space-between">
                                    <Group gap="md">
                                        <Box p={10} bg="slate.50" style={{ borderRadius: '1rem' }}>
                                            <FileText size={22} className="text-slate-500" />
                                        </Box>
                                        <Box>
                                            <Text size="sm" fw={800} c="#16284F">{doc.name}</Text>
                                            <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts="1px">
                                                {formatFileSize(doc.size)} • ENCRYPTED STORAGE
                                            </Text>
                                        </Box>
                                    </Group>
                                    <ActionIcon variant="subtle" color="red" size="lg" radius="md" onClick={() => removeDocument(index)}>
                                        <Trash2 size={18} />
                                    </ActionIcon>
                                </Group>
                            </Card>
                        ))}
                    </div>
                </Stack>
            )}

            {/* COMPLIANCE GUIDANCE: Masterpiece Alert */}
            <Paper p="2rem" radius="2rem" bg="indigo.0" style={{ border: '1px solid #e0e7ff' }}>
                <Group align="flex-start" gap="xl">
                    <Box p={12} bg="indigo.1" style={{ borderRadius: '1.25rem' }}>
                        <ShieldCheck size={24} className="text-indigo-600" />
                    </Box>
                    <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={900} c="indigo.9" tt="uppercase" lts="2px">Security & Authority Guidelines</Text>
                        <Text size="sm" c="indigo.8" fw={500} mt={8} style={{ lineHeight: 1.6 }}>
                            All documents are processed through our secure encryption layer. Once submitted, artifacts cannot be deleted without Authority approval. Ensure all scans are high-resolution and include official government stamps.
                        </Text>
                    </Box>
                </Group>
            </Paper>
        </Stack>
    );
};
