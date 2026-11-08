/**
 * Чистая логика «живых» блоков сводки: нагрузка на Битрикс (Prometheus) и
 * привязки виджетов, как их видит Битрикс сейчас. Без React.
 */

/** Привязка из placement.get — нужные поля. */
export interface LiveBinding {
    placement: string;
    handler: string;
    ours: boolean;
    widget: string | null;
}

export interface LiveWidgetRow {
    code: string;
    title: string;
    /** Где привязан по ответу Битрикса; пусто — не привязан. */
    places: string[];
}

export interface LiveWidgetsView {
    /** Виджеты по списку портала и где они реально стоят. */
    rows: LiveWidgetRow[];
    /** Наши привязки виджетов не из списка портала — лишние. */
    extra: LiveBinding[];
    /** Привязки приложения на чужой/старый адрес обработчика. */
    foreign: LiveBinding[];
}

/** Список портала (`app_widgets`) против ответа Битрикса (placement.get). */
export function liveWidgetsView(
    desired: readonly string[],
    bindings: readonly LiveBinding[],
    titles: Readonly<Record<string, string>>,
): LiveWidgetsView {
    const ours = bindings.filter(item => item.ours);
    const wanted = new Set(desired);
    return {
        rows: desired.map(code => ({
            code,
            title: titles[code] ?? code,
            places: ours.filter(item => item.widget === code).map(item => item.placement),
        })),
        extra: ours.filter(item => !item.widget || !wanted.has(item.widget)),
        foreign: bindings.filter(item => !item.ours),
    };
}

/** Класс вызова Битрикса — по-русски. */
export const CALL_CLASS_TITLE: Record<string, string> = {
    interactive: 'действия людей',
    background: 'фоновые задачи',
};

/** Доля неудачных (ошибки + таймауты) в процентах; null — вызовов не было. */
export function failureShare(load: { total: number; errors: number; timeouts: number }): number | null {
    if (load.total <= 0) return null;
    return Math.round(((load.errors + load.timeouts) / load.total) * 1000) / 10;
}

/** «0,8 с» / «120 мс»; null — «—». */
export function formatSeconds(seconds: number | null): string {
    if (seconds === null || !Number.isFinite(seconds)) return '—';
    if (seconds < 1) return `${Math.round(seconds * 1000)} мс`;
    return `${seconds.toFixed(1).replace('.', ',')} с`;
}

/** «12 345» — разряды неразрывным пробелом. */
export function formatCount(value: number): string {
    return Math.round(value).toLocaleString('ru-RU');
}

const pad = (value: number): string => String(value).padStart(2, '0');

/** Час пика по его концу: «14:00–15:00» (время браузера). */
export function formatPeakHour(endIso: string): string {
    const end = new Date(endIso);
    if (Number.isNaN(end.getTime())) return '—';
    const start = new Date(end.getTime() - 60 * 60 * 1000);
    return `${pad(start.getHours())}:00–${pad(end.getHours())}:00`;
}
