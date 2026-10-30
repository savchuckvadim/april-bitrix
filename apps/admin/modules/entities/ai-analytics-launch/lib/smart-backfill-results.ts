import {
    cards,
    SMART_BACKFILL_PERIOD_DAYS,
    SMART_BACKFILL_TEXT,
} from '../consts/smart-backfill.const';
import type {
    LaunchOutcome,
    LaunchPeriod,
    SmartBackfillRunResult,
    SmartBackfillRunStatus,
} from '../model';
import { todayKey } from './launch-period';

/**
 * Карточка «Поля карточек разборов»: период кнопок, ответ запуска и статус
 * прогона — человеческим текстом. Чистые функции под vitest.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Последние 30 дней по сегодня включительно (по часам браузера). */
export function smartBackfillPeriod(now: Date): LaunchPeriod {
    return {
        from: todayKey(new Date(now.getTime() - SMART_BACKFILL_PERIOD_DAYS * DAY_MS)),
        to: todayKey(now),
    };
}

export function smartBackfillOutcome(
    result: SmartBackfillRunResult,
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
              text: `Подсчёт поставлен в очередь (${period}). Число карточек появится здесь через минуту.`,
              raw: result,
          }
        : {
              ok: true,
              text: `Запись полей запущена (${period}), по ${result.quota} карточек на часть; следующие части ставятся сами.`,
              next: 'Прогресс — ниже, раз в 30 секунд. Страницу можно закрыть: запись идёт сама.',
              raw: result,
          };
}

/** Прогон моложе трёх часов и не закончен — ещё идёт. */
export function isSmartBackfillRunning(
    run: SmartBackfillRunStatus | null | undefined,
    now: Date,
): boolean {
    if (!run || run.finished || run.dryRun) return false;
    const at = Date.parse(run.updatedAt);
    return Number.isFinite(at) && now.getTime() - at < 3 * 60 * 60 * 1000;
}

/** Доля записанного для прогресс-бара; dryRun и законченный — 1. */
export function smartBackfillShare(run: SmartBackfillRunStatus): number {
    if (run.finished) return 1;
    const total = run.candidates - run.skipped;
    return total > 0 ? Math.min(1, run.done / total) : 0;
}

/** Статус прогона словами: режим, источник, счётчики, ошибка. */
export function smartBackfillRunText(run: SmartBackfillRunStatus): string {
    const source =
        run.source === 'cron'
            ? SMART_BACKFILL_TEXT.sourceCron
            : SMART_BACKFILL_TEXT.sourceAdmin;
    const mode =
        run.mode === 'pending'
            ? SMART_BACKFILL_TEXT.modePending
            : SMART_BACKFILL_TEXT.modePeriod;
    const head = `${run.from} — ${run.to}, ${mode} (${source}).`;
    const toWrite = run.candidates - run.skipped;
    if (run.dryRun) {
        return `${head} Подсчёт: ${toWrite} ${cards(toWrite)} будет переписано, пропущено ${run.skipped}.`;
    }
    const parts = [
        `${run.finished ? 'Готово' : `Часть ${run.part}`}: записано ${run.done} из ${toWrite}`,
    ];
    if (run.failed > 0) parts.push(`сбоев ${run.failed}`);
    if (run.missing > 0) parts.push(`без элемента ${run.missing}`);
    if (run.skipped > 0) parts.push(`пропущено ${run.skipped}`);
    const tail = run.lastError ? ` Последняя ошибка: ${run.lastError}.` : '';
    return `${head} ${parts.join(', ')}.${tail}`;
}
