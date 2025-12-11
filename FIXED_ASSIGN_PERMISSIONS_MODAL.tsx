// Assign Permissions Modal Component with PermissionMatrix
function AssignPermissionsModal({ isOpen, role, permissions, onClose, onSuccess }: {
    isOpen: boolean;
    role: Role | null;
    permissions: Permission[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Update selected permissions when role changes
    useEffect(() => {
        if (role && role.permissions) {
            setSelectedPermissionIds(role.permissions.map(p => p.id));
        } else {
            setSelectedPermissionIds([]);
        }
    }, [role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;

        try {
            setSubmitting(true);
            await rolesService.assignPermissions(role.id, selectedPermissionIds);
            toast.success('Permissions assigned successfully');
            onClose();
            onSuccess();
        } catch (error: any) {
            toast.error('Failed to assign permissions: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Don't render if no role selected
    if (!role) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Assign Permissions: ${role.name}`} size="xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="alert alert-info">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="font-medium">Select permissions for this role</p>
                        <p className="text-sm mt-1 opacity-90">
                            Click checkboxes to select/deselect permissions. Click "Save Permissions" button when done.
                        </p>
                    </div>
                </div>

                {/* Permission Matrix */}
                <PermissionMatrix
                    permissions={permissions}
                    selectedPermissions={selectedPermissionIds}
                    onChange={setSelectedPermissionIds}
                    disabled={submitting}
                />

                {/* Save Buttons - Always Visible */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Save Permissions
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
