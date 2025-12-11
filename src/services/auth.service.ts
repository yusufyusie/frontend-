import { api } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface LoginCredentials {
    email: string;
    password: string;
}

interface User {
    id: number;
    email: string;
    username: string;
    permissions: string[];
    roles: string[];
    claims: Record<string, string>;
}

export const authService = {
    async login(credentials: LoginCredentials) {
        const response = await api.post('/auth/login', credentials);
        const { access_token, user } = response.data;

        localStorage.setItem('access_token', access_token);

        return { token: access_token, user };
    },

    async getProfile(): Promise<User> {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout() {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    },
};
