import {
    aiIsoWeekMondayUtc,
    aiIsoWeekRange,
} from '@/modules/entities/ai-analytics/lib/ai-period-label.util';

/*
 * Неделя «Повестки планёрки» по-человечески. weekKey ответа — ТЕКУЩАЯ
 * ISO-неделя планёрки (YYYY-Www), а звонки повестки — прошлой полной
 * недели (пн–вс, TZ портала), несогласия — с понедельника прошлой недели
 * по сейчас. Сырой YYYY-Www на экран не выводим: только даты «дд.мм–дд.мм».
 * Разбор ключа недели — общий форматтер периодов сущности.
 */

export const AI_AGENDA_TEXT = {
    description: (range: string) =>
        `Звонки прошлой недели (${range}) для планёрки`,
    descriptionNoRange: 'Звонки прошлой недели для планёрки',
    itemsEmpty: 'За прошлую неделю подходящих звонков для повестки нет.',
    disagreementsTitle: 'Несогласия с понедельника прошлой недели',
    disagreementsEmpty:
        'С понедельника прошлой недели несогласий с разбором не было.',
} as const;

/** Понедельник ISO-недели YYYY-Www (UTC); битый ключ или номер вне года — null. */
export const aiIsoWeekMonday = aiIsoWeekMondayUtc;

/** «14.09–20.09» — неделя перед неделей планёрки; битый ключ — null. */
export const aiAgendaPrevWeekRange = (weekKey: string): string | null =>
    aiIsoWeekRange(weekKey, -1);

/** Подпись карточки: «Звонки прошлой недели (14.09–20.09) для планёрки». */
export const aiAgendaDescription = (
    weekKey: string | null | undefined,
): string => {
    const range = weekKey ? aiAgendaPrevWeekRange(weekKey) : null;
    return range
        ? AI_AGENDA_TEXT.description(range)
        : AI_AGENDA_TEXT.descriptionNoRange;
};
