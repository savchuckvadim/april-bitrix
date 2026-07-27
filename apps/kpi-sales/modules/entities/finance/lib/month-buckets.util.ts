import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { FinanceClosedReport } from '../model';

export interface FinanceMonthBucket {
    /** yyyy-MM — ключ сортировки. */
    month: string;
    /** «март 2026» — подпись оси. */
    label: string;
    dealsCount: number;
    advanceAmount: number;
    monthlyAmount: number;
    expectedContractAmount: number;
}

/**
 * Динамика по месяцам из уже загруженного отчёта: сделки бакетируются
 * по месяцу closeDate на клиенте — дополнительных запросов не нужно.
 */
export const buildMonthBuckets = (
    report: FinanceClosedReport,
): FinanceMonthBucket[] => {
    const buckets = new Map<string, FinanceMonthBucket>();

    report.employees.forEach(employee =>
        employee.deals.forEach(deal => {
            const date = new Date(deal.closeDate);
            if (Number.isNaN(date.getTime())) return;
            const month = format(date, 'yyyy-MM');
            let bucket = buckets.get(month);
            if (!bucket) {
                bucket = {
                    month,
                    label: format(date, 'LLL yyyy', { locale: ru }),
                    dealsCount: 0,
                    advanceAmount: 0,
                    monthlyAmount: 0,
                    expectedContractAmount: 0,
                };
                buckets.set(month, bucket);
            }
            bucket.dealsCount += 1;
            bucket.advanceAmount += deal.advanceAmount;
            bucket.monthlyAmount += deal.monthlyAmount;
            bucket.expectedContractAmount += deal.expectedContractAmount;
        }),
    );

    return [...buckets.values()].sort((a, b) =>
        a.month.localeCompare(b.month),
    );
};
