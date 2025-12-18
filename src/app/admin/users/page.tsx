'use client';

import { useEffect, useState } from 'react';
import { usersService, type User, type CreateUserData } from '@/services/users.service';
import { rolesService, type Role } from '@/services/roles.service';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import { DynamicSelect } from '@/components/DynamicSelect';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { UserDetailsDrawer } from '@/components/UserDetailsDrawer';
import { toast } from '@/components/Toast';
import { PermissionGate } from '@/components/PermissionGate';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [assignRolesModalOpen, setAssignRolesModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    // User Details Drawer
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Selected user
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, rolesData] = await Promise.all([
                usersService.getAll(),
                rolesService.getAll()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
        } catch (error: any) {
            toast.error('Failed to load data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            await usersService.delete(selectedUser.id);
            toast.success(`User "${selectedUser.username}" deleted successfully`);
            fetchData();
        } catch (error: any) {
            toast.error('Failed to delete user: ' + error.message);
        }
    };

    const handleViewUser = (userId: number) => {
        setSelectedUserId(userId);
        setDrawerOpen(true);
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
                    <h1 className="text-4xl font-bold text-gradient">Users Management</h1>
                    <p className="text-gray-600 mt-2">Manage user accounts, roles, and permissions</p>
                </div>
                <PermissionGate permission="User.Create">
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add User
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
                        placeholder="Search users by name or email..."
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="table-header">
                                <th className="text-left p-4">User</th>
                                <th className="text-left p-4">Email</th>
                                <th className="text-left p-4">Roles</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-left p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="table-row">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-mint-500 flex items-center justify-center text-white font-semibold">
                                                    {user.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{user.username}</div>
                                                    <div className="text-sm text-gray-500">ID: {user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-700">{user.email}</td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {user.roles && user.roles.length > 0 ? (
                                                    user.roles.map(role => (
                                                        <span key={role.id} className="badge badge-info">
                                                            {role.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-400">No roles</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewUser(user.id)}
                                                    className="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                                                    title="View Details"
                                                >
                                                    View
                                                </button>
                                                <PermissionGate permission="User.Edit">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setAssignRolesModalOpen(true);
                                                        }}
                                                        className="px-3 py-1.5 text-sm bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                                                        title="Assign Roles"
                                                    >
                                                        Roles
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setEditModalOpen(true);
                                                        }}
                                                        className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                                        title="Edit User"
                                                    >
                                                        Edit
                                                    </button>
                                                </PermissionGate>
                                                <PermissionGate permission="User.Delete">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setDeleteConfirmOpen(true);
                                                        }}
                                                        className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Delete User"
                                                    >
                                                        Delete
                                                    </button>
                                                </PermissionGate>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <CreateUserModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={() => {
                    setCreateModalOpen(false);
                    fetchData();
                }}
            />

            {selectedUser && (
                <>
                    <EditUserModal
                        isOpen={editModalOpen}
                        user={selectedUser}
                        onClose={() => setEditModalOpen(false)}
                        onSuccess={() => {
                            setEditModalOpen(false);
                            fetchData();
                        }}
                    />

                    <AssignRolesModal
                        isOpen={assignRolesModalOpen}
                        user={selectedUser}
                        roles={roles}
                        onClose={() => setAssignRolesModalOpen(false)}
                        onSuccess={() => {
                            setAssignRolesModalOpen(false);
                            fetchData();
                        }}
                    />
                </>
            )}

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDeleteUser}
                title="Delete User"
                message={`Are you sure you want to delete user "${selectedUser?.username}"? This action cannot be  undone.`}
                confirmText="Delete"
                type="danger"
            />

            {/* User Details Drawer */}
            <UserDetailsDrawer
                userId={selectedUserId}
                isOpen={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setSelectedUserId(null);
                }}
                onUpdate={fetchData}
            />
        </div>
    );
}

// Create User Modal Component
function CreateUserModal({ isOpen, onClose, onSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState<CreateUserData>({
        username: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<Partial<CreateUserData>>({});
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const newErrors: Partial<CreateUserData> = {};
        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);
            await usersService.create(formData);
            toast.success('User created successfully');
            setFormData({ username: '', email: '', password: '' });
            onSuccess();
        } catch (error: any) {
            toast.error('Failed to create user: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New User">
            <form onSubmit={handleSubmit}>
                <FormInput
                    label="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    error={errors.username}
                    required
                    disabled={submitting}
                />

                <FormInput
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    required
                    disabled={submitting}
                />

                <FormInput
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                    required
                    disabled={submitting}
                />

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
                        {submitting ? 'Creating...' : 'Create User'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// Edit User Modal Component
function EditUserModal({ isOpen, user, onClose, onSuccess }: {
    isOpen: boolean;
    user: User;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        username: user.username,
        email: user.email,
        isActive: user.isActive ?? true
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await usersService.update(user.id, formData);
            toast.success('User updated successfully');
            onSuccess();
        } catch (error: any) {
            toast.error('Failed to update user: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit User">
            <form onSubmit={handleSubmit}>
                <FormInput
                    label="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    disabled={submitting}
                />

                <FormInput
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={submitting}
                />

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={formData.isActive ? 'active' : 'inactive'}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        disabled={submitting}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
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

// Assign Roles Modal Component
function AssignRolesModal({ isOpen, user, roles, onClose, onSuccess }: {
    isOpen: boolean;
    user: User;
    roles: Role[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Update selected roles when user changes or modal opens
    useEffect(() => {
        if (isOpen && user.roles) {
            const currentRoleIds = user.roles.map(r => r.id);
            // Roles set for user
            setSelectedRoleIds(currentRoleIds);
        }
    }, [isOpen, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Submitting role assignment
        try {
            setSubmitting(true);
            await usersService.assignRoles(user.id, selectedRoleIds);
            toast.success('Roles assigned successfully');
            onSuccess();
        } catch (error: any) {
            toast.error('Failed to assign roles: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Assign Roles: ${user.username}`} size="xl">
            <form onSubmit={handleSubmit} className="min-h-[400px]">
                <p className="text-sm text-gray-600 mb-4">
                    Select one or more roles to assign to this user. You can search by role name or description.
                </p>

                <DynamicSelect
                    label="Select Roles"
                    options={roles.map(r => ({
                        value: r.id,
                        label: r.name,
                        description: r.description || 'No description available'
                    }))}
                    value={selectedRoleIds}
                    onChange={(value: (string | number)[]) => setSelectedRoleIds(value.map((v: string | number) => Number(v)))}
                    placeholder="Choose one or more roles..."
                    searchable={true}
                    multiple={true}
                />

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
                        {submitting ? 'Saving...' : 'Assign Roles'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
