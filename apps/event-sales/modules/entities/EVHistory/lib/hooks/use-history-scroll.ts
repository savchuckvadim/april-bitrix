'use client';

import { useEffect, useRef } from 'react';

/**
 * Скролл-догрузка ленты: отдаёт ref для sentinel-элемента в конце группы;
 * когда он появляется во вьюпорте — зовёт `onReachEnd`. `enabled=false`
 * (нечего грузить / уже грузим) наблюдатель не вешает вовсе.
 */
export const useHistoryScroll = (
    onReachEnd: () => void,
    enabled: boolean,
): ((node: HTMLElement | null) => void) => {
    const nodeRef = useRef<HTMLElement | null>(null);
    const callbackRef = useRef(onReachEnd);
    callbackRef.current = onReachEnd;

    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        observerRef.current?.disconnect();
        if (!enabled || !nodeRef.current) return;

        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                callbackRef.current();
            }
        });
        observer.observe(nodeRef.current);
        observerRef.current = observer;
        return () => observer.disconnect();
    }, [enabled]);

    return (node: HTMLElement | null) => {
        nodeRef.current = node;
    };
};
