import type { AiDealMovementHonesty } from '@/modules/entities/ai-analytics';
import { aiDmDays, aiDmPercent } from './ai-deal-movement-format.util';

/*
 * «Честность оценок AI»: доля звонков с продвижением 4–5, после которых
 * стадия сделки не сдвинулась за N дней. Чем выше доля, тем чаще модель
 * видит согласие клиента там, где сделка стоит.
 */

/** Верх шкалы продвижения сделки по звонку. */
export const AI_DM_PROGRESS_MAX = 5;

/** «4–5»; если проверяется только верх шкалы — «5». */
export const aiDmProgressRange = (progressMin: number): string =>
    progressMin >= AI_DM_PROGRESS_MAX
        ? String(AI_DM_PROGRESS_MAX)
        : `${progressMin}–${AI_DM_PROGRESS_MAX}`;

/** Доля в ячейке: «30 % (9 из 30)»; проверенных нет — «—». */
export const aiDmHonestyShare = (
    honesty: Pick<AiDealMovementHonesty, 'stillPct' | 'still' | 'checked'>,
): string =>
    honesty.stillPct === null || honesty.checked === 0
        ? '—'
        : `${aiDmPercent(honesty.stillPct)} (${honesty.still} из ${honesty.checked})`;

/**
 * Главная фраза по отделу: «После звонков с продвижением 4–5 стадия не
 * сдвинулась за 12 дней: 30 % (9 из 30)». Проверенных нет — фраза о том,
 * что итог ещё не известен.
 */
export const aiDmHonestyHeadline = (
    honesty: AiDealMovementHonesty,
    checkDays: number,
    progressMin: number,
): string => {
    const range = aiDmProgressRange(progressMin);
    if (honesty.stillPct === null || honesty.checked === 0) {
        return (
            `Звонков с продвижением ${range} за период: ${honesty.highProgress}. ` +
            `Проверенных пока нет — итог появится, когда после звонков пройдёт ${aiDmDays(checkDays)}.`
        );
    }
    return (
        `После звонков с продвижением ${range} стадия не сдвинулась за ` +
        `${aiDmDays(checkDays)}: ${aiDmHonestyShare(honesty)}`
    );
};

/** Остаток без итога: «Ещё ждут срока: 6 · Не проверены: 4»; всё проверено — null. */
export const aiDmHonestyRest = (
    honesty: Pick<AiDealMovementHonesty, 'pending' | 'unchecked'>,
): string | null => {
    const parts = [
        honesty.pending > 0 ? `Ещё ждут срока: ${honesty.pending}` : null,
        honesty.unchecked > 0 ? `Не проверены: ${honesty.unchecked}` : null,
    ].filter((part): part is string => part !== null);
    return parts.length ? parts.join(' · ') : null;
};

/** Заголовок колонки «Звонков с продвижением 4–5». */
export const aiDmHonestyHighColumn = (progressMin: number): string =>
    `Звонков с продвижением ${aiDmProgressRange(progressMin)}`;
