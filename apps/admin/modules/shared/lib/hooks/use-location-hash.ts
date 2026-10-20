'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Якорь адреса (`location.hash`) как состояние: читается после монтирования
 * (на сервере его нет), обновляется по `hashchange`. `setHash` меняет адрес
 * без прокрутки и перезагрузки — для оглавлений и секций с якорями.
 */
export const useLocationHash = (): [string, (hash: string) => void] => {
    const [hash, setHashState] = useState('');

    useEffect(() => {
        const read = () => setHashState(window.location.hash);
        read();
        window.addEventListener('hashchange', read);
        return () => window.removeEventListener('hashchange', read);
    }, []);

    const setHash = useCallback((next: string) => {
        const value = next.startsWith('#') ? next : `#${next}`;
        window.history.replaceState(
            null,
            '',
            `${window.location.pathname}${window.location.search}${value}`,
        );
        setHashState(value);
    }, []);

    return [hash, setHash];
};
