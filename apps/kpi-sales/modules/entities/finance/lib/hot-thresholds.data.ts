import type { FinanceHotThreshold } from '../model';

/** Пороги воронки горячих клиентов (глобальные — влияют на серверный запрос). */
export const HOT_THRESHOLDS: { value: FinanceHotThreshold; label: string }[] = [
    { value: 'presentation', label: 'От презентации' },
    { value: 'document', label: 'От документов' },
];

/** Подпись порога (Excel, заголовки). */
export const hotThresholdLabel = (threshold: FinanceHotThreshold): string =>
    HOT_THRESHOLDS.find(item => item.value === threshold)?.label ?? threshold;
