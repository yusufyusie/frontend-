'use client';

import { create } from 'zustand';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    duration?: number;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(7);
        const duration = toast.duration || 5000;

        set((state) => ({
            toasts: [...state.toasts, { ...toast, id, duration }]
        }));

        // Auto remove after duration
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id)
            }));
        }, duration);
    },
    removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
    }))
}));

export function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    return (
        <div
            className="fixed top-20 right-4 z-50 space-y-3 max-w-md"
            role="region"
            aria-label="Notifications"
        >
            {toasts.map((toast, index) => (
                <Toast
                    key={toast.id}
                    toast={toast}
                    onClose={() => removeToast(toast.id)}
                    index={index}
                />
            ))}
        </div>
    );
}

function Toast({ toast, onClose, index }: { toast: Toast; onClose: () => void; index: number }) {
    const [progress, setProgress] = useState(100);
    const duration = toast.duration || 5000;

    // Progress bar animation
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const decrease = (100 / duration) * 50; // Update every 50ms
                return Math.max(0, prev - decrease);
            });
        }, 50);

        return () => clearInterval(interval);
    }, [duration]);

    const variants = {
        success: {
            bg: 'bg-accent-50 border-accent',
            icon: <CheckCircle className="w-6 h-6 text-accent flex-shrink-0" aria-hidden="true" />,
            progress: 'bg-accent'
        },
        error: {
            bg: 'bg-error-50 border-error',
            icon: <XCircle className="w-6 h-6 text-error flex-shrink-0" aria-hidden="true" />,
            progress: 'bg-error'
        },
        warning: {
            bg: 'bg-warning-50 border-warning',
            icon: <AlertCircle className="w-6 h-6 text-warning flex-shrink-0" aria-hidden="true" />,
            progress: 'bg-warning'
        },
        info: {
            bg: 'bg-primary-50 border-primary',
            icon: <Info className="w-6 h-6 text-primary flex-shrink-0" aria-hidden="true" />,
            progress: 'bg-primary'
        }
    };

    const variant = variants[toast.type];
    const delay = index * 100; // Stagger animation

    return (
        <div
            className={`
                ${variant.bg} 
                border-l-4 
                rounded-lg 
                shadow-xl 
                backdrop-blur-sm 
                overflow-hidden
                animate-slide-in-right
                hover:shadow-2xl
                transition-shadow
                duration-300
            `}
            style={{ animationDelay: `${delay}ms` }}
            role="alert"
            aria-live="polite"
        >
            <div className="flex items-start gap-3 p-4">
                {/* Icon with circular background */}
                <div className="flex-shrink-0">
                    {variant.icon}
                </div>

                {/* Message */}
                <p className="flex-1 text-sm font-medium text-gray-900 leading-relaxed pt-0.5">
                    {toast.message}
                </p>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="flex-shrink-0 rounded-lg p-1 hover:bg-gray-900/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4 text-gray-600" aria-hidden="true" />
                </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-gray-200/50">
                <div
                    className={`h-full ${variant.progress} transition-all duration-100 ease-linear`}
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
        </div>
    );
}

// Helper function to show toasts from anywhere
export const toast = {
    success: (message: string, duration?: number) =>
        useToastStore.getState().addToast({ type: 'success', message, duration }),
    error: (message: string, duration?: number) =>
        useToastStore.getState().addToast({ type: 'error', message, duration }),
    info: (message: string, duration?: number) =>
        useToastStore.getState().addToast({ type: 'info', message, duration }),
    warning: (message: string, duration?: number) =>
        useToastStore.getState().addToast({ type: 'warning', message, duration })
};
