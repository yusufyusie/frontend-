import { ReactNode } from 'react';
import { usePermission, useRole } from '../hooks/usePermission';

interface PermissionGateProps {
    children: ReactNode;
    permission?: string;
    role?: string;
    fallback?: ReactNode;
}

export function PermissionGate({
    children,
    permission,
    role,
    fallback = null
}: PermissionGateProps) {
    const hasPermission = usePermission(permission || '');
    const hasRole = useRole(role || '');

    // Debug logging
    if (permission) {
        console.log(`🚪 PermissionGate: "${permission}" =>`, hasPermission ? '✅ GRANTED' : '❌ DENIED');
    }
    if (role) {
        console.log(`🚪 RoleGate: "${role}" =>`, hasRole ? '✅ GRANTED' : '❌ DENIED');
    }

    if (permission && !hasPermission) {
        return <>{fallback}</>;
    }

    if (role && !hasRole) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

