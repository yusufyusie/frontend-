import { Edit, Eye, Trash, Shield, Users } from 'lucide-react';
import type { Permission } from '@/services/permissions.service';

/**
 * Props for the PermissionCard component
 */
interface PermissionCardProps {
    permission: Permission;
    isSelected: boolean;
    onSelect: (id: number) => void;
    onEdit: () => void;
    onDelete: () => void;
    onViewDetails: () => void;
}

/**
 * Individual permission record visualization
 * Displays identity, taxonomy, and impact statistics for a single rule
 */
export function PermissionCard({
    permission,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    onViewDetails,
}: PermissionCardProps) {
    const usageCount = permission._count?.rolePermissions || 0;

    return (
        <div
            className={`
                relative p-5 border-none rounded-2xl transition-all duration-300 group
                ${isSelected
                    ? 'bg-primary/5 ring-4 ring-primary/10'
                    : 'bg-white shadow-sm hover:shadow-md hover:-translate-y-1'
                }
            `}
        >
            {/* Contextual selection control */}
            <div className="absolute top-4 left-4 z-10 transition-transform group-hover:scale-110">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(permission.id)}
                    className="w-5 h-5 rounded-lg border-gray-200 text-primary focus:ring-primary cursor-pointer transition-all"
                />
            </div>

            {/* Taxonomy information and Administrative control */}
            <div className="flex justify-between items-start mb-4 ml-6">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-gray-50 border border-gray-100 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                    <Shield className="w-3 h-3 text-gray-400 group-hover:text-primary" />
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-primary uppercase tracking-widest leading-none">
                        {permission.groupName || 'Global'}
                    </span>
                </div>

                <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onEdit}
                        className="p-1.5 hover:bg-primary/10 text-gray-400 hover:text-primary rounded-lg transition-all"
                        title="Edit Rule"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onViewDetails}
                        className="p-1.5 hover:bg-secondary/10 text-gray-400 hover:text-secondary rounded-lg transition-all"
                        title="Inspect Registry"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-all"
                        title="Withdraw Permission"
                    >
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Permission identity and description */}
            <div className="ml-6">
                <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight truncate">
                    {permission.displayName || permission.name}
                </h3>
                <div className="mt-0.5 text-[10px] font-mono text-gray-400 uppercase tracking-tighter">
                    {permission.name}
                </div>

                <p className="mt-3 text-xs text-gray-500 leading-relaxed line-clamp-2 min-h-[32px]">
                    {permission.description || 'No detailed business documentation provided for this system access rule.'}
                </p>

                {/* Impact analysis statistics */}
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 group/stat">
                        <Users className="w-3.5 h-3.5 text-gray-300 group-hover:text-accent transition-colors" />
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-700 uppercase tracking-widest leading-none">
                            Used by {usageCount} {usageCount === 1 ? 'Role' : 'Roles'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
