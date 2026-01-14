'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Info, Trash2, X, CheckCircle2 } from 'lucide-react';

/**
 * Props for the ConfirmDialog component
 */
interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

/**
 * Premium Confirmation Dialog
 * Provides a highly visible, accessible, and theme-aware confirmation interface
 * for critical or destructive user actions.
 */
export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm Action',
    cancelText = 'Cancel',
    type = 'danger'
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    // Escape key and scroll lock management
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                document.body.style.overflow = 'unset';
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Semantic configuration mapping
    const themeConfig = {
        danger: {
            icon: <Trash2 className="w-8 h-8 text-red-600" />,
            bg: 'bg-red-50',
            border: 'border-red-100',
            button: 'bg-red-600 hover:bg-red-700 shadow-red-200',
            accent: 'text-red-700'
        },
        warning: {
            icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
            accent: 'text-amber-700'
        },
        info: {
            icon: <Info className="w-8 h-8 text-primary" />,
            bg: 'bg-primary/5',
            border: 'border-primary/10',
            button: 'bg-primary hover:bg-primary-600 shadow-primary/20',
            accent: 'text-primary-700'
        }
    };

    const config = themeConfig[type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop layer with occlusion and visual noise reduction */}
            <div
                className="fixed inset-0 bg-gray-950/70 backdrop-blur-md transition-all duration-300 animate-fade-in"
                onClick={onClose}
            />

            {/* Transactional Boundary Surface */}
            <div
                ref={dialogRef}
                className="relative w-full max-w-md transform overflow-hidden rounded-[2.5rem] bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/10 animate-modal-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Visual indicator section */}
                <div className={`${config.bg} p-10 flex flex-col items-center text-center space-y-4`}>
                    <div className="p-5 bg-white rounded-3xl shadow-xl shadow-black/5 ring-1 ring-black/[0.03]">
                        {config.icon}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h3>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${config.accent}`}>
                            Verification Required
                        </p>
                    </div>
                </div>

                {/* Information content context */}
                <div className="px-10 py-8 bg-white">
                    <p className="text-gray-600 text-center leading-relaxed font-medium">
                        {message}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 mt-10">
                        <button
                            onClick={onClose}
                            className="flex-1 px-8 py-4 rounded-2xl border-2 border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-200 hover:bg-gray-50 transition-all duration-300 font-bold text-sm uppercase tracking-widest"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-8 py-4 rounded-2xl text-white shadow-lg transition-all duration-300 active:scale-95 font-bold text-sm uppercase tracking-widest ${config.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>

                {/* Termination trigger */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-xl bg-black/5 text-gray-400 hover:text-gray-900 hover:bg-black/10 transition-all duration-300"
                    aria-label="Terminate transaction"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
