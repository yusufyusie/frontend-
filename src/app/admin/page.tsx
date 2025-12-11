'use client';

import { useEffect, useState } from 'react';
import { usersService } from '@/services/users.service';
import { rolesService } from '@/services/roles.service';
import { permissionsService } from '@/services/permissions.service';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAccessStore } from '@/store/access.store';
import Link from 'next/link';

export default function AdminDashboard() {
    const { user } = useAccessStore();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalRoles: 0,
        totalPermissions: 0,
        loading: true
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [users, roles, permissions] = await Promise.all([
                usersService.getAll(),
                rolesService.getAll(),
                permissionsService.getAll()
            ]);

            setStats({
                totalUsers: users.length,
                activeUsers: users.filter(u => u.status === 'active').length,
                totalRoles: roles.length,
                totalPermissions: permissions.length,
                loading: false
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    if (stats.loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: '👥',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            link: '/admin/users'
        },
        {
            title: 'Active Users',
            value: stats.activeUsers,
            icon: '✅',
            color: 'from-green-500 to-teal-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            link: '/admin/users'
        },
        {
            title: 'Roles',
            value: stats.totalRoles,
            icon: '🎭',
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            link: '/admin/roles'
        },
        {
            title: 'Permissions',
            value: stats.totalPermissions,
            icon: '🔐',
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
            link: '/admin/permissions'
        }
    ];

    const quickActions = [
        {
            title: 'Add New User',
            description: 'Create a new user account',
            icon: '👤➕',
            link: '/admin/users',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            title: 'Manage Roles',
            description: 'Configure roles and permissions',
            icon: '🎭',
            link: '/admin/roles',
            color: 'from-purple-500 to-pink-500'
        },
        {
            title: 'View Permissions',
            description: 'Browse all system permissions',
            icon: '🔐',
            link: '/admin/permissions',
            color: 'from-green-500 to-teal-500'
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Header */}
            <div className="card-gradient p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gradient mb-2">
                            Welcome back, {user?.username}! 👋
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Here's what's happening with your access control system today.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl">
                            {user?.username?.substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <Link key={index} href={stat.link}>
                        <div className="card hover-lift cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
                                    {stat.icon}
                                </div>
                                <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <div className="text-sm text-gray-600 mb-1">{stat.title}</div>
                            <div className="text-4xl font-bold text-gray-900">{stat.value}</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickActions.map((action, index) => (
                        <Link key={index} href={action.link}>
                            <div className="card hover-lift cursor-pointer group">
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                    {action.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {action.title}
                                </h3>
                                <p className="text-gray-600">{action.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activity / System Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Information */}
                <div className="card">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">ℹ️</span>
                        System Information
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700">Version</span>
                            <span className="font-semibold text-gray-900">1.0.0</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700">Access Control Type</span>
                            <span className="font-semibold text-gray-900">Dynamic RBAC & PBAC</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700">Claims-Based Auth</span>
                            <span className="badge badge-success">Enabled</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700">Database</span>
                            <span className="badge badge-success">Connected</span>
                        </div>
                    </div>
                </div>

                {/* Your Access */}
                <div className="card">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">🔑</span>
                        Your Access
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm text-blue-700 mb-1">Username</div>
                            <div className="font-semibold text-blue-900">{user?.username}</div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="text-sm text-purple-700 mb-1">Email</div>
                            <div className="font-semibold text-purple-900">{user?.email}</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-sm text-green-700 mb-1">Status</div>
                            <span className="badge badge-success">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Highlights */}
            <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                <div className="flex items-start gap-4">
                    <div className="text-5xl">🎯</div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Dynamic Access Control System
                        </h3>
                        <p className="text-gray-700 mb-4">
                            This system provides enterprise-grade access control with dynamic RBAC, PBAC, and Claims-Based Authentication.
                            All permissions and roles are fully configurable without code changes.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="badge bg-blue-100 text-blue-800 border border-blue-300">✅ Dynamic RBAC</span>
                            <span className="badge bg-purple-100 text-purple-800 border border-purple-300">✅ Dynamic PBAC</span>
                            <span className="badge bg-green-100 text-green-800 border border-green-300">✅ Claims-Based</span>
                            <span className="badge bg-orange-100 text-orange-800 border border-orange-300">✅ ASP.NET Zero UX</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
