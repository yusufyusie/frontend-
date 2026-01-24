'use client';

import { useState, useMemo, useEffect, ReactNode } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit, Trash2, Search as SearchIcon, Eye } from 'lucide-react';
import { Badge, Text, Progress } from '@mantine/core';

export interface TreeNode {
    id: string | number;
    label: string;
    icon?: ReactNode;
    badge?: { text: string; color: string };
    children?: TreeNode[];
    meta?: Record<string, any>;
}

interface AdvancedTreeGridProps {
    data: TreeNode[];
    onEdit?: (node: TreeNode) => void;
    onDelete?: (node: TreeNode) => void;
    onAddChild?: (node: TreeNode) => void;
    onViewDetail?: (node: TreeNode) => void;
    searchable?: boolean;
    initialExpandLevel?: number;
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
}

const GRID_LAYOUT = "grid grid-cols-[1fr_220px_140px_140px_120px_130px_160px]";

export function AdvancedTreeGrid({
    data,
    onEdit,
    onDelete,
    onAddChild,
    onViewDetail,
    searchable = true,
    initialExpandLevel = 1,
    searchTerm: externalSearchTerm,
    onSearchChange
}: AdvancedTreeGridProps) {
    const [internalSearchTerm, setInternalSearchTerm] = useState('');
    const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
    const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());

    // Auto-expand initial levels
    useEffect(() => {
        const autoExpandSet = new Set<string | number>();
        const autoExpand = (nodes: TreeNode[], level: number = 0) => {
            nodes.forEach(node => {
                if (level < initialExpandLevel) {
                    autoExpandSet.add(node.id);
                    if (node.children) {
                        autoExpand(node.children, level + 1);
                    }
                }
            });
        };
        autoExpand(data);
        setExpandedIds(autoExpandSet);
    }, [data, initialExpandLevel]);

    const filterTree = (nodes: TreeNode[]): TreeNode[] => {
        if (!searchTerm) return nodes;
        return nodes.reduce((acc, node) => {
            const matches = node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (node.meta?.occupantName?.toLowerCase().includes(searchTerm.toLowerCase()));
            const filteredChildren = node.children ? filterTree(node.children) : [];
            if (matches || filteredChildren.length > 0) {
                acc.push({
                    ...node,
                    children: filteredChildren.length > 0 ? filteredChildren : node.children
                });
                if (filteredChildren.length > 0) {
                    setExpandedIds(prev => new Set(prev).add(node.id));
                }
            }
            return acc;
        }, [] as TreeNode[]);
    };

    const filteredData = useMemo(() => filterTree(data), [data, searchTerm]);

    const toggleExpand = (nodeId: string | number) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) newSet.delete(nodeId);
            else newSet.add(nodeId);
            return newSet;
        });
    };

    const renderNode = (node: TreeNode, level: number = 0) => {
        const isExpanded = expandedIds.has(node.id);
        const hasChildren = node.children && node.children.length > 0;
        const meta = node.meta || {};

        return (
            <div key={node.id} className="last:border-0 border-b border-slate-100/50">
                <div
                    onClick={() => hasChildren && toggleExpand(node.id)}
                    className={`${GRID_LAYOUT} group items-center hover:bg-slate-50 transition-all duration-300 relative cursor-pointer active:bg-slate-100/50`}
                >

                    {/* Active Selection Indicator */}
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#0C7C92] opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-r-full" />

                    {/* Hierarchy Column - Strictly mathematical alignment */}
                    <div
                        className="flex items-center gap-4 py-2.5 px-6 relative"
                        style={{ paddingLeft: `${level * 42 + 24}px` }}
                    >
                        {/* Persistent Systemic Connectors */}
                        {level > 0 && (
                            <>
                                {/* Vertical connector from parent */}
                                <div
                                    className="absolute border-l-[3px] border-slate-200/80"
                                    style={{ left: `${(level - 1) * 42 + 38}px`, top: '-50%', height: '100.5%' }}
                                />
                                {/* Horizontal 'L' bend */}
                                <div
                                    className="absolute border-b-[3px] border-slate-200/80 w-6"
                                    style={{ left: `${(level - 1) * 42 + 38}px`, top: '50%' }}
                                />
                            </>
                        )}

                        <div className="flex items-center gap-3 min-w-0 z-10">
                            {hasChildren ? (
                                <div
                                    className={`
                                        w-7 h-7 flex items-center justify-center rounded-lg transition-all shadow-sm border
                                        ${isExpanded ? 'bg-[#0C7C92] text-white border-[#0C7C92]' : 'bg-white text-slate-600 border-slate-200 group-hover:border-[#0C7C92]'}
                                    `}
                                >
                                    {isExpanded ? <ChevronDown size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
                                </div>
                            ) : (
                                <div className="w-7 flex justify-center">
                                    <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-[#0C7C92]/30 transition-colors" />
                                </div>
                            )}

                            <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 group-hover:border-[#0C7C92]/30 transition-all flex-shrink-0">
                                {node.icon}
                            </div>

                            <div className="flex flex-col min-w-0">
                                <span className="font-extrabold text-[#16284F] text-[14px] leading-tight truncate block">
                                    {node.label}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-widest border border-slate-200/30 leading-none">
                                        {meta.usageType || 'UNIT'}
                                    </span>
                                    {meta.code && (
                                        <span className="text-[8px] font-black text-[#0C7C92]/60 font-mono tracking-tighter leading-none">
                                            #{meta.code}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Occupant Detail */}
                    <div className="px-6 py-2 flex flex-col justify-center border-l border-slate-100/50 h-full min-w-0">
                        <span className="text-[8px] text-[#64748B] font-black uppercase tracking-[0.1em] mb-1">Entity Occupant</span>
                        <div className="flex flex-col gap-1.5">
                            {meta.occupantName === 'v' || !meta.occupantName ? (
                                <Text size="11px" fw={800} c="slate.4" fs="italic" className="tracking-tight leading-none uppercase">Vacant</Text>
                            ) : (
                                <Text size="11px" fw={900} className="text-[#0C7C92] truncate leading-none font-bold uppercase">{meta.occupantName}</Text>
                            )}
                            <Progress
                                value={meta.occupancyStatus === 'Occupied' ? 100 : 0}
                                size="3px"
                                radius="xl"
                                color={meta.occupancyStatus === 'Occupied' ? '#0C7C92' : 'slate.2'}
                                className="shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Physical m² */}
                    <div className="px-6 py-2 border-l border-slate-100/50 text-right h-full flex flex-col justify-center">
                        <span className="text-[8px] text-[#64748B] font-black uppercase tracking-[0.1em] mb-0.5">Gross Area</span>
                        <span className="text-[12px] font-mono font-black text-slate-700 leading-none">
                            {meta.areaM2 ? Number(meta.areaM2).toLocaleString() : '-'} <span className="text-[8px] opacity-40">m²</span>
                        </span>
                    </div>

                    {/* Contract m² */}
                    <div className="px-6 py-2 border-l border-slate-100/50 text-right h-full flex flex-col justify-center bg-slate-50/10">
                        <span className="text-[8px] text-[#64748B] font-black uppercase tracking-[0.1em] mb-0.5">Leased Area</span>
                        <span className="text-[12px] font-mono font-black text-blue-700 leading-none">
                            {meta.contractAreaM2 ? Number(meta.contractAreaM2).toLocaleString() : '0'} <span className="text-[8px] opacity-40">m²</span>
                        </span>
                    </div>

                    {/* Variance */}
                    <div className="px-6 py-2 border-l border-slate-100/50 text-right h-full flex flex-col justify-center">
                        <span className="text-[8px] text-[#64748B] font-black uppercase tracking-[0.1em] mb-0.5">Variance</span>
                        <span className={`text-[12px] font-mono font-black leading-none ${meta.areaVarianceM2 > 0 ? 'text-orange-600' : 'text-slate-900'}`}>
                            {meta.areaVarianceM2 ? (meta.areaVarianceM2 > 0 ? '+' : '') + Number(meta.areaVarianceM2).toLocaleString() : '0'}
                        </span>
                    </div>

                    {/* Live Status */}
                    <div className="px-6 py-2 border-l border-slate-100/50 h-full flex items-center justify-center">
                        {meta.occupancyStatus && (
                            <Badge
                                variant="gradient"
                                gradient={meta.occupancyStatus === 'Occupied' ? { from: '#0C7C92', to: '#1098AD', deg: 45 } : { from: '#94A3B8', to: '#CBD5E1', deg: 45 }}
                                size="sm"
                                radius="xl"
                                fw={900}
                                className={`shadow-sm border-0 text-white`}
                                styles={{
                                    root: {
                                        height: '24px',
                                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    },
                                    label: { fontSize: '9px', letterSpacing: '0.1em', padding: '0 14px' }
                                }}
                            >
                                {meta.occupancyStatus.toUpperCase()}
                            </Badge>
                        )}
                    </div>

                    {/* Actions Panel - Top Smart Icons */}
                    <div className="px-6 py-4 border-l border-slate-100/50 h-full flex items-center justify-end gap-2.5 bg-slate-50/20 group-hover:bg-slate-100/30 transition-all">
                        {onViewDetail && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onViewDetail(node); }}
                                className="w-8 h-8 flex items-center justify-center text-[#16284F] bg-[#16284F]/5 border border-[#16284F]/10 rounded-xl shadow-sm hover:bg-[#16284F] hover:text-white hover:shadow-indigo-100 transition-all duration-300 active:scale-95"
                                title="Organization Intelligence"
                            >
                                <Eye size={14} strokeWidth={2.5} />
                            </button>
                        )}
                        {onAddChild && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onAddChild(node); }}
                                className="w-8 h-8 flex items-center justify-center text-[#0C7C92] bg-[#0C7C92]/5 border border-[#0C7C92]/10 rounded-xl shadow-sm hover:bg-[#0C7C92] hover:text-white hover:shadow-teal-100 transition-all duration-300 active:scale-90"
                                title="Add Architecture Sub-Element"
                            >
                                <Plus size={16} strokeWidth={3} />
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(node); }}
                                className="w-8 h-8 flex items-center justify-center text-blue-600 bg-blue-50 border border-blue-100 rounded-xl shadow-sm hover:bg-blue-500 hover:text-white hover:shadow-blue-100 transition-all duration-300 active:scale-95"
                                title="Edit Configuration"
                            >
                                <Edit size={14} strokeWidth={2.5} />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(node); }}
                                className="w-8 h-8 flex items-center justify-center text-rose-600 bg-rose-50 border border-rose-100 rounded-xl shadow-sm hover:bg-rose-500 hover:text-white hover:shadow-rose-100 transition-all duration-300 active:scale-95"
                                title="Terminal Deletion"
                            >
                                <Trash2 size={14} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Sub-Hierarchy with systemic spacing */}
                {hasChildren && isExpanded && (
                    <div className="relative bg-slate-50/30">
                        {node.children!.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full max-w-full border border-slate-200/60 rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-slate-200/40">
            {/* Scrollable Intelligence Grid */}
            <div className="overflow-x-auto custom-scrollbar w-full">
                <div className="min-w-max">
                    {/* Synchronized Header - Mathematically tied to row layout */}
                    <div className={`${GRID_LAYOUT} bg-[#F8FAFC] border-b border-slate-200 py-6 sticky top-0 z-30`}>
                        <div className="px-6 flex items-center gap-3">
                            <div className="w-1.5 h-5 bg-[#0C7C92] rounded-full shadow-sm shadow-cyan-200" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#16284F]">Asset Tree Infrastructure</span>
                        </div>
                        <div className="px-6 border-l border-slate-200/60 text-[10px] font-black text-[#64748B] uppercase tracking-[0.15em] flex items-center">Occupancy Detail</div>
                        <div className="px-6 border-l border-slate-200/60 text-[10px] font-black text-[#64748B] uppercase tracking-[0.15em] flex items-center justify-end">Physical m²</div>
                        <div className="px-6 border-l border-slate-200/60 text-[10px] font-black text-[#64748B] uppercase tracking-[0.15em] flex items-center justify-end">Contract m²</div>
                        <div className="px-6 border-l border-slate-200/60 text-[10px] font-black text-[#64748B] uppercase tracking-[0.15em] flex items-center justify-end">Variance</div>
                        <div className="px-6 border-l border-slate-200/60 text-[10px] font-black text-[#64748B] uppercase tracking-[0.15em] flex items-center justify-center">Live Status</div>
                        <div className="px-6 border-l border-slate-200/60 text-[10px] font-black text-[#0C7C92] uppercase tracking-[0.15em] flex items-center justify-end">Operations</div>
                    </div>

                    {/* High-Performance Scroller Body */}
                    <div className="max-h-[700px] overflow-y-auto custom-scrollbar-visible bg-white">
                        {filteredData.length > 0 ? (
                            filteredData.map(node => renderNode(node))
                        ) : (
                            <div className="py-40 text-center">
                                <div className="inline-flex p-10 bg-slate-50 rounded-[3rem] shadow-inner mb-8">
                                    <SearchIcon size={64} className="text-slate-200" strokeWidth={1} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Logical Mapping Empty</h3>
                                <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">Try adjusting your filters or search keywords to reveal the infrastructure.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style jsx>{`
                .custom-scrollbar-visible::-webkit-scrollbar {
                    width: 10px;
                }
                .custom-scrollbar-visible::-webkit-scrollbar-track {
                    background: #f8fafc;
                }
                .custom-scrollbar-visible::-webkit-scrollbar-thumb {
                    background: rgba(12, 124, 146, 0.4);
                    border-radius: 20px;
                    border: 3px solid #f8fafc;
                }
                .custom-scrollbar-visible::-webkit-scrollbar-thumb:hover {
                    background: rgba(12, 124, 146, 0.7);
                }
            `}</style>
        </div>
    );
}
