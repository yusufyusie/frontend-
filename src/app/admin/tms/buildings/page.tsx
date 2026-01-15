'use client';

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Building2, Layers, Home, Eye, Edit, Trash2 } from 'lucide-react';
import { buildingsService, Building } from '../../../../services/buildings.service';
import { BuildingForm } from '../../../../components/organisms/tms/BuildingForm';
import { Modal } from '@/components/Modal';
import { toast } from '@/components/Toast';
import Link from 'next/link';

export default function BuildingsPage() {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [opened, setOpened] = useState(false);
    const [metrics, setMetrics] = useState({
        totalBuildings: 0,
        totalFloors: 0,
        totalRooms: 0,
        occupancyRate: 0
    });

    const fetchBuildings = async () => {
        setIsLoading(true);
        try {
            const response: any = await buildingsService.getAll();
            const data = response.data || response;
            setBuildings(data);

            // Calculate metrics
            let totalFloors = 0;
            let totalRooms = 0;
            data.forEach((b: any) => {
                totalFloors += b._count?.floors || 0;
                totalRooms += b.floors?.reduce((sum: number, f: any) => sum + (f._count?.rooms || 0), 0) || 0;
            });

            setMetrics({
                totalBuildings: data.length,
                totalFloors,
                totalRooms,
                occupancyRate: 78 // Mock - calculate from real data
            });
        } catch (error) {
            toast.error('Failed to fetch buildings');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBuildings();
    }, []);

    const handleCreate = async (data: Partial<Building>) => {
        setIsLoading(true);
        try {
            await buildingsService.create(data);
            toast.success('✅ Building created successfully');
            setOpened(false);
            fetchBuildings();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Creation failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('⚠️ Delete this building? This will remove all associated floors and rooms.')) {
            try {
                await buildingsService.delete(id);
                toast.success('Building deleted');
                fetchBuildings();
            } catch (error) {
                toast.error('Delete failed');
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-primary">Building Catalog</h1>
                    <p className="text-gray-500 mt-1">Physical infrastructure management and floor planning</p>
                </div>
                <button
                    onClick={() => setOpened(true)}
                    className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Building</span>
                </button>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Buildings</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{metrics.totalBuildings}</p>
                        </div>
                        <Building2 className="w-10 h-10 text-primary/20" />
                    </div>
                </div>
                <div className="card p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Floors</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{metrics.totalFloors}</p>
                        </div>
                        <Layers className="w-10 h-10 text-cyan-500/20" />
                    </div>
                </div>
                <div className="card p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Rooms</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{metrics.totalRooms}</p>
                        </div>
                        <Home className="w-10 h-10 text-success/20" />
                    </div>
                </div>
                <div className="card p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Occupancy Rate</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{metrics.occupancyRate}%</p>
                        </div>
                        <Home className="w-10 h-10 text-warning/20" />
                    </div>
                </div>
            </div>

            {/* Buildings Table */}
            <div className="card p-0 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Building Info</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Code</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Floors</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rooms</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {buildings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-12 text-gray-400 italic">
                                        No buildings registered yet.
                                    </td>
                                </tr>
                            ) : (
                                buildings.map((building) => (
                                    <tr key={building.id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 leading-tight">{building.nameEn}</div>
                                                    <div className="text-[10px] font-mono text-gray-400 mt-0.5">ID: {building.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100 uppercase tracking-tighter">
                                                {building.code}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm font-bold text-gray-900">
                                                {building.totalFloors || 0}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm font-bold text-gray-900">
                                                {(building as any)._count?.rooms || 0}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-0.5 rounded bg-green-50 text-green-600 text-[10px] font-bold">
                                                {(building as any).buildingType?.lookupValue?.en || 'Operational'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={`/admin/tms/buildings/${building.id}`}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                                                    title="Edit Building"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(building.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Building"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Branded Modal */}
            <Modal
                isOpen={opened}
                onClose={() => setOpened(false)}
                title="Register New Building"
                description="Infrastructure Management"
                size="lg"
            >
                <BuildingForm onSubmit={handleCreate} isLoading={isLoading} />
            </Modal>
        </div>
    );
}
