'use client';

import { useEffect, useState } from 'react';
import { rolesService, type Role, type CreateRoleData, type RoleStats } from '@/services/roles.service';
import { permissionsService, type Permission } from '@/services/permissions.service';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import { PermissionMatrix } from '@/components/PermissionMatrix';
import { RoleMenuAssignment } from '@/components/RoleMenuAssignment';
import { RoleCard } from '@/components/RoleCard';
import { RoleBulkActions } from '@/components/RoleBulkActions';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from '@/components/Toast';
import { PermissionGate } from '@/components/PermissionGate';

export default function AdminRolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [stats, setStats] = useState<RoleStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'users' | 'permissions'>('name');

    // Modals
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [assignPermissionsModalOpen, setAssignPermissionsModalOpen] = useState(false);
    const [bulkAssignPermissionsModalOpen, setBulkAssignPermissionsModalOpen] = useState(false);
    const [assignMenusModalOpen, setAssignMenusModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

    // Selected items
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesData, permissionsData, statsData] = await Promise.all([
                rolesService.getAll(),
                permissionsService.getAll(),
                rolesService.getStats(),
            ]);
            setRoles(rolesData);
            setPermissions(permissionsData);
            setStats(statsData);
        } catch (error: any) {
            toast.error('Failed to load data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort roles
    const filteredRoles = roles
        .filter(role =>
            role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortBy === 'users') {
                const aCount = a._count?.userRoles || 0;
                const bCount = b._count?.userRoles || 0;
                return bCount - aCount;
            } else {
                const aCount = a._count?.rolePermissions || 0;
                const bCount = b._count?.rolePermissions || 0;
                return bCount - aCount;
            }
        });

    const handleSelectRole = (id: number) => {
        const role = roles.find(r => r.id === id);
        if (role?.isSystem) return; // Can't select system roles

        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = () => {
        const nonSystemRoles = filteredRoles.filter(r => !r.isSystem);
        setSelectedIds(new Set(nonSystemRoles.map(r => r.id)));
    };

    const handleDeselectAll = () => {
        setSelectedIds(new Set());
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;

        try {
            const result = await rolesService.bulkDelete(Array.from(selectedIds));
            toast.success(result.message);
            setSelectedIds(new Set());
            setBulkDeleteConfirmOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error('Failed to delete roles: ' + error.message);
        }
    };

    const handleDeleteRole = async () => {
        if (!selectedRole) return;
        try {
            await rolesService.delete(selectedRole.id);
            toast.success(`Role "${selectedRole.name}" deleted successfully`);
            fetchData();
        } catch (error: any) {
            toast.error('Failed to delete role: ' + error.message);
        }
    };

    const handleExport = async () => {
        try {
            const data = await rolesService.exportRoles();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `roles-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Roles exported successfully');
        } catch (error: any) {
            toast.error('Failed to export roles: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-gradient">Roles Management</h1>
                    <p className="text-gray-600 mt-2">Define roles and assign permissions dynamically</p>
                </div>
                <PermissionGate permission="Role.Create">
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
                            Add Role
                        </button>
                    </div>
                </PermissionGate>
            </div>

            {/* Enhanced Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalRoles}</p>
                                <p className="text-sm text-gray-600">Total Roles</p>
                            </div>
                        </div>
                    </div>

                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                                <p className="text-sm text-gray-600">Total Users</p>
                            </div>
                        </div>
                    </div>

                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.averagePermissions}</p>
                                <p className="text-sm text-gray-600">Avg Permissions</p>
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
            <RoleBulkActions
                selectedCount={selectedIds.size}
                totalCount={filteredRoles.filter(r => !r.isSystem).length}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onBulkDelete={() => setBulkDeleteConfirmOpen(true)}
                onBulkAssignPermissions={() => setBulkAssignPermissionsModalOpen(true)}
            />

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search roles by name or description..."
                            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        />
                    </div>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="users">Sort by Users</option>
                        <option value="permissions">Sort by Permissions</option>
                    </select>
                </div>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRoles.length === 0 ? (
                    <div className="col-span-full card text-center p-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-500 text-lg">No roles found matching your criteria</p>
                    </div>
                ) : (
                    filteredRoles.map((role) => (
                        <RoleCard
                            key={role.id}
                            role={role}
                            isSelected={selectedIds.has(role.id)}
                            onSelect={handleSelectRole}
                            onEdit={() => {
                                setSelectedRole(role);
                                setEditModalOpen(true);
                            }}
                            onDelete={() => {
                                setSelectedRole(role);
                                setDeleteConfirmOpen(true);
                            }}
                            onAssignPermissions={() => {
                                setSelectedRole(role);
                                setAssignPermissionsModalOpen(true);
                            }}
                            onAssignMenus={() => {
                                setSelectedRole(role);
                                setAssignMenusModalOpen(true);
                            }}
                        />
                    ))
                )}
            </div>

            {/* Modals */}
            <CreateRoleModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={() => {
                    setCreateModalOpen(false);
                    fetchData();
                }}
            />

            {selectedRole && (
                <>
                    <EditRoleModal
                        isOpen={editModalOpen}
                        role={selectedRole}
                        onClose={() => setEditModalOpen(false)}
                        onSuccess={() => {
                            setEditModalOpen(false);
                            fetchData();
                        }}
                    />

                    <AssignPermissionsModal
                        isOpen={assignPermissionsModalOpen}
                        role={selectedRole}
                        permissions={permissions}
                        onClose={() => setAssignPermissionsModalOpen(false)}
                        onSuccess={() => {
                            setAssignPermissionsModalOpen(false);
                            fetchData();
                        }}
                    />

                    <Modal
                        isOpen={assignMenusModalOpen}
                        onClose={() => setAssignMenusModalOpen(false)}
                        title={`Assign Menus: ${selectedRole.name}`}
                        size="xl"
                    >
                        <RoleMenuAssignment
                            roleId={selectedRole.id}
                            roleName={selectedRole.name}
                        />
                    </Modal>
                </>
            )}

            {/* Bulk Assign Permissions Modal */}
            <BulkAssignPermissionsModal
                isOpen={bulkAssignPermissionsModalOpen}
                selectedRoleIds={Array.from(selectedIds)}
                permissions={permissions}
                onClose={() => setBulkAssignPermissionsModalOpen(false)}
                onSuccess={() => {
                    setBulkAssignPermissionsModalOpen(false);
                    setSelectedIds(new Set());
                    fetchData();
                }}
            />

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDeleteRole}
                title="Delete Role"
                message={`Are you sure you want to delete role "${selectedRole?.name}"? This will remove this role from all assigned users.`}
                confirmText="Delete"
                type="danger"
            />

            <ConfirmDialog
                isOpen={bulkDeleteConfirmOpen}
                onClose={() => setBulkDeleteConfirmOpen(false)}
                onConfirm={handleBulkDelete}
                title="Delete Multiple Roles"
                message={`Are you sure you want to delete ${selectedIds.size} role(s)? This action cannot be undone.`}
                confirmText="Delete All"
                type="danger"
            />
        </div>
    );
}

// Create Role Modal Component
function CreateRoleModal({ isOpen, onClose, onSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState<CreateRoleData>({
        name: '',
        description: ''
    });
    const [errors, setErrors] = useState<Partial<CreateRoleData>>({});
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const newErrors: Partial<CreateRoleData> = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.description) newErrors.description = 'Description is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);
            await rolesService.create(formData);
            toast.success('Role created successfully');
            setFormData({ name: '', description: '' });
            onSuccess();
        } catch (error: any) {
            toast.error('Failed to create role: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Role">
            <form onSubmit={handleSubmit}>
                <FormInput
                    label="Role Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    placeholder="e.g., Manager, Editor, Viewer"
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
                        placeholder="Describe the purpose of this role..."
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
                        {submitting ? 'Creating...' : 'Create Role'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// Edit Role Modal Component
function EditRoleModal({ isOpen, role, onClose, onSuccess }: {
    isOpen: boolean;
    role: Role;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        name: role.name,
        description: role.description
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await rolesService.update(role.id, formData);
            toast.success('Role updated successfully');
            onSuccess();
        } catch (error: any) {
            toast.error('Failed to update role: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Role">
            <form onSubmit={handleSubmit}>
                <FormInput
                    label="Role Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

// Assign Permissions Modal Component with PermissionMatrix
function AssignPermissionsModal({ isOpen, role, permissions, onClose, onSuccess }: {
    isOpen: boolean;
    role: Role | null;
    permissions: Permission[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
    const [initialPermissionIds, setInitialPermissionIds] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (role && role.permissions) {
            const ids = role.permissions.map(p => p.id);
            setSelectedPermissionIds(ids);
            setInitialPermissionIds(ids);
        } else {
            setSelectedPermissionIds([]);
            setInitialPermissionIds([]);
        }
    }, [role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;

        try {
            setSubmitting(true);
            await rolesService.assignPermissions(role.id, selectedPermissionIds);
            toast.success('Permissions assigned successfully');
            setInitialPermissionIds(selectedPermissionIds);
            onClose();
            onSuccess();
        } catch (error: any) {
            toast.error('Failed to assign permissions: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setSelectedPermissionIds(initialPermissionIds);
    };

    // Check if there are changes
    const hasChanges = JSON.stringify([...selectedPermissionIds].sort()) !== JSON.stringify([...initialPermissionIds].sort());

    if (!role) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Assign Permissions: ${role.name}`}
            size="xl"
            footer={hasChanges ? (
                <div className="flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="btn btn-secondary"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="assign-permissions-form"
                        className="btn btn-primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : 'Save Permissions'}
                    </button>
                </div>
            ) : undefined}
        >
            <form id="assign-permissions-form" onSubmit={handleSubmit}>
                <PermissionMatrix
                    permissions={permissions}
                    selectedPermissions={selectedPermissionIds}
                    onChange={setSelectedPermissionIds}
                    disabled={submitting}
                />
            </form>
        </Modal>
    );
}

// Bulk Assign Permissions Modal
function BulkAssignPermissionsModal({ isOpen, selectedRoleIds, permissions, onClose, onSuccess }: {
    isOpen: boolean;
    selectedRoleIds: number[];
    permissions: Permission[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            await rolesService.bulkAssignPermissions(selectedRoleIds, selectedPermissionIds);
            toast.success(`Permissions assigned to ${selectedRoleIds.length} role(s)`);
            onClose();
            onSuccess();
        } catch (error: any) {
            toast.error('Failed to assign permissions: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setSelectedPermissionIds([]);
    };

    // Only show buttons if permissions are selected
    const hasChanges = selectedPermissionIds.length > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Bulk Assign Permissions (${selectedRoleIds.length} roles)`}
            size="xl"
            footer={hasChanges ? (
                <div className="flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="btn btn-secondary"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="bulk-assign-permissions-form"
                        className="btn btn-primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Assigning...' : 'Assign to All'}
                    </button>
                </div>
            ) : undefined}
        >
            <form id="bulk-assign-permissions-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="alert alert-info">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Select permissions to assign to all {selectedRoleIds.length} selected roles. This will replace existing permissions.</p>
                </div>

                <PermissionMatrix
                    permissions={permissions}
                    selectedPermissions={selectedPermissionIds}
                    onChange={setSelectedPermissionIds}
                    disabled={submitting}
                />
            </form>
        </Modal>
    );
}
