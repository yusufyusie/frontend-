'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { X, Layers, Check, AlertTriangle, AlertCircle } from 'lucide-react';
import { Text } from '@mantine/core';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    footer?: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger';
    mode?: 'modal' | 'drawer';
}

/**
 * Premium Standard Modal System
 * Matches the requested aesthetic: White header, branded teal icons, Card-based grouping.
 */
export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    footer,
    variant = 'default',
    mode = 'modal'
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocus = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            previousFocus.current = document.activeElement as HTMLElement;
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                modalRef.current?.focus();
            }, 100);
        } else {
            document.body.style.overflow = 'unset';
            previousFocus.current?.focus();
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-5xl',
        '3xl': 'max-w-6xl',
        '4xl': 'max-w-7xl',
        full: 'w-full'
    };

    const StatusIcon = () => {
        switch (variant) {
            case 'success': return <Check className="h-6 w-6 text-emerald-600" />;
            case 'warning': return <AlertTriangle className="h-6 w-6 text-amber-600" />;
            case 'danger': return <AlertCircle className="h-6 w-6 text-rose-600" />;
            default: return <Layers className="h-6 w-6 text-[#0C7C92]" />;
        }
    };

    const iconBg = {
        default: 'bg-[#0C7C92]/10',
        success: 'bg-emerald-50',
        warning: 'bg-amber-50',
        danger: 'bg-rose-50'
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className={`flex min-h-full ${mode === 'modal' ? 'items-center justify-center p-4' : ''}`}>
                <div
                    ref={modalRef}
                    className={`relative w-full ${size == 'full' && mode !== 'drawer' ? 'max-w-7xl' : sizeClasses[size]} transform bg-white shadow-2xl transition-all duration-300 flex flex-col overflow-hidden
                        ${mode === 'modal'
                            ? 'rounded-[2.5rem] animate-in fade-in zoom-in-95 max-h-[92vh]'
                            : 'fixed inset-y-0 right-0 h-full rounded-l-[2.5rem] animate-in slide-in-from-right shadow-2xl'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                    tabIndex={-1}
                >
                    {/* Header: White, Professional, Branded Icon */}
                    <div className="px-6 py-5 flex-shrink-0 bg-white border-b border-gray-100 z-30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl ${iconBg[variant]}`}>
                                    <StatusIcon />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                                    <h3 id="modal-title" className="text-xl font-extrabold text-[#0C7C92] tracking-tight">
                                        {title}
                                    </h3>
                                    {description && (
                                        <Text size="sm" fw={600} c="dimmed" className="hidden sm:block">
                                            {description}
                                        </Text>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200 active:scale-95"
                                aria-label="Close modal"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Body: Soft Background for Card Contrast */}
                    <div className="flex-1 overflow-y-auto scrollbar-custom bg-gray-100/80 p-6">
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {children}
                        </div>
                    </div>

                    {/* Footer: Persistent, Aligned Right, Premium Background */}
                    {footer && (
                        <div className="px-6 py-5 bg-gray-100/50 border-t border-gray-200 flex-shrink-0 z-20">
                            <div className="flex justify-end gap-3 items-center">
                                {footer}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 20px;
                    border: 2px solid transparent;
                    background-clip: content-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                    background-clip: content-box;
                }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
            `}</style>
        </div>
    );
}
