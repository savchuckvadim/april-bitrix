import { useEffect, useState } from 'react';

/**
 * Хук для проверки монтирования компонента на клиенте
 * Полезно для избежания проблем с SSR
 */
export function useMounted(): boolean {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted;
}
