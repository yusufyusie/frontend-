'use client';

import { useEffect, useState } from 'react';
import { rolesService, type Role, type CreateRoleData } from '@/services/roles.service';
import { permissionsService, type Permission } from '@/services/permissions.service';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import { PermissionMatrix } from '@/components/PermissionMatrix';
import { RoleMenuAssignment } from '@/components/RoleMenuAssignment';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from '@/components/Toast';
import { PermissionGate } from '@/components/PermissionGate';

export default function AdminRolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [assignPermissionsModalOpen, setAssignPermissionsModalOpen] = useState(false);
    const [assignMenusModalOpen, setAssignMenusModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    // Selected role
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesData, permissionsData] = await Promise.all([
                rolesService.getAll(),
                permissionsService.getAll()
            ]);
            setRoles(rolesData);
            setPermissions(permissionsData);
        } catch (error: any) {
            toast.error('Failed to load data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gradient">Roles Management</h1>
                    <p className="text-gray-600 mt-2">Define roles and assign permissions</p>
                </div>
                <PermissionGate permission="Role.Create">
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Role
                    </button>
                </PermissionGate>
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
                        placeholder="Search roles..."
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRoles.length === 0 ? (
                    <div className="col-span-full text-center p-8 text-gray-500">
                        No roles found
                    </div>
                ) : (
                    filteredRoles.map((role) => (
                        <div key={role.id} className="card-gradient hover-lift">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{role.name}</h3>
                            <p className="text-gray-600 mb-4 min-h-[48px]">{role.description}</p>

                            <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span>{role._count?.userRoles || 0} users</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span>{role._count?.rolePermissions || 0} permissions</span>
                                </div>
                            </div>

                            <PermissionGate permission="Role.Create">
                                <div className="flex gap-2 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            setSelectedRole(role);
                                            setAssignPermissionsModalOpen(true);
                                        }}
                                        className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                                    >
                                        Permissions
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedRole(role);
                                            setAssignMenusModalOpen(true);
                                        }}
                                        className="flex-1 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium text-sm"
                                    >
                                        Menus
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedRole(role);
                                            setEditModalOpen(true);
                                        }}
                                        className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedRole(role);
                                            setDeleteConfirmOpen(true);
                                        }}
                                        className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </PermissionGate>
                        </div>
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

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDeleteRole}
                title="Delete Role"
                message={`Are you sure you want to delete role "${selectedRole?.name}"? This will remove this role from all assigned users.`}
                confirmText="Delete"
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
    const [submitting, setSubmitting] = useState(false);

    // Update selected permissions when role changes
    useEffect(() => {
        if (role && role.permissions) {
            setSelectedPermissionIds(role.permissions.map(p => p.id));
        } else {
            setSelectedPermissionIds([]);
        }
    }, [role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;

        try {
            setSubmitting(true);
            await rolesService.assignPermissions(role.id, selectedPermissionIds);
            toast.success('Permissions assigned successfully');
            onClose();
            onSuccess();
        } catch (error: any) {
            toast.error('Failed to assign permissions: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Don't render if no role selected
    if (!role) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Assign Permissions: ${role.name}`} size="xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="alert alert-info">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="font-medium">Select permissions for this role</p>
                        <p className="text-sm mt-1 opacity-90">
                            Click checkboxes to select/deselect permissions. Then click "Save Permissions" button below.
                        </p>
                    </div>
                </div>

                {/* Permission Matrix */}
                <PermissionMatrix
                    permissions={permissions}
                    selectedPermissions={selectedPermissionIds}
                    onChange={setSelectedPermissionIds}
                    disabled={submitting}
                />

                {/* Save Buttons - Always Visible */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 bg-white sticky bottom-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Save Permissions
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
