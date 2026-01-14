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
                    {/* Integrated Design Header */}
                    <div className={`${headerVariants[variant]} px-8 py-4 flex-shrink-0 relative overflow-hidden ${mode === 'modal' ? 'rounded-t-3xl' : 'rounded-tl-3xl'}`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <h3
                                    id="modal-title"
                                    className="text-xl font-black text-white drop-shadow-md tracking-tight"
                                >
                                    {title}
                                </h3>
                                {description && (
                                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest leading-none border-l-2 border-white/20 pl-4 py-0.5">
                                        {description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-xl p-2 text-white/90 hover:bg-white/20 hover:text-white transition-all duration-300 hover:rotate-90 focus:outline-none focus:ring-4 focus:ring-white/30 backdrop-blur-sm"
                                aria-label="Terminate transaction"
                            >
                                <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {/* Operational Surface Area (Scrollable) */}
                    <div className="px-8 pt-6 flex-1 overflow-hidden flex flex-col bg-white">
                        <div className="h-full flex flex-col">
                            {children}
                        </div>
                    </div>

                    {/* Action Footer (Sticky) */}
                    {footer && (
                        <div className={`border-t border-gray-100 px-8 py-5 bg-gray-50 flex-shrink-0 ${mode === 'modal' ? 'rounded-b-3xl' : 'rounded-bl-3xl'}`}>
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
