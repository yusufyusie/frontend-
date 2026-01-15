import { Badge } from '@mantine/core';
import { Check, X } from 'lucide-react';

interface Props {
    active: boolean;
}

export const LookupStatusBadge = ({ active }: Props) => {
    return (
        <Badge
            color={active ? 'tms-mint' : 'gray'}
            variant="light"
            leftSection={active ? <Check size={12} /> : <X size={12} />}
            radius="sm"
        >
            {active ? 'Active' : 'Inactive'}
        </Badge>
    );
};
