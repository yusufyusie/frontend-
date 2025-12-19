'use client';

import { useEffect, useRef } from 'react';

interface FocusTrapProps {
    children: React.ReactNode;
    active?: boolean;
    onEscape?: () => void;
}

export function FocusTrap({ children, active = true, onEscape }: FocusTrapProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!active || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Focus first element on mount
        firstElement?.focus();

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') {
                if (e.key === 'Escape' && onEscape) {
                    e.preventDefault();
                    onEscape();
                }
                return;
            }

            if (focusableElements.length === 0) return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleTabKey as any);

        return () => {
            container.removeEventListener('keydown', handleTabKey as any);
        };
    }, [active, onEscape]);

    if (!active) return <>{children}</>;

    return <div ref={containerRef}>{children}</div>;
}
