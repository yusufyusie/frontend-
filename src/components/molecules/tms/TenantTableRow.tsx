import { Table, Group, Text, ActionIcon, Box, Badge, Menu, Avatar } from '@mantine/core';
import { Eye, Edit, Trash2, MoreVertical, ExternalLink, Mail, Phone } from 'lucide-react';
import { Tenant } from '../../../services/tenants.service';
import { TenantStatusBadge } from '../../atoms/tms/TenantStatusBadge';
import Link from 'next/link';

interface Props {
    tenant: Tenant;
    onDelete: (id: number) => void;
}

export const TenantTableRow = ({ tenant, onDelete }: Props) => {
    return (
        <Table.Tr className="hover:bg-gray-50 transition-colors">
            <Table.Td>
                <Group gap="sm">
                    <Avatar color="blue" radius="xl">
                        {tenant.nameEn.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Text size="sm" fw={700}>{tenant.nameEn}</Text>
                        <Text size="xs" c="dimmed">{tenant.companyRegNumber}</Text>
                    </Box>
                </Group>
            </Table.Td>
            <Table.Td>
                <Badge variant="outline" color="gray" size="sm">
                    {(tenant as any).businessCategory?.lookupValue?.en || 'N/A'}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Stack gap={2}>
                    {tenant.email && (
                        <Group gap={4}>
                            <Mail size={12} className="text-gray-400" />
                            <Text size="xs">{tenant.email}</Text>
                        </Group>
                    )}
                    {tenant.phone && (
                        <Group gap={4}>
                            <Phone size={12} className="text-gray-400" />
                            <Text size="xs">{tenant.phone}</Text>
                        </Group>
                    )}
                </Stack>
            </Table.Td>
            <Table.Td>
                <Group gap="xs">
                    <Badge variant="dot" color="blue" size="sm">
                        {tenant._count?.contacts || 0} Liaisons
                    </Badge>
                    <Badge variant="dot" color="orange" size="sm">
                        {tenant._count?.documents || 0} Docs
                    </Badge>
                </Group>
            </Table.Td>
            <Table.Td>
                <TenantStatusBadge
                    statusName={(tenant as any).status?.lookupCode}
                />
            </Table.Td>
            <Table.Td>
                <Group gap="xs" justify="flex-end">
                    <ActionIcon
                        component={Link}
                        href={`/admin/tms/tenants/${tenant.id}`}
                        variant="light"
                        color="blue"
                        radius="md"
                        size="md"
                        className="border border-blue-100 shadow-sm transition-all active:scale-90 hover:shadow-md"
                    >
                        <Eye size={16} strokeWidth={2.5} />
                    </ActionIcon>
                    <Menu position="bottom-end" shadow="md">
                        <Menu.Target>
                            <ActionIcon variant="subtle" color="gray" size="md" radius="md" className="hover:bg-gray-100">
                                <MoreVertical size={16} className="text-gray-500" />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item leftSection={<Edit size={14} className="text-blue-600" strokeWidth={2.5} />}>Edit Profile</Menu.Item>
                            {tenant.website && (
                                <Menu.Item
                                    leftSection={<ExternalLink size={14} />}
                                    component="a"
                                    href={tenant.website}
                                    target="_blank"
                                >
                                    Visit Website
                                </Menu.Item>
                            )}
                            <Menu.Divider />
                            <Menu.Item
                                color="red"
                                leftSection={<Trash2 size={14} className="text-rose-500" strokeWidth={2.5} />}
                                onClick={() => onDelete(tenant.id)}
                            >
                                Deactivate Account
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Table.Td>
        </Table.Tr>
    );
};

// Helper for the stackGap
import { Stack } from '@mantine/core';
