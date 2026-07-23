'use client';

import { useEffect, useState } from 'react';

/**
 * Память UI-выбора (select показателя и т.п.) в localStorage.
 * Next-safe: на сервере и первом рендере значение пустое (гидрация
 * совпадает), чтение — только на клиенте в эффекте.
 */
export const usePersistedSelection = (storageKey: string) => {
    const [value, setValue] = useState('');

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(storageKey);
            if (stored) setValue(stored);
        } catch {
            // localStorage недоступен — работаем без памяти
        }
    }, [storageKey]);

    const set = (next: string) => {
        setValue(next);
        try {
            window.localStorage.setItem(storageKey, next);
        } catch {
            // noop
        }
    };

    return [value, set] as const;
};
