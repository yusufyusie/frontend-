'use client';

import { useAccessStore } from '@/store/access.store';

export default function DashboardPage() {
    const { user, permissions, roles, isLoading } = useAccessStore();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                    <h3 className="text-lg font-semibold mb-2">User Info</h3>
                    <p className="text-gray-600">Username: {user?.username}</p>
                    <p className="text-gray-600">Email: {user?.email}</p>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-2">Roles</h3>
                    <div className="flex flex-wrap gap-2">
                        {roles.map((role) => (
                            <span
                                key={role}
                                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                            >
                                {role}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-2">Permissions</h3>
                    <p className="text-gray-600">
                        You have {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            <div className="card">
                <h3 className="text-xl font-semibold mb-4">Your Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {permissions.map((permission) => (
                        <div
                            key={permission}
                            className="px-3 py-2 bg-gray-100 rounded text-sm font-mono"
                        >
                            {permission}
                        </div>
                    ))}
                </div>
            </div>

            <div className="card bg-primary-50 border-2 border-blue-200">
                <h3 className="text-xl font-semibold mb-2">🎉 Welcome to Access Control System!</h3>
                <p className="text-gray-700">
                    This system demonstrates fully dynamic RBAC + PBAC + Claims-based access control.
                </p>
                <ul className="mt-4 space-y-2 text-gray-700">
                    <li>✅ Permissions are loaded from the database</li>
                    <li>✅ Menu items appear based on your permissions</li>
                    <li>✅ API endpoints are protected by guards</li>
                    <li>✅ Admins can add new permissions without code changes</li>
                </ul>
            </div>
        </div>
    );
}
