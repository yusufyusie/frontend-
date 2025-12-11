'use client';

import { useAccessStore } from '@/store/access.store';
import { authService } from '@/services/auth.service';
import { useState } from 'react';

export default function PermissionDebugPage() {
    const { permissions, roles, claims, user } = useAccessStore();
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            const profile = await authService.getProfile();
            useAccessStore.getState().setPermissions(profile.permissions);
            useAccessStore.getState().setRoles(profile.roles);
            useAccessStore.getState().setClaims(profile.claims);
            alert('✅ Permissions refreshed! Check console for details.');
        } catch (error) {
            alert('❌ Failed to refresh permissions: ' + error);
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="card">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">🔍 Permission Debug</h1>
                <p className="text-gray-600">
                    Use this page to debug permission issues. Check the browser console for detailed logs.
                </p>
            </div>

            {/* User Info */}
            <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">👤 Current User</h2>
                <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                    <div><strong>ID:</strong> {user?.id}</div>
                    <div><strong>Username:</strong> {user?.username}</div>
                    <div><strong>Email:</strong> {user?.email}</div>
                </div>
            </div>

            {/* Refresh Button */}
            <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">🔄 Refresh Permissions</h2>
                <p className="text-sm text-gray-600 mb-4">
                    If an admin changed your role permissions, click this button to reload them without logging out.
                </p>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="btn btn-primary"
                >
                    {refreshing ? 'Refreshing...' : '🔄 Refresh Permissions'}
                </button>
            </div>

            {/* Permissions */}
            <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">🔐 Your Permissions ({permissions.length})</h2>
                {permissions.length === 0 ? (
                    <p className="text-red-600">⚠️ No permissions loaded! You should have at least some permissions.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {permissions.map((perm) => (
                            <div
                                key={perm}
                                className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-mono"
                            >
                                ✅ {perm}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Roles */}
            <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">🎭 Your Roles ({roles.length})</h2>
                {roles.length === 0 ? (
                    <p className="text-yellow-600">⚠️ No roles assigned!</p>
                ) : (
                    <div className="flex gap-2 flex-wrap">
                        {roles.map((role) => (
                            <span key={role} className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-semibold">
                                {role}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Claims */}
            <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">🏷️ Your Claims ({Object.keys(claims).length})</h2>
                {Object.keys(claims).length === 0 ? (
                    <p className="text-gray-500">No claims assigned</p>
                ) : (
                    <div className="space-y-2">
                        {Object.entries(claims).map(([type, value]) => (
                            <div key={type} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                <span className="font-semibold text-blue-900">{type}:</span>
                                <span className="text-blue-700">{value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="card bg-yellow-50 border-2 border-yellow-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">📋 How to Test</h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Open browser console (F12)</li>
                    <li>Look for logs starting with 🚪 (PermissionGate checks)</li>
                    <li>Look for logs starting with ⚠️ (missing permissions)</li>
                    <li>If you don't see the permission you need in the list above, it's missing!</li>
                    <li>Ask an admin to add the permission to your role</li>
                    <li>Click "Refresh Permissions" button above (no logout needed!)</li>
                </ol>
            </div>

            {/* Common Permissions Test */}
            <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">🧪 Permission Tests</h2>
                <div className="space-y-3">
                    {[
                        'User.View',
                        'User.Create',
                        'User.Edit',
                        'User.Delete',
                        'Role.View',
                        'Role.View',
                        'Permission.View',
                        'Permission.View',
                    ].map((perm) => {
                        const has = permissions.includes(perm);
                        return (
                            <div
                                key={perm}
                                className={`p-3 rounded-lg flex items-center justify-between ${has ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                    }`}
                            >
                                <span className="font-mono text-sm">{perm}</span>
                                <span className={`font-bold ${has ? 'text-green-700' : 'text-red-700'}`}>
                                    {has ? '✅ YOU HAVE IT' : '❌ YOU DON\'T HAVE IT'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
