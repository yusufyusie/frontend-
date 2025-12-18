'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    footer?: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    footer,
    variant = 'default'
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocus = useRef<HTMLElement | null>(null);

    // Lock body scroll and manage focus
    useEffect(() => {
        if (isOpen) {
            previousFocus.current = document.activeElement as HTMLElement;
            document.body.style.overflow = 'hidden';

            // Focus the modal
            setTimeout(() => {
                modalRef.current?.focus();
            }, 100);
        } else {
            document.body.style.overflow = 'unset';

            // Return focus to previous element
            previousFocus.current?.focus();
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle Escape key
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
        full: 'max-w-7xl'
    };

    const headerVariants = {
        default: 'bg-gradient-to-r from-primary to-primary-600 border-t-4 border-accent',
        success: 'bg-gradient-to-r from-success to-success-600 border-t-4 border-success-700',
        warning: 'bg-gradient-to-r from-warning to-warning-600 border-t-4 border-warning-700',
        danger: 'bg-gradient-to-r from-error to-error-600 border-t-4 border-error-700'
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Enhanced Backdrop with Glassmorphism */}
            <div
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-all duration-300 animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                <div
                    ref={modalRef}
                    className={`relative w-full ${sizeClasses[size]} transform rounded-2xl bg-white shadow-2xl transition-all duration-300 max-h-[90vh] flex flex-col animate-modal-slide-up`}
                    onClick={(e) => e.stopPropagation()}
                    tabIndex={-1}
                >
                    {/* Premium Header with Brand Gradient */}
                    <div className={`${headerVariants[variant]} px-6 py-4 flex-shrink-0 rounded-t-2xl`}>
                        <div className="flex items-center justify-between">
                            <h3
                                id="modal-title"
                                className="text-xl font-bold text-white drop-shadow-sm"
                            >
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-2 text-white/90 hover:bg-white/20 hover:text-white transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
                                aria-label="Close modal"
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content with Custom Scrollbar */}
                    <div className="px-6 py-5 overflow-y-auto flex-1 scrollbar-custom">
                        {children}
                    </div>

                    {/* Premium Footer */}
                    {footer && (
                        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50/80 backdrop-blur-sm flex-shrink-0 rounded-b-2xl">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
