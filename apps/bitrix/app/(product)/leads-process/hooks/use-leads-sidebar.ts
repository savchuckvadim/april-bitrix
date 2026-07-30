'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'leads-sidebar-hidden';

/** Состояние сайдбара (свёрнут/развёрнут) с запоминанием в браузере. */
export const useLeadsSidebar = () => {
    const [isOpen, setOpen] = useState(true);

    useEffect(() => {
        try {
            if (localStorage.getItem(STORAGE_KEY) === '1') setOpen(false);
        } catch {
            // приватный режим — остаёмся с дефолтом
        }
    }, []);

    const toggle = useCallback(() => {
        setOpen((value) => {
            const next = !value;
            try {
                localStorage.setItem(STORAGE_KEY, next ? '0' : '1');
            } catch {
                // приватный режим — без запоминания
            }
            return next;
        });
    }, []);

    return { isOpen, toggle };
};
