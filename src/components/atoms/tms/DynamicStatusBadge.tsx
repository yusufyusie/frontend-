import { Badge } from '@mantine/core';
import { useState, useEffect } from 'react';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import * as LucideIcons from 'lucide-react';

interface DynamicStatusBadgeProps {
    category: string; // 'PAYMENT_STATUS', 'INQUIRY_STAGES', 'TENANT_STATUS', etc.
    code: string; // 'PAID', 'LOI', 'ACTIVE', etc.
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'filled' | 'light' | 'outline' | 'dot';
}

/**
 * DynamicStatusBadge - Displays a status badge using dynamic lookup data
 * 
 * Features:
 * - Auto-fetches lookup data for the specified category
 * - Uses metadata.color for badge color
 * - Uses metadata.icon for badge icon (Lucide)
 * - Uses lookupValue.en for badge text
 * 
 * Usage:
 * <DynamicStatusBadge category="PAYMENT_STATUS" code="PAID" />
 * <DynamicStatusBadge category="INQUIRY_STAGES" code="LOI" size="lg" />
 */
export function DynamicStatusBadge({
    category,
    code,
    size = 'sm',
    variant = 'light'
}: DynamicStatusBadgeProps) {
    const [lookup, setLookup] = useState<SystemLookup | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLookup = async () => {
            try {
                const res = await lookupsService.getByCategory(category);
                const items = (res as any).data || res;
                const item = items.find((i: SystemLookup) => i.lookupCode === code);
                setLookup(item || null);
            } catch (error) {
                console.error(`Failed to load lookup for ${category}:${code}`, error);
            } finally {
                setLoading(false);
            }
        };

        loadLookup();
    }, [category, code]);

    if (loading) {
        return <Badge size={size} variant={variant} color="gray">...</Badge>;
    }

    if (!lookup) {
        return (
            <Badge size={size} variant={variant} color="gray">
                {code ? code.replace(/_/g, ' ') : 'N/A'}
            </Badge>
        );
    }

    const iconName = lookup.metadata?.icon;
    const color = lookup.metadata?.color || 'gray';
    const label = lookup.lookupValue?.en || code;

    // Dynamically get Lucide icon component
    const IconComponent = iconName && (LucideIcons as any)[iconName]
        ? (LucideIcons as any)[iconName]
        : null;

    return (
        <Badge
            size={size}
            variant={variant}
            color={color}
            leftSection={IconComponent && <IconComponent size={14} />}
        >
            {label}
        </Badge>
    );
}
