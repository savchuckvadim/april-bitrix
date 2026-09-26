import type { Tone } from '@workspace/april-ui/tones';
import { GOLDEN_SET_TEXT } from '../consts/ai-analytics-audit.const';
import type {
    AiAnalyticsGoldenSetEntry,
    AiAnalyticsGoldenSetRunResult,
} from '../model';
import { formatAuditDateTime } from './audit-format.util';

/** Бейдж записи набора: подпись и тон. */
export interface GoldenSetBadge {
    label: string;
    tone: Tone;
}

/** Запись набора, разложенная под таблицу: значения уже строками. */
export interface GoldenSetEntryView {
    id: string;
    periodKey: string;
    promptVersion: string;
    pairs: string;
    quota: GoldenSetBadge;
    sigmaLlm: string;
    sigmaSource: GoldenSetBadge;
    generatedAt: string;
}

/** Ответ запуска, разложенный под уведомление: тон, заголовок, текст. */
export interface GoldenSetRunView {
    tone: 'info' | 'warning';
    title: string;
    message: string;
}

/** σ_llm двумя знаками с запятой. */
export const formatGoldenSigma = (value: number): string =>
    value.toFixed(2).replace('.', ',');

/** «N из M»: сколько пар набрано против квоты. */
export const formatGoldenPairs = (pairs: number, quota: number): string =>
    `${pairs} из ${quota}`;

const quotaBadge = (withinQuota: boolean): GoldenSetBadge =>
    withinQuota
        ? { label: GOLDEN_SET_TEXT.withinQuota, tone: 'success' }
        : { label: GOLDEN_SET_TEXT.overQuota, tone: 'warning' };

/** Источник σ_llm: измерена повтором (success) либо взята из реестра (muted). */
const sigmaSourceBadge = (source: string): GoldenSetBadge =>
    source === 'measured'
        ? { label: GOLDEN_SET_TEXT.sigmaMeasured, tone: 'success' }
        : { label: GOLDEN_SET_TEXT.sigmaConfigured, tone: 'muted' };

/** Запись набора → строка таблицы. */
export const buildGoldenSetEntryView = (
    entry: AiAnalyticsGoldenSetEntry,
): GoldenSetEntryView => ({
    id: entry.id,
    periodKey: entry.periodKey,
    promptVersion: entry.promptVersion,
    pairs: formatGoldenPairs(entry.pairs, entry.quota),
    quota: quotaBadge(entry.withinQuota),
    sigmaLlm: formatGoldenSigma(entry.sigmaLlm),
    sigmaSource: sigmaSourceBadge(entry.sigmaSource),
    generatedAt: formatAuditDateTime(entry.generatedAt),
});

/** Записи набора свежими первыми (по моменту формирования). */
export const sortGoldenSetEntries = (
    entries: readonly AiAnalyticsGoldenSetEntry[],
): AiAnalyticsGoldenSetEntry[] =>
    [...entries].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));

/**
 * Ответ запуска → уведомление: джоба поставлена (info, с id и квотой)
 * либо не поставлена (warning, с причиной бэка).
 */
export const buildGoldenSetRunView = (
    result: AiAnalyticsGoldenSetRunResult,
): GoldenSetRunView =>
    result.dispatched
        ? {
              tone: 'info',
              title: GOLDEN_SET_TEXT.dispatchedTitle,
              message: `${GOLDEN_SET_TEXT.jobId}: ${result.jobId ?? '—'} · ${GOLDEN_SET_TEXT.quotaUsed}: ${result.quota}`,
          }
        : {
              tone: 'warning',
              title: GOLDEN_SET_TEXT.notDispatchedTitle,
              message: result.reason ?? GOLDEN_SET_TEXT.runUnavailable,
          };

/**
 * Значение поля квоты → число. Пустая строка — undefined (бэк возьмёт
 * retest_budget_calls реестра); не-число — NaN, поле подсвечивается.
 */
export const parseGoldenQuota = (raw: string): number | undefined =>
    raw.trim() === '' ? undefined : Number(raw);
