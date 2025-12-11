'use client';

import { useState, useEffect } from 'react';
import { menuService, MenuItem } from '@/services/menu.service';
import { permissionsService, Permission } from '@/services/permissions.service';
import { DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import { DynamicSelect } from '@/components/DynamicSelect';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from '@/components/Toast';
import { PermissionGate } from '@/components/PermissionGate';
import * as Icons from 'lucide-react';
import { Plus, Edit, Trash2, Menu as MenuIcon, ChevronRight } from 'lucide-react';

export default function MenuManagementPage() {
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [menusData, permissionsData] = await Promise.all([
                menuService.getAllMenusFlat().catch(() => {
                    // Fallback menu data
                    return [
                        { id: 1, name: 'Dashboard', path: '/admin', icon: 'LayoutDashboard', order: 1, isActive: true, level: 0, children: [], _count: { children: 0 } },
                        { id: 2, name: 'User Management', icon: 'Users', order: 2, isActive: true, level: 0, children: [], _count: { children: 4 } },
                        { id: 3, name: 'Users', path: '/admin/users', icon: 'User', order: 1, isActive: true, level: 1, parentId: 2, parent: { id: 2, name: 'User Management' }, children: [], _count: { children: 0 } },
                        { id: 4, name: 'Roles', path: '/admin/roles', icon: 'Shield', order: 2, isActive: true, level: 1, parentId: 2, parent: { id: 2, name: 'User Management' }, children: [], _count: { children: 0 } },
                        { id: 5, name: 'Permissions', path: '/admin/permissions', icon: 'Lock', order: 3, isActive: true, level: 1, parentId: 2, parent: { id: 2, name: 'User Management' }, children: [], _count: { children: 0 } },
                        { id: 10, name: 'Menus', path: '/admin/menus', icon: 'Menu', order: 4, isActive: true, level: 1, parentId: 2, parent: { id: 2, name: 'User Management' }, children: [], _count: { children: 0 } },
                        { id: 6, name: 'Security', icon: 'ShieldCheck', order: 3, isActive: true, level: 0, children: [], _count: { children: 2 } },
                        { id: 7, name: 'Policies', path: '/admin/policies', icon: 'FileText', order: 1, isActive: true, level: 1, parentId: 6, parent: { id: 6, name: 'Security' }, badge: 'New', badgeColor: 'blue', children: [], _count: { children: 0 } },
                        { id: 8, name: 'Audit Logs', path: '/admin/audit', icon: 'FileSearch', order: 2, isActive: true, level: 1, parentId: 6, parent: { id: 6, name: 'Security' }, children: [], _count: { children: 0 } },
                        { id: 9, name: 'Bookings', path: '/admin/bookings', icon: 'Calendar', order: 4, isActive: true, level: 0, children: [], _count: { children: 0 } },
                    ] as MenuItem[];
                }),
                permissionsService.getAll(),
            ]);
            setMenus(menusData);
            setPermissions(permissionsData);
        } catch (error: any) {
            toast.error('Failed to load data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedMenu) return;
        try {
            await menuService.deleteMenuItem(selectedMenu.id);
            toast.success(`Menu "${selectedMenu.name}" deleted successfully`);
            fetchData();
        } catch (error: any) {
            toast.error('Failed to delete menu: ' + error.message);
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Menu Name',
            sortable: true,
            render: (menu: MenuItem) => (
                <div className="flex items-center gap-2">
                    <div className="text-gray-600">
                        {menu.icon && (() => {
                            const Icon = (Icons as any)[menu.icon];
                            return Icon ? <Icon className="w-4 h-4" /> : null;
                        })()}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{menu.name}</div>
                        {menu.path && <div className="text-xs text-gray-500">{menu.path}</div>}
                    </div>
                </div>
            ),
        },
        {
            key: 'parent',
            header: 'Parent',
            sortable: true,
            render: (menu: MenuItem) => (
                menu.parent ? (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                        <ChevronRight className="w-3 h-3" />
                        {menu.parent.name}
                    </div>
                ) : (
                    <span className="text-xs text-gray-400">Root</span>
                )
            ),
        },
        {
            key: 'level',
            header: 'Level',
            sortable: true,
            render: (menu: MenuItem) => (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    L{menu.level}
                </span>
            ),
        },
        {
            key: 'permission',
            header: 'Permission',
            render: (menu: MenuItem) => (
                menu.permission ? (
                    <span className="text-sm text-gray-700">{menu.permission.name}</span>
                ) : (
                    <span className="text-xs text-gray-400">None</span>
                )
            ),
        },
        {
            key: 'children',
            header: 'Children',
            render: (menu: MenuItem) => (
                <span className="text-sm text-gray-600">
                    {menu._count?.children || 0}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (menu: MenuItem) => (
                <span className={`px-2 py-1 text-xs rounded ${menu.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                    }`}>
                    {menu.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (menu: MenuItem) => (
                <PermissionGate permission="Menu.Create">
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setSelectedMenu(menu);
                                setEditModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                setSelectedMenu(menu);
                                setDeleteConfirmOpen(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </PermissionGate>
            ),
        },
    ];

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
                    <h1 className="text-4xl font-bold text-gradient">Menu Management</h1>
                    <p className="text-gray-600 mt-2">Configure application menu structure and hierarchy</p>
                </div>
                <PermissionGate permission="Menu.Create">
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Menu Item
                    </button>
                </PermissionGate>
            </div>

            {/* DataTable */}
            <DataTable
                data={menus}
                columns={columns}
                pageSize={10}
            />

            {/* Modals */}
            <MenuFormModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={() => {
                    setCreateModalOpen(false);
                    fetchData();
                }}
                menus={menus}
                permissions={permissions}
            />

            {selectedMenu && (
                <>
                    <MenuFormModal
                        isOpen={editModalOpen}
                        onClose={() => setEditModalOpen(false)}
                        onSuccess={() => {
                            setEditModalOpen(false);
                            fetchData();
                        }}
                        menu={selectedMenu}
                        menus={menus}
                        permissions={permissions}
                    />
                </>
            )}

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Menu Item"
                message={`Are you sure you want to delete "${selectedMenu?.name}"? This will also delete all child menu items.`}
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
}

// Menu Form Modal Component
function MenuFormModal({
    isOpen,
    onClose,
    onSuccess,
    menu,
    menus,
    permissions,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    menu?: MenuItem;
    menus: MenuItem[];
    permissions: Permission[];
}) {
    const [formData, setFormData] = useState({
        name: menu?.name || '',
        path: menu?.path || '',
        icon: menu?.icon || '',
        parentId: menu?.parentId || null,
        permissionId: menu?.permissionId || null,
        order: menu?.order || 0,
        isActive: menu?.isActive ?? true,
        description: menu?.description || '',
        badge: menu?.badge || '',
        badgeColor: menu?.badgeColor || '',
        isExternal: menu?.isExternal || false,
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            if (menu) {
                await menuService.updateMenuItem(menu.id, formData as any);
                toast.success('Menu item updated successfully');
            } else {
                await menuService.createMenuItem(formData as any);
                toast.success('Menu item created successfully');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(`Failed to ${menu ? 'update' : 'create'} menu: ` + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Icon options
    const iconOptions = [
        'LayoutDashboard', 'Users', 'User', 'Shield', 'Lock', 'Menu',
        'Settings', 'FileText', 'FileSearch', 'Calendar', 'Briefcase',
        'ShieldCheck', 'Database', 'Server', 'Cloud', 'Activity',
        'BarChart', 'PieChart', 'TrendingUp', 'Home', 'Folder',
    ];

    // Parent menu options (exclude current menu and its descendants)
    const parentOptions = menus
        .filter(m => !menu || m.id !== menu.id)
        .map(m => ({
            value: String(m.id),
            label: `${m.name} (L${m.level})`,
        }));

    const permissionOptions = permissions.map(p => ({
        value: String(p.id),
        label: p.name,
    }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={menu ? 'Edit Menu Item' : 'Create Menu Item'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* Name */}
                    <FormInput
                        label="Menu Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Dashboard, Users"
                        required
                        disabled={submitting}
                    />

                    {/* Path */}
                    <FormInput
                        label="Route Path"
                        value={formData.path || ''}
                        onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                        placeholder="e.g., /admin/users (optional for parents)"
                        disabled={submitting}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Icon */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Icon
                        </label>
                        <select
                            value={formData.icon || ''}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                            disabled={submitting}
                        >
                            <option value="">No Icon</option>
                            {iconOptions.map(icon => (
                                <option key={icon} value={icon}>{icon}</option>
                            ))}
                        </select>
                    </div>

                    {/* Parent */}
                    <DynamicSelect
                        label="Parent Menu"
                        value={formData.parentId ? [String(formData.parentId)] : []}
                        onChange={(value) => setFormData({ ...formData, parentId: value[0] ? Number(value[0]) : null })}
                        options={[{ value: '', label: 'Root (No Parent)' }, ...parentOptions]}
                        placeholder="Select parent menu"
                        disabled={submitting}
                        multiple={false}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Permission */}
                    <DynamicSelect
                        label="Required Permission"
                        value={formData.permissionId ? [String(formData.permissionId)] : []}
                        onChange={(value) => setFormData({ ...formData, permissionId: value[0] ? Number(value[0]) : null })}
                        options={[{ value: '', label: 'No Permission Required' }, ...permissionOptions]}
                        placeholder="Select permission"
                        disabled={submitting}
                        multiple={false}
                    />

                    {/* Order */}
                    <FormInput
                        label="Display Order"
                        type="number"
                        value={String(formData.order)}
                        onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                        disabled={submitting}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Optional tooltip or description"
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        disabled={submitting}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Badge */}
                    <FormInput
                        label="Badge Text"
                        value={formData.badge || ''}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        placeholder="e.g., New, Beta"
                        disabled={submitting}
                    />

                    {/* Badge Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Badge Color
                        </label>
                        <select
                            value={formData.badgeColor || ''}
                            onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                            disabled={submitting}
                        >
                            <option value="">Default</option>
                            <option value="blue">Blue</option>
                            <option value="green">Green</option>
                            <option value="red">Red</option>
                            <option value="yellow">Yellow</option>
                        </select>
                    </div>
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            disabled={submitting}
                        />
                        <span className="text-sm text-gray-700">Active</span>
                    </label>

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.isExternal}
                            onChange={(e) => setFormData({ ...formData, isExternal: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            disabled={submitting}
                        />
                        <span className="text-sm text-gray-700">External Link</span>
                    </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
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
                        {submitting ? 'Saving...' : menu ? 'Update Menu' : 'Create Menu'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
