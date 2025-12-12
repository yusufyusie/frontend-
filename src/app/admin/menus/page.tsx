'use client';

import { useState, useEffect } from 'react';
import { menuService, MenuItem, MenuStats } from '@/services/menu.service';
import { permissionsService, Permission } from '@/services/permissions.service';
import { DataTable } from '@/components/DataTable';
import { MenuBulkActions } from '@/components/MenuBulkActions';
import { Modal } from '@/components/Modal';
import { FormInput } from '@/components/FormInput';
import { DynamicSelect } from '@/components/DynamicSelect';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from '@/components/Toast';
import { PermissionGate } from '@/components/PermissionGate';
import { getGradientStyle } from '@/utils/color-generator';
import * as Icons from 'lucide-react';

export default function MenuManagementPage() {
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [availableIcons, setAvailableIcons] = useState<string[]>([]);
    const [stats, setStats] = useState<MenuStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterLevel, setFilterLevel] = useState<number | null>(null);

    // Modals
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);

    // Selection
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [menusData, permissionsData, iconsData, statsData] = await Promise.all([
                menuService.getAllMenusFlat(),
                permissionsService.getAll(),
                menuService.getAvailableIcons(),
                menuService.getStats(),
            ]);
            setMenus(menusData);
            setPermissions(permissionsData);
            setAvailableIcons(iconsData);
            setStats(statsData);
        } catch (error: any) {
            toast.error('Failed to load data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMenu = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = () => {
        setSelectedIds(new Set(menus.map(m => m.id)));
    };

    const handleDeselectAll = () => {
        setSelectedIds(new Set());
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        try {
            const result = await menuService.bulkDelete(Array.from(selectedIds));
            toast.success(result.message);
            setSelectedIds(new Set());
            setBulkDeleteConfirmOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error('Failed to delete menus: ' + error.message);
        }
    };

    const handleBulkToggleStatus = async (isActive: boolean) => {
        if (selectedIds.size === 0) return;
        try {
            const result = await menuService.bulkToggleStatus(Array.from(selectedIds), isActive);
            toast.success(result.message);
            setSelectedIds(new Set());
            fetchData();
        } catch (error: any) {
            toast.error('Failed to update menus: ' + error.message);
        }
    };

    const handleDeleteMenu = async () => {
        if (!selectedMenu) return;
        try {
            await menuService.deleteMenuItem(selectedMenu.id);
            toast.success(`Menu "${selectedMenu.name}" deleted successfully`);
            setDeleteConfirmOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error('Failed to delete menu: ' + error.message);
        }
    };

    const handleExport = async () => {
        try {
            const data = await menuService.exportMenus();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `menus-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Menus exported successfully');
        } catch (error: any) {
            toast.error('Failed to export menus: ' + error.message);
        }
    };

    // Filter menus by level if selected
    const filteredMenus = filterLevel === null
        ? menus
        : menus.filter(m => m.level === filterLevel);

    const uniqueLevels = Array.from(new Set(menus.map(m => m.level))).sort((a, b) => a - b);

    // Table columns configuration
    const columns = [
        {
            key: 'select',
            header: (
                <input
                    type="checkbox"
                    checked={selectedIds.size === filteredMenus.length && filteredMenus.length > 0}
                    onChange={() => selectedIds.size === filteredMenus.length ? handleDeselectAll() : handleSelectAll()}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
            ),
            render: (menu: MenuItem) => (
                <input
                    type="checkbox"
                    checked={selectedIds.has(menu.id)}
                    onChange={() => handleSelectMenu(menu.id)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
            ),
        },
        {
            key: 'name',
            header: 'Menu Name',
            sortable: true,
            render: (menu: MenuItem) => {
                const Icon = menu.icon ? (Icons as any)[menu.icon] : null;
                return (
                    <div className="flex items-center gap-3">
                        <div
                            className="p-2 rounded-lg shadow-sm"
                            style={getGradientStyle(menu.name)}
                        >
                            {Icon ? (
                                <Icon className="w-4 h-4 text-white" />
                            ) : (
                                <Icons.Menu className="w-4 h-4 text-white" />
                            )}
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">{menu.name}</div>
                            {menu.path && <div className="text-xs text-gray-500 font-mono">{menu.path}</div>}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'level',
            header: 'Level',
            sortable: true,
            render: (menu: MenuItem) => {
                const levelStyle = getGradientStyle(`Level-${menu.level}`);
                return (
                    <div
                        className="inline-flex px-3 py-1 rounded-full font-medium text-sm shadow-sm"
                        style={levelStyle}
                    >
                        <span className="text-white">L{menu.level}</span>
                    </div>
                );
            },
        },
        {
            key: 'parent',
            header: 'Parent',
            sortable: true,
            render: (menu: MenuItem) => (
                menu.parent ? (
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Icons.Folder className="w-4 h-4 text-gray-400" />
                        {menu.parent.name}
                    </div>
                ) : (
                    <span className="text-xs text-gray-400 italic">Root</span>
                )
            ),
        },
        {
            key: 'children',
            header: 'Children',
            render: (menu: MenuItem) => {
                const count = menu._count?.children || 0;
                return (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Icons.List className="w-4 h-4 text-gray-400" />
                        <span>{count}</span>
                    </div>
                );
            },
        },
        {
            key: 'order',
            header: 'Order',
            sortable: true,
            render: (menu: MenuItem) => (
                <span className="text-sm text-gray-700 font-medium">{menu.order}</span>
            ),
        },
        {
            key: 'badge',
            header: 'Badge',
            render: (menu: MenuItem) => (
                menu.badge ? (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${menu.badgeColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                        menu.badgeColor === 'green' ? 'bg-green-100 text-green-800' :
                            menu.badgeColor === 'red' ? 'bg-red-100 text-red-800' :
                                menu.badgeColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                    menu.badgeColor === 'purple' ? 'bg-purple-100 text-purple-800' :
                                        menu.badgeColor === 'pink' ? 'bg-pink-100 text-pink-800' :
                                            'bg-gray-100 text-gray-800'
                        }`}>
                        {menu.badge}
                    </span>
                ) : (
                    <span className="text-xs text-gray-400">-</span>
                )
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (menu: MenuItem) => (
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${menu.isActive
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
                    <div className="flex gap-1">
                        <button
                            onClick={() => {
                                setSelectedMenu(menu);
                                setEditModalOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Icons.Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                setSelectedMenu(menu);
                                setDeleteConfirmOpen(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Icons.Trash2 className="w-4 h-4" />
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
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-gradient">Menu Management</h1>
                    <p className="text-gray-600 mt-2">Configure application menu structure and hierarchy</p>
                </div>
                <PermissionGate permission="Menu.Create">
                    <div className="flex gap-2">
                        <button
                            onClick={handleExport}
                            className="btn btn-secondary flex items-center gap-2"
                        >
                            <Icons.Download className="w-5 h-5" />
                            Export
                        </button>
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Icons.Plus className="w-5 h-5" />
                            Add Menu Item
                        </button>
                    </div>
                </PermissionGate>
            </div>

            {/* Enhanced Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                                <Icons.Menu className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalMenus}</p>
                                <p className="text-sm text-gray-600">Total Menus</p>
                            </div>
                        </div>
                    </div>

                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl shadow-lg">
                                <Icons.Check className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.activeMenus}</p>
                                <p className="text-sm text-gray-600">Active</p>
                            </div>
                        </div>
                    </div>

                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                                <Icons.Layers className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{stats.maxHierarchyDepth + 1}</p>
                                <p className="text-sm text-gray-600">Max Depth</p>
                            </div>
                        </div>
                    </div>

                    <div className="card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -mr-16 -mt-16" />
                        <div className="relative flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                                <Icons.Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{selectedIds.size}</p>
                                <p className="text-sm text-gray-600">Selected</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Actions */}
            <MenuBulkActions
                selectedCount={selectedIds.size}
                totalCount={filteredMenus.length}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onBulkDelete={() => setBulkDeleteConfirmOpen(true)}
                onBulkToggleStatus={handleBulkToggleStatus}
            />

            {/* Level Filter */}
            {uniqueLevels.length > 1 && (
                <div className="card">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Filter by Level:</label>
                        <select
                            value={filterLevel === null ? '' : String(filterLevel)}
                            onChange={(e) => setFilterLevel(e.target.value === '' ? null : Number(e.target.value))}
                            className="px-4 py-2 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                        >
                            <option value="">All Levels</option>
                            {uniqueLevels.map(level => (
                                <option key={level} value={level}>Level {level}</option>
                            ))}
                        </select>
                        {filterLevel !== null && (
                            <button
                                onClick={() => setFilterLevel(null)}
                                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* DataTable with Pagination */}
            <DataTable
                data={filteredMenus}
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
                availableIcons={availableIcons}
            />

            {selectedMenu && (
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
                    availableIcons={availableIcons}
                />
            )}

            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleDeleteMenu}
                title="Delete Menu Item"
                message={`Are you sure you want to delete "${selectedMenu?.name}"? This will also delete all child menu items.`}
                confirmText="Delete"
                type="danger"
            />

            <ConfirmDialog
                isOpen={bulkDeleteConfirmOpen}
                onClose={() => setBulkDeleteConfirmOpen(false)}
                onConfirm={handleBulkDelete}
                title="Delete Multiple Menus"
                message={`Are you sure you want to delete ${selectedIds.size} menu item(s)? This action cannot be undone.`}
                confirmText="Delete All"
                type="danger"
            />
        </div>
    );
}

// Menu Form Modal Component (same as before)
function MenuFormModal({
    isOpen,
    onClose,
    onSuccess,
    menu,
    menus,
    permissions,
    availableIcons,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    menu?: MenuItem;
    menus: MenuItem[];
    permissions: Permission[];
    availableIcons: string[];
}) {
    const [formData, setFormData] = useState({
        name: menu?.name || '',
        path: menu?.path || '',
        icon: menu?.icon || '',
        parentId: menu?.parentId || null,
        permissionId: menu?.permissionId || null,
        order: menu?.order || 0,
        isActive: menu?.isActive ?? true,
        badge: menu?.badge || '',
        badgeColor: menu?.badgeColor || '',
        isExternal: menu?.isExternal || false,
    });
    const [submitting, setSubmitting] = useState(false);
    const [iconSearch, setIconSearch] = useState('');

    // Update form data when menu prop changes
    useEffect(() => {
        if (menu) {
            setFormData({
                name: menu.name,
                path: menu.path || '',
                icon: menu.icon || '',
                parentId: menu.parentId || null,
                permissionId: menu.permissionId || null,
                order: menu.order,
                isActive: menu.isActive,
                badge: menu.badge || '',
                badgeColor: menu.badgeColor || '',
                isExternal: menu.isExternal || false,
            });
        } else {
            // Reset form for create mode
            setFormData({
                name: '',
                path: '',
                icon: '',
                parentId: null,
                permissionId: null,
                order: 0,
                isActive: true,
                badge: '',
                badgeColor: '',
                isExternal: false,
            });
        }
        setIconSearch('');
    }, [menu, isOpen]);

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

    const filteredIcons = iconSearch
        ? availableIcons.filter(icon => icon.toLowerCase().includes(iconSearch.toLowerCase()))
        : availableIcons;

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

    const badgeColors = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'indigo', 'gray'];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={menu ? 'Edit Menu Item' : 'Create Menu Item'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label="Menu Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Dashboard, Users"
                        required
                        disabled={submitting}
                    />
                    <FormInput
                        label="Route Path"
                        value={formData.path || ''}
                        onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                        placeholder="e.g., /admin/users"
                        disabled={submitting}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                        <input
                            type="text"
                            value={iconSearch}
                            onChange={(e) => setIconSearch(e.target.value)}
                            placeholder="Search icons..."
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none mb-2"
                        />
                        <select
                            value={formData.icon || ''}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                            disabled={submitting}
                        >
                            <option value="">No Icon</option>
                            {filteredIcons.map(icon => (
                                <option key={icon} value={icon}>{icon}</option>
                            ))}
                        </select>
                    </div>

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
                    <DynamicSelect
                        label="Required Permission"
                        value={formData.permissionId ? [String(formData.permissionId)] : []}
                        onChange={(value) => setFormData({ ...formData, permissionId: value[0] ? Number(value[0]) : null })}
                        options={[{ value: '', label: 'No Permission Required' }, ...permissionOptions]}
                        placeholder="Select permission"
                        disabled={submitting}
                        multiple={false}
                    />
                    <FormInput
                        label="Display Order"
                        type="number"
                        value={String(formData.order)}
                        onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                        disabled={submitting}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label="Badge Text"
                        value={formData.badge || ''}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        placeholder="e.g., New, Beta"
                        disabled={submitting}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Badge Color</label>
                        <select
                            value={formData.badgeColor || ''}
                            onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                            disabled={submitting}
                        >
                            <option value="">Default</option>
                            {badgeColors.map(color => (
                                <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                            disabled={submitting}
                        />
                        <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.isExternal}
                            onChange={(e) => setFormData({ ...formData, isExternal: e.target.checked })}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                            disabled={submitting}
                        />
                        <span className="text-sm text-gray-700">External Link</span>
                    </label>
                </div>

                <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
                    <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Saving...' : menu ? 'Update Menu' : 'Create Menu'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
