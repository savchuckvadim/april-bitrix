import type { AiDossier, AiDossierReason } from '../model';

/*
 * Досье менеджера (Фаза 3, П4): подписи разделов и причин пустого раздела,
 * окно по умолчанию, порядок разделов в карточке.
 */

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

export const aiDossierSectionLabel = (section: string): string =>
    AI_DOSSIER_SECTION_LABELS[section] ?? section;

/** Окно досье по умолчанию и границы (зеркало AI_DOSSIER_MONTHS бэка). */
export const AI_DOSSIER_MONTHS = { default: 3, min: 1, max: 12 } as const;

/** Варианты окна для переключателя. */
export const AI_DOSSIER_MONTH_OPTIONS = [3, 6, 12] as const;

/** Подпись причины пустого раздела: «Тренды — данных мало…». */
export const formatAiDossierReason = (reason: AiDossierReason): string =>
    `${aiDossierSectionLabel(reason.section)} — ${reason.text}`;

/** Сколько разделов досье собралось (из десяти). */
export const aiDossierFilledCount = (dossier: AiDossier): number =>
    Object.keys(AI_DOSSIER_SECTION_LABELS).length - dossier.reasons.length;

/** Статусы паспорта по-русски. */
export const AI_DOSSIER_STATUS_LABELS: Record<string, string> = {
    active: 'работает',
    probation: 'испытательный срок',
    absent: 'отсутствует',
    left: 'уволен',
};

export const aiDossierStatusLabel = (status: string | null): string =>
    status === null ? '—' : (AI_DOSSIER_STATUS_LABELS[status] ?? status);

/** Источники даты стажа по-русски. */
export const AI_DOSSIER_SINCE_SOURCE_LABELS: Record<string, string> = {
    employment: 'дата приёма',
    register: 'регистрация на портале',
    proxy: 'первое событие (прокси)',
};

export const aiDossierSinceSourceLabel = (source: string | null): string =>
    source === null ? '' : (AI_DOSSIER_SINCE_SOURCE_LABELS[source] ?? source);

/** Виды реакций свода обратной связи по-русски. */
export const AI_DOSSIER_FEEDBACK_KIND_LABELS: Record<string, string> = {
    useful: 'полезно',
    not_useful: 'не полезно',
    disagree: 'не согласен',
    view: 'просмотров',
    alert_handled: 'отработано',
};

export const aiDossierFeedbackKindLabel = (kind: string): string =>
    AI_DOSSIER_FEEDBACK_KIND_LABELS[kind] ?? kind;
