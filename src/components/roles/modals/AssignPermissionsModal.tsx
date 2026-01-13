import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  permissionTemplatesService,
  type PermissionTemplate,
} from "@/services/permission-templates.service";
import { toast } from "@/components/Toast";
import type { Permission } from "@/services/permissions.service";
import type { Role } from "@/services/roles.service";
import { rolesService } from "@/services/roles.service";

interface AssignPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (roleId: number, permissionIds: number[]) => Promise<void>;
  role: Role | null;
  permissions: Permission[];
}

interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

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
  const [activeTab, setActiveTab] = useState<"templates" | "custom">(
    "templates",
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Group permissions
  const groupedPermissions = useMemo(() => {
    const groups = permissions.reduce(
      (acc, perm) => {
        if (!acc[perm.groupName]) {
          acc[perm.groupName] = [];
        }
        acc[perm.groupName].push(perm);
        return acc;
      },
      {} as Record<string, Permission[]>,
    );
    return Object.entries(groups).map(([name, perms]) => ({
      name,
      permissions: perms,
    }));
  }, [permissions]);

  // Check if dirty
  const isDirty = useMemo(() => {
    if (selectedIds.length !== initialSelectedIds.length) return true;
    const sortedSelected = [...selectedIds].sort((a, b) => a - b);
    const sortedInitial = [...initialSelectedIds].sort((a, b) => a - b);
    return sortedSelected.some((id, index) => id !== sortedInitial[index]);
  }, [selectedIds, initialSelectedIds]);

  // Filter permissions by search
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groupedPermissions;
    return groupedPermissions
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (perm) =>
            perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            perm.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            perm.description.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [groupedPermissions, searchTerm]);

  // Toggle group expansion
  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  // Toggle permission selection
  const togglePermission = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  // Select all in group
  const selectAllInGroup = (group: PermissionGroup) => {
    const groupIds = group.permissions.map((p) => p.id);
    setSelectedIds((prev) => {
      const newSelected = new Set(prev);
      groupIds.forEach((id) => {
        if (newSelected.has(id)) {
          newSelected.delete(id);
        } else {
          newSelected.add(id);
        }
      });
      return Array.from(newSelected);
    });
  };

  // Load templates
  useEffect(() => {
    if (isOpen) {
      const loadTemplates = async () => {
        try {
          const data = await permissionTemplatesService.getAll();
          setTemplates(data);
        } catch (error) {
          toast.error("Failed to load permission templates");
        }
      };
      loadTemplates();
      setExpandedGroups(new Set());
    }
  }, [isOpen]);

  // Load current assigned permissions
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

  // Apply template
  const applyTemplate = async (templateId: number) => {
    try {
      setLoading(true);
      const permissionIds =
        await permissionTemplatesService.evaluate(templateId);
      setSelectedIds(permissionIds);
      toast.success("Template applied successfully");
    } catch (error) {
      toast.error("Failed to apply template");
    } finally {
      setLoading(false);
    }
  };

  // Handle assign
  const handleAssign = async () => {
    if (!role || selectedIds.length === 0) {
      toast.error("No permissions selected");
      return;
    }
    try {
      setLoading(true);
      await onAssign(role.id, selectedIds);
      onClose();
      toast.success("Permissions assigned successfully");
    } catch (error) {
      toast.error("Failed to assign permissions");
    } finally {
      setLoading(false);
    }
  };

  // Clear selection
  const clearSelection = () => setSelectedIds([]);

  // Is all selected in group
  const isAllSelectedInGroup = (group: PermissionGroup) => {
    const groupIds = group.permissions.map((p) => p.id);
    return groupIds.every((id) => selectedIds.includes(id));
  };

  // Is some selected in group
  const isSomeSelectedInGroup = (group: PermissionGroup) => {
    const groupIds = group.permissions.map((p) => p.id);
    return (
      groupIds.some((id) => selectedIds.includes(id)) &&
      !isAllSelectedInGroup(group)
    );
  };

  if (!role) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Permissions to "${role.name}"`}
      size="xl"
    >
      <div className="space-y-6 p-6 font-primary">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === "templates"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === "custom"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            Custom Selection
          </button>
        </div>

        {/* Content */}
        {activeTab === "templates" ? (
          /* Templates Section */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start space-x-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: template.color || "#6EC9C4" }}
                  >
                    {template.icon || "T"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-secondary truncate">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                  <Button
                    onClick={() => applyTemplate(template.id)}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="ml-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckIcon className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Custom Selection Section */
          <>
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-10"
              />
            </div>

            {/* Permissions Matrix */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredGroups.map((group) => (
                <div
                  key={group.name}
                  className="bg-white rounded-lg shadow-sm border border-gray-200"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 rounded-t-lg"
                    onClick={() => toggleGroup(group.name)}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isAllSelectedInGroup(group)}
                        indeterminate={isSomeSelectedInGroup(group)}
                        onChange={() => selectAllInGroup(group)}
                      />
                      <h4 className="text-lg font-medium text-secondary">
                        {group.name}
                      </h4>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {group.permissions.length}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {
                          group.permissions.filter((p) =>
                            selectedIds.includes(p.id),
                          ).length
                        }{" "}
                        selected
                      </span>
                      <ChevronDownIcon
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedGroups.has(group.name) ? "rotate-180" : ""
                          }`}
                      />
                    </div>
                  </div>
                  {expandedGroups.has(group.name) && (
                    <div className="p-4 space-y-2">
                      {group.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Checkbox
                            checked={selectedIds.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-secondary truncate">
                              {permission.displayName || permission.name}
                            </div>
                            <div className="text-sm text-gray-600 truncate">
                              {permission.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filteredGroups.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No permissions found matching "{searchTerm}"
                </div>
              )}
            </div>
          </>
        )}

        {/* Selection Summary */}
        {selectedIds.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-primary font-medium">
                {selectedIds.length} permission(s) selected
              </span>
              <Button onClick={clearSelection} variant="ghost" size="sm">
                <XMarkIcon className="w-4 h-4" /> Clear All
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Actions - Only show if dirty */}
      {
        isDirty && (
          <div className="flex justify-between items-center border-t border-gray-200 p-4 bg-gray-50/50 rounded-b-lg animate-slide-up-fade">
            <span className="text-sm text-gray-500 italic">
              You have unsaved changes
            </span>
            <div className="flex space-x-3">
              <Button onClick={onClose} variant="ghost" className="hover:bg-gray-200">
                Discard
              </Button>
              <Button
                onClick={handleAssign}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <CheckIcon className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        )
      }
    </Modal>
  );
}

// Helper component for chevron (assuming it's imported or defined)
function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}
