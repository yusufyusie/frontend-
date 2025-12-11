import { useAccessStore } from '../store/access.store';

export function usePermission(permission: string): boolean {
    return useAccessStore((state) => state.hasPermission(permission));
}

export function useRole(role: string): boolean {
    return useAccessStore((state) => state.hasRole(role));
}

export function useClaim(claimType: string, claimValue: string): boolean {
    return useAccessStore((state) => state.hasClaim(claimType, claimValue));
}
