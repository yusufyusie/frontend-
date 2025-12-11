'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAccessStore } from '@/store/access.store';
import { authService } from '@/services/auth.service';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();
    const { setUser, setPermissions, setRoles, setClaims, setLoading, reset } = useAccessStore();

    useEffect(() => {
        const init = async () => {
            if (!authService.isAuthenticated()) {
                router.push('/login');
                setLoading(false);
                return;
            }

            try {
                const profile = await authService.getProfile();
                setUser({
                    id: profile.id,
                    email: profile.email,
                    username: profile.username,
                });
                setPermissions(profile.permissions);
                setRoles(profile.roles);
                setClaims(profile.claims);
            } catch (error) {
                console.error('Failed to load profile:', error);
                reset();
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [router, setUser, setPermissions, setRoles, setClaims, setLoading, reset]);

    return <>{children}</>;
}
