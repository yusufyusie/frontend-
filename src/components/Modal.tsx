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
    icon?: ReactNode;
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
    mode = 'modal',
    icon
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
        sm: 'max-w-lg',
        md: 'max-w-3xl',
        lg: 'max-w-5xl',
        xl: 'max-w-7xl',
        '2xl': 'max-w-[1400px]',
        '3xl': 'max-w-[1600px]',
        '4xl': 'max-w-[1800px]',
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

            <div className={`flex min-h-full ${mode === 'modal' ? 'items-center justify-center p-4 sm:pl-[15%]' : ''}`}>
                <div
                    ref={modalRef}
                    className={`relative w-full ${size == 'full' && mode !== 'drawer' ? 'max-w-7xl' : sizeClasses[size]} transform bg-white shadow-2xl transition-all duration-300 flex flex-col overflow-hidden
                        ${mode === 'modal'
                            ? 'rounded-[2rem] animate-in fade-in zoom-in-95 max-h-[90dvh] h-auto'
                            : 'fixed inset-y-0 right-0 h-[100dvh] w-full sm:w-[500px] md:w-[600px] lg:w-[700px] xl:w-[800px] rounded-l-[1.5rem] sm:rounded-l-[2.5rem] animate-in slide-in-from-right shadow-2xl'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                    tabIndex={-1}
                >
                    {/* Header: Fixed Height, Persistent */}
                    <div className="px-6 py-5 flex-shrink-0 bg-white border-b border-gray-100 z-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl ${iconBg[variant]} shadow-sm`}>
                                    {icon || <StatusIcon />}
                                </div>
                                <div className="flex items-center gap-3">
                                    <h3 id="modal-title" className="text-xl font-black text-[#16284F] tracking-tighter leading-none whitespace-nowrap">
                                        {title}
                                    </h3>
                                    {description && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                            <Text size="11px" fw={800} c="dimmed" tt="uppercase" lts="1px" className="opacity-80 whitespace-nowrap">
                                                {description}
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-300 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 active:scale-95"
                                aria-label="Close modal"
                            >
                                <X size={22} strokeWidth={3} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Body: Confined between Header & Footer */}
                    <div className="flex-1 overflow-y-auto scrollbar-custom bg-[#F8FAFC]/50 p-4 sm:p-6 md:p-8 custom-scrollbar min-h-0">
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {children}
                        </div>
                    </div>

                    {/* Footer: Always Visible, Persistent Shadow */}
                    {footer && (
                        <div className="px-8 py-5 bg-white border-t border-gray-100 flex-shrink-0 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
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
