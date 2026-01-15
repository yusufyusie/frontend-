'use client';

import { Group, Box, Title, Text, Breadcrumbs, Anchor, Button } from '@mantine/core';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs: BreadcrumbItem[];
    actions?: {
        label: string;
        icon: LucideIcon;
        onClick?: () => void;
        href?: string;
        variant?: string;
        color?: string;
        loading?: boolean;
    }[];
}

export const PageHeader = ({ title, description, breadcrumbs, actions }: PageHeaderProps) => {
    return (
        <Group justify="space-between" mb="xl" align="flex-start">
            <Box>
                <Breadcrumbs mb="xs">
                    {breadcrumbs.map((item, index) => (
                        item.href ? (
                            <Anchor component={Link} href={item.href} key={index} size="xs" fw={500}>
                                {item.label}
                            </Anchor>
                        ) : (
                            <Text key={index} size="xs" c="dimmed">
                                {item.label}
                            </Text>
                        )
                    ))}
                </Breadcrumbs>
                <Title order={1} fw={900} trackingTight>
                    {title}
                </Title>
                {description && (
                    <Text c="dimmed" size="sm" mt={4}>
                        {description}
                    </Text>
                )}
            </Box>

            <Group gap="sm">
                {actions?.map((action, index) => (
                    action.href ? (
                        <Button
                            key={index}
                            component={Link}
                            href={action.href}
                            leftSection={action.icon && <action.icon size={18} />}
                            variant={action.variant as any || 'filled'}
                            color={action.color}
                            loading={action.loading}
                            radius="md"
                        >
                            {action.label}
                        </Button>
                    ) : (
                        <Button
                            key={index}
                            onClick={action.onClick}
                            leftSection={action.icon && <action.icon size={18} />}
                            variant={action.variant as any || 'filled'}
                            color={action.color}
                            loading={action.loading}
                            radius="md"
                        >
                            {action.label}
                        </Button>
                    )
                ))}
            </Group>
        </Group>
    );
};
