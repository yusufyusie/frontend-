'use client';

import { useEffect, useState } from 'react';
import { usersService } from '@/services/users.service';
import { rolesService } from '@/services/roles.service';
import { permissionsService } from '@/services/permissions.service';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAccessStore } from '@/store/access.store';
import Link from 'next/link';

import { Users, UserCheck, Shield, Lock, ChevronRight, UserPlus, Info, Mail, Activity, Target } from 'lucide-react';

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

    /**
     * Fetch dashboard statistics from multiple services
     */
    const fetchStats = async () => {
        try {
            const [users, roles, permissions] = await Promise.all([
                usersService.getAll(),
                rolesService.getAll(),
                permissionsService.getAll()
            ]);

            setStats({
                totalUsers: users.length,
                activeUsers: users.filter(u => u.isActive).length,
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
            icon: Users,
            color: 'bg-primary',
            link: '/admin/users'
        },
        {
            title: 'Active Users',
            value: stats.activeUsers,
            icon: UserCheck,
            color: 'bg-success',
            link: '/admin/users'
        },
        {
            title: 'System Roles',
            value: stats.totalRoles,
            icon: Shield,
            color: 'bg-secondary',
            link: '/admin/roles'
        },
        {
            title: 'Permissions',
            value: stats.totalPermissions,
            icon: Lock,
            color: 'bg-accent',
            link: '/admin/permissions'
        }
    ];

    const quickActions = [
        {
            title: 'Add New User',
            description: 'Register and configure fresh user accounts',
            icon: UserPlus,
            link: '/admin/users',
            color: 'bg-primary'
        },
        {
            title: 'Manage Roles',
            description: 'Configure hierarchical access controls',
            icon: Shield,
            link: '/admin/roles',
            color: 'bg-secondary'
        },
        {
            title: 'System Audit',
            description: 'Monitor all administrative activities',
            icon: Activity,
            link: '/admin/audit',
            color: 'bg-success'
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Dashboard welcome section */}
            <div className="card-gradient p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
                            Welcome, {user?.username}
                        </h1>
                        <p className="text-gray-600 text-base md:text-lg max-w-2xl">
                            Overview of the Tenant Management System activities and configuration status.
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl md:text-5xl font-bold shadow-xl border-4 border-white">
                            {user?.username?.substring(0, 1).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Core statistics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Link key={index} href={stat.link}>
                            <div className="card hover-lift cursor-pointer group p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.title}</div>
                                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Administrative quick actions */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-1 bg-primary rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Link key={index} href={action.link}>
                                <div className="card hover-lift cursor-pointer group h-full">
                                    <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                                        {action.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{action.description}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* System details and access info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* System technical status */}
                <div className="card">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" />
                        System Information
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="text-sm font-medium text-gray-600 uppercase tracking-widest text-[10px]">Version</span>
                            <span className="font-mono text-sm font-bold text-primary">v1.0.0</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="text-sm font-medium text-gray-600 uppercase tracking-widest text-[10px]">Security Engine</span>
                            <span className="badge badge-success badge-sm font-bold">Dynamic PBAC</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="text-sm font-medium text-gray-600 uppercase tracking-widest text-[10px]">Identity Provider</span>
                            <span className="text-sm font-bold text-gray-900">Internal JWT</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="text-sm font-medium text-gray-600 uppercase tracking-widest text-[10px]">Database Status</span>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-success animate-pulse"></span>
                                <span className="text-sm font-bold text-gray-900">Synchronized</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current user session info */}
                <div className="card">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Access Details
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <div className="flex items-center gap-3 mb-1">
                                <Users className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Username</span>
                            </div>
                            <div className="font-bold text-gray-900">{user?.username}</div>
                        </div>
                        <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/10">
                            <div className="flex items-center gap-3 mb-1">
                                <Mail className="w-4 h-4 text-secondary" />
                                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Auth Email</span>
                            </div>
                            <div className="font-bold text-gray-900">{user?.email}</div>
                        </div>
                        <div className="p-4 bg-success/5 rounded-xl border border-success/10">
                            <div className="flex items-center gap-3 mb-1">
                                <Target className="w-4 h-4 text-success" />
                                <span className="text-[10px] font-bold text-success uppercase tracking-widest">Account Status</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="badge badge-success font-bold uppercase tracking-tighter">Verified Session</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature spotlight */}
            <div className="card bg-primary text-white border-0 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 rounded-3xl backdrop-blur-md flex items-center justify-center flex-shrink-0">
                        <Target className="w-10 h-10 md:w-12 md:h-12 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl md:text-3xl font-bold mb-3">
                            Next-Generation Access Management
                        </h3>
                        <p className="text-white/80 mb-6 text-sm md:text-base leading-relaxed max-w-2xl">
                            Our system utilizes fully dynamic, automated RBAC and PBAC controls.
                            Configure entire organizational structures and security constraints in real-time.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            {['Zero-Trust Ready', 'claims-based', 'Auto-Discovery', 'Enterprise Audit'].map(feature => (
                                <span key={feature} className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
