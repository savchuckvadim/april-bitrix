import type { Tone } from '@workspace/april-ui';
import type {
    AiFunnelShape,
    AiStyleAxis,
    AiStyleCard,
    AiStyleCardStatus,
    AiStyleProfile,
    AiStyleTag,
} from '@/modules/entities/ai-analytics/model';
import { AI_FUNNEL_SHAPE } from '@/modules/entities/ai-analytics/lib/ai-overview.data';

/*
 * Чистая логика карточки стиля менеджера (manager/style): подписи
 * состояний и доверия, формат отклонений в σ, положение на шкале оси,
 * строки подсказок, месяцы окна. Импорты сущности точечные (model / lib).
 */

/** Текст пустого состояния, если бэк не прислал note. */
export const AI_STYLE_STATUS_TEXT: Record<
    Exclude<AiStyleCardStatus, 'ready'>,
    string
> = {
    few_data: 'Данных для стиля пока мало',
    opt_out: 'Профиль отключён по запросу сотрудника',
};

/** Пояснение пустого состояния (few_data / opt_out); ready — null. */
export const aiStyleStatusNote = (
    card: Pick<AiStyleCard, 'status' | 'note'>,
): string | null =>
    card.status === 'ready'
        ? null
        : card.note || AI_STYLE_STATUS_TEXT[card.status];

export const AI_STYLE_STALE_TEXT =
    'Профиль давно не пересчитывался — читайте с оговоркой';
export const AI_STYLE_DISPUTED_TEXT = 'оспорена менеджером';
export const AI_STYLE_LOW_CONFIDENCE_TEXT =
    'Данных мало для выводов — профиль показан с оговоркой';

/** Оговорка профиля при низком доверии; нет профиля или ok — null. */
export const aiStyleProfileNote = (
    profile: AiStyleProfile | null,
): string | null =>
    profile?.confidence === 'low' ? AI_STYLE_LOW_CONFIDENCE_TEXT : null;

export type AiStyleConfidence = 'ok' | 'low' | 'none';

export const AI_STYLE_CONFIDENCE: Record<
    AiStyleConfidence,
    { label: string; tone: Tone }
> = {
    ok: { label: 'уверенно', tone: 'success' },
    low: { label: 'мало данных', tone: 'warning' },
    none: { label: 'нет данных', tone: 'muted' },
};

export const isAiStyleConfidence = (
    value: string,
): value is AiStyleConfidence =>
    value === 'ok' || value === 'low' || value === 'none';

/** Подпись и тон доверия; неизвестный уровень — как есть, тоном muted. */
export const aiStyleConfidence = (
    level: string,
): { label: string; tone: Tone } =>
    isAiStyleConfidence(level)
        ? AI_STYLE_CONFIDENCE[level]
        : { label: level, tone: 'muted' };

/** Причины пониженного доверия оси; неизвестная — как есть. */
export const AI_STYLE_REASON_LABELS: Record<string, string> = {
    'few-calls': 'мало звонков',
    'few-peers': 'мало коллег для сравнения',
    indistinguishable: 'неотличим от нормы коллег',
    'no-tenure': 'стаж не задан',
    'opt-out': 'профиль отключён',
    'style-crm-unavailable': 'телефония была недоступна',
};

export const aiStyleReasonLabel = (
    reason: string | null | undefined,
): string | null =>
    reason ? (AI_STYLE_REASON_LABELS[reason] ?? reason) : null;

/** Число со знаком и одним знаком после запятой: 1.23 → «+1,2», −0.4 → «−0,4», 0 → «0,0». */
const formatSigmaValue = (value: number): string => {
    const rounded = Math.round(value * 10) / 10;
    const sign = rounded > 0 ? '+' : rounded < 0 ? '−' : '';
    return `${sign}${Math.abs(rounded).toLocaleString('ru-RU', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })}`;
};

/** Отклонение от нормы коллег: «+1,2 σ». */
export const formatAiSigma = (value: number): string =>
    `${formatSigmaValue(value)} σ`;

/** Интервал 80 %: [0.6, 1.8] → «+0,6…+1,8 σ»; нет двух границ — пусто. */
export const formatAiStyleCi80 = (ci80: number[] | undefined): string => {
    if (!ci80 || ci80.length < 2) return '';
    const [low, high] = ci80;
    if (low === undefined || high === undefined) return '';
    return `${formatSigmaValue(low)}…${formatSigmaValue(high)} σ`;
};

/** Границы шкалы оси: ±3 σ (дальше — упор). */
export const AI_STYLE_AXIS_RANGE_SIGMA = 3;

/** Положение на шкале 0..1: −3 σ → 0, 0 → 0,5, +3 σ → 1. */
export const aiStyleAxisShare = (value: number): number => {
    const range = AI_STYLE_AXIS_RANGE_SIGMA;
    const clamped = Math.max(-range, Math.min(range, value));
    return (clamped + range) / (2 * range);
};

/** Полоса интервала 80 % на шкале: левый край и ширина (0..1); нет интервала — null. */
export const aiStyleCi80Band = (
    ci80: number[] | undefined,
): { left: number; width: number } | null => {
    if (!ci80 || ci80.length < 2) return null;
    const [low, high] = ci80;
    if (low === undefined || high === undefined) return null;
    const from = aiStyleAxisShare(Math.min(low, high));
    const to = aiStyleAxisShare(Math.max(low, high));
    return { left: from, width: to - from };
};

export type AiStyleAxisSide = 'minus' | 'plus' | 'center';

/** Порог «заметного» отклонения — меньше считаем нормой. */
export const AI_STYLE_NOTABLE_SIGMA = 0.5;

/** К какому полюсу тяготеет ось. */
export const aiStyleAxisSide = (value: number): AiStyleAxisSide => {
    if (Math.abs(value) < AI_STYLE_NOTABLE_SIGMA) return 'center';
    return value < 0 ? 'minus' : 'plus';
};

/** Строки подсказки оси: отклонение, интервал, n, доверие, причина. */
export const aiStyleAxisHintLines = (axis: AiStyleAxis): string[] => {
    const lines = [`Отклонение: ${formatAiSigma(axis.value)}`];
    const ci = formatAiStyleCi80(axis.ci80);
    if (ci) lines.push(`80 %: ${ci}`);
    lines.push(
        `Наблюдений: n = ${axis.n}`,
        `Доверие: ${aiStyleConfidence(axis.confidence).label}`,
    );
    const reason = aiStyleReasonLabel(axis.reason);
    if (reason) lines.push(`Причина: ${reason}`);
    return lines;
};

/** Строки подсказки подписи: опора в числах, n, пометка об оспаривании. */
export const aiStyleTagHintLines = (tag: AiStyleTag): string[] => [
    tag.basis,
    `n = ${tag.n}`,
    ...(tag.disputed
        ? ['Оспорена менеджером — вне карточки подпись не используется.']
        : []),
];

const RU_MONTHS = [
    'январь',
    'февраль',
    'март',
    'апрель',
    'май',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь',
];

/** «2026-08» → «август 2026»; пусто → «—»; иное — как есть. */
export const formatAiStyleMonth = (
    value: string | null | undefined,
): string => {
    if (!value) return '—';
    const [year, month] = value.split('-');
    const name = RU_MONTHS[Number(month) - 1];
    return year && name ? `${name} ${year}` : value;
};

/** Окно профиля: «июнь 2026 — август 2026»; один месяц — он сам; пусто — «—». */
export const formatAiStyleWindow = (window: string[]): string => {
    const first = window[0];
    if (first === undefined) return '—';
    const last = window[window.length - 1] ?? first;
    return first === last
        ? formatAiStyleMonth(first)
        : `${formatAiStyleMonth(first)} — ${formatAiStyleMonth(last)}`;
};

export const isAiFunnelShape = (value: string): value is AiFunnelShape =>
    Object.prototype.hasOwnProperty.call(AI_FUNNEL_SHAPE, value);

/** Форма воронки как контекст карточки; неизвестная — как есть. */
export const aiFunnelShapeLabel = (shape: string): string =>
    isAiFunnelShape(shape) ? AI_FUNNEL_SHAPE[shape] : shape;
