import { format, isValid } from 'date-fns';
import {
    formatAiCount,
    formatAiFullDate,
    formatAiMoney,
    formatAiMoneyCompact,
    pluralRu,
    type AiDealMovementDeal,
} from '@/modules/entities/ai-analytics';
import { AI_DEAL_MOVEMENT_TEXT } from './ai-deal-movement.texts';

/*
 * Форматтеры подвкладки «Движение сделок»: числа со склонением, суммы,
 * сроки стадии, «с какой ночи», имена менеджеров. Сырые коды и ISO-даты
 * на экран не выводятся.
 */

type Forms = readonly [string, string, string];

const DAY_FORMS: Forms = ['день', 'дня', 'дней'];
const DEAL_FORMS: Forms = ['сделка', 'сделки', 'сделок'];
const CALL_FORMS: Forms = ['звонок', 'звонка', 'звонков'];

const T = AI_DEAL_MOVEMENT_TEXT;
const NIGHT_KEY = /^(\d{4})-(\d{2})-(\d{2})/;

const withForm = (count: number, forms: Forms): string =>
    `${formatAiCount(count)} ${pluralRu(count, forms)}`;

/** «12 дней». */
export const aiDmDays = (count: number): string => withForm(count, DAY_FORMS);
/** «3 сделки». */
export const aiDmDeals = (count: number): string => withForm(count, DEAL_FORMS);
/** «54 звонка». */
export const aiDmCalls = (count: number): string => withForm(count, CALL_FORMS);

/** Сумма коротко; null (ночь без сумм) — «сумма не посчитана». */
export const aiDmAmountShort = (amount: number | null): string =>
    amount === null ? T.statuses.sumUnknown : formatAiMoneyCompact(amount);

/** Подсказка к числу: «12 сделок на 1 250 000 ₽» или «12 сделок, сумма не посчитана». */
export const aiDmCountWithSum = (count: number, amount: number | null): string =>
    amount === null
        ? `${aiDmDeals(count)}, ${T.statuses.sumUnknown}`
        : `${aiDmDeals(count)} на ${formatAiMoney(amount)}`;

/** Сумма сделки полностью; не указана — «не указана». */
export const aiDmDealAmount = (amount: number | null): string =>
    amount === null ? T.deals.noAmount : formatAiMoney(amount);

/** «в стадии 34 дн. при обычных 21 (по истории портала)». */
export const aiDmStageTiming = (
    deal: Pick<
        AiDealMovementDeal,
        'daysInStage' | 'stageLimitDays' | 'stageLimitSource'
    >,
): string =>
    `в стадии ${formatAiCount(deal.daysInStage)} дн. при обычных ` +
    `${formatAiCount(deal.stageLimitDays)} ` +
    `(${T.deals.limitSource[deal.stageLimitSource]})`;

/**
 * С какой ночи сделка в статусе — дата по часам пользователя (ночной счёт
 * идёт после полуночи); null — «с начала наблюдений».
 */
export const aiDmSince = (since: string | null): string => {
    if (!since) return T.deals.sinceStart;
    const date = new Date(since);
    return isValid(date)
        ? `с ${format(date, 'dd.MM.yyyy')}`
        : T.deals.sinceStart;
};

/** Ночь «2026-11-19» → «19.11» для оси графика; битый ключ — как есть не выводим. */
export const aiDmNightLabel = (day: string): string => {
    const match = NIGHT_KEY.exec(day);
    return match ? `${match[3]}.${match[2]}` : formatAiFullDate(day);
};

/** «На ночь 19.11.2026». */
export const aiDmAsOf = (day: string): string =>
    `${T.statuses.asOf} ${formatAiFullDate(day)}`;

/** Доля с одной цифрой после запятой: 33.3 → «33,3 %». */
export const aiDmPercent = (value: number): string =>
    `${value.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}\u00a0%`;

/**
 * Пометка «мало звонков»: текст сервера, а если его нет при малом числе —
 * запасной; звонков достаточно — null. Число рядом показывается всегда.
 */
export const aiDmFewCallsNote = (
    item: { fewCalls: boolean; note: string | null },
    fallback: string,
): string | null => item.note?.trim() || (item.fewCalls ? fallback : null);

/** Строка с менеджером и его именем из любого ответа подвкладки. */
export interface AiDmNamed {
    managerId: string | null;
    managerName: string | null;
}

/** Имена менеджеров из всех ответов подвкладки: id → «Иванова Анна». */
export const aiDmKnownNames = (
    lists: readonly (readonly AiDmNamed[])[],
): Map<string, string> => {
    const names = new Map<string, string>();
    for (const row of lists.flat()) {
        const name = row.managerName?.trim();
        if (row.managerId && name && !names.has(row.managerId)) {
            names.set(row.managerId, name);
        }
    }
    return names;
};

/**
 * Имя менеджера: из ответа сервера, иначе из структуры отдела (fallback);
 * ответственного нет — «Ответственный не назначен».
 */
export const aiDmManagerName = (
    managerId: string | null,
    managerName: string | null,
    fallback: (managerId: string) => string,
): string => {
    if (managerName?.trim()) return managerName;
    return managerId ? fallback(managerId) : T.deals.noManager;
};
