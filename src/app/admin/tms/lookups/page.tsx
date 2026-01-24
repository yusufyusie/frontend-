'use client';
// Premium Lookups Management Interface with Glassmorphism

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Stack, Group, Text, Box, Title, Paper, ActionIcon, Skeleton, Button, Badge } from '@mantine/core';
import { Map, Layers, Building2, LayoutList, Settings, Info, GitBranch, FileText, Database, Plus, Sparkles, DoorOpen, Coffee, Shield, Wallet, Activity, Leaf, Headset, Server, Radio, Code2, Hammer, Clock, Users, Briefcase, Settings2, Save, X } from 'lucide-react';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { LookupTree } from '@/components/organisms/tms/LookupTree';
import { LookupForm } from '@/components/organisms/tms/LookupForm';
import { Modal } from '@/components/Modal';

const ICON_MAP: Record<string, any> = {
    Map, Layers, Building2, LayoutList, Settings, Info, GitBranch, FileText, Database, DoorOpen, Coffee,
    Shield, Wallet, Activity, Leaf, Headset, Server, Radio, Code2, Hammer, Clock, Users, Briefcase, Settings2
};

const getIcon = (name: string) => ICON_MAP[name] || Database;

const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
        emerald: 'text-emerald-600',
        blue: 'text-blue-600',
        violet: 'text-violet-600',
        pink: 'text-pink-600',
        amber: 'text-amber-600',
        cyan: 'text-cyan-600',
        teal: 'text-teal-600',
        indigo: 'text-indigo-600',
        orange: 'text-orange-600',
        slate: 'text-slate-600',
        red: 'text-red-600',
    };
    return colors[color] || 'text-slate-600';
};

export default function LookupsPage() {
    const [mounted, setMounted] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [category, setCategory] = useState<string | null>(null);
    const [lookups, setLookups] = useState<SystemLookup[]>([]);
    const [loading, setLoading] = useState(true);
    const [catsLoading, setCatsLoading] = useState(true);
    const [editItem, setEditItem] = useState<Partial<SystemLookup> | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadCategories();
    }, []);

    useEffect(() => {
        if (category) {
            loadData();
        }
    }, [category]);

    const loadCategories = async () => {
        setCatsLoading(true);
        try {
            const res: any = await lookupsService.getCategories();
            const data = res.data || res || [];
            setCategories(data);
            if (data.length > 0 && !category) {
                setCategory(data[0].value);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCatsLoading(false);
        }
    };

    const loadData = async () => {
        if (!category) return;
        setLoading(true);
        try {
            const res: any = await lookupsService.getTree(category);
            setLookups(res.data || res || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const activeCategory = categories.find(c => c.value === category) || categories[0];

    if (!mounted) return null;

    return (
        <>
            <div className="h-[calc(100vh-120px)] flex flex-col overflow-hidden bg-white/30 backdrop-blur-sm rounded-3xl border border-white/50 shadow-2xl animate-render">
                {/* Professional Fixed Header */}
                <Box p="md" className="border-b border-slate-200 bg-white/80 backdrop-blur-md z-20">
                    <Group justify="space-between" align="center">
                        <Group gap="md">
                            <Box className="bg-gradient-to-br from-[#0C7C92] to-cyan-600 p-2.5 rounded-xl shadow-lg shadow-cyan-100">
                                <Database size={24} className="text-white" strokeWidth={2.5} />
                            </Box>
                            <div className="animate-fade-in-delayed">
                                <Group gap="xs">
                                    <Title order={3} className="text-2xl font-black bg-gradient-to-r from-slate-800 to-teal-800 bg-clip-text text-transparent">
                                        System Lookups
                                    </Title>
                                    <Badge variant="dot" color="teal" size="sm">Active Session</Badge>
                                </Group>
                                <Text size="xs" c="dimmed" fw={600}>Master Metadata Management</Text>
                            </div>
                        </Group>
                        <Group gap="xs">
                            <Button
                                size="compact-md"
                                radius="xl"
                                className="bg-gradient-to-r from-[#0C7C92] to-[#0a6c7e] shadow-md hover:shadow-lg transition-all"
                                leftSection={<Plus size={16} strokeWidth={3} />}
                                onClick={() => setEditItem({ lookupCategory: category || '', isActive: true, level: 1 })}
                            >
                                Add Root
                            </Button>
                        </Group>
                    </Group>
                </Box>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar: Categories Navigation */}
                    <Box
                        w={260}
                        p="md"
                        className="bg-slate-50/50 border-r border-slate-200 overflow-y-auto custom-scrollbar"
                    >
                        <Text size="xs" fw={800} tt="uppercase" c="dimmed" mb="md" lts="1px" className="px-2">
                            Categories
                        </Text>
                        <Stack gap={3} className="animate-fade-in-delayed">
                            {catsLoading ? (
                                [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <Skeleton key={i} height={36} radius="md" />
                                ))
                            ) : (
                                categories.map(cat => {
                                    const isActive = category === cat.value;
                                    const Icon = getIcon(cat.icon);
                                    return (
                                        <button
                                            key={cat.value}
                                            onClick={() => setCategory(cat.value)}
                                            className={`
                                            flex items-center gap-2.5 w-full p-2 rounded-xl transition-all duration-200 group text-left
                                            ${isActive
                                                    ? 'bg-[#0C7C92] shadow-md shadow-cyan-100/50 text-white'
                                                    : 'hover:bg-white hover:shadow-sm text-slate-600'
                                                }
                                        `}
                                        >
                                            <Box className={`${isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'} p-1.5 rounded-lg transition-colors flex-shrink-0`}>
                                                <Icon
                                                    size={16}
                                                    className={isActive ? 'text-white' : getColorClass(cat.color)}
                                                    strokeWidth={2.5}
                                                />
                                            </Box>
                                            <Text size="sm" fw={isActive ? 800 : 600} className="whitespace-nowrap">
                                                {cat.label}
                                            </Text>
                                        </button>
                                    );
                                })
                            )}
                        </Stack>
                    </Box>

                    {/* Main Content: Tree View */}
                    <Box className="flex-1 bg-white/40 p-6 overflow-y-auto custom-scrollbar animate-fade-in-delayed">
                        <div className="max-w-6xl mx-auto space-y-6">
                            {/* Entity Header Banner - Compact Horizontal Layout */}
                            {activeCategory && (
                                <Paper p="sm" radius="2rem" className="bg-white shadow-xl shadow-slate-200/40 border border-slate-100/50 overflow-hidden relative group">
                                    <div className={`absolute top-0 left-0 w-1.5 h-full bg-${activeCategory.color}-500 shadow-lg shadow-teal-500/20`} />
                                    <div className="relative z-10">
                                        <Group gap="md" px="xs" wrap="nowrap">
                                            <Box className={`bg-${activeCategory.color}-50 p-2 rounded-xl shadow-inner border border-${activeCategory.color}-100 flex-shrink-0`}>
                                                {(() => {
                                                    const BannerIcon = getIcon(activeCategory.icon);
                                                    return <BannerIcon size={20} className={getColorClass(activeCategory.color)} strokeWidth={2.5} />;
                                                })()}
                                            </Box>
                                            <Group gap="sm" wrap="nowrap" align="center">
                                                <Title order={4} className="font-black text-slate-800 tracking-tight whitespace-nowrap">
                                                    {activeCategory.label}
                                                </Title>
                                                <Badge variant="light" color={activeCategory.color} size="sm" radius="md">
                                                    Dynamic
                                                </Badge>
                                                <Text c="dimmed" fw={600} size="xs" className="hidden border-l border-slate-200 pl-3 sm:block">
                                                    Manage your {activeCategory.label.toLowerCase()} definitions and hierarchy
                                                </Text>
                                            </Group>
                                        </Group>
                                    </div>
                                </Paper>
                            )}

                            <Paper p="xl" radius="2rem" className="bg-white shadow-2xl shadow-slate-200/60 border border-slate-100/50">
                                {loading ? (
                                    <Stack gap="xs">
                                        {[1, 2, 3].map(i => (
                                            <Skeleton key={i} height={80} radius="xl" />
                                        ))}
                                    </Stack>
                                ) : lookups.length > 0 ? (
                                    <LookupTree
                                        data={lookups}
                                        onEdit={(item) => setEditItem(item)}
                                        onDelete={() => loadData()}
                                        onAddChild={(node) => setEditItem({
                                            parentId: node.id,
                                            lookupCategory: category || '',
                                            isActive: true,
                                            level: 2
                                        })}
                                    />
                                ) : (
                                    <Paper className="border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center" radius="2xl">
                                        <Database size={48} className="text-slate-200 mx-auto mb-4" />
                                        <Text fw={700} c="dimmed">No entries found in this category</Text>
                                        <Button
                                            variant="light"
                                            radius="xl"
                                            mt="md"
                                            onClick={() => setEditItem({ lookupCategory: category || '', isActive: true, level: 1 })}
                                        >
                                            Create Foundation Entry
                                        </Button>
                                    </Paper>
                                )}
                            </Paper>
                        </div>
                    </Box>
                </div>

                {/* Professional Card Footer - Refined Spacing */}
                <Box px="lg" pb="md" pt="xs" className="z-20">
                    <Paper p="md" radius="xl" className="border border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm">
                        <Group justify="space-between" px="md">
                            <Group gap="xl">
                                <Group gap={8}>
                                    <div className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                    </div>
                                    <Text size="xs" fw={800} className="text-slate-500 uppercase tracking-[0.15em] text-[9px]">
                                        System Operational
                                    </Text>
                                </Group>

                                <Group gap="xs">
                                    <Box className="bg-slate-100/80 px-3 py-1 rounded-lg border border-slate-200/50">
                                        <Text size="xs" fw={800} className="text-[#0C7C92] font-mono text-[10px] tracking-tight">
                                            TOTAL NODES: {lookups.length}
                                        </Text>
                                    </Box>
                                    <Text size="xs" fw={700} c="dimmed" className="italic text-[10px] opacity-70">
                                        Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </Group>
                            </Group>

                            <Group gap="md">
                                <Text size="xs" fw={800} className="text-slate-400 tracking-[-0.02em] text-[11px] hidden md:block">
                                    TMS <span className="text-slate-200 ml-1 mr-1">|</span> LOOKUPS ENGINE <span className="text-slate-300">v2.1</span>
                                </Text>
                                <Box className="bg-white/50 px-3 py-1 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                                    <Sparkles size={10} className="text-cyan-500" fill="currentColor" />
                                    <Text size="xs" fw={900} variant="gradient" gradient={{ from: 'slate.700', to: 'slate.900' }} className="text-[9px] uppercase tracking-wider">
                                        Premium Access
                                    </Text>
                                </Box>
                            </Group>
                        </Group>
                    </Paper>
                </Box>

                <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 7px;
                    height: 7px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(241, 245, 249, 0.5);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #0C7C92 0%, #1098AD 100%);
                    border-radius: 10px;
                    border: 2px solid rgba(241, 245, 249, 0.5);
                    background-clip: padding-box;
                    transition: all 0.2s ease;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #1098AD;
                    border: 1px solid rgba(241, 245, 249, 0.5);
                }
                
                @keyframes renderIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-render {
                    animation: renderIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-fade-in-delayed {
                    animation: fadeIn 0.6s ease-out 0.3s both;
                }
            `}</style>
            </div>

            {/* Modal - Rendered via Portal to body to escape any layout constraints/clipping */}
            {mounted && createPortal(
                <Modal
                    isOpen={!!editItem}
                    onClose={() => setEditItem(null)}
                    title="Manage Entry"
                    description="System Lookup Configuration"
                    size="lg"
                    footer={
                        <Group justify="flex-end" gap="md">
                            <Button
                                variant="subtle"
                                color="gray"
                                onClick={() => setEditItem(null)}
                                leftSection={<X size={18} />}
                                radius="xl"
                                size="md"
                                className="hover:bg-gray-200/50 text-gray-700 font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="filled"
                                bg="#0C7C92"
                                onClick={() => {
                                    document.getElementById('lookup-form')?.dispatchEvent(
                                        new Event('submit', { cancelable: true, bubbles: true })
                                    );
                                }}
                                disabled={!isFormValid}
                                leftSection={<Save size={18} />}
                                radius="xl"
                                size="md"
                                className={`shadow-lg shadow-teal-100 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Save Entry
                            </Button>
                        </Group>
                    }
                >
                    <LookupForm
                        initialData={editItem || {}}
                        onSubmit={async (data) => {
                            // Sanitize data: Remove fields not allowed by Create/UpdateLookupDto
                            const { id, children, createdAt, updatedAt, ...sanitizedData } = data as any;

                            // Ensure parentId is either a number or undefined (not null) for strict DTOs
                            if (sanitizedData.parentId === null) {
                                delete sanitizedData.parentId;
                            }

                            if (editItem?.id) await lookupsService.update(editItem.id, sanitizedData);
                            else await lookupsService.create(sanitizedData);

                            setEditItem(null);
                            loadData();
                            if (category === 'CAT_CONFIG') {
                                loadCategories();
                            }
                        }}
                        onValidityChange={setIsFormValid}
                    />
                </Modal>,
                document.body
            )}
        </>
    );
}
