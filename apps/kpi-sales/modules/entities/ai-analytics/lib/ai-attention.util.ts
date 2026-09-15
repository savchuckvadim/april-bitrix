import type { AiAttentionBasis, AiAttentionItem } from '../model';
import { AI_BASIS_LABELS, AI_BASIS_RATE_CODES } from './ai-overview.data';
import { formatAiCi90, formatAiRate } from './ai-metric.util';
import { formatAiCount } from './ai-finance.util';

/** Код опоры про долю (share/rate/pct) — значение 0..1, показываем в %. */
export const isAiBasisRate = (code: string): boolean =>
    AI_BASIS_RATE_CODES.some(marker => code.includes(marker));

const formatBasisValue = (basis: AiAttentionBasis, value: number): string =>
    isAiBasisRate(basis.code) ? formatAiRate(value) : formatAiCount(value);

/**
 * Строка основания карточки: «Шаг с датой: 31 % (норма 50 %) · n = 24 ·
 * 90 %: 20–45 %». Норма и интервал — только если пришли; n = 0 означает
 * значение из настройки, объём не показываем.
 */
export const formatAiBasisLine = (basis: AiAttentionBasis): string => {
    const label = AI_BASIS_LABELS[basis.code] ?? basis.code;
    const parts = [`${label}: ${formatBasisValue(basis, basis.value)}`];
    if (basis.norm !== undefined) {
        parts[0] += ` (норма ${formatBasisValue(basis, basis.norm)})`;
    }
    if (basis.n > 0) parts.push(`n = ${basis.n}`);
    const ci = formatAiCi90(basis.ci90);
    if (ci) parts.push(`90 %: ${ci}`);
    return parts.join(' · ');
};

/** Строки подсказки «Основание» карточки. */
export const aiAttentionHintLines = (item: AiAttentionItem): string[] =>
    item.basis.length
        ? item.basis.map(formatAiBasisLine)
        : ['Опоры не переданы — сигнал по правилу без чисел.'];

/** Карточки по рангу (сервер уже сортирует; страхуем порядок). */
export const sortAiAttention = (items: AiAttentionItem[]): AiAttentionItem[] =>
    [...items].sort((a, b) => a.rank - b.rank);
