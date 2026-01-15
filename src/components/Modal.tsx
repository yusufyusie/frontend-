'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

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
 * Universal Modal System
 * Provides a consistent, accessible, and responsive container for contextual operations.
 * Supports multiple size variants and semantic color themes.
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

    // Document body scroll locking and accessibility focus management
    useEffect(() => {
        if (isOpen) {
            previousFocus.current = document.activeElement as HTMLElement;
            document.body.style.overflow = 'hidden';

            // Establish focus within the modal context
            setTimeout(() => {
                modalRef.current?.focus();
            }, 100);
        } else {
            document.body.style.overflow = 'unset';

            // Restore previous interaction context
            previousFocus.current?.focus();
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Global keyboard event orchestration (Escape key containment)
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
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-5xl',
        '3xl': 'max-w-6xl',
        '4xl': 'max-w-7xl',
        full: 'w-full'
    };

    const headerVariants = {
        default: 'bg-gradient-to-r from-primary to-primary-600 border-t-4 border-accent shadow-lg shadow-primary/10',
        success: 'bg-gradient-to-r from-success to-success-600 border-t-4 border-success-700 shadow-lg shadow-success/10',
        warning: 'bg-gradient-to-r from-warning to-warning-600 border-t-4 border-warning-700 shadow-lg shadow-warning/10',
        danger: 'bg-gradient-to-r from-error to-error-600 border-t-4 border-error-700 shadow-lg shadow-error/10'
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Backdrop layer with visual occlusion and containment */}
            <div
                className="fixed inset-0 bg-gray-950/70 backdrop-blur-md transition-all duration-300 animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal layout container - Conditional based on mode */}
            <div className={`flex min-h-full ${mode === 'modal' ? 'items-center justify-center p-4 sm:p-6' : ''}`}>
                <div
                    ref={modalRef}
                    className={`relative w-full ${size == 'full' && mode !== 'drawer' ? 'max-w-7xl' : sizeClasses[size]} transform bg-white shadow-3xl transition-all duration-300 flex flex-col border border-white/10
                        ${mode === 'modal'
                            ? 'rounded-3xl animate-modal-slide-up max-h-[95vh]'
                            : 'fixed inset-y-0 right-0 h-full rounded-l-3xl animate-slide-in-right shadow-2xl'
                        }`}
                    style={{
                        maxWidth: mode === 'drawer' ? 'calc(100vw - 320px)' : undefined
                    }}
                    onClick={(e) => e.stopPropagation()}
                    tabIndex={-1}
                >
                    {/* Integrated Design Header - Fixed */}
                    <div className={`${headerVariants[variant]} px-8 py-5 flex-shrink-0 relative overflow-hidden transition-all duration-500 shadow-md z-20 ${mode === 'modal' ? 'rounded-t-3xl' : 'rounded-tl-3xl'}`}>
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none animate-pulse" />
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
                                    <h3
                                        id="modal-title"
                                        className="text-xl md:text-2xl font-black text-white drop-shadow-lg tracking-tight leading-none"
                                    >
                                        {title}
                                    </h3>
                                </div>
                                {description && (
                                    <div className="hidden sm:block">
                                        <p className="text-white/90 text-[10px] font-black uppercase tracking-[0.2em] leading-none border-l-2 border-white/30 pl-5 py-1">
                                            {description}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-2xl p-2.5 text-white/90 hover:bg-white/25 hover:text-white transition-all duration-500 hover:rotate-90 focus:outline-none focus:ring-4 focus:ring-white/40 backdrop-blur-xl border border-white/10 group"
                                aria-label="Terminate transaction"
                            >
                                <X className="h-5 w-5 transition-transform group-hover:scale-110" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {/* Operational Surface Area (Smart Scrollable) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-white/50 backdrop-blur-sm relative z-10">
                        <div className="px-8 py-8 animate-fade-in-up">
                            {children}
                        </div>
                    </div>

                    {/* Action Footer (Sticky/Persistent) */}
                    {footer && (
                        <div className={`border-t border-gray-100 px-8 py-6 bg-gray-50/80 backdrop-blur-md flex-shrink-0 z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] ${mode === 'modal' ? 'rounded-b-3xl' : 'rounded-bl-3xl'}`}>
                            <div className="flex justify-end gap-3 items-center">
                                {footer}
                            </div>
                        </div>
                    )}

                    {/* Background Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0 rounded-3xl" />
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
