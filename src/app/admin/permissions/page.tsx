'use client';

import { useEffect, useState } from 'react';
import { permissionsService, type Permission, type CreatePermissionData } from '@/services/permissions.service';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from '@/components/Toast';
import { PermissionGate } from '@/components/PermissionGate';

export default function AdminPermissionsPage() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    // Selected permission
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

    // Expanded groups
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await permissionsService.getAll();
            setPermissions(data);
            // Expand all groups by default
            const groups = new Set(data.map(p => p.groupName || 'Other'));
            setExpandedGroups(groups);
        } catch (error: any) {
            toast.error('Failed to load permissions: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredPermissions = permissions.filter(perm =>
        perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.groupName.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const groupColors: Record<string, string> = {
        'User': 'from-blue-500 to-cyan-500',
        'Role': 'from-purple-500 to-pink-500',
        'Permission': 'from-green-500 to-teal-500',
        'Booking': 'from-orange-500 to-red-500',
        'Other': 'from-gray-500 to-gray-600'
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gradient">Permissions Management</h1>
                    <p className="text-gray-600 mt-2">Define and organize system permissions</p>
                </div>
                <PermissionGate permission="Permission.Create">
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Permission
                    </button>
                </PermissionGate>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
                            <p className="text-sm text-gray-600">Total Permissions</p>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{Object.keys(groupedPermissions).length}</p>
                            <p className="text-sm text-gray-600">Permission Groups</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card">
                <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search permissions..."
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Grouped Permissions */}
            <div className="space-y-4">
                {Object.keys(groupedPermissions).length === 0 ? (
                    <div className="card text-center p-8 text-gray-500">
                        No permissions found
                    </div>
                ) : (
                    Object.entries(groupedPermissions).sort(([a], [b]) => a.localeCompare(b)).map(([group, perms]) => {
                        const isExpanded = expandedGroups.has(group);
                        const colorClass = groupColors[group] || groupColors['Other'];

                        return (
                            <div key={group} className="card overflow-hidden">
                                {/* Group Header */}
                                <button
                                    onClick={() => toggleGroup(group)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 bg-gradient-to-r ${colorClass} rounded-lg`}>
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-xl font-semibold text-gray-900">{group}</h2>
                                            <p className="text-sm text-gray-600">{perms.length} permission{perms.length !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <svg
                                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Permissions List */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                                            {perms.map((perm) => (
                                                <div
                                                    key={perm.id}
                                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all bg-white"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-gray-900 mb-1">{perm.name}</h3>
                                                            <p className="text-sm text-gray-600">{perm.description}</p>
                                                        </div>
                                                        <PermissionGate permission="Permission.Create">
                                                            <div className="flex gap-1 ml-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedPermission(perm);
                                                                        setEditModalOpen(true);
                                                                    }}
                                                                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedPermission(perm);
                                                                        setDeleteConfirmOpen(true);
                                                                    }}
                                                                    className="p-1.5 hover:bg-red-50 rounded transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </PermissionGate>
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        ID: {perm.id}
                                                    </div>
                                                </div>
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
        </div>
    );
}

// Create Permission Modal Component
function CreatePermissionModal({ isOpen, onClose, onSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
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
                />

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
function EditPermissionModal({ isOpen, permission, onClose, onSuccess }: {
    isOpen: boolean;
    permission: Permission;
    onClose: () => void;
    onSuccess: () => void;
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
                />

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
