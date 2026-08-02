'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'april-process-sidebar-hidden';

/**
 * Свёрнутость бокового меню. Читаем в эффекте, а не при инициализации:
 * иначе серверная и клиентская разметка разъедутся.
 */
export const useProcessSidebar = () => {
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        try {
            setIsOpen(localStorage.getItem(STORAGE_KEY) !== '1');
        } catch {
            // приватный режим — оставляем меню открытым
        }
    }, []);

    const toggle = useCallback(() => {
        setIsOpen(prev => {
            const next = !prev;
            try {
                localStorage.setItem(STORAGE_KEY, next ? '0' : '1');
            } catch {
                // приватный режим — работаем без сохранения
            }
            return next;
        });
    }, []);

    return { isOpen, toggle };
};
