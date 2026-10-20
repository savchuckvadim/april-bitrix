// Словарь причин — напрямую из констант раздела «Модель»: барель раздела
// тянет React-панель, а этот файл — чистая логика под vitest.
import { BACKTEST_REASON_LABEL } from '@/modules/entities/ai-analytics-model/consts/ai-analytics-model.labels.const';
import { LAUNCH_STEP_TEXT } from '../consts/ai-analytics-launch.const';
import type {
    LaunchBackfillResult,
    LaunchBacktest,
    LaunchBacktestResult,
    LaunchCacheResetResult,
    LaunchInstallSmartResult,
    LaunchOutcome,
    LaunchRecomputeResult,
    LaunchReanalyzeRunResult,
    LaunchStageFlagsResult,
} from '../model';

/**
 * Ответы ручек панели запуска — человеческим текстом с «что дальше».
 * Сырой ответ уходит в `raw` (под «подробнее»). Чистые функции.
 */

const BACKFILL_REASON_TEXT: Readonly<Record<string, string>> = {
    'backfill-empty-range': 'Период пустой — нечего догонять.',
    'backfill-range-too-wide': 'Больше 24 месяцев за раз ручка не принимает.',
};

const months = (count: number): string => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod100 >= 11 && mod100 <= 14) return `${count} месяцев`;
    if (mod10 === 1) return `${count} месяц`;
    if (mod10 >= 2 && mod10 <= 4) return `${count} месяца`;
    return `${count} месяцев`;
};

export function smartOutcome(result: LaunchInstallSmartResult): LaunchOutcome {
    const parts = [
        result.created
            ? 'Смарт «AI-анализ звонков» создан.'
            : 'Смарт «AI-анализ звонков» уже был — довели до эталона.',
        `Новых полей: ${result.fieldsAdded.length}.`,
    ];
    const enums = result.enumItemsAdded ?? [];
    parts.push(
        enums.length > 0
            ? `Долиты значения: ${enums.join('; ')}.`
            : 'Все значения перечислений уже были на месте.',
    );
    const failed = result.fieldsFailed.length > 0;
    if (failed) {
        parts.push(
            `Не удалось создать полей: ${result.fieldsFailed.length} — повторите позже; если не помогает, попросите разработчика проверить права вебхука.`,
        );
    }
    return {
        ok: !failed,
        text: parts.join(' '),
        next: LAUNCH_STEP_TEXT.smart.next,
        raw: result,
    };
}

export const cacheOutcome = (
    result: LaunchCacheResetResult,
): LaunchOutcome => ({
    ok: true,
    text: result.message,
    next: LAUNCH_STEP_TEXT.cache.next,
    raw: result,
});

export function historyOutcome(result: LaunchBackfillResult): LaunchOutcome {
    if (result.reason) {
        return {
            ok: false,
            text:
                BACKFILL_REASON_TEXT[result.reason] ??
                `Не поставлено: ${result.reason}.`,
            raw: result,
        };
    }
    const first = result.monthKeys[0];
    const last = result.monthKeys[result.monthKeys.length - 1];
    return {
        ok: true,
        text: `Поставлено в очередь: ${months(result.jobs.length)} (${first} — ${last}). Считается в фоне; уже посчитанные месяцы пропускаются.`,
        next: LAUNCH_STEP_TEXT.history.next,
        raw: result,
    };
}

export const restoreOutcome = (
    result: LaunchRecomputeResult,
    monthKey: string,
): LaunchOutcome => ({
    ok: true,
    text: `Пересчёт ${monthKey} поставлен в очередь: звонки, история стадий, журнал прогноза задним числом и проверка точности.`,
    next: LAUNCH_STEP_TEXT['forecast-restore'].next,
    raw: result,
});

const reasonsText = (reasons: readonly string[]): string =>
    reasons.map(code => BACKTEST_REASON_LABEL[code] ?? code).join('; ');

/** Вердикт проверки точности словами: пройдено / не пройдено / мало данных. */
export function backtestVerdict(item: LaunchBacktest | null): LaunchOutcome {
    if (item === null) {
        return {
            ok: false,
            text: 'Проверки точности ещё нет: дождитесь пересчёта после «Восстановить прогноз по истории» (10–30 минут) и проверьте снова.',
        };
    }
    const shadow = `теневых месяцев ${item.shadowMonths} из ${item.shadowMinMonths} нужных, из истории — ${item.replayedMonths}`;
    if (item.status === 'pass') {
        return {
            ok: true,
            text: `Пройдено (месяц ${item.monthKey}, ${shadow}): прогноз точнее простых способов — его можно показывать.`,
            next: 'Нажмите «Показать прогноз в отчёте».',
        };
    }
    if (item.status === 'insufficient') {
        const why = reasonsText(item.reasons);
        return {
            ok: false,
            text: `Мало данных (месяц ${item.monthKey}): ${shadow}${why ? `; ${why}` : ''}.`,
            next: 'Догоните историю и восстановите прогноз, потом проверьте ещё раз.',
        };
    }
    return {
        ok: false,
        text: `Не пройдено (месяц ${item.monthKey}): ${reasonsText(item.reasons) || 'причина не записана'}.`,
        next: 'Показывать прогноз пока рано — проверка повторится сама в следующем закрытом месяце.',
    };
}

export const checkOutcome = (result: LaunchBacktestResult): LaunchOutcome => ({
    ...backtestVerdict(result.items[0] ?? null),
    raw: result,
});

export const showOutcome = (result: LaunchStageFlagsResult): LaunchOutcome => ({
    ok: result.forecastStageEnabled,
    text: result.message,
    next: LAUNCH_STEP_TEXT['forecast-show'].next,
    raw: result,
});

export function reanalyzeOutcome(
    result: LaunchReanalyzeRunResult,
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
              text: `Подсчёт поставлен в очередь (${period}, пилот портала). Результат появится здесь через минуту-две — нажмите «Обновить состояние».`,
              next: LAUNCH_STEP_TEXT['reanalyze-count'].next,
              raw: result,
          }
        : {
              ok: true,
              text: `Переразбор запущен (${period}), по ${result.quota} звонков на часть; следующие части ставятся сами.`,
              next: LAUNCH_STEP_TEXT['reanalyze-run'].next,
              raw: result,
          };
}

/** Пересборка витрины: догон закрытых месяцев (если есть) + сброс кэша. */
export function rebuildOutcome(
    backfill: LaunchBackfillResult | null,
    cache: LaunchCacheResetResult,
): LaunchOutcome {
    const history = backfill
        ? historyOutcome(backfill)
        : {
              ok: true,
              text: 'Закрытых месяцев в периоде нет — текущий месяц пересоберёт ночной прогон.',
          };
    return {
        ok: history.ok,
        text: `${history.text} ${cache.message}`,
        next: LAUNCH_STEP_TEXT.rebuild.next,
        raw: { backfill, cache },
    };
}
