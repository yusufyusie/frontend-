'use client';
// Premium Lookups Management Interface with Glassmorphism

import { useState, useEffect } from 'react';
import { Stack, Group, Text, Box, Title, Paper, ActionIcon, Skeleton, Button, Badge } from '@mantine/core';
import { Map, Layers, Building2, LayoutList, Settings, Info, GitBranch, FileText, Database, Plus, Sparkles, DoorOpen, Coffee } from 'lucide-react';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { LookupTree } from '@/components/organisms/tms/LookupTree';
import { LookupForm } from '@/components/organisms/tms/LookupForm';
import { Modal } from '@/components/Modal';

const ICON_MAP: Record<string, any> = {
    Map, Layers, Building2, LayoutList, Settings, Info, GitBranch, FileText, Database, DoorOpen, Coffee
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
                {/* Compact Category Navigation Sidebar */}
                <Box
                    className="w-fit min-w-[160px] max-w-[240px] border-r border-slate-200 bg-slate-50/50 overflow-y-auto custom-scrollbar"
                    p="xs"
                >
                    <Text size="xs" fw={800} tt="uppercase" className="text-slate-400 mb-3 px-2 tracking-widest whitespace-nowrap" ml={4}>
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
                                                className={isActive ? 'text-white' : `text-${cat.color}-600`}
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

                {/* Content Area with Independent Scroll */}
                <main className="flex-1 overflow-y-auto bg-white/40 p-6 custom-scrollbar animate-fade-in-delayed">
                    {activeCategory && (
                        <Box mb="xl">
                            <Group justify="space-between" align="center" mb="lg">
                                <div>
                                    <Title order={4} fw={800} className="text-slate-800 text-xl flex items-center gap-2">
                                        {activeCategory.label} hierarchy
                                        <Badge size="sm" variant="outline" className="border-slate-200 text-slate-500">
                                            {lookups.length} nodes
                                        </Badge>
                                    </Title>
                                    <Text size="sm" c="dimmed" fw={500}>Viewing classification data for {activeCategory.label}</Text>
                                </div>
                            </Group>

                            {loading ? (
                                <Stack gap="xs">
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} height={80} radius="xl" />
                                    ))}
                                </Stack>
                            ) : lookups.length > 0 ? (
                                <LookupTree
                                    data={lookups}
                                    onEdit={setEditItem}
                                    onDelete={() => { }}
                                    onAddChild={(node) => setEditItem({ parentId: node.id, lookupCategory: category || undefined, isActive: true })}
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
                        </Box>
                    )}
                </main>
            </div>

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
                    from { opacity: 0; transform: scale(0.985) translateY(10px); filter: blur(4px); }
                    to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
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

            {/* Modal */}
            <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Manage Entry">
                <LookupForm
                    initialData={editItem || {}}
                    onSubmit={async (data) => {
                        if (editItem?.id) await lookupsService.update(editItem.id, data);
                        else await lookupsService.create(data);
                        setEditItem(null);
                        loadData();
                    }}
                    onValidityChange={() => { }}
                />
            </Modal>
        </div>
    );
}
