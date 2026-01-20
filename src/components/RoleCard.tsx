import { Shield, Users, Key, Settings, Edit, Trash } from 'lucide-react';
import type { Role } from '@/services/roles.service';

/**
 * Props for the RoleCard component
 */
interface RoleCardProps {
    role: Role;
    isSelected: boolean;
    onSelect: (id: number) => void;
    onEdit: () => void;
    onDelete: () => void;
    onAssignPermissions: () => void;
    onAssignMenus: () => void;
}

/**
 * Visual representation of a security role
 * Displays role details, usage statistics, and administrative actions
 */
export function RoleCard({
    role,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    onAssignPermissions,
    onAssignMenus,
}: RoleCardProps) {
    const userCount = role._count?.userRoles || 0;
    const permissionCount = role._count?.rolePermissions || 0;

    return (
        <div
            className={`
                bg-white rounded-2xl p-6 border transition-all duration-300 relative group
                ${isSelected ? 'border-primary ring-4 ring-primary/10 shadow-lg' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'}
            `}
        >
            {/* Contextual selection control */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                {role.isSystem && (
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                        System Default
                    </span>
                )}
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(role.id)}
                    className="w-5 h-5 rounded-lg border-gray-200 text-primary focus:ring-primary cursor-pointer transition-all"
                    disabled={role.isSystem}
                />
            </div>

            {/* Visual identification */}
            <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 truncate tracking-tight">{role.name}</h3>
                    <div className="text-[10px] font-mono text-gray-400 mt-0.5 uppercase tracking-tighter">UID: {role.id}</div>
                </div>
            </div>

            {/* Role description */}
            <p className="text-sm text-gray-500 leading-relaxed mb-6 line-clamp-2 min-h-[40px]">
                {role.description || 'No business description provided for this security role.'}
            </p>

            {/* Aggregated usage statistics */}
            <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2 group/stat">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover/stat:text-accent transition-colors">
                        <Users className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-700 leading-none">{userCount}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Users</div>
                    </div>
                </div>
                <div className="flex items-center gap-2 group/stat">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover/stat:text-secondary transition-colors">
                        <Key className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-700 leading-none">{permissionCount}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Rules</div>
                    </div>
                </div>
            </div>

            {/* Administrative control matrix */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                <button
                    onClick={onAssignPermissions}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-secondary/5 text-secondary rounded-xl hover:bg-secondary/10 transition-all font-bold text-[10px] uppercase tracking-widest border border-secondary/10 shadow-sm"
                >
                    <Key className="w-3.5 h-3.5" strokeWidth={2.5} />
                    <span>ACL</span>
                </button>
                <button
                    onClick={onAssignMenus}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition-all font-bold text-[10px] uppercase tracking-widest border border-teal-100 shadow-sm"
                    style={{ color: '#0C7C92', borderColor: 'rgba(12, 124, 146, 0.2)' }}
                >
                    <Settings className="w-3.5 h-3.5" strokeWidth={2.5} />
                    <span>Menus</span>
                </button>
                <button
                    onClick={onEdit}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-bold text-[10px] uppercase tracking-widest border border-blue-100 shadow-sm"
                >
                    <Edit className="w-3.5 h-3.5" strokeWidth={2.5} />
                    <span>Edit</span>
                </button>
                <button
                    onClick={onDelete}
                    disabled={role.isSystem}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest border ${role.isSystem ? 'bg-gray-50 text-gray-300 cursor-not-allowed border-gray-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100 shadow-sm'}`}
                >
                    <Trash className="w-3.5 h-3.5" strokeWidth={2.5} />
                    <span>Drop</span>
                </button>
            </div>
        </div>
    );
}
