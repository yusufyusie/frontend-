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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700" role="main">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <div className="mb-8 text-center">
                    <div
                        className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                        aria-hidden="true"
                    >
                        <span className="text-white font-bold text-2xl">ET</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Ethiopian IT Park</h1>
                    <p className="text-gray-600 mt-1">Access Control System</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form" noValidate>
                    {error && (
                        <div
                            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
                            role="alert"
                            aria-live="assertive"
                            aria-atomic="true"
                        >
                            <span className="sr-only">Error:</span>
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                            <span className="text-red-600" aria-label="required">*</span>
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            placeholder="admin@example.com"
                            required
                            aria-required="true"
                            aria-invalid={error ? 'true' : 'false'}
                            aria-describedby={error ? 'error-message' : undefined}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                            <span className="text-red-600" aria-label="required">*</span>
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            placeholder="••••••••"
                            required
                            aria-required="true"
                            aria-invalid={error ? 'true' : 'false'}
                            aria-describedby={error ? 'error-message' : undefined}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full"
                        aria-busy={loading}
                        aria-label={loading ? 'Signing in, please wait' : 'Sign in to your account'}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200" role="complementary" aria-label="Test credentials">
                    <p className="font-semibold mb-2 text-primary-900">✅ Test Credentials:</p>
                    <ul className="space-y-1.5 text-sm">
                        <li className="flex items-center gap-2">
                            <span className="text-primary-600" aria-hidden="true">👑</span>
                            <span className="text-gray-700">
                                <strong>Admin:</strong> admin@example.com / <code className="bg-primary-100 px-1.5 py-0.5 rounded text-primary-800">Admin@123</code>
                            </span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-primary-600" aria-hidden="true">👔</span>
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
