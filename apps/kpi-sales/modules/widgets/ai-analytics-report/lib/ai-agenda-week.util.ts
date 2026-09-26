import {
    addDays,
    addWeeks,
    format,
    getISOWeeksInYear,
    startOfISOWeek,
} from 'date-fns';

/*
 * Неделя «Повестки планёрки» по-человечески. weekKey ответа — ТЕКУЩАЯ
 * ISO-неделя планёрки (YYYY-Www), а звонки повестки — прошлой полной
 * недели (пн–вс, TZ портала), несогласия — с понедельника прошлой недели
 * по сейчас. Сырой YYYY-Www на экран не выводим: только даты «дд.мм–дд.мм».
 */

const WEEK_KEY = /^(\d{4})-W(\d{2})$/;
/** 4 января всегда в первой ISO-неделе года. */
const ISO_ANCHOR_DAY = 4;
const DAYS_IN_WEEK = 7;

export const AI_AGENDA_TEXT = {
    description: (range: string) =>
        `Звонки прошлой недели (${range}) для планёрки`,
    descriptionNoRange: 'Звонки прошлой недели для планёрки',
    itemsEmpty: 'За прошлую неделю подходящих звонков для повестки нет.',
    disagreementsTitle: 'Несогласия с понедельника прошлой недели',
    disagreementsEmpty:
        'С понедельника прошлой недели несогласий с разбором не было.',
} as const;

/** Понедельник ISO-недели YYYY-Www; битый ключ или номер вне года — null. */
export const aiIsoWeekMonday = (weekKey: string): Date | null => {
    const match = WEEK_KEY.exec(weekKey);
    if (!match) return null;
    const anchor = new Date(Number(match[1]), 0, ISO_ANCHOR_DAY);
    const week = Number(match[2]);
    if (week < 1 || week > getISOWeeksInYear(anchor)) return null;
    return addWeeks(startOfISOWeek(anchor), week - 1);
};

/** «14.09–20.09» — неделя перед неделей планёрки; битый ключ — null. */
export const aiAgendaPrevWeekRange = (weekKey: string): string | null => {
    const monday = aiIsoWeekMonday(weekKey);
    if (!monday) return null;
    const from = addWeeks(monday, -1);
    const to = addDays(from, DAYS_IN_WEEK - 1);
    return `${format(from, 'dd.MM')}–${format(to, 'dd.MM')}`;
};

/** Подпись карточки: «Звонки прошлой недели (14.09–20.09) для планёрки». */
export const aiAgendaDescription = (
    weekKey: string | null | undefined,
): string => {
    const range = weekKey ? aiAgendaPrevWeekRange(weekKey) : null;
    return range
        ? AI_AGENDA_TEXT.description(range)
        : AI_AGENDA_TEXT.descriptionNoRange;
};
