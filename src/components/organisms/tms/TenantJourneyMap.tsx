'use client';

import { Group, Stack, Text, Box, rem, useMantineTheme } from '@mantine/core';
import { FileSearch, ClipboardList, PenTool, FileSignature, Zap } from 'lucide-react';

interface TenantJourneyMapProps {
    currentStage: 'LOI' | 'PROPOSAL' | 'OFFER' | 'CONTRACT' | 'OPERATIONAL' | 'EXIT';
}

const STAGES = [
    { id: 'LOI', label: 'Intention', icon: FileSearch, color: 'blue' },
    { id: 'PROPOSAL', label: 'Proposal', icon: ClipboardList, color: 'indigo' },
    { id: 'OFFER', label: 'Evaluation', icon: PenTool, color: 'violet' },
    { id: 'CONTRACT', label: 'Legal', icon: FileSignature, color: 'teal' },
    { id: 'OPERATIONAL', label: 'Live', icon: Zap, color: 'green' },
];

export function TenantJourneyMap({ currentStage }: TenantJourneyMapProps) {
    const theme = useMantineTheme();
    const currentIndex = STAGES.findIndex(s => s.id === currentStage);

    return (
        <Box className="glass p-8 rounded-3xl border shadow-sm mb-xl" bg="white/40">
            <Group justify="space-between" align="center" style={{ position: 'relative' }}>
                {/* Connector Line */}
                <div style={{
                    position: 'absolute',
                    top: '40px',
                    left: '40px',
                    right: '40px',
                    height: '2px',
                    background: `linear-gradient(90deg, ${theme.colors.blue[4]} 0%, ${theme.colors.gray[2]} 100%)`,
                    zIndex: 0
                }} />

                {STAGES.map((stage, index) => {
                    const isCompleted = index < currentIndex || currentStage === 'OPERATIONAL';
                    const isActive = stage.id === currentStage;
                    const Icon = stage.icon;
                    const color = isActive || isCompleted ? theme.colors[stage.color][6] : theme.colors.gray[3];

                    return (
                        <Stack key={stage.id} gap={8} align="center" style={{ zIndex: 1, flex: 1 }}>
                            <Box
                                style={{
                                    width: rem(80),
                                    height: rem(80),
                                    borderRadius: '100%',
                                    background: isActive ? `linear-gradient(135deg, ${theme.colors[stage.color][6]} 0%, ${theme.colors[stage.color][8]} 100%)` : isCompleted ? theme.colors[stage.color][0] : 'white',
                                    border: `2px solid ${color}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: isActive ? theme.shadows.lg : 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                className={isActive ? 'animate-pulse' : ''}
                            >
                                <Icon
                                    size={32}
                                    color={isActive ? 'white' : color}
                                    strokeWidth={isActive ? 2.5 : 1.5}
                                />
                            </Box>
                            <Stack gap={0} align="center">
                                <Text size="xs" fw={900} tt="uppercase" c={isActive ? stage.color : 'dimmed'} style={{ letterSpacing: '1px' }}>
                                    {stage.label}
                                </Text>
                                {isActive && (
                                    <Text size="9px" fw={700} c={stage.color} className="animate-bounce">Active Stage</Text>
                                )}
                            </Stack>
                        </Stack>
                    );
                })}
            </Group>
        </Box>
    );
}
