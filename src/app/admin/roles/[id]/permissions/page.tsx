'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronRight,
    Home,
    Shield,
    Users,
    LayoutGrid,
    Table,
    ListTree,
    List,
    Save,
    X,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    Sparkles,
    ArrowLeft,
} from 'lucide-react';
import { rolesService, type Role } from '@/services/roles.service';
import { permissionsService, type Permission } from '@/services/permissions.service';
import {
    permissionTemplatesService,
    type PermissionTemplate,
} from '@/services/permission-templates.service';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from '@/components/Toast';
import { PermissionTree } from '@/components/PermissionTree';
import { ResourceActionMatrix } from '@/components/ResourceActionMatrix';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, ChevronDown, ArrowRight, ShieldCheck } from 'lucide-react';

type TabType = 'templates' | 'matrix' | 'hierarchy' | 'list';

interface PermissionGroup {
    name: string;
    permissions: Permission[];
}

export default function RolePermissionsPage() {
    const params = useParams();
    const router = useRouter();
    const roleId = Number(params.id);

    const [role, setRole] = useState<Role | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [initialSelectedIds, setInitialSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('templates');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // Load data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [roleData, permsData, templatesData] = await Promise.all([
                    rolesService.getOne(roleId),
                    permissionsService.getAll(),
                    permissionTemplatesService.getAll(),
                ]);

                setRole(roleData);
                setPermissions(permsData);
                setTemplates(templatesData || []);

                const currentIds = roleData.permissions?.map((p) => p.id) || [];
                setSelectedIds(currentIds);
                setInitialSelectedIds(currentIds);
            } catch (error) {
                toast.error('Failed to load permissions data');
                router.push('/admin/roles');
            } finally {
                setLoading(false);
            }
        };

        if (roleId) {
            loadData();
        }
    }, [roleId, router]);

    // Group permissions
    const groupedPermissions = useMemo(() => {
        const groups = permissions.reduce(
            (acc, perm) => {
                const groupName = perm.groupName || 'General';
                if (!acc[groupName]) {
                    acc[groupName] = [];
                }
                acc[groupName].push(perm);
                return acc;
            },
            {} as Record<string, Permission[]>,
        );
        return Object.entries(groups).map(([name, perms]) => ({
            name,
            permissions: perms,
        }));
    }, [permissions]);

    // Filter groups by search
    const filteredGroups = useMemo(() => {
        if (!searchTerm.trim()) return groupedPermissions;
        const lowerSearch = searchTerm.toLowerCase();
        return groupedPermissions
            .map((group) => ({
                ...group,
                permissions: group.permissions.filter(
                    (perm) =>
                        perm.name.toLowerCase().includes(lowerSearch) ||
                        perm.displayName?.toLowerCase().includes(lowerSearch) ||
                        perm.description?.toLowerCase().includes(lowerSearch),
                ),
            }))
            .filter((group) => group.permissions.length > 0);
    }, [groupedPermissions, searchTerm]);

    // Check if dirty
    const isDirty = useMemo(() => {
        if (selectedIds.length !== initialSelectedIds.length) return true;
        const sortedSelected = [...selectedIds].sort((a, b) => a - b);
        const sortedInitial = [...initialSelectedIds.sort((a, b) => a - b)];
        return sortedSelected.some((id, index) => id !== sortedInitial[index]);
    }, [selectedIds, initialSelectedIds]);

    // Stats
    const coverage = permissions.length > 0 ? Math.round((selectedIds.length / permissions.length) * 100) : 0;

    // Handlers
    const handleSave = async () => {
        if (!role) return;
        try {
            setSaving(true);
            await rolesService.assignPermissions(role.id, selectedIds);
            setInitialSelectedIds(selectedIds);
            toast.success('Permissions updated successfully');
            router.push('/admin/roles');
        } catch (error) {
            toast.error('Failed to update permissions');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        router.push('/admin/roles');
    };

    const applyTemplate = async (templateId: number) => {
        try {
            const permissionIds = await permissionTemplatesService.evaluate(templateId);
            setSelectedIds(permissionIds || []);
            toast.success('Template applied successfully');
        } catch (error) {
            toast.error('Template evaluation error');
        }
    };

    const togglePermission = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
        );
    };

    const toggleGroup = (groupName: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupName)) {
            newExpanded.delete(groupName);
        } else {
            newExpanded.add(groupName);
        }
        setExpandedGroups(newExpanded);
    };

    const selectAllInGroup = (group: PermissionGroup) => {
        const groupIds = group.permissions.map((p) => p.id);
        const allSelectedInGroup = groupIds.every((id) => selectedIds.includes(id));

        setSelectedIds((prev) => {
            if (allSelectedInGroup) {
                return prev.filter((id) => !groupIds.includes(id));
            } else {
                const newSelected = new Set([...prev, ...groupIds]);
                return Array.from(newSelected);
            }
        });
    };

    const isAllSelectedInGroup = (group: PermissionGroup) => {
        const groupIds = group.permissions.map((p) => p.id);
        return groupIds.length > 0 && groupIds.every((id) => selectedIds.includes(id));
    };

    const isSomeSelectedInGroup = (group: PermissionGroup) => {
        const groupIds = group.permissions.map((p) => p.id);
        return (
            groupIds.some((id) => selectedIds.includes(id)) &&
            !isAllSelectedInGroup(group)
        );
    };

    const clearSelection = () => setSelectedIds([]);

    if (loading || !role) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-sm text-gray-600">Loading permissions...</p>
                </div>
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'templates':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-6">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-primary-200 transition-all duration-300"
                            >
                                <div className="flex items-start gap-5">
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300"
                                        style={{
                                            backgroundColor: `${template.color}15`,
                                            color: template.color,
                                        }}
                                    >
                                        <ShieldCheck className="w-7 h-7" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {template.description}
                                        </p>
                                        <div className="flex items-center gap-2 pt-2">
                                            <div
                                                className={`w-2 h-2 rounded-full ${template.isSystem ? 'bg-primary-500' : 'bg-gray-400'
                                                    }`}
                                            />
                                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                {template.isSystem ? 'System' : 'Custom'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => applyTemplate(template.id)}
                                    className="mt-4 w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-md"
                                >
                                    Apply Template
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        ))}
                        {templates.length === 0 && (
                            <div className="col-span-full py-16 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <LayoutGrid className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-sm font-semibold text-gray-700">
                                    No templates available
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Create templates to quickly assign permissions
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 'hierarchy':
                return (
                    <div className="p-6">
                        <PermissionTree
                            permissions={permissions}
                            selectedIds={selectedIds}
                            onChange={setSelectedIds}
                            searchTerm={searchTerm}
                        />
                    </div>
                );

            case 'matrix':
                return (
                    <div className="p-6">
                        <ResourceActionMatrix
                            permissions={permissions}
                            selectedPermissions={selectedIds}
                            onChange={setSelectedIds}
                        />
                    </div>
                );

            case 'list':
                return (
                    <div className="p-6 space-y-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search permissions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500"
                            />
                        </div>

                        <div className="space-y-3">
                            {filteredGroups.map((group) => (
                                <div
                                    key={group.name}
                                    className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
                                >
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                        onClick={() => toggleGroup(group.name)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={isAllSelectedInGroup(group)}
                                                indeterminate={isSomeSelectedInGroup(group)}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    selectAllInGroup(group);
                                                }}
                                            />
                                            <h4 className="font-bold text-gray-900">{group.name}</h4>
                                            <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                                                {group.permissions.length}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className={`w-5 h-5 text-gray-400 transition-transform ${expandedGroups.has(group.name) ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </div>
                                    {expandedGroups.has(group.name) && (
                                        <div className="divide-y divide-gray-100">
                                            {group.permissions.map((permission) => (
                                                <div
                                                    key={permission.id}
                                                    className={`flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedIds.includes(permission.id)
                                                        ? 'bg-primary-50/50'
                                                        : ''
                                                        }`}
                                                    onClick={() => togglePermission(permission.id)}
                                                >
                                                    <Checkbox
                                                        checked={selectedIds.includes(permission.id)}
                                                        onChange={() => togglePermission(permission.id)}
                                                        className="mt-0.5"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div
                                                            className={`text-sm font-semibold ${selectedIds.includes(permission.id)
                                                                ? 'text-primary-700'
                                                                : 'text-gray-900'
                                                                }`}
                                                        >
                                                            {permission.displayName || permission.name}
                                                        </div>
                                                        {permission.description && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {permission.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {filteredGroups.length === 0 && (
                            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-gray-700">
                                    No permissions found
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Try adjusting your search terms
                                </p>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumbs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-[1600px] mx-auto px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                        <button
                            onClick={() => router.push('/admin')}
                            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            <span>Admin</span>
                        </button>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <button
                            onClick={() => router.push('/admin/roles')}
                            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <Users className="w-4 h-4" />
                            <span>Roles</span>
                        </button>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{role.name}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-primary-600">Permissions</span>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="bg-gradient-to-br from-primary-50 via-white to-white border-b border-gray-200">
                <div className="max-w-[1600px] mx-auto px-6 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleCancel}
                                className="p-2 hover:bg-white rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900">
                                        Manage Permissions
                                    </h1>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Configure access control for{' '}
                                        <span className="font-bold text-primary-600">
                                            {role.name}
                                        </span>{' '}
                                        role
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Selected
                                </div>
                                <div className="text-2xl font-black text-primary-600 mt-1">
                                    {selectedIds.length}
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Total
                                </div>
                                <div className="text-2xl font-black text-gray-900 mt-1">
                                    {permissions.length}
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                    Coverage
                                    <TrendingUp className="w-3 h-3" />
                                </div>
                                <div className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mt-1">
                                    {coverage}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1600px] mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                    {/* Left: Tabs & Content */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 340px)' }}>
                        {/* Tabs */}
                        <div className="flex items-center gap-6 border-b border-gray-200 px-6 pt-4 flex-shrink-0 bg-white">
                            {[
                                { id: 'templates', label: 'Templates', icon: LayoutGrid },
                                { id: 'matrix', label: 'Matrix', icon: Table },
                                { id: 'hierarchy', label: 'Hierarchy', icon: ListTree },
                                { id: 'list', label: 'List', icon: List },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as TabType)}
                                    className={`group flex items-center gap-2 pb-4 pt-1 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id
                                        ? 'border-primary-600 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                                        }`}
                                >
                                    <tab.icon
                                        className={`w-4 h-4 ${activeTab === tab.id
                                            ? 'text-primary-600'
                                            : 'text-gray-400 group-hover:text-gray-600'
                                            }`}
                                    />
                                    <span className="uppercase tracking-wider text-xs">
                                        {tab.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto">{renderTabContent()}</div>
                    </div>

                    {/* Right: Selection Summary Sidebar */}
                    <div className="space-y-6">
                        {/* Selection Summary */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-primary-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Selection Summary</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">
                                        Permissions Selected
                                    </span>
                                    <span className="text-lg font-black text-primary-600">
                                        {selectedIds.length}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-gray-600">
                                            Coverage
                                        </span>
                                        <span className="font-bold text-primary-600">
                                            {coverage}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300"
                                            style={{ width: `${coverage}%` }}
                                        />
                                    </div>
                                </div>

                                {isDirty && (
                                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                        <span className="text-xs font-semibold text-amber-700">
                                            Unsaved changes
                                        </span>
                                    </div>
                                )}

                                {selectedIds.length > 0 && (
                                    <button
                                        onClick={clearSelection}
                                        className="w-full px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        Clear All Selections
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-gray-900">Quick Tips</h3>
                            </div>
                            <ul className="space-y-2 text-xs text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Use templates for common permission sets</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Matrix view shows resource-action relationships</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Hierarchy shows permission inheritance</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Bar */}
            {isDirty && (
                <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 animate-in slide-in-from-bottom-4 fade-in">
                    <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="border-2"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg shadow-primary-500/30"
                    >
                        {saving ? (
                            <>
                                <LoadingSpinner />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
