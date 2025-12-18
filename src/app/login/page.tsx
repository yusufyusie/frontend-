'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Login and get token
            const { token, user } = await authService.login({ email, password });

            // Fetch full user profile with permissions
            const profile = await authService.getProfile();

            // Update access store with user data
            const { useAccessStore } = await import('@/store/access.store');
            useAccessStore.getState().setUser({
                id: profile.id,
                email: profile.email,
                username: profile.username
            });
            useAccessStore.getState().setPermissions(profile.permissions || []);
            useAccessStore.getState().setRoles(profile.roles || []);
            useAccessStore.getState().setClaims(profile.claims || {});
            useAccessStore.getState().setLoading(false);

            // Redirect to admin
            router.push('/admin');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white font-bold text-2xl">ET</span>
                    </div>
                    <h1 className="text-3xl font-bold">Ethiopian IT Park</h1>
                    <p className="text-gray-600 mt-1">Accesscontrol System</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            placeholder="admin@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
                    <p className="font-semibold mb-2 text-primary-900">✅ Test Credentials:</p>
                    <ul className="space-y-1.5 text-sm">
                        <li className="flex items-center gap-2">
                            <span className="text-primary-600">👑</span>
                            <span className="text-gray-700">
                                <strong>Admin:</strong> admin@example.com / <code className="bg-primary-100 px-1.5 py-0.5 rounded text-primary-800">Admin@123</code>
                            </span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-primary-600">👔</span>
                            <span className="text-gray-700">
                                <strong>Manager:</strong> manager@example.com / <code className="bg-primary-100 px-1.5 py-0.5 rounded text-primary-800">Manager@123</code>
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
