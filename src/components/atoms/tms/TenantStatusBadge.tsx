import { Badge } from '@mantine/core';
import { useMemo } from 'react';

interface Props {
    statusId?: number;
    statusName?: string;
    variant?: 'filled' | 'light' | 'outline' | 'dot';
}

export const TenantStatusBadge = ({ statusId, statusName, variant = 'light' }: Props) => {
    const config = useMemo(() => {
        const name = statusName?.toUpperCase() || '';
        if (name.includes('ACTIVE')) return { color: 'green', label: 'Active' };
        if (name.includes('ONBOARDING')) return { color: 'blue', label: 'Onboarding' };
        if (name.includes('SUSPENDED')) return { color: 'orange', label: 'Suspended' };
        if (name.includes('TERMINATED')) return { color: 'red', label: 'Terminated' };
        return { color: 'gray', label: statusName || 'Unknown' };
    }, [statusName]);

    return (
        <Badge color={config.color} variant={variant} radius="xs" size="sm">
            {config.label}
        </Badge>
    );
};
