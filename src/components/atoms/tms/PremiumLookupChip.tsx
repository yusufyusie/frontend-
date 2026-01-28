'use client';

import React from 'react';
import { UnstyledButton, Text, ThemeIcon, Box } from '@mantine/core';
import * as LucideIcons from 'lucide-react';

interface PremiumLookupChipProps {
    label: string;
    icon?: string;
    color?: string;
    isActive?: boolean;
    onClick: () => void;
    variant?: 'discovery' | 'form';
    description?: string;
}

export const PremiumLookupChip = ({
    label,
    icon,
    color = 'blue',
    isActive,
    onClick,
    variant = 'discovery',
    description
}: PremiumLookupChipProps) => {
    const Icon = (LucideIcons as any)[icon || 'Circle'] || LucideIcons.HelpCircle;

    // Branded Glassmorphism & Shadow styles
    const discoveryStyles = isActive
        ? {
            background: 'rgba(12, 124, 146, 0.1)',
            backdropFilter: 'blur(12px)',
            border: '2px solid #0C7C92',
            boxShadow: '0 8px 24px rgba(12, 124, 146, 0.15)',
            transform: 'translateY(-2px)'
        }
        : {
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(8px)',
            border: '2px solid rgba(241, 245, 249, 0.8)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
        };

    const formStyles = isActive
        ? {
            background: '#16284F',
            color: 'white',
            boxShadow: '0 4px 12px rgba(22, 40, 79, 0.2)'
        }
        : {
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            color: '#64748B'
        };

    const styles = variant === 'discovery' ? discoveryStyles : formStyles;

    return (
        <UnstyledButton
            onClick={onClick}
            className={`
                group flex items-center gap-3 transition-all duration-300 rounded-2xl
                ${variant === 'discovery' ? 'px-5 py-3' : 'px-4 py-2'}
                ${!isActive && 'hover:border-slate-300 hover:bg-white hover:shadow-lg'}
            `}
            style={{ ...styles, minWidth: 'max-content' }}
        >
            <Box
                className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}
            >
                <ThemeIcon
                    size={variant === 'discovery' ? 'lg' : 'sm'}
                    radius="xl"
                    variant={isActive ? 'filled' : 'light'}
                    color={isActive && variant === 'form' ? 'white' : (color || 'blue')}
                    styles={{
                        root: {
                            backgroundColor: isActive && variant === 'discovery' ? undefined : undefined,
                            boxShadow: isActive ? `0 0 15px ${color}40` : 'none'
                        }
                    }}
                >
                    <Icon size={variant === 'discovery' ? 18 : 12} />
                </ThemeIcon>
            </Box>

            <Box>
                <Text
                    size={variant === 'discovery' ? 'sm' : 'xs'}
                    fw={900}
                    className={`tracking-tight ${variant === 'discovery' ? 'text-slate-800' : (isActive ? 'text-white' : 'text-slate-600')}`}
                >
                    {label}
                </Text>
                {variant === 'discovery' && description && (
                    <Text size="10px" fw={700} c="dimmed" className="uppercase tracking-widest opacity-70">
                        {description}
                    </Text>
                )}
            </Box>
        </UnstyledButton>
    );
};
