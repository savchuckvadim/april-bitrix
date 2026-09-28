import type {
    AiAttentionBasis,
    AiAttentionItem,
    AiAttentionSignal,
} from '../model';
import {
    AI_BASIS_LABELS,
    AI_BASIS_RATE_CODES,
    AI_SIGNAL,
} from './ai-overview.data';
import { formatAiCi90Words, formatAiRate } from './ai-metric.util';
import { formatAiCount } from './ai-finance.util';

/** Код опоры про долю (share/rate/pct) — значение 0..1, показываем в %. */
export const isAiBasisRate = (code: string): boolean =>
    AI_BASIS_RATE_CODES.some(marker => code.includes(marker));

/** Подпись незнакомой опоры — нейтрально, без кода. */
export const AI_BASIS_UNKNOWN_LABEL = 'показатель';

/** Подпись опоры по коду; незнакомый код — «показатель». */
export const aiBasisLabel = (code: string): string =>
    AI_BASIS_LABELS[code] ?? AI_BASIS_UNKNOWN_LABEL;

const formatBasisValue = (basis: AiAttentionBasis, value: number): string =>
    isAiBasisRate(basis.code) ? formatAiRate(value) : formatAiCount(value);

/**
 * Строка основания карточки: «Шаг с датой: 31 % (норма 50 %) · звонков: 24 ·
 * вероятно от 20 до 45 %». Норма и разброс — только если пришли; n = 0
 * означает значение из настройки, объём не показываем.
 */
export const formatAiBasisLine = (basis: AiAttentionBasis): string => {
    const parts = [`${aiBasisLabel(basis.code)}: ${formatBasisValue(basis, basis.value)}`];
    if (basis.norm !== undefined) {
        parts[0] += ` (норма ${formatBasisValue(basis, basis.norm)})`;
    }
    if (basis.n > 0) parts.push(`звонков: ${basis.n}`);
    const ci = formatAiCi90Words(basis.ci90);
    if (ci) parts.push(ci);
    return parts.join(' · ');
};

/** Сигнал по правилу, без чисел в основании. */
export const AI_ATTENTION_NO_BASIS = 'Чисел к сигналу нет.';

/** «Что сделать: …» по коду сигнала. */
export const aiAttentionActionLine = (signal: AiAttentionSignal): string =>
    `Что сделать: ${AI_SIGNAL[signal].action}`;

/** Строки основания: подписи опор с числами; без опор — «Чисел к сигналу нет». */
export const aiAttentionBasisLines = (
    item: Pick<AiAttentionItem, 'basis'>,
): string[] =>
    item.basis.length
        ? item.basis.map(formatAiBasisLine)
        : [AI_ATTENTION_NO_BASIS];

/**
 * Строки подсказки бэйджа сигнала (карточка «Внимание», строка таблицы):
 * что значит сигнал, что сделать, затем основание в числах.
 */
export const aiAttentionHintLines = (
    item: Pick<AiAttentionItem, 'signal' | 'basis'>,
): string[] => [
    AI_SIGNAL[item.signal].hint,
    aiAttentionActionLine(item.signal),
    ...aiAttentionBasisLines(item),
];

/** Карточки по рангу (сервер уже сортирует; страхуем порядок). */
export const sortAiAttention = (items: AiAttentionItem[]): AiAttentionItem[] =>
    [...items].sort((a, b) => a.rank - b.rank);
