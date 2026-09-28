import type {
    AiDossier,
    AiDossierFeedbackSummary,
    AiDossierReason,
} from '../model';
import { aiCallSectionLabel } from './ai-call-sections.data';
import { AI_DATE_EMPTY } from './ai-period-label.util';
import { aiTrendMetricLabel } from './ai-trend.util';
import { aiYoyReasonLabel } from './ai-yoy.util';

/*
 * Досье менеджера: подписи разделов и причин пустого раздела, окно по
 * умолчанию, паспорт (статус, источник даты, группа стажа), своды. Даты и
 * ключи периодов форматирует ai-period-label.util, разделы рубрики
 * разбора — ai-call-sections.data (своих копий здесь нет).
 */

/* ---------- Разделы досье и причины пустого раздела ---------- */

/** Разделы досье в порядке карточки: код DTO → подпись. */
export const AI_DOSSIER_SECTION_LABELS: Record<string, string> = {
    passport: 'Паспорт',
    series: 'Ряды недель и месяцев',
    trends: 'Тренды',
    planFact: 'План — факт',
    yoy: 'Год назад',
    style: 'Стиль',
    objections: 'Возражения',
    feedbackSummary: 'Обратная связь',
    ropMarks: 'Метки руководителя',
    readiness: 'Готовность',
};

export const AI_DOSSIER_SECTION_FALLBACK = 'Раздел';

export const aiDossierSectionLabel = (section: string): string =>
    AI_DOSSIER_SECTION_LABELS[section] ?? AI_DOSSIER_SECTION_FALLBACK;

/** Окно досье по умолчанию и границы (зеркало AI_DOSSIER_MONTHS бэка). */
export const AI_DOSSIER_MONTHS = { default: 3, min: 1, max: 12 } as const;

/** Варианты окна для переключателя. */
export const AI_DOSSIER_MONTH_OPTIONS = [3, 6, 12] as const;

/** Подпись причины пустого раздела: «Тренды — данных мало…». */
export const formatAiDossierReason = (reason: AiDossierReason): string =>
    `${aiDossierSectionLabel(reason.section)} — ${reason.text}`;

/** Код причины пустого раздела → короткая подпись бэйджа; незнакомый — без бэйджа (null). */
export const AI_DOSSIER_REASON_LABELS: Record<string, string> = {
    'no-snapshots': 'нет расчёта',
    'no-history': 'нет истории',
    'too-few-data': 'мало данных',
    'section-failed': 'ошибка раздела',
    'style-opt-out': 'отказ от профиля',
};

export const aiDossierReasonBadge = (reason: string): string | null =>
    AI_DOSSIER_REASON_LABELS[reason] ?? null;

/** Сколько разделов досье собралось (из десяти). */
export const aiDossierFilledCount = (dossier: AiDossier): number =>
    Object.keys(AI_DOSSIER_SECTION_LABELS).length - dossier.reasons.length;

/* ---------- Паспорт ---------- */

/** Статусы паспорта по-русски; незнакомый — нейтрально. */
export const AI_DOSSIER_STATUS_LABELS: Record<string, string> = {
    active: 'работает',
    probation: 'испытательный срок',
    absent: 'отсутствует',
    left: 'уволен',
};

export const AI_DOSSIER_STATUS_FALLBACK = 'не определён';

export const aiDossierStatusLabel = (status: string | null): string =>
    status === null
        ? AI_DATE_EMPTY
        : (AI_DOSSIER_STATUS_LABELS[status] ?? AI_DOSSIER_STATUS_FALLBACK);

/** Источники даты стажа по-русски; незнакомый — не показываем (пусто). */
export const AI_DOSSIER_SINCE_SOURCE_LABELS: Record<string, string> = {
    employment: 'дата приёма',
    register: 'регистрация на портале',
    proxy: 'по первому событию (приблизительно)',
};

export const aiDossierSinceSourceLabel = (source: string | null): string =>
    source === null ? '' : (AI_DOSSIER_SINCE_SOURCE_LABELS[source] ?? '');

const BAND_RANGE_RE = /^(\d+)-(\d+)$/;
const BAND_OPEN_RE = /^(\d+)\+$/;

/** Полоса стажа бэка: «6-18» → «группа стажа 6–18 мес.», «18+» → «от 18 мес.»; иное — нейтрально. */
export const formatAiTenureBand = (band: string): string => {
    const range = BAND_RANGE_RE.exec(band);
    if (range) return `группа стажа ${range[1]}–${range[2]} мес.`;
    const open = BAND_OPEN_RE.exec(band);
    if (open) return `группа стажа от ${open[1]} мес.`;
    return 'группа стажа не определена';
};

/* ---------- Разделы рубрики в метках руководителя ---------- */

/** Замечания руководителя по разделам: названия через запятую, без повторов. */
export const formatAiDossierRopSections = (
    sections: readonly string[],
): string => [...new Set(sections.map(aiCallSectionLabel))].join(', ');

/* ---------- Тренды и «год назад» в досье ---------- */

/** Подпись метрики тренда; незнакомый код — «показатель», не сам код. */
export const aiDossierMetricLabel = (metric: string): string => {
    const label = aiTrendMetricLabel(metric);
    return label === metric ? 'показатель' : label;
};

/** Причина несопоставимости «год назад»; незнакомый код — нейтрально. */
export const aiDossierYoyReasonLabel = (code: string): string => {
    const label = aiYoyReasonLabel(code);
    return label === code ? 'условия периодов различаются' : label;
};

/* ---------- Обратная связь ---------- */

/** Виды реакций свода обратной связи по-русски (порядок — как в своде). */
export const AI_DOSSIER_FEEDBACK_KIND_LABELS: Record<string, string> = {
    useful: 'полезно',
    not_useful: 'не полезно',
    disagree: 'не согласен',
    alert_handled: 'отработано',
    view: 'просмотров',
};

/** Сводная подпись видов, которых нет в справочнике (служебные и новые). */
export const AI_DOSSIER_FEEDBACK_OTHER = 'прочее';

export const aiDossierFeedbackKindLabel = (kind: string): string =>
    AI_DOSSIER_FEEDBACK_KIND_LABELS[kind] ?? AI_DOSSIER_FEEDBACK_OTHER;

const feedbackCount = (value: unknown): number =>
    typeof value === 'number' && Number.isFinite(value) && value > 0
        ? value
        : 0;

/**
 * Части свода по видам: известные — по-русски в порядке справочника,
 * незнакомые складываются в одно «прочее N» (сырые коды не показываем);
 * нули пропускаем.
 */
export const aiDossierFeedbackParts = (
    byKind: Record<string, unknown>,
): string[] => {
    let other = 0;
    const known = new Map<string, number>();
    for (const [kind, value] of Object.entries(byKind)) {
        const count = feedbackCount(value);
        if (!count) continue;
        if (kind in AI_DOSSIER_FEEDBACK_KIND_LABELS) known.set(kind, count);
        else other += count;
    }
    const parts = Object.entries(AI_DOSSIER_FEEDBACK_KIND_LABELS)
        .filter(([kind]) => known.has(kind))
        .map(([kind, label]) => `${label} ${String(known.get(kind))}`);
    if (other) parts.push(`${AI_DOSSIER_FEEDBACK_OTHER} ${String(other)}`);
    return parts;
};

/** Свод «Обратная связь»: «реакций 7: полезно 4, не согласен 1, прочее 2». */
export const formatAiDossierFeedback = (
    summary: AiDossierFeedbackSummary,
): string => {
    if (!summary.total) return 'реакций пока нет';
    const parts = aiDossierFeedbackParts(summary.byKind);
    const head = `реакций ${String(summary.total)}`;
    return parts.length ? `${head}: ${parts.join(', ')}` : head;
};
