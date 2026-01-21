'use client';

import { useState, useEffect } from 'react';
import { usersService, type User } from '@/services/users.service';
import { rolesService, type Role } from '@/services/roles.service';
import { toast } from '@/components/Toast';
import {
    User as UserIcon,
    Shield,
    Key,
    Tag,
    Edit,
    Save,
    X,
    Trash2,
    Check,
    ShieldCheck,
    UserCircle,
    Info,
    Clock,
    Calendar,
    Mail,
    Hash,
    Activity,
    Plus
} from 'lucide-react';
import React from 'react'; // Added React import for React.cloneElement

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
            // Error handled silently or via higher-level UI
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
                className="fixed inset-0 bg-black/30 z-40 transition-opacity backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : user ? (
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="bg-primary p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-2xl"></div>

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <h2 className="text-2xl font-bold text-white">User Details</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-all border border-transparent hover:border-white/30 active:scale-90"
                                >
                                    <X className="w-6 h-6 text-white" strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* User Avatar & Basic Info */}
                            <div className="flex items-center gap-5 mb-4 relative z-10">
                                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center text-white text-3xl font-black border-2 border-white/30 shadow-xl">
                                    {user.username.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="text-white">
                                    <h3 className="text-2xl font-black tracking-tight">{user.username}</h3>
                                    <p className="text-white/70 font-medium">{user.email}</p>
                                    <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.isActive ? 'bg-teal-400/20 text-teal-100 border border-teal-400/30' : 'bg-rose-400/20 text-rose-100 border border-rose-400/30'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-teal-400 animate-pulse' : 'bg-rose-400'}`}></div>
                                        {user.isActive ? 'Active' : 'Suspended'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-100 bg-gray-50/50 p-2">
                            <nav className="flex gap-1">
                                {[
                                    { id: 'overview', label: 'Overview', icon: <UserIcon className="w-4 h-4" /> },
                                    { id: 'roles', label: 'Roles', icon: <Shield className="w-4 h-4" /> },
                                    { id: 'permissions', label: 'Permissions', icon: <Key className="w-4 h-4" /> },
                                    { id: 'claims', label: 'Claims', icon: <Tag className="w-4 h-4" /> }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as Tab)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all group ${activeTab === tab.id
                                            ? 'bg-white text-primary shadow-sm border border-gray-100'
                                            : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'
                                            }`}
                                    >
                                        <span className={`p-1.5 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                                            }`}>
                                            {React.cloneElement(tab.icon as any, { strokeWidth: 2.5 })}
                                        </span>
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {activeTab === 'overview' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <UserCircle className="w-5 h-5 text-primary" strokeWidth={2.5} />
                                            </div>
                                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Identity Profile</h3>
                                        </div>
                                        {!isEditing ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all text-sm font-bold border border-blue-100 shadow-sm active:scale-95 flex items-center gap-2"
                                            >
                                                <Edit className="w-4 h-4" strokeWidth={2.5} />
                                                Edit Profile
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setIsEditing(false)}
                                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all text-sm font-bold border border-gray-200 shadow-sm active:scale-95"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="px-4 py-2 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition-all text-sm font-bold border border-teal-100/50 shadow-md active:scale-95 flex items-center gap-2"
                                                    style={{ color: '#0C7C92' }}
                                                >
                                                    <Save className="w-4 h-4" strokeWidth={2.5} />
                                                    Save Changes
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Username</label>
                                                <input
                                                    type="text"
                                                    value={editForm.username}
                                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Account Lifecycle Status</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditForm({ ...editForm, isActive: true })}
                                                        className={`px-4 py-3 rounded-xl border text-sm font-black transition-all ${editForm.isActive ? 'bg-teal-50 border-teal-200 text-teal-700 shadow-sm' : 'bg-gray-100 border-gray-200 text-gray-400 opacity-50'}`}
                                                    >
                                                        Active
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditForm({ ...editForm, isActive: false })}
                                                        className={`px-4 py-3 rounded-xl border text-sm font-black transition-all ${!editForm.isActive ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' : 'bg-gray-100 border-gray-200 text-gray-400 opacity-50'}`}
                                                    >
                                                        Suspended
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Stats Cards */}
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center">
                                                    <div className="text-2xl font-black text-blue-700">{user.roles?.length || 0}</div>
                                                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Roles</div>
                                                </div>
                                                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 shadow-sm flex flex-col items-center">
                                                    <div className="text-2xl font-black text-teal-700">
                                                        {user.roles?.reduce((acc, role) => acc + (role.permissions?.length || 0), 0) || 0}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Effective Perms</div>
                                                </div>
                                                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 shadow-sm flex flex-col items-center">
                                                    <div className="text-2xl font-black text-purple-700">{user.claims?.length || 0}</div>
                                                    <div className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Claims</div>
                                                </div>
                                            </div>

                                            {/* User Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <InfoItem label="System ID" value={`#${user.id}`} icon={<Hash className="w-4 h-4" />} />
                                                <InfoItem label="Status" value={user.isActive ? 'Active' : 'Suspended'} icon={<Activity className="w-4 h-4" />} />
                                                <InfoItem label="Username" value={user.username} icon={<UserIcon className="w-4 h-4" />} />
                                                <InfoItem label="Email Address" value={user.email} icon={<Mail className="w-4 h-4" />} />
                                                <InfoItem label="Provisioned On" value={new Date(user.createdAt).toLocaleDateString()} icon={<Calendar className="w-4 h-4" />} />
                                                <InfoItem label="Last Update" value={user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Initial'} icon={<Clock className="w-4 h-4" />} />
                                            </div>

                                            {/* Quick Role Summary */}
                                            {user.roles && user.roles.length > 0 && (
                                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                        Active Permissions inherited from
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {user.roles.map(role => (
                                                            <span
                                                                key={role.id}
                                                                className="px-3 py-1.5 bg-white text-primary rounded-xl text-xs font-black border border-gray-200 shadow-sm flex items-center gap-2"
                                                            >
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
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
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Shield className="w-5 h-5 text-primary" strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Security Memberships</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {user.roles?.map(role => (
                                            <div key={role.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group hover:border-primary/30 transition-all">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-black text-gray-900 flex items-center gap-2">
                                                            {role.name}
                                                            <span className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-wider rounded border border-primary/10">Member</span>
                                                        </div>
                                                        {role.description && (
                                                            <div className="text-sm text-gray-500 mt-1 font-medium">{role.description}</div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveRole(role.id)}
                                                        className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all border border-rose-100 shadow-sm active:scale-90"
                                                        title="Revoke Role"
                                                    >
                                                        <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!user.roles || user.roles.length === 0) && (
                                            <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                <Shield className="w-10 h-10 text-gray-300 mb-2" strokeWidth={1.5} />
                                                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">No roles assigned</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Check className="w-3.5 h-3.5" />
                                            Available Role Assignments
                                        </h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {roles
                                                .filter(r => !user.roles?.find(ur => ur.id === r.id))
                                                .map(role => (
                                                    <button
                                                        key={role.id}
                                                        onClick={() => handleAddRole(role.id)}
                                                        className="w-full text-left p-4 bg-gray-50 rounded-2xl hover:bg-teal-50 hover:border-teal-200 border border-transparent transition-all group flex items-center justify-between"
                                                    >
                                                        <div>
                                                            <div className="font-black text-gray-900 group-hover:text-teal-700">{role.name}</div>
                                                            <div className="text-xs text-gray-500 font-medium">{role.description}</div>
                                                        </div>
                                                        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Plus className="w-4 h-4 text-teal-600" strokeWidth={3} />
                                                        </div>
                                                    </button>
                                                ))}
                                            {roles.filter(r => !user.roles?.find(ur => ur.id === r.id)).length === 0 && (
                                                <p className="text-gray-400 text-xs py-4 text-center font-bold">All available roles have been assigned.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'permissions' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Key className="w-5 h-5 text-primary" strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Access Control Matrix</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">Permissions are synchronized from active role memberships:</p>

                                    {user.roles && user.roles.length > 0 ? (
                                        <div className="space-y-4">
                                            {user.roles.map(role => (
                                                role.permissions && role.permissions.length > 0 && (
                                                    <div key={role.id} className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm overflow-hidden relative">
                                                        <div className="absolute top-0 right-0 p-1">
                                                            <Shield className="w-12 h-12 text-gray-50/50" />
                                                        </div>
                                                        <div className="flex items-center gap-2 mb-4 relative z-10">
                                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                <Shield className="w-4 h-4 text-primary" strokeWidth={2.5} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-gray-900 leading-none">{role.name}</h4>
                                                                <span className="text-[10px] font-bold text-gray-400 tracking-tighter uppercase">{role.permissions.length} nodes assigned</span>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-2 relative z-10">
                                                            {role.permissions.map(perm => (
                                                                <div key={perm.id} className="flex items-center gap-3 p-3 bg-teal-50/50 rounded-xl border border-teal-100/50 transition-all hover:shadow-sm">
                                                                    <div className="p-1 px-1.5 rounded-lg bg-white border border-teal-100 shadow-sm">
                                                                        <Check className="w-3.5 h-3.5" strokeWidth={4} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-black text-gray-900 text-sm">{perm.name}</div>
                                                                        <div className="text-[10px] text-teal-600 font-black uppercase tracking-widest">{perm.groupName || 'Uncategorized'}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <Key className="w-12 h-12 text-gray-300 mb-3" strokeWidth={1} />
                                            <p className="text-gray-400 text-sm font-black uppercase tracking-widest">No Effective Permissions</p>
                                            <p className="text-gray-400 text-xs mt-1">Assign roles to grant access</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'claims' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Tag className="w-5 h-5 text-primary" strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Dynamic Claims</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">
                                        Custom user attributes used for extended authorization policies.
                                    </p>

                                    {/* Existing Claims */}
                                    <div className="space-y-3">
                                        {user.claims && user.claims.length > 0 ? (
                                            user.claims.map(claim => (
                                                <div key={claim.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group transition-all hover:border-blue-200">
                                                    <div className="flex-1 flex items-center gap-4">
                                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
                                                            <Tag className="w-4 h-4" strokeWidth={2.5} />
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-0.5">{claim.claimType}</div>
                                                            <div className="font-black text-gray-900">{claim.claimValue}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await usersService.removeClaim(user.id, claim.id);
                                                                toast.success('Claim revoked successfully');
                                                                fetchUserDetails();
                                                                onUpdate();
                                                            } catch (error: any) {
                                                                toast.error('Sync failed');
                                                            }
                                                        }}
                                                        className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all border border-rose-100 shadow-sm active:scale-90"
                                                        title="Revoke Claim"
                                                    >
                                                        <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                <Tag className="w-10 h-10 text-gray-300 mb-2" strokeWidth={1.5} />
                                                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">No claims defined</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Add New Claim Form */}
                                    <div className="pt-8 border-t border-gray-100">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Plus className="w-3.5 h-3.5" />
                                            Define New Claim Attribute
                                        </h4>
                                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Type/Key</label>
                                                    <input
                                                        type="text"
                                                        id="claim-type"
                                                        placeholder="e.g., Department"
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Value</label>
                                                    <input
                                                        type="text"
                                                        id="claim-value"
                                                        placeholder="e.g., Finance"
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-sm"
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
                                                        toast.error('Attribute definition requires both Key and Value');
                                                        return;
                                                    }

                                                    try {
                                                        await usersService.addClaim(user.id, claimType, claimValue);
                                                        toast.success('Sync complete');
                                                        if (typeInput) typeInput.value = '';
                                                        if (valueInput) valueInput.value = '';
                                                        fetchUserDetails();
                                                        onUpdate();
                                                    } catch (error: any) {
                                                        toast.error('Provisioning failed');
                                                    }
                                                }}
                                                className="w-full py-3 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition-all font-black border border-teal-100 shadow-md active:scale-95 flex items-center justify-center gap-2"
                                                style={{ color: '#0C7C92' }}
                                            >
                                                <Plus className="w-5 h-5" strokeWidth={3} />
                                                Authorize Claim
                                            </button>
                                        </div>
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

function InfoItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
    return (
        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all">
            <div className="flex items-center gap-2 mb-1.5">
                <div className="text-gray-400 group-hover:text-primary transition-colors">
                    {icon && React.cloneElement(icon as any, { size: 14, strokeWidth: 3 })}
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-500 transition-colors">{label}</div>
            </div>
            <div className="font-black text-gray-900 truncate tracking-tight">{value}</div>
        </div>
    );
}
