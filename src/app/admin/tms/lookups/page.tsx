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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 relative overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <Stack gap="xl" className="relative z-10 p-8 max-w-[1600px] mx-auto">
                {/* Premium Header */}
                <Box>
                    <Group gap="lg" mb="md">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-2xl blur-lg opacity-60"></div>
                            <Box
                                className="relative bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-xl"
                                p="lg"
                            >
                                <Database size={40} className="text-white" strokeWidth={2.5} />
                            </Box>
                        </div>
                        <div>
                            <Group gap="md" align="center">
                                <Title
                                    order={1}
                                    className="text-5xl font-black bg-gradient-to-r from-slate-800 via-teal-700 to-cyan-700 bg-clip-text text-transparent"
                                    style={{ letterSpacing: '-1px' }}
                                >
                                    System Lookups
                                </Title>
                                <Badge
                                    size="lg"
                                    variant="light"
                                    className="bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 border border-teal-200"
                                    leftSection={<Sparkles size={14} />}
                                >
                                    Master Data
                                </Badge>
                            </Group>
                            <Text size="lg" c="dimmed" fw={500} mt={4}>
                                Manage hierarchical metadata and classification systems
                            </Text>
                        </div>
                    </Group>
                </Box>

                {/* Main Content Grid */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Category Navigation Sidebar */}
                    <div className="col-span-12 lg:col-span-3">
                        <div className="sticky top-8">
                            <Paper
                                className="backdrop-blur-xl bg-white/70 border border-white/60 shadow-2xl"
                                radius="xl"
                                p="md"
                            >
                                <Text size="xs" fw={800} tt="uppercase" className="text-slate-500 mb-3 tracking-wider">
                                    Categories
                                </Text>
                                <Stack gap="xs">
                                    {catsLoading ? (
                                        [1, 2, 3, 4, 5].map(i => (
                                            <Skeleton key={i} height={50} radius="lg" />
                                        ))
                                    ) : (
                                        categories.map(cat => {
                                            const isActive = category === cat.value;
                                            const Icon = getIcon(cat.icon);
                                            const colorClass = getColorClass(cat.color);
                                            return (
                                                <Paper
                                                    key={cat.value}
                                                    className={`
                                                        cursor-pointer transition-all duration-300 border
                                                        ${isActive
                                                            ? 'scale-105 shadow-lg bg-gradient-to-r from-[#0C7C92] to-[#0a6c7e] text-white border-transparent'
                                                            : 'hover:scale-102 hover:shadow-md bg-white/50 hover:bg-white/80 border-slate-200'
                                                        }
                                                    `}
                                                    p="md"
                                                    radius="lg"
                                                    onClick={() => setCategory(cat.value)}
                                                >
                                                    <Group gap="sm" wrap="nowrap">
                                                        <Box
                                                            className={`
                                                                rounded-lg p-2 transition-all
                                                                ${isActive ? 'bg-white/20' : 'bg-slate-100'}
                                                            `}
                                                        >
                                                            <Icon
                                                                size={20}
                                                                className={isActive ? 'text-white' : `text-${cat.color}-600`}
                                                                strokeWidth={2.5}
                                                            />
                                                        </Box>
                                                        <Text
                                                            size="sm"
                                                            fw={isActive ? 800 : 600}
                                                            className={isActive ? 'text-white' : 'text-slate-700'}
                                                        >
                                                            {cat.label}
                                                        </Text>
                                                    </Group>
                                                </Paper>
                                            );
                                        })
                                    )}
                                </Stack>
                            </Paper>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="col-span-12 lg:col-span-9">
                        <Paper
                            className="backdrop-blur-xl bg-white/70 border border-white/60 shadow-2xl min-h-[600px]"
                            radius="xl"
                            p="xl"
                        >
                            {/* Category Header */}
                            {activeCategory && (
                                <Group justify="space-between" mb="xl">
                                    <Group gap="md">
                                        <Box className={`bg-gradient-to-br from-[#0C7C92] to-[#0a6c7e] rounded-xl p-3 shadow-lg`}>
                                            {(() => {
                                                const Icon = getIcon(activeCategory.icon);
                                                return <Icon size={28} className="text-white" strokeWidth={2.5} />;
                                            })()}
                                        </Box>
                                        <div>
                                            <Title order={2} fw={800} className="text-slate-800">
                                                {activeCategory.label}
                                            </Title>
                                            <Text size="sm" c="dimmed" fw={500}>
                                                {lookups.length} {lookups.length === 1 ? 'entry' : 'entries'} in this category
                                            </Text>
                                        </div>
                                    </Group>
                                    <Button
                                        size="md"
                                        radius="xl"
                                        className={`bg-gradient-to-r from-[#0C7C92] to-[#0a6c7e] shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95`}
                                        leftSection={<Plus size={18} strokeWidth={2.5} />}
                                        onClick={() => setEditItem({ lookupCategory: category || '', isActive: true, level: 1 })}
                                    >
                                        Add Root Entry
                                    </Button>
                                </Group>
                            )}

                            {/* Content */}
                            <Box className="transition-all duration-500 ease-in-out">
                                {loading ? (
                                    <Stack gap="md">
                                        {[1, 2, 3, 4].map(i => (
                                            <Paper key={i} withBorder p="lg" radius="lg" className="animate-pulse">
                                                <Group gap="md">
                                                    <Skeleton height={40} width={40} radius="md" />
                                                    <div className="flex-1">
                                                        <Skeleton height={16} width="40%" mb={8} radius="md" />
                                                        <Skeleton height={12} width="60%" radius="md" />
                                                    </div>
                                                </Group>
                                            </Paper>
                                        ))}
                                    </Stack>
                                ) : lookups.length > 0 ? (
                                    <div className="animate-fade-in">
                                        <LookupTree
                                            data={lookups}
                                            onEdit={setEditItem}
                                            onDelete={() => { }}
                                            onAddChild={(node) => setEditItem({ parentId: node.id, lookupCategory: category || undefined, isActive: true })}
                                        />
                                    </div>
                                ) : category && (
                                    <Paper
                                        className="border-2 border-dashed border-slate-200 bg-slate-50/50"
                                        p="xl"
                                        radius="xl"
                                    >
                                        <Stack align="center" gap="md">
                                            <Box className="bg-slate-100 rounded-full p-6">
                                                {(() => {
                                                    const Icon = getIcon(activeCategory?.icon);
                                                    return <Icon size={48} className="text-slate-400" strokeWidth={1.5} />;
                                                })()}
                                            </Box>
                                            <div className="text-center">
                                                <Text size="lg" fw={700} c="dimmed" mb={4}>
                                                    No entries found
                                                </Text>
                                                <Text size="sm" c="dimmed">
                                                    Start building your {activeCategory?.label.toLowerCase()} hierarchy
                                                </Text>
                                            </div>
                                            <Button
                                                size="lg"
                                                radius="xl"
                                                variant="light"
                                                className="mt-4"
                                                leftSection={<Plus size={20} />}
                                                onClick={() => setEditItem({ lookupCategory: category || undefined, isActive: true, level: 1 })}
                                            >
                                                Create First Entry
                                            </Button>
                                        </Stack>
                                    </Paper>
                                )}
                            </Box>
                        </Paper>
                    </div>
                </div>
            </Stack>

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

            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .hover\\:scale-102:hover {
                    transform: scale(1.02);
                }
            `}</style>
        </div>
    );
}
