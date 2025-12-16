'use client';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { DataTable, type Column } from '@/components/DataTable';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import * as Icons from 'lucide-react';

// Custom Hooks
import { useResources } from '@/hooks/resources/useResources';
import { useResourceFilters } from '@/hooks/resources/useResourceFilters';
import { useMultiSelect } from '@/hooks/shared/useMultiSelect';
import { useModalState } from '@/hooks/shared/useModalState';

// Components
import { ResourcesPageHeader } from '@/components/resources/ResourcesPageHeader';
import { ResourcesStatsCards } from '@/components/resources/ResourcesStatsCards';
import { ResourcesFilterBar } from '@/components/resources/ResourcesFilterBar';

// Existing modals (keeping ResourceFormModal as is since it's well-structured)
import { ResourceFormModal } from '@/components/resources/modals/ResourceFormModal';

import type { Resource } from '@/services/resource.service';

/**
 * Resources Management Page
 * 
 * Orchestrates resource management using custom hooks and presentational components
 * All data is fetched dynamically from the database - no hardcoded values
 */
export default function ResourcesPage() {
    // Data Management
    const {
        resources,
        stats,
        loading,
        create,
        update,
        delete: deleteResource,
        bulkDelete,
    } = useResources();

    // Filtering
    const filters = useResourceFilters(resources);

    // Multi-Selection
    const selection = useMultiSelect(filters.filteredResources);

    // Modal States
    const createModal = useModalState<void>();
    const editModal = useModalState<Resource>();
    const deleteModal = useModalState<Resource>();
    const bulkDeleteModal = useModalState<void>();

    /**
     * Handle delete resource
     */
    const handleDelete = async () => {
        const resource = deleteModal.selectedItem;
        if (!resource) return;

        try {
            await deleteResource(resource.id, resource.name);
            deleteModal.close();
        } catch (error) {
            // Error handled in hook
        }
    };

    /**
     * Handle bulk delete
     */
    const handleBulkDelete = async () => {
        try {
            await bulkDelete(selection.selectedIdsArray);
            selection.clear();
            bulkDeleteModal.close();
        } catch (error) {
            // Error handled in hook
        }
    };

    /**
     * Get icon component dynamically
     */
    const getIconComponent = (iconName: string) => {
        const IconComponent = (Icons as any)[iconName];
        return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
    };

    /**
     * Table columns configuration (fully dynamic, no hardcoded values)
     */
    const columns: Column<Resource>[] = [
        {
            key: 'select',
            header: (
                <input
                    type="checkbox"
                    checked={selection.count === filters.filteredResources.length && filters.filteredResources.length > 0}
                    onChange={selection.count === filters.filteredResources.length ? selection.deselectAll : selection.selectAll}
                    className="w-4 h-4 rounded"
                />
            ),
            sortable: false,
            render: (resource) => (
                <input
                    type="checkbox"
                    checked={selection.isSelected(resource.id)}
                    onChange={() => selection.toggle(resource.id)}
                    className="w-4 h-4 rounded"
                />
            ),
        },
        {
            key: 'icon',
            header: 'Icon',
            sortable: false,
            render: (resource) => (
                <div className="flex items-center justify-center p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg text-white">
                    {resource.iconName ? getIconComponent(resource.iconName) : <Icons.Package className="w-5 h-5" />}
                </div>
            ),
        },
        {
            key: 'name',
            header: 'Name',
            sortable: true,
        },
        {
            key: 'displayName',
            header: 'Display Name',
            sortable: true,
        },
        {
            key: 'category',
            header: 'Category',
            sortable: true,
            render: (resource) => (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {resource.category || 'Uncategorized'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            sortable: false,
            render: (resource) => (
                <div className="flex flex-wrap gap-1">
                    {(resource.actions || []).map((action, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                        >
                            {action}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            key: 'isActive',
            header: 'Status',
            sortable: true,
            render: (resource) => (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${resource.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                    }`}>
                    {resource.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'manage',
            header: 'Manage',
            sortable: false,
            render: (resource) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => editModal.open(resource)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Icons.Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => deleteModal.open(resource)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Icons.Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    // Loading State
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <ResourcesPageHeader onCreateClick={() => createModal.open()} />

            {/* Stats Cards */}
            <ResourcesStatsCards
                stats={stats}
                selectedCount={selection.count}
            />

            {/* Bulk Actions */}
            {selection.hasSelection && (
                <div className="card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">{selection.count}</span> item(s) selected
                        </p>
                        <button
                            onClick={selection.deselectAll}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Deselect All
                        </button>
                    </div>
                    <button
                        onClick={() => bulkDeleteModal.open()}
                        className="btn btn-danger flex items-center gap-2"
                    >
                        <Icons.Trash2 className="w-4 h-4" />
                        Delete Selected
                    </button>
                </div>
            )}

            {/* Filter Bar */}
            <ResourcesFilterBar
                searchTerm={filters.searchTerm}
                setSearchTerm={filters.setSearchTerm}
                filterCategory={filters.filterCategory}
                setFilterCategory={filters.setFilterCategory}
                uniqueCategories={filters.uniqueCategories.filter((c): c is string => c != null)}
            />

            {/* Resources Table */}
            <div className="card">
                <DataTable
                    data={filters.filteredResources}
                    columns={columns}
                    searchable={false}
                    pageSize={10}
                    emptyMessage="No resources found"
                />
            </div>

            {/* Modals */}
            <ResourceFormModal
                isOpen={createModal.isOpen}
                onClose={createModal.close}
                onSubmit={create}
                mode="create"
            />

            <ResourceFormModal
                isOpen={editModal.isOpen}
                onClose={editModal.close}
                onSubmit={async (data) => {
                    if (editModal.selectedItem) {
                        await update(editModal.selectedItem.id, data);
                    }
                }}
                mode="edit"
                resource={editModal.selectedItem || undefined}
            />

            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.close}
                onConfirm={handleDelete}
                title="Delete Resource"
                message={`Are you sure you want to delete resource "${deleteModal.selectedItem?.name}"? This will also delete all associated permissions.`}
                confirmText="Delete"
                type="danger"
            />

            <ConfirmDialog
                isOpen={bulkDeleteModal.isOpen}
                onClose={bulkDeleteModal.close}
                onConfirm={handleBulkDelete}
                title="Delete Multiple Resources"
                message={`Are you sure you want to delete ${selection.count} resource(s)? This action cannot be undone.`}
                confirmText="Delete All"
                type="danger"
            />
        </div>
    );
}
