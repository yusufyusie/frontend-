'use client';

import { useEffect, useState } from 'react';
import { permissionsService, type Permission, type CreatePermissionData, type PermissionStats } from '@/services/permissions.service';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from '@/components/Toast';
import { PermissionGate } from '@/components/PermissionGate';
import { PermissionCard } from '@/components/PermissionCard';
import { PermissionBulkActions } from '@/components/PermissionBulkActions';
import { getGradientStyle } from '@/utils/color-generator';

export default function AdminPermissionsPage() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [stats, setStats] = useState<PermissionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'name' | 'usage' | 'date'>('name');

    // Modals
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
    const [moveGroupModalOpen, setMoveGroupModalOpen] = useState(false);

    // Selected items
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [newGroupName, setNewGroupName] = useState('');

    // Expanded groups
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [permData, statsData] = await Promise.all([
                permissionsService.getAll(),
                permissionsService.getStats(),
            ]);
            setPermissions(permData);
            setStats(statsData);
            // Expand all groups by default
            const groups = new Set(permData.map(p => p.groupName || 'Other'));
            setExpandedGroups(groups);
        } catch (error: any) {
            toast.error('Failed to load permissions: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort permissions
    const filteredPermissions = permissions
        .filter(perm => {
            const matchesSearch =
                perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                perm.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                perm.groupName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesGroup = selectedGroup === 'all' || perm.groupName === selectedGroup;

            return matchesSearch && matchesGroup;
        })
        .sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortBy === 'usage') {
                const aCount = a._count?.rolePermissions || 0;
                const bCount = b._count?.rolePermissions || 0;
                return bCount - aCount;
            } else {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

    const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
        const group = perm.groupName || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(perm);
        return acc;
    }, {} as Record<string, Permission[]>);

    const toggleGroup = (group: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(group)) {
            newExpanded.delete(group);
        } else {
            newExpanded.add(group);
        }
        setExpandedGroups(newExpanded);
    };

    const handleSelectPermission = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = () => {
        setSelectedIds(new Set(filteredPermissions.map(p => p.id)));
    };

    const handleDeselectAll = () => {
        setSelectedIds(new Set());
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;

        try {
            const result = await permissionsService.bulkDelete(Array.from(selectedIds));
            toast.success(result.message);
            setSelectedIds(new Set());
            setBulkDeleteConfirmOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error('Failed to delete permissions: ' + error.message);
        }
    };

    const handleBulkMoveGroup = async () => {
        if (selectedIds.size === 0 || !newGroupName) return;

        try {
            const result = await permissionsService.bulkUpdateGroup(Array.from(selectedIds), newGroupName);
            toast.success(result.message);
            setSelectedIds(new Set());
            setMoveGroupModalOpen(false);
            setNewGroupName('');
            fetchData();
        } catch (error: any) {
            toast.error('Failed to move permissions: ' + error.message);
        }
    };

    const handleDeletePermission = async () => {
        if (!selectedPermission) return;
        try {
            await permissionsService.delete(selectedPermission.id);
            toast.success(`Permission "${selectedPermission.name}" deleted successfully`);
            fetchData();
        } catch (error: any) {
            toast.error('Failed to delete permission: ' + error.message);
        }
    };

    const handleExport = async () => {
        try {
            const data = await permissionsService.exportPermissions();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `permissions-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Permissions exported successfully');
        } catch (error: any) {
            toast.error('Failed to export permissions: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const uniqueGroups = Array.from(new Set(permissions.map(p => p.groupName)));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-gradient">Permissions Management</h1>
                    <p className="text-gray-600 mt-2">Define and organize system permissions dynamically</p>
                </div>
                <PermissionGate permission="Permission.Create">
                    <div className="flex gap-2">
                        <button
                            onClick={handleExport}
                            className="btn btn-secondary flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export
                        </button>
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Permission
                        </button>
                    </div>
                </PermissionGate>
            </div>

            {/* Enhanced Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalPermissions}</p>
                                <p className="text-sm text-gray-600">Total Permissions</p>
                            </div>
                        </div>
                    </div>

                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalGroups}</p>
                                <p className="text-sm text-gray-600">Permission Groups</p>
                            </div>
                        </div>
                    </div>

                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.recentlyCreated}</p>
                                <p className="text-sm text-gray-600">Added This Week</p>
                            </div>
                        </div>
                    </div>

                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{selectedIds.size}</p>
                                <p className="text-sm text-gray-600">Selected Items</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Actions */}
            <PermissionBulkActions
                selectedCount={selectedIds.size}
                totalCount={filteredPermissions.length}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onBulkDelete={() => setBulkDeleteConfirmOpen(true)}
                onBulkMoveGroup={() => setMoveGroupModalOpen(true)}
            />

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative col-span-2">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search permissions by name, description, or group..."
                            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        />
                    </div>

                    {/* Group Filter */}
                    <div className="flex gap-2">
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        >
                            <option value="all">All Groups</option>
                            {uniqueGroups.map(group => (
                                <option key={group} value={group}>{group}</option>
                            ))}
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="usage">Sort by Usage</option>
                            <option value="date">Sort by Date</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grouped Permissions */}
            <div className="space-y-4">
                {Object.keys(groupedPermissions).length === 0 ? (
                    <div className="card text-center p-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-gray-500 text-lg">No permissions found matching your criteria</p>
                    </div>
                ) : (
                    Object.entries(groupedPermissions).sort(([a], [b]) => a.localeCompare(b)).map(([group, perms]) => {
                        const isExpanded = expandedGroups.has(group);

                        return (
                            <div key={group} className="card overflow-hidden">
                                {/* Group Header */}
                                <button
                                    onClick={() => toggleGroup(group)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="p-3 rounded-xl shadow-md"
                                            style={getGradientStyle(group)}
                                        >
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-2xl font-bold text-gray-900">{group}</h2>
                                            <p className="text-sm text-gray-600 mt-0.5">{perms.length} permission{perms.length !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <svg
                                        className={`w-6 h-6 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Permissions Grid */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {perms.map((perm) => (
                                                <PermissionCard
                                                    key={perm.id}
                                                    permission={perm}
                                                    isSelected={selectedIds.has(perm.id)}
                                                    onSelect={handleSelectPermission}
                                                    onEdit={() => {
                                                        setSelectedPermission(perm);
                                                        setEditModalOpen(true);
                                                    }}
                                                    onDelete={() => {
                                                        setSelectedPermission(perm);
                                                        setDeleteConfirmOpen(true);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modals */}
            <CreatePermissionModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={() => {
                    setCreateModalOpen(false);
                    fetchData();
                }}
                existingGroups={uniqueGroups}
            />

            {selectedPermission && (
                <EditPermissionModal
                    isOpen={editModalOpen}
                    permission={selectedPermission}
                    onClose={() => setEditModalOpen(false)}
                    onSuccess={() => {
                        setEditModalOpen(false);
                        fetchData();
                    }}
                    existingGroups={uniqueGroups}
                />
            )}

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDeletePermission}
                title="Delete Permission"
                message={`Are you sure you want to delete permission "${selectedPermission?.name}"? This will remove it from all roles.`}
                confirmText="Delete"
                type="danger"
            />

            <ConfirmDialog
                isOpen={bulkDeleteConfirmOpen}
                onClose={() => setBulkDeleteConfirmOpen(false)}
                onConfirm={handleBulkDelete}
                title="Delete Multiple Permissions"
                message={`Are you sure you want to delete ${selectedIds.size} permission(s)? This action cannot be undone.`}
                confirmText="Delete All"
                type="danger"
            />

            {/* Move Group Modal */}
            <Modal
                isOpen={moveGroupModalOpen}
                onClose={() => {
                    setMoveGroupModalOpen(false);
                    setNewGroupName('');
                }}
                title="Move to Group"
            >
                <div className="mb-4">
                    <p className="text-gray-600 mb-4">
                        Move {selectedIds.size} selected permission(s) to a new group:
                    </p>
                    <FormInput
                        label="Group Name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Enter group name..."
                        list="existing-groups"
                    />
                    <datalist id="existing-groups">
                        {uniqueGroups.map(group => (
                            <option key={group} value={group} />
                        ))}
                    </datalist>
                </div>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={() => {
                            setMoveGroupModalOpen(false);
                            setNewGroupName('');
                        }}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleBulkMoveGroup}
                        className="btn btn-primary"
                        disabled={!newGroupName}
                    >
                        Move
                    </button>
                </div>
            </Modal>
        </div>
    );
}

// Create Permission Modal Component
function CreatePermissionModal({ isOpen, onClose, onSuccess, existingGroups }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    existingGroups: string[];
}) {
    const [formData, setFormData] = useState<CreatePermissionData>({
        name: '',
        groupName: '',
        description: ''
    });
    const [errors, setErrors] = useState<Partial<CreatePermissionData>>({});
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const newErrors: Partial<CreatePermissionData> = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.groupName) newErrors.groupName = 'Group is required';
        if (!formData.description) newErrors.description = 'Description is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);
            await permissionsService.create(formData);
            toast.success('Permission created successfully');
            setFormData({ name: '', groupName: '', description: '' });
            onSuccess();
        } catch (error: any) {
            toast.error('Failed to create permission: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Permission">
            <form onSubmit={handleSubmit}>
                <FormInput
                    label="Permission Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    placeholder="e.g., Report.Generate, Invoice.View"
                    required
                    disabled={submitting}
                />

                <FormInput
                    label="Group Name"
                    value={formData.groupName}
                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                    error={errors.groupName}
                    placeholder="e.g., Report, Invoice, User"
                    required
                    disabled={submitting}
                    list="group-suggestions"
                />
                <datalist id="group-suggestions">
                    {existingGroups.map(group => (
                        <option key={group} value={group} />
                    ))}
                </datalist>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe what this permission allows..."
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                        disabled={submitting}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                </div>

                <div className="flex gap-3 justify-end mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Creating...' : 'Create Permission'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// Edit Permission Modal Component
function EditPermissionModal({ isOpen, permission, onClose, onSuccess, existingGroups }: {
    isOpen: boolean;
    permission: Permission;
    onClose: () => void;
    onSuccess: () => void;
    existingGroups: string[];
}) {
    const [formData, setFormData] = useState({
        name: permission.name,
        groupName: permission.groupName,
        description: permission.description
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await permissionsService.update(permission.id, formData);
            toast.success('Permission updated successfully');
            onSuccess();
        } catch (error: any) {
            toast.error('Failed to update permission: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Permission">
            <form onSubmit={handleSubmit}>
                <FormInput
                    label="Permission Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={submitting}
                />

                <FormInput
                    label="Group Name"
                    value={formData.groupName}
                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                    required
                    disabled={submitting}
                    list="edit-group-suggestions"
                />
                <datalist id="edit-group-suggestions">
                    {existingGroups.map(group => (
                        <option key={group} value={group} />
                    ))}
                </datalist>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                        disabled={submitting}
                    />
                </div>

                <div className="flex gap-3 justify-end mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
