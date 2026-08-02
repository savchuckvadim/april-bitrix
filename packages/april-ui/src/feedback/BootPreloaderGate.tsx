'use client';

import { useEffect } from 'react';
import { BOOT_PRELOADER_HIDE_CLASS, BOOT_PRELOADER_ID } from './BootPreloader';

export interface BootPreloaderGateProps {
    /** Задержка перед удалением из DOM, мс (должна перекрывать transition). */
    removeAfterMs?: number;
}

/**
 * Гасит boot-прелоадер, как только React гидратировался.
 *
 * Отдельным клиентским компонентом, потому что сам BootPreloader обязан
 * рендериться на сервере (он и нужен до загрузки JS). Приложениям, у которых
 * нет своего App-гейта, достаточно отрендерить этот компонент рядом.
 *
 * Ничего не рисует.
 */
export const BootPreloaderGate = ({
    removeAfterMs = 400,
}: BootPreloaderGateProps) => {
    useEffect(() => {
        const boot = document.getElementById(BOOT_PRELOADER_ID);
        if (!boot) return;
        boot.classList.add(BOOT_PRELOADER_HIDE_CLASS);
        const timer = setTimeout(() => boot.remove(), removeAfterMs);
        return () => clearTimeout(timer);
    }, [removeAfterMs]);

    return null;
};
