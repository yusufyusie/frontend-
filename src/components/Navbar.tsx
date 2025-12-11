'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccessStore } from '@/store/access.store';
import { authService } from '@/services/auth.service';
import { Menu, Bell, Search, Settings, LogOut, User, ChevronDown } from 'lucide-react';

interface NavbarProps {
    onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
    const router = useRouter();
    const { user } = useAccessStore();
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const handleLogout = () => {
        authService.logout();
        router.push('/login');
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 shadow-sm">
            <div className="flex items-center justify-between h-full px-4">
                {/* Left: Menu Toggle + Logo */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Toggle sidebar"
                        title="Toggle sidebar"
                    >
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">AC</span>
                        </div>
                        <div className="hidden md:block">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Access Control
                            </h1>
                            <p className="text-xs text-gray-500">System Management</p>
                        </div>
                    </div>
                </div>

                {/* Center: Search (Optional - can be added later) */}
                <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Right: Notifications + User Menu */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <button
                        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell className="w-5 h-5 text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Settings */}
                    <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden md:block"
                        aria-label="Settings"
                    >
                        <Settings className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-semibold text-gray-900">
                                    {user?.username || 'User'}
                                </div>
                                <div className="text-xs text-gray-500">{user?.email}</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                                {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
                        </button>

                        {/* Dropdown Menu */}
                        {profileMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setProfileMenuOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {user?.username}
                                        </div>
                                        <div className="text-xs text-gray-500">{user?.email}</div>
                                    </div>
                                    <button
                                        onClick={() => router.push('/profile')}
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left"
                                    >
                                        <User className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm text-gray-700">My Profile</span>
                                    </button>
                                    <button
                                        onClick={() => router.push('/settings')}
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left"
                                    >
                                        <Settings className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm text-gray-700">Settings</span>
                                    </button>
                                    <hr className="my-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors w-full text-left"
                                    >
                                        <LogOut className="w-5 h-5 text-red-600" />
                                        <span className="text-sm text-red-600 font-medium">Logout</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
