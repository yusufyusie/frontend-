import { create } from 'zustand';

interface User {
    id: number;
    email: string;
    username: string;
}

interface AccessState {
    user: User | null;
    permissions: string[];
    roles: string[];
    claims: Record<string, string>;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setPermissions: (permissions: string[]) => void;
    setRoles: (roles: string[]) => void;
    setClaims: (claims: Record<string, string>) => void;
    setLoading: (loading: boolean) => void;
    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
    hasClaim: (claimType: string, claimValue: string) => boolean;
    reset: () => void;
}

export const useAccessStore = create<AccessState>((set, get) => ({
    user: null,
    permissions: [],
    roles: [],
    claims: {},
    isLoading: true,

    setUser: (user) => set({ user }),
    setPermissions: (permissions) => {
        console.log('📝 Setting permissions:', permissions);
        set({ permissions });
    },
    setRoles: (roles) => set({ roles }),
    setClaims: (claims) => set({ claims }),
    setLoading: (isLoading) => set({ isLoading }),

    hasPermission: (permission: string) => {
        const permissions = get().permissions;
        const has = permissions.includes(permission);
        if (!has) {
            console.log(`⚠️  Permission "${permission}" not found in:`, permissions);
        }
        return has;
    },

    hasRole: (role: string) => {
        return get().roles.includes(role);
    },

    hasClaim: (claimType: string, claimValue: string) => {
        return get().claims[claimType] === claimValue;
    },

    reset: () => set({
        user: null,
        permissions: [],
        roles: [],
        claims: {},
        isLoading: false,
    }),
}));
