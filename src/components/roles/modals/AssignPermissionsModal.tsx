import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Check,
  X,
  LayoutGrid,
  ListTree,
  Table,
  Globe,
  ShieldCheck,
  History,
  ChevronDown,
  AlertCircle,
  ArrowRight,
  Save,
  Trash
} from 'lucide-react';
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  permissionTemplatesService,
  type PermissionTemplate,
} from "@/services/permission-templates.service";
import { toast } from "@/components/Toast";
import type { Permission } from "@/services/permissions.service";
import type { Role } from "@/services/roles.service";
import { rolesService } from "@/services/roles.service";
import { PermissionTree } from "@/components/PermissionTree";
import { ResourceActionMatrix } from "@/components/ResourceActionMatrix";

/**
 * Props for the AssignPermissionsModal component
 */
interface AssignPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (roleId: number, permissionIds: number[]) => Promise<void>;
  role: Role | null;
  permissions: Permission[];
}

/**
 * Internal group descriptor for permissions taxonomy
 */
interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

/**
 * Valid visualization strategies for permission assignment
 */
type TabType = "templates" | "custom" | "tree" | "matrix";

/**
 * Administrative Control Center for Role-Based Access Control (RBAC)
 * Orchestrates technical rule assignment via templates, matrices, and hierarchical trees.
 */
export function AssignPermissionsModal({
  isOpen,
  onClose,
  onAssign,
  role,
  permissions,
}: AssignPermissionsModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [initialSelectedIds, setInitialSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("templates");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Derive logical taxonomy groups from raw registry entries
  const groupedPermissions = useMemo(() => {
    const groups = permissions.reduce(
      (acc, perm) => {
        const groupName = perm.groupName || "General";
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

  // Determine delta between initial state and current selection
  const isDirty = useMemo(() => {
    if (selectedIds.length !== initialSelectedIds.length) return true;
    const sortedSelected = [...selectedIds].sort((a, b) => a - b);
    const sortedInitial = [...initialSelectedIds].sort((a, b) => a - b);
    return sortedSelected.some((id, index) => id !== sortedInitial[index]);
  }, [selectedIds, initialSelectedIds]);

  // Apply search filtering across the taxonomy
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

  /**
   * Toggle expansion of a logical group in the list view
   */
  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  /**
   * Toggle individual permission selection
   */
  const togglePermission = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  /**
   * Perform bulk selection/deselection for a group
   */
  const selectAllInGroup = (group: PermissionGroup) => {
    const groupIds = group.permissions.map((p) => p.id);
    const allSelectedInGroup = groupIds.every(id => selectedIds.includes(id));

    setSelectedIds((prev) => {
      if (allSelectedInGroup) {
        return prev.filter(id => !groupIds.includes(id));
      } else {
        const newSelected = new Set([...prev, ...groupIds]);
        return Array.from(newSelected);
      }
    });
  };

  // Load templates on open
  useEffect(() => {
    if (isOpen) {
      const loadTemplates = async () => {
        try {
          const data = await permissionTemplatesService.getAll();
          setTemplates(data || []);
        } catch (error) {
          // Errors managed via centralized logging
        }
      };
      loadTemplates();
      setExpandedGroups(new Set());
    }
  }, [isOpen]);

  // Load current role permissions
  useEffect(() => {
    if (isOpen && role) {
      const fetchAssignedPermissions = async () => {
        try {
          const roleWithPermissions = await rolesService.getOne(role.id);
          const currentIds =
            roleWithPermissions.permissions?.map((p) => p.id) || [];
          setSelectedIds(currentIds);
          setInitialSelectedIds(currentIds);
        } catch (error) {
          toast.error("Failed to load current permissions");
        }
      };
      fetchAssignedPermissions();
    }
  }, [isOpen, role]);

  /**
   * Apply template
   */
  const applyTemplate = async (templateId: number) => {
    try {
      setLoading(true);
      const permissionIds =
        await permissionTemplatesService.evaluate(templateId);
      setSelectedIds(permissionIds || []);
      toast.success("Template applied successfully");
    } catch (error) {
      toast.error("Template evaluation error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save changes
   */
  const handleAssign = async () => {
    if (!role) return;
    try {
      setLoading(true);
      await onAssign(role.id, selectedIds);
      onClose();
      toast.success("Role permissions updated successfully");
    } catch (error) {
      toast.error("Failed to update permissions");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear selection
   */
  const clearSelection = () => setSelectedIds([]);

  /**
   * Logic for indeterminate checkbox states
   */
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

  if (!role) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case "templates":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group relative bg-white/50 backdrop-blur-sm rounded-[2rem] border border-gray-100 p-6 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500"
              >
                <div className="flex items-start gap-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                    style={{ backgroundColor: `${template.color}15`, color: template.color }}
                  >
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-lg font-black text-gray-900 tracking-tight group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${template.isSystem ? 'bg-primary' : 'bg-gray-400'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      {template.isSystem ? 'System' : 'Custom'}
                    </span>
                  </div>
                  <Button
                    onClick={() => applyTemplate(template.id)}
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    className="bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 transition-all"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Apply Template <ArrowRight className="w-3.5 h-3.5" /></>
                    )}
                  </Button>
                </div>
              </div>
            ))}
            {templates.length === 0 && (
              <div className="col-span-full py-24 text-center space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-gray-50/50">
                  <Globe className="w-10 h-10 text-gray-200" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Templates</p>
                  <p className="text-gray-400 font-medium">No permission templates found.</p>
                </div>
              </div>
            )}
          </div>
        );
      case "tree":
        return (
          <div className="animate-in fade-in duration-500 bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100">
            <PermissionTree
              permissions={permissions}
              selectedIds={selectedIds}
              onChange={setSelectedIds}
              searchTerm={searchTerm}
            />
          </div>
        );
      case "matrix":
        return (
          <div className="animate-in fade-in duration-500 bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xl shadow-black/5">
            <ResourceActionMatrix
              permissions={permissions}
              selectedPermissions={selectedIds}
              onChange={setSelectedIds}
            />
          </div>
        );
      case "custom":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-10 py-6 bg-white border-gray-200 focus:ring-primary/20 focus:border-primary rounded-xl text-sm"
              />
            </div>

            <div className="space-y-4">
              {filteredGroups.map((group) => (
                <div
                  key={group.name}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-colors border-b border-gray-100"
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
                        className="w-4 h-4 rounded border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {group.name}
                        </h4>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded">
                          {group.permissions.length}
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedGroups.has(group.name) ? "rotate-180" : ""
                        }`}
                    />
                  </div>
                  {expandedGroups.has(group.name) && (
                    <div className="divide-y divide-gray-100">
                      {group.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className={`flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer ${selectedIds.includes(permission.id) ? 'bg-primary/5' : ''
                            }`}
                          onClick={(e) => {
                            e.preventDefault();
                            togglePermission(permission.id);
                          }}
                        >
                          <Checkbox
                            checked={selectedIds.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${selectedIds.includes(permission.id) ? 'text-primary' : 'text-gray-900'
                              }`}>
                              {permission.displayName || permission.name}
                            </div>
                            {permission.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
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
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Search className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-900">No permissions found</p>
                <p className="text-xs text-gray-500 mt-1">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        );
    }
  };

  const modalFooter = (
    <div className="w-full border-t border-gray-100 bg-gray-50/50 p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">
              {selectedIds.length}
            </span>
            <span className="text-sm font-medium text-gray-600">Selected</span>
            <Button
              onClick={clearSelection}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs h-auto py-1 px-2"
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isDirty && (
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded animate-pulse">
            Unsaved Changes
          </span>
        )}
        <Button
          variant="outline"
          onClick={onClose}
          className="bg-white"
        >
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          disabled={loading || !isDirty}
          className="bg-primary hover:bg-primary/90 text-white shadow-sm"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Permissions"
      description={`Manage permissions for role: ${role.name}`}
      size="full"
      mode="drawer"
      footer={modalFooter}
    >
      <div className="flex flex-col h-full">
        {/* Modern Tab Navigation (Mantine-inspired) */}
        <div className="flex items-center gap-8 border-b border-gray-200 mb-0 px-1 pt-4 flex-none bg-white z-10 sticky top-0">
          {[
            { id: "templates", label: "Templates", icon: LayoutGrid },
            { id: "matrix", label: "Matrix", icon: Table },
            { id: "tree", label: "Hierarchy", icon: ListTree },
            { id: "custom", label: "List", icon: ListTree },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`group flex items-center gap-2 pb-3 pt-1 text-sm font-bold border-b-2 transition-all duration-200 ${activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-primary" : "text-gray-400 group-hover:text-gray-600"}`} />
              <span className="uppercase tracking-wider text-[11px]">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto scrollbar-custom pt-6 pr-2 -mr-2">
          {renderTabContent()}
        </div>
      </div>
    </Modal>
  );
}
