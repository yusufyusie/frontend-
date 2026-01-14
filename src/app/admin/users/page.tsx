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

import { Plus, Search, Eye, Shield, Edit, Trash } from 'lucide-react';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state management
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [assignRolesModalOpen, setAssignRolesModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    // Details drawer state
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Active user selection
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    /**
     * Fetch users and roles for the management interface
     */
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

    /**
     * Handle user deletion confirmation
     */
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

    /**
     * Trigger user details view (drawer)
     */
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
            {/* Page header and primary actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-primary">Users Management</h1>
                    <p className="text-gray-500 mt-1">Directory of all registered user accounts and their system roles.</p>
                </div>
                <PermissionGate permission="User.Create">
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="btn btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add New User</span>
                    </button>
                </PermissionGate>
            </div>

            {/* Search and filter controls */}
            <div className="card p-0 overflow-hidden">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users by name, email, or ID..."
                        className="w-full pl-12 pr-4 py-4 border-none outline-none focus:ring-0 transition-all text-gray-700 bg-transparent"
                    />
                </div>
            </div>

            {/* Main users data table */}
            <div className="card p-0 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identity</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned Roles</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-gray-400 italic">
                                        No matching user records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                                    {user.username.substring(0, 1).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 leading-tight">{user.username}</div>
                                                    <div className="text-[10px] font-mono text-gray-400 mt-0.5">UUID: {user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-gray-600 font-medium">{user.email}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {user.roles && user.roles.length > 0 ? (
                                                    user.roles.map(role => (
                                                        <span key={role.id} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100 uppercase tracking-tighter">
                                                            {role.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-gray-300 italic">No Roles</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleViewUser(user.id)}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                    title="View Profile"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <PermissionGate permission="User.Edit">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setAssignRolesModalOpen(true);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-all"
                                                        title="Manage Roles"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setEditModalOpen(true);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                                                        title="Edit Details"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </PermissionGate>
                                                <PermissionGate permission="User.Delete">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setDeleteConfirmOpen(true);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Terminate Account"
                                                    >
                                                        <Trash className="w-4 h-4" />
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

            {/* Interaction components */}
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
                title="Confirm Account Deletion"
                message={`Are you sure you want to permanently delete the user account for "${selectedUser?.username}"? This action is irreversible.`}
                confirmText="Proceed with Deletion"
                type="danger"
            />

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

/**
 * Interface for modal props
 */
interface ModalCommonProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

/**
 * Modal component for creating fresh user accounts
 */
function CreateUserModal({ isOpen, onClose, onSuccess }: ModalCommonProps) {
    const [formData, setFormData] = useState<CreateUserData>({
        username: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<Partial<CreateUserData>>({});
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const newErrors: Partial<CreateUserData> = {};
        if (!formData.username.trim()) newErrors.username = 'Valid username is required';
        if (!formData.email.trim()) newErrors.email = 'Valid email is required';
        if (!formData.password) newErrors.password = 'Initial password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);
            await usersService.create(formData);
            toast.success('User account provisioned successfully');
            setFormData({ username: '', email: '', password: '' });
            onSuccess();
        } catch (error: any) {
            toast.error('Provisioning failed: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Register New User" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                    label="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    error={errors.username}
                    required
                    disabled={submitting}
                />

                <FormInput
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    required
                    disabled={submitting}
                />

                <FormInput
                    label="Temporary Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                    required
                    disabled={submitting}
                    description="User will be prompted to change this on first login."
                />

                <div className="flex gap-3 justify-end pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary border-none"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary min-w-[120px]"
                        disabled={submitting}
                    >
                        {submitting ? <LoadingSpinner size="sm" /> : 'Register User'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/**
 * Modal component for editing existing user profiles
 */
function EditUserModal({ isOpen, user, onClose, onSuccess }: ModalCommonProps & { user: User }) {
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
            toast.success('User record updated');
            onSuccess();
        } catch (error: any) {
            toast.error('Update failed: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Account: ${user.username}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                    label="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    disabled={submitting}
                />

                <FormInput
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={submitting}
                />

                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Account Lifecycle Status</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isActive: true })}
                            className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${formData.isActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                        >
                            Active
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isActive: false })}
                            className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${!formData.isActive ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                        >
                            Suspended
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary border-none"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary min-w-[120px]"
                        disabled={submitting}
                    >
                        {submitting ? <LoadingSpinner size="sm" /> : 'Apply Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/**
 * Modal component for role assignments
 */
function AssignRolesModal({ isOpen, user, roles, onClose, onSuccess }: ModalCommonProps & { user: User, roles: Role[] }) {
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && user.roles) {
            setSelectedRoleIds(user.roles.map(r => r.id));
        }
    }, [isOpen, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await usersService.assignRoles(user.id, selectedRoleIds);
            toast.success('Roles synchronized successfully');
            onSuccess();
        } catch (error: any) {
            toast.error('Synch failed: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Synchronize Roles: ${user.username}`} size="xl">
            <form onSubmit={handleSubmit} className="min-h-[400px] flex flex-col">
                <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        Specify the system roles this user belongs to. Permissions are inherited dynamically based on role membership.
                    </p>

                    <DynamicSelect
                        label="Identity Roles"
                        options={roles.map(r => ({
                            value: r.id,
                            label: r.name,
                            description: r.description || 'System-defined role'
                        }))}
                        value={selectedRoleIds}
                        onChange={(value: (string | number)[]) => setSelectedRoleIds(value.map((v: string | number) => Number(v)))}
                        placeholder="Choose roles to assign..."
                        searchable={true}
                        multiple={true}
                    />
                </div>

                <div className="flex gap-3 justify-end pt-8 border-t border-gray-50 mt-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary border-none"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary min-w-[140px]"
                        disabled={submitting}
                    >
                        {submitting ? <LoadingSpinner size="sm" /> : 'Synchronize Roles'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
