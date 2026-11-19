/** Форматирование строк списка «Отзывы о разборах» — чистые функции. */

/** Оценка: целая — как есть, дробная — один знак через запятую; нет — «—». */
export const formatScore = (value: number | null | undefined): string =>
    value === null || value === undefined || !Number.isFinite(value)
        ? '—'
        : Number.isInteger(value)
          ? String(value)
          : value.toFixed(1).replace('.', ',');

/** «AI 7,2 → 5»: оценка AI и оценка руководителя. */
export const scoreChangeLabel = (aiScore: number | null, leaderScore: number | null): string =>
    `AI ${formatScore(aiScore)} → ${formatScore(leaderScore)}`;

/** Разница со знаком: «+0,5», «−1,2», «0»; нет — «—». */
export const formatDiff = (value: number | null | undefined): string => {
    if (value === null || value === undefined || !Number.isFinite(value)) return '—';
    if (value === 0) return '0';
    return `${value > 0 ? '+' : '−'}${formatScore(Math.abs(value))}`;
};

/** Число и доля: «9 (39,1 %)»; доли нет — только число. */
export const countWithPct = (count: number, pct: number | null | undefined): string =>
    pct === null || pct === undefined ? String(count) : `${count} (${formatScore(pct)} %)`;

/** Момент по Москве: «18.11.2026, 15:41»; нет — «—». */
export const formatMoscowDateTime = (iso: string | null | undefined): string => {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('ru-RU', {
        timeZone: 'Europe/Moscow',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

/** Начало комментария для таблицы и признак, что он обрезан. */
export interface CommentPreview {
    text: string;
    truncated: boolean;
}

/** Первые `max` знаков комментария (обрезанный — с «…»). */
export const commentPreview = (comment: string, max: number): CommentPreview => {
    const text = comment.trim();
    if (text.length <= max) return { text, truncated: false };
    return { text: `${text.slice(0, max).trimEnd()}…`, truncated: true };
};

/** Менеджер: имя, иначе «сотрудник {id}», иначе «—». */
export const managerLabel = (name: string | null, id: string | null): string =>
    name?.trim() || (id ? `сотрудник ${id}` : '—');
