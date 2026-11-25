'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useReport } from '@/modules/entities/report';
import { useReportFilterPanel } from '@/modules/feature/report-flow';

/**
 * Кап полноэкранного Processing: счётчик 60с + «почти готово» 3с —
 * дальше рендерим каркас страницы (фильтры доступны, можно изменить
 * период/состав и переотправить запрос), а незавершённая загрузка
 * показывается индикаторами самих виджетов.
 */
const PROCESSING_CAP_MS = 63_000;

/**
 * Состояние каркаса отчёта: mounted-гейт (стор гидрируется на клиенте —
 * до маунта не рендерим, чтобы не ловить hydration mismatch), dev-байпас
 * превью Processing, статус загрузки/наличия данных и открытость фильтров
 * (она живёт в стор вместе с черновиком фильтра: открытие делает снимок
 * действующего фильтра, закрытие без «Применить» его выбрасывает).
 */
export const useReportProvider = () => {
    const { report, isLoading, isFetched } = useReport();
    const { isOpen: isFilterOpen, setOpen: setIsFilterOpen } =
        useReportFilterPanel();
    const [mounted, setMounted] = useState(false);
    const [processingCapped, setProcessingCapped] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Каркас размонтируется при уходе со страниц отчёта (например, на
    // «Разборы звонков»): панель закрывается, брошенный черновик не
    // переживает уход — как раньше, когда открытость жила в состоянии каркаса.
    useEffect(() => () => setIsFilterOpen(false), [setIsFilterOpen]);

    const reportPending = isLoading || !isFetched;

    useEffect(() => {
        if (!reportPending) {
            setProcessingCapped(false);
            return;
        }
        const timer = setTimeout(
            () => setProcessingCapped(true),
            PROCESSING_CAP_MS,
        );
        return () => clearTimeout(timer);
    }, [reportPending]);

    return {
        mounted,
        // Dev-превью Processing-вариантов не зависит от состояния отчёта.
        isDevProcessingPreview:
            pathname?.startsWith('/dev/processing') ?? false,
        // Полноэкранный Processing — только до капа; дальше страница живёт.
        isReportLoading: reportPending && !processingCapped,
        // Отчёт всё ещё считается (после капа блок показывает свой лоадер).
        isReportPending: reportPending,
        hasReportData: Boolean(report?.length),
        isFilterOpen,
        setIsFilterOpen,
    };
};
