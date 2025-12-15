'use client';

import { useState, useEffect } from 'react';
import { resourceService, Resource, ResourceStats } from '@/services/resource.service';
import { DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from '@/components/Toast';
import { PermissionGate } from '@/components/PermissionGate';
import { getGradientStyle } from '@/utils/color-generator';
import * as Icons from 'lucide-react';

const availableIcons = ['Package', 'FileText', 'Users', 'ShoppingCart', 'DollarSign', 'Calendar', 'Mail', 'Phone', 'Archive', 'Briefcase', 'Database', 'Server', 'Shield', 'Settings', 'Tool', 'Zap'];

export default function ResourcesPage() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [stats, setStats] = useState<ResourceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Modals
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

    useEffect(() => {
        // Wait a bit for permissions to load to avoid race condition
        const timer = setTimeout(() => {
            fetchData();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resourcesData, statsData] = await Promise.all([
                resourceService.getAll(),
                resourceService.getStats(),
            ]);
            setResources(resourcesData);
            setStats(statsData);
        } catch (error: any) {
            toast.error('Failed to load data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedResource) return;
        try {
            await resourceService.delete(selectedResource.id);
            toast.success(`Resource "${selectedResource.name}" deleted successfully`);
            setDeleteConfirmOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error('Failed to delete resource: ' + error.message);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        try {
            const result = await resourceService.bulkDelete(Array.from(selectedIds));
            toast.success(result.message);
            setSelectedIds(new Set());
            fetchData();
        } catch (error: any) {
            toast.error('Failed to bulk delete: ' + error.message);
        }
    };

    const filteredResources = resources
        .filter(r =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.displayName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(r => !filterCategory || r.category === filterCategory);

    const categories = Array.from(new Set(resources.map(r => r.category || 'Uncategorized')));

    const columns = [
        {
            key: 'select',
            header: (
                <input
                    type="checkbox"
                    checked={selectedIds.size === filteredResources.length && filteredResources.length > 0}
                    onChange={() => selectedIds.size === filteredResources.length
                        ? setSelectedIds(new Set())
                        : setSelectedIds(new Set(filteredResources.map(r => r.id)))}
                    className="w-4 h-4 rounded"
                />
            ),
            render: (resource: Resource) => (
                <input
                    type="checkbox"
                    checked={selectedIds.has(resource.id)}
                    onChange={() => {
                        const newSet = new Set(selectedIds);
                        newSet.has(resource.id) ? newSet.delete(resource.id) : newSet.add(resource.id);
                        setSelectedIds(newSet);
                    }}
                    className="w-4 h-4 rounded"
                />
            ),
        },
        {
            key: 'name',
            header: 'Resource',
            sortable: true,
            render: (resource: Resource) => {
                const Icon = resource.icon ? (Icons as any)[resource.icon] : Icons.Package;
                return (
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg shadow-sm" style={getGradientStyle(resource.name)}>
                            <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">{resource.displayName}</div>
                            <div className="text-xs text-gray-500">{resource.name}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'category',
            header: 'Category',
            sortable: true,
            render: (resource: Resource) => (
                <span className="px-3 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-700">
                    {resource.category || 'Uncategorized'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (resource: Resource) => (
                <div className="text-sm text-gray-700 font-medium">
                    {resource._count?.actions || 0} actions
                </div>
            ),
        },
        {
            key: 'permissions',
            header: 'Permissions',
            render: (resource: Resource) => (
                <div className="text-sm text-gray-700">{resource._count?.permissions || 0}</div>
            ),
        },
        {
            key: 'menus',
            header: 'Menus',
            render: (resource: Resource) => (
                <div className="text-sm text-gray-700">{resource._count?.menus || 0}</div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (resource: Resource) => (
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${resource.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {resource.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {resource.isSystem && (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">System</span>
                    )}
                </div>
            ),
        },
        {
            key: 'edit',
            header: 'Edit',
            render: (resource: Resource) => (
                <PermissionGate permission="Resource.Edit">
                    <div className="flex gap-1">
                        <button
                            onClick={() => {
                                setSelectedResource(resource);
                                setEditModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                            <Icons.Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                setSelectedResource(resource);
                                setDeleteConfirmOpen(true);
                            }}
                            disabled={resource.isSystem}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        >
                            <Icons.Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </PermissionGate>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-gradient">Resources</h1>
                    <p className="text-gray-600 mt-2">Manage framework-level business entities and their actions</p>
                </div>
                <PermissionGate permission="Resource.Create">
                    <button onClick={() => setCreateModalOpen(true)} className="btn btn-primary flex items-center gap-2">
                        <Icons.Plus className="w-5 h-5" /> Add Resource
                    </button>
                </PermissionGate>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                                <Icons.Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalResources}</p>
                                <p className="text-sm text-gray-600">Total Resources</p>
                            </div>
                        </div>
                    </div>
                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl shadow-lg">
                                <Icons.Check className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.activeResources}</p>
                                <p className="text-sm text-gray-600">Active</p>
                            </div>
                        </div>
                    </div>
                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                                <Icons.Zap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalActions}</p>
                                <p className="text-sm text-gray-600">Total Actions</p>
                            </div>
                        </div>
                    </div>
                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                                <Icons.Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{selectedIds.size}</p>
                                <p className="text-sm text-gray-600">Selected</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card p-4 flex gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500"
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                {selectedIds.size > 0 && (
                    <button onClick={handleBulkDelete} className="btn btn-danger">
                        <Icons.Trash2 className="w-5 h-5 mr-2" /> Delete Selected ({selectedIds.size})
                    </button>
                )}
            </div>

            <DataTable data={filteredResources} columns={columns} pageSize={10} />

            <ResourceFormModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={() => {
                    setCreateModalOpen(false);
                    fetchData();
                }}
            />

            {selectedResource && (
                <ResourceFormModal
                    isOpen={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onSuccess={() => {
                        setEditModalOpen(false);
                        fetchData();
                    }}
                    resource={selectedResource}
                />
            )}

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Resource"
                message={`Are you sure you want to delete "${selectedResource?.name}"?`}
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
}

function ResourceFormModal({ isOpen, onClose, onSuccess, resource }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    resource?: Resource;
}) {
    const [formData, setFormData] = useState({
        name: resource?.name || '',
        displayName: resource?.displayName || '',
        description: resource?.description || '',
        category: resource?.category || '',
        icon: resource?.icon || '',
        isActive: resource?.isActive ?? true,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (resource) {
            setFormData({
                name: resource.name,
                displayName: resource.displayName,
                description: resource.description || '',
                category: resource.category || '',
                icon: resource.icon || '',
                isActive: resource.isActive,
            });
        } else {
            setFormData({
                name: '',
                displayName: '',
                description: '',
                category: '',
                icon: '',
                isActive: true,
            });
        }
    }, [resource, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            if (resource) {
                await resourceService.update(resource.id, formData);
                toast.success('Resource updated successfully');
            } else {
                await resourceService.create(formData);
                toast.success('Resource created successfully');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(`Failed to ${resource ? 'update' : 'create'} resource: ` + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={resource ? 'Edit Resource' : 'Create Resource'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label="Name (PascalCase)"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., User, Invoice"
                        required
                        disabled={submitting}
                    />
                    <FormInput
                        label="Display Name"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        placeholder="e.g., User Management"
                        required
                        disabled={submitting}
                    />
                </div>

                <FormInput
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description"
                    disabled={submitting}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label="Category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g., Security, Finance"
                        disabled={submitting}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                        <select
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-500"
                            disabled={submitting}
                        >
                            <option value="">No Icon</option>
                            {availableIcons.map(icon => (
                                <option key={icon} value={icon}>{icon}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded"
                        disabled={submitting}
                    />
                    <span className="text-sm text-gray-700">Active</span>
                </label>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                    <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Saving...' : resource ? 'Update Resource' : 'Create Resource'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
