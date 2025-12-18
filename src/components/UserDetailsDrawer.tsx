'use client';

import { useState, useEffect } from 'react';
import { usersService, type User } from '@/services/users.service';
import { rolesService, type Role } from '@/services/roles.service';
import { toast } from '@/components/Toast';

interface UserDetailsDrawerProps {
    userId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

type Tab = 'overview' | 'roles' | 'permissions' | 'claims';

export function UserDetailsDrawer({ userId, isOpen, onClose, onUpdate }: UserDetailsDrawerProps) {
    const [user, setUser] = useState<User | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ username: '', email: '', isActive: true });

    useEffect(() => {
        if (userId && isOpen) {
            fetchUserDetails();
            fetchRoles();
        }
    }, [userId, isOpen]);

    const fetchUserDetails = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const data = await usersService.getOne(userId);
            setUser(data);
            setEditForm({
                username: data.username,
                email: data.email,
                isActive: data.isActive ?? true
            });
        } catch (error: any) {
            toast.error('Failed to load user details');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const data = await rolesService.getAll();
            setRoles(data);
        } catch (error) {
            console.error('Failed to load roles');
        }
    };

    const handleSaveEdit = async () => {
        if (!user) return;
        try {
            await usersService.update(user.id, editForm);
            toast.success('User updated successfully');
            setIsEditing(false);
            fetchUserDetails();
            onUpdate();
        } catch (error: any) {
            toast.error('Failed to update user');
        }
    };

    const handleRemoveRole = async (roleId: number) => {
        if (!user) return;
        try {
            const newRoleIds = user.roles?.filter(r => r.id !== roleId).map(r => r.id) || [];
            await usersService.assignRoles(user.id, newRoleIds);
            toast.success('Role removed successfully');
            fetchUserDetails();
            onUpdate();
        } catch (error: any) {
            toast.error('Failed to remove role');
        }
    };

    const handleAddRole = async (roleId: number) => {
        if (!user) return;
        try {
            const currentRoleIds = user.roles?.map(r => r.id) || [];
            await usersService.assignRoles(user.id, [...currentRoleIds, roleId]);
            toast.success('Role added successfully');
            fetchUserDetails();
            onUpdate();
        } catch (error: any) {
            toast.error('Failed to add role');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : user ? (
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <h2 className="text-2xl font-bold text-white">User Details</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* User Avatar & Basic Info */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                                    {user.username.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="text-white">
                                    <h3 className="text-2xl font-bold">{user.username}</h3>
                                    <p className="text-blue-100">{user.email}</p>
                                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-500' : 'bg-red-500'
                                        }`}>
                                        {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 bg-gray-50">
                            <nav className="flex gap-1 px-6">
                                {[
                                    { id: 'overview', label: 'Overview', icon: '👤' },
                                    { id: 'roles', label: 'Roles', icon: '🎭' },
                                    { id: 'permissions', label: 'Permissions', icon: '🔐' },
                                    { id: 'claims', label: 'Claims', icon: '🏷️' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as Tab)}
                                        className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === tab.id
                                            ? 'border-primary-600 text-primary-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <span className="mr-2">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-gray-900">User Information</h3>
                                        {!isEditing ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                                <input
                                                    type="text"
                                                    value={editForm.username}
                                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                                <select
                                                    value={editForm.isActive ? 'active' : 'inactive'}
                                                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'active' })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Stats Cards */}
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                                    <div className="text-2xl font-bold text-blue-900">{user.roles?.length || 0}</div>
                                                    <div className="text-sm text-primary-700">Roles</div>
                                                </div>
                                                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                                    <div className="text-2xl font-bold text-green-900">
                                                        {user.roles?.reduce((acc, role) => acc + (role.permissions?.length || 0), 0) || 0}
                                                    </div>
                                                    <div className="text-sm text-green-700">Permissions</div>
                                                </div>
                                                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                                    <div className="text-2xl font-bold text-purple-900">{user.claims?.length || 0}</div>
                                                    <div className="text-sm text-purple-700">Claims</div>
                                                </div>
                                            </div>

                                            {/* User Details */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <InfoItem label="User ID" value={`#${user.id}`} />
                                                <InfoItem label="Status" value={user.isActive ? 'Active' : 'Inactive'} />
                                                <InfoItem label="Username" value={user.username} />
                                                <InfoItem label="Email" value={user.email} />
                                                <InfoItem label="Created" value={new Date(user.createdAt).toLocaleString()} />
                                                <InfoItem label="Last Updated" value={user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'} />
                                            </div>

                                            {/* Quick Role Summary */}
                                            {user.roles && user.roles.length > 0 && (
                                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="text-sm font-semibold text-gray-700 mb-2">Quick Role Summary</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {user.roles.map(role => (
                                                            <span
                                                                key={role.id}
                                                                className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                                                            >
                                                                {role.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === 'roles' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Assigned Roles</h3>
                                    <div className="space-y-3">
                                        {user.roles?.map(role => (
                                            <div key={role.id} className="p-4 bg-primary-50 rounded-lg border border-blue-200">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900">{role.name}</div>
                                                        {role.description && (
                                                            <div className="text-sm text-gray-600 mt-1">{role.description}</div>
                                                        )}
                                                        {role.permissions && role.permissions.length > 0 && (
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <span className="text-xs text-gray-600">
                                                                    {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveRole(role.id)}
                                                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex-shrink-0"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!user.roles || user.roles.length === 0) && (
                                            <p className="text-gray-500 text-sm py-4 text-center">No roles assigned</p>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Role</h4>
                                        <div className="space-y-2">
                                            {roles
                                                .filter(r => !user.roles?.find(ur => ur.id === r.id))
                                                .map(role => (
                                                    <button
                                                        key={role.id}
                                                        onClick={() => handleAddRole(role.id)}
                                                        className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-primary-50 hover:border-blue-300 border border-gray-200 transition-colors"
                                                    >
                                                        <div className="font-medium text-gray-900">{role.name}</div>
                                                        <div className="text-sm text-gray-600">{role.description}</div>
                                                    </button>
                                                ))}
                                            {roles.filter(r => !user.roles?.find(ur => ur.id === r.id)).length === 0 && (
                                                <p className="text-gray-500 text-sm py-4 text-center">All roles assigned</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'permissions' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Effective Permissions</h3>
                                    <p className="text-sm text-gray-600">Permissions inherited from assigned roles:</p>

                                    {user.roles && user.roles.length > 0 ? (
                                        <div className="space-y-4">
                                            {user.roles.map(role => (
                                                role.permissions && role.permissions.length > 0 && (
                                                    <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                            </svg>
                                                            <h4 className="font-semibold text-gray-900">From: {role.name}</h4>
                                                            <span className="ml-auto px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                                                                {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {role.permissions.map(perm => (
                                                                <div key={perm.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-medium text-gray-900">{perm.name}</div>
                                                                        {perm.description && (
                                                                            <div className="text-sm text-gray-600 mt-0.5">{perm.description}</div>
                                                                        )}
                                                                        {perm.groupName && (
                                                                            <div className="mt-1">
                                                                                <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                                                                                    {perm.groupName}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm py-8 text-center">No permissions (no roles assigned)</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'claims' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">User Claims</h3>
                                    <p className="text-sm text-gray-600">
                                        Claims provide additional key-value attributes for user authorization
                                    </p>

                                    {/* Existing Claims */}
                                    <div className="space-y-2">
                                        {user.claims && user.claims.length > 0 ? (
                                            user.claims.map(claim => (
                                                <div key={claim.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                            </svg>
                                                            <span className="font-medium text-gray-900">{claim.claimType}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 ml-6">{claim.claimValue}</div>
                                                    </div>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await usersService.removeClaim(user.id, claim.id);
                                                                toast.success('Claim removed successfully');
                                                                fetchUserDetails();
                                                                onUpdate();
                                                            } catch (error: any) {
                                                                toast.error('Failed to remove claim');
                                                            }
                                                        }}
                                                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex-shrink-0"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm py-4 text-center">No claims assigned</p>
                                        )}
                                    </div>

                                    {/* Add New Claim Form */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Add New Claim</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Claim Type</label>
                                                <input
                                                    type="text"
                                                    id="claim-type"
                                                    placeholder="e.g., Department"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Claim Value</label>
                                                <input
                                                    type="text"
                                                    id="claim-value"
                                                    placeholder="e.g., Engineering"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                const typeInput = document.getElementById('claim-type') as HTMLInputElement;
                                                const valueInput = document.getElementById('claim-value') as HTMLInputElement;
                                                const claimType = typeInput?.value?.trim();
                                                const claimValue = valueInput?.value?.trim();

                                                if (!claimType || !claimValue) {
                                                    toast.error('Both claim type and value are required');
                                                    return;
                                                }

                                                try {
                                                    await usersService.addClaim(user.id, claimType, claimValue);
                                                    toast.success('Claim added successfully');
                                                    if (typeInput) typeInput.value = '';
                                                    if (valueInput) valueInput.value = '';
                                                    fetchUserDetails();
                                                    onUpdate();
                                                } catch (error: any) {
                                                    toast.error('Failed to add claim');
                                                }
                                            }}
                                            className="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                                        >
                                            Add Claim
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="font-semibold text-gray-900">{value}</div>
        </div>
    );
}
