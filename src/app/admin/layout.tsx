'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            {/* Sidebar + Main Content */}
            <div className="flex pt-16">
                {/* Sidebar */}
                <Sidebar
                    isOpen={sidebarOpen}
                    isCollapsed={!sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Main Content */}
                <main className={`flex-1 transition-all duration-300 min-w-0 overflow-x-hidden ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
                    }`}>
                    <div className="p-4 md:p-6 max-w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
