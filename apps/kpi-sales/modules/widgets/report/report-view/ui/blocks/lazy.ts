'use client';
import dynamic from 'next/dynamic';

// Тяжёлые части отчёта (таблицы + chart.js) грузим лениво и без SSR.

/** Блок конверсий внутри вкладок: разбивка по отделам/группам + рейтинги. */
export const ConversionsBlock = dynamic(
    () =>
        import('@/modules/widgets/conversions-block').then(
            mod => mod.ConversionsBlock,
        ),
    { ssr: false },
);

/** Эфирное время: тяжёлый запрос без кэша — контент грузится при раскрытии. */
export const AirtimeWidget = dynamic(
    () =>
        import('@/modules/feature/airtime-widget/ui/AirtimeWidget').then(
            mod => mod.AirtimeWidget,
        ),
    { ssr: false },
);

/** Вкладка «Финансы» — целиком ленивый виджет. */
export const FinanceReport = dynamic(
    () =>
        import('@/modules/widgets/finance-report').then(
            mod => mod.FinanceReport,
        ),
    { ssr: false },
);
