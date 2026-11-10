import type { MicroSelectOption } from '@workspace/april-ui/fields';
import {
    analyses,
    FACTS_CATCHUP_MONTHS,
    FACTS_CATCHUP_TEXT,
} from '../consts/facts-catchup.const';
import type {
    FactsCatchupRunResult,
    FactsCatchupRunStatus,
    LaunchOutcome,
    LaunchPeriod,
} from '../model';
import {
    monthPeriod,
    recentClosedMonths,
    shiftedMonthKey,
} from './launch-period';
import { monthLabel } from './reanalysis-scope';

/**
 * Карточка «Признаки для отчётов в старых разборах»: выбор месяца, ответ
 * запуска и статус прогона — человеческим текстом. Чистые функции под
 * vitest.
 */

const RUNNING_WINDOW_MS = 3 * 60 * 60 * 1000;

/** Месяцы на выбор: текущий первым, затем закрытые, новые первыми. */
export function factsCatchupMonthOptions(now: Date): MicroSelectOption[] {
    const current = shiftedMonthKey(now, 0);
    return [
        {
            value: current,
            label: FACTS_CATCHUP_TEXT.currentMonth(monthLabel(current)),
        },
        ...recentClosedMonths(now, FACTS_CATCHUP_MONTHS).map(month => ({
            value: month,
            label: monthLabel(month),
        })),
    ];
}

/** Месяц по умолчанию — последний закрытый. */
export const factsCatchupDefaultMonth = (now: Date): string =>
    shiftedMonthKey(now, -1);

/** Период дат месяца; текущий месяц — по сегодня. */
export function factsCatchupPeriod(monthKey: string, now: Date): LaunchPeriod {
    return monthPeriod(monthKey, now);
}

export function factsCatchupOutcome(
    result: FactsCatchupRunResult,
): LaunchOutcome {
    if (!result.dispatched) {
        return {
            ok: false,
            text: `Не запущено: ${result.reason ?? 'причина не указана'}.`,
            raw: result,
        };
    }
    const period = `${result.from} — ${result.to}`;
    return result.dryRun
        ? {
              ok: true,
              text: `Подсчёт поставлен в очередь (${period}). Число разборов и оценка стоимости появятся здесь.`,
              raw: result,
          }
        : {
              ok: true,
              text: `Догон запущен (${period}), по ${result.quota} звонков на часть; остаток дорабатывается сам.`,
              next: 'Прогресс — ниже, раз в 30 секунд. Страницу можно закрыть: догон идёт на сервере.',
              raw: result,
          };
}

/** Прогон моложе трёх часов, не закончен и не остановлен — ещё идёт. */
export function isFactsCatchupRunning(
    run: FactsCatchupRunStatus | null | undefined,
    now: Date,
): boolean {
    if (!run || run.finished || run.dryRun || run.stopped) return false;
    const at = Date.parse(run.updatedAt);
    return Number.isFinite(at) && now.getTime() - at < RUNNING_WINDOW_MS;
}

/** Доля догнанного для прогресс-бара; законченный — 1. */
export function factsCatchupShare(run: FactsCatchupRunStatus): number {
    if (run.finished) return 1;
    return run.total > 0 ? Math.min(1, run.done / run.total) : 0;
}

const skipCount = (run: FactsCatchupRunStatus, reason: string): number => {
    const value = run.skippedBy[reason];
    return typeof value === 'number' ? value : 0;
};

const money = (value: number): string =>
    `${value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽`;

/** Статус прогона словами: подсчёт с оценкой либо ход догона. */
export function factsCatchupRunText(run: FactsCatchupRunStatus): string {
    if (run.dryRun) {
        const skipped =
            `пропущено ${run.skipped} (с признаками ${skipCount(run, 'hasFacts')}, ` +
            `без разбора ${skipCount(run, 'noAnalysis')})`;
        const head = `Подсчёт: без признаков ${run.candidates} ${analyses(run.candidates)}, ${skipped}.`;
        const estimate = run.estimate;
        if (!estimate) return head;
        const total =
            estimate.estimatedTokens !== null && estimate.estimatedPrice !== null
                ? ` Итого ≈ ${estimate.estimatedTokens.toLocaleString('ru-RU')} токенов, ${money(estimate.estimatedPrice)}.`
                : '';
        return `${head} ${estimate.message}${total}`;
    }
    const parts = [
        `${run.finished ? 'Готово' : `Часть ${run.part}`}: догнано ${run.done} из ${run.total}`,
    ];
    if (run.failed > 0) parts.push(`сбоев ${run.failed}`);
    if (!run.finished && run.etaMinutes !== null) {
        parts.push(`осталось ≈ ${run.etaMinutes} мин`);
    }
    parts.push(`потрачено ${money(run.price)}`);
    const error = run.lastError ? ` Последняя ошибка: ${run.lastError}.` : '';
    const stopped = run.stopped ? ` ${FACTS_CATCHUP_TEXT.stopped}` : '';
    return `${parts.join(', ')}.${error}${stopped}`;
}
