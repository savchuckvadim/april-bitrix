import type { LiquidProgressTone } from '@workspace/april-ui';

/** Рубли полностью: 1 234 567 → «1 234 567 ₽»; не число → «0 ₽». */
export const formatAiMoney = (value: number | null | undefined): string =>
    typeof value === 'number' && Number.isFinite(value)
        ? `${Math.round(value).toLocaleString('ru-RU')} ₽`
        : '0 ₽';

/** Компактно для ячеек: 1 234 567 → «1,2 млн ₽», 340 000 → «340 тыс ₽», 900 → «900 ₽». */
export const formatAiMoneyCompact = (
    value: number | null | undefined,
): string => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return '0 ₽';
    const abs = Math.abs(value);
    if (abs >= 1_000_000) {
        return `${(value / 1_000_000).toLocaleString('ru-RU', {
            maximumFractionDigits: 1,
        })} млн ₽`;
    }
    if (abs >= 1_000) {
        return `${Math.round(value / 1_000).toLocaleString('ru-RU')} тыс ₽`;
    }
    return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
};

/** Целое с разделителями: 12345 → «12 345»; null → «—». */
export const formatAiCount = (value: number | null | undefined): string =>
    typeof value === 'number' && Number.isFinite(value)
        ? Math.round(value).toLocaleString('ru-RU')
        : '—';

/** «Сделано / запланировано» плана CRM: 12 и 20 → «12 / 20»; без плана → «12 / —». */
export const formatAiPlanDone = (done: number, plan: number): string =>
    `${formatAiCount(done)} / ${plan > 0 ? formatAiCount(plan) : '—'}`;

/** Доля выполнения плана 0..∞; null — плана нет. */
export const aiPlanShare = (done: number, plan: number): number | null =>
    plan > 0 ? done / plan : null;

/** Тон доли плана: ≥ 100 % — success, ≥ 50 % — warning, ниже — destructive. */
export const aiPlanTone = (share: number | null): LiquidProgressTone => {
    if (share === null || share >= 1) return 'success';
    return share >= 0.5 ? 'warning' : 'destructive';
};
