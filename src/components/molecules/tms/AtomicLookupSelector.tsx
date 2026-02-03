'use client';

import React, { useMemo } from 'react';
import { Group, Text, Box, Select, ThemeIcon, rem } from '@mantine/core';
import * as LucideIcons from 'lucide-react';
import { SystemLookup } from '@/services/lookups.service';

interface AtomicLookupSelectorProps {
    label: string;
    items: SystemLookup[];
    value: number | string | null;
    onChange: (value: any) => void;
    variant?: 'discovery' | 'form';
    isLoading?: boolean;
    placeholder?: string;
}

export const AtomicLookupSelector = ({
    label,
    items,
    value,
    onChange,
    variant = 'form',
    isLoading,
    placeholder = 'Search & Select...'
}: AtomicLookupSelectorProps) => {

    const selectData = useMemo(() => {
        return items
            .filter(item => item?.id != null && item?.lookupValue?.en) // ✅ Filter invalid items
            .map(item => ({
                value: item.id.toString(),
                label: item.lookupValue.en,
                icon: item.metadata?.icon,
                color: item.metadata?.color || 'blue'
            }));
    }, [items]);

    const getIcon = (iconName?: string) => {
        const Icon = (LucideIcons as any)[iconName || 'Circle'] || LucideIcons.HelpCircle;
        return <Icon size={14} />;
    };

    if (items.length === 0 && !isLoading) return null;

    // UNIFIED MODE: Professional Branded Dropdown with Enhanced Scroller
    return (
        <Box className={`w-full ${variant === 'discovery' ? 'bg-white p-4 rounded-2xl border border-slate-100 shadow-sm' : ''}`}>
            {variant === 'discovery' && (
                <Group gap="xs" mb="sm">
                    <div className="w-1 h-4 rounded-full bg-[#0C7C92]" />
                    <Text size="xs" fw={900} c="#16284F" tt="uppercase" lts="1px">
                        {label}
                    </Text>
                </Group>
            )}

            <Select
                label={variant === 'form' ? label : null}
                placeholder={placeholder}
                searchable
                nothingFoundMessage="No matching results"
                data={selectData}
                value={value?.toString()}
                onChange={(val) => {
                    const selected = items.find(i => i.id.toString() === val);
                    onChange(selected ? selected.id : null);
                }}
                maxDropdownHeight={300}
                radius="xl"
                size="md"
                leftSectionPointerEvents="none"
                leftSection={(() => {
                    const itemData = value ? selectData.find(d => d.value === value.toString()) : null;
                    const Icon = itemData ? (LucideIcons as any)[itemData.icon || 'Circle'] || LucideIcons.Circle : LucideIcons.Sparkles;
                    return (
                        <ThemeIcon
                            size="md"
                            variant="transparent"
                            color={itemData?.color || 'blue.4'}
                            style={{ opacity: 0.6 }}
                        >
                            <Icon size={18} strokeWidth={2.5} />
                        </ThemeIcon>
                    );
                })()}
                styles={{
                    label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' },
                    input: {
                        border: '2px solid #E2E8F0',
                        backgroundColor: '#fff',
                        fontWeight: 700,
                        height: variant === 'discovery' ? '44px' : '54px',
                        transition: 'all 0.2s ease',
                        paddingLeft: rem(48), // Explicit spacing for branded icon
                        '&:focus': { borderColor: '#16284F', backgroundColor: '#fff' }
                    },
                    dropdown: {
                        borderRadius: '1.5rem',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                        padding: '8px',
                        zIndex: 1000
                    },
                    option: {
                        borderRadius: '1rem',
                        marginBottom: '4px',
                        padding: '12px 16px',
                    },
                    section: {
                        width: rem(48),
                        justifyContent: 'center',
                    }
                }}
                comboboxProps={{
                    transitionProps: { transition: 'pop-top-left', duration: 200 },
                    shadow: 'xl',
                }}
                className="[&_.mantine-Select-input]:!pl-[48px]"
                renderOption={({ option, checked }) => {
                    const itemData = selectData.find(d => d.value === option.value);
                    const lookupItem = items.find(i => i.id.toString() === option.value);
                    return (
                        <Group gap="sm" wrap="nowrap">
                            <ThemeIcon
                                size="md"
                                radius="lg"
                                variant={checked ? 'filled' : 'light'}
                                color={itemData?.color}
                                className="shadow-sm"
                            >
                                {getIcon(itemData?.icon)}
                            </ThemeIcon>
                            <Box style={{ flex: 1 }}>
                                <Text size="sm" fw={checked ? 900 : 700} c={checked ? 'white' : '#16284F'}>
                                    {option.label}
                                </Text>
                                <Text size="10px" fw={500} c={checked ? 'rgba(255,255,255,0.7)' : 'dimmed'} tt="uppercase" lts="0.5px">
                                    {lookupItem?.lookupCode || 'ID: ' + option.value}
                                </Text>
                            </Box>
                            {checked && <LucideIcons.Check size={16} color="white" />}
                        </Group>
                    );
                }}
            />
        </Box>
    );
};
