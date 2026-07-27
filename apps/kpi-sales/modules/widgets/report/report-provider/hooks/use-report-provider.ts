'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useReport } from '@/modules/entities/report';

/**
 * Состояние каркаса отчёта: mounted-гейт (стор гидрируется на клиенте —
 * до маунта не рендерим, чтобы не ловить hydration mismatch), dev-байпас
 * превью Processing, статус загрузки/наличия данных и открытость фильтров.
 */
export const useReportProvider = () => {
    const { report, isLoading, isFetched } = useReport();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    return {
        mounted,
        // Dev-превью Processing-вариантов не зависит от состояния отчёта.
        isDevProcessingPreview:
            pathname?.startsWith('/dev/processing') ?? false,
        isReportLoading: isLoading || !isFetched,
        hasReportData: Boolean(report?.length),
        isFilterOpen,
        setIsFilterOpen,
    };
};
