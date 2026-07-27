/** Форматирование длительностей эфирного времени (секунды из API). */

/** «чч:мм:сс» (часы без ведущего нуля, при 0 часов — «мм:сс»). */
export const formatDurationClock = (totalSeconds: number): string => {
    const seconds = Math.max(0, Math.round(totalSeconds));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

/** «1 ч 23 м» / «42 м» / «15 с» — для карточек и подписей. */
export const formatDurationHuman = (totalSeconds: number): string => {
    const seconds = Math.max(0, Math.round(totalSeconds));
    if (seconds < 60) return `${seconds} с`;
    // Округляем до минут ДО деления на часы — иначе 59.5 м даёт «60 м».
    const totalMinutes = Math.round(seconds / 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m} м`;
    return m > 0 ? `${h} ч ${m} м` : `${h} ч`;
};

/** Минуты (округлённые) — для рейтингов/CSV, где нужна числовая шкала. */
export const secondsToMinutes = (totalSeconds: number): number =>
    Math.round(totalSeconds / 60);
