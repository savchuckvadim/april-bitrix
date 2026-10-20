import type { AiOverviewScope } from '../model';

/*
 * Периметр разбора: вкладка показывает только сотрудников, чьи звонки
 * разбирает AI (бэк режет строки сам, см. meta.scope). Здесь — один
 * источник подписи чипа в шапке, пустого состояния таблиц и примечаний у
 * блоков, которые считаются по всему отделу (прогноз).
 */

export interface AiScopeNote {
    /** Список разбора действует: в строках только сотрудники из него. */
    pilotActive: boolean;
    /** Сколько сотрудников в строках ответа. */
    shownManagers: number;
    /** Сколько выбранных в фильтре скрыто, потому что их звонки AI не разбирает. */
    hiddenByPilot: number;
    /** В выбранном фильтре нет никого из разбора — строк нет. */
    empty: boolean;
}

/** Примечание из meta.scope обзора; старый кэш без поля — null. */
export const buildAiScopeNote = (
    scope: AiOverviewScope | null | undefined,
): AiScopeNote | null =>
    scope
        ? {
              pilotActive: scope.pilotActive,
              shownManagers: scope.shownManagers,
              hiddenByPilot: scope.hiddenByPilot,
              empty: scope.pilotActive && scope.shownManagers === 0,
          }
        : null;

/** Чип показываем только при действующем списке разбора. */
export const isAiScopeChipVisible = (note: AiScopeNote | null): boolean =>
    !!note && note.pilotActive;

export const AI_SCOPE_TEXT = {
    chip: (shown: number) => `Только сотрудники из разбора: ${shown}`,
    chipHint: {
        title: 'Показаны только сотрудники из разбора',
        lines: [
            'Во вкладке показаны только сотрудники, чьи звонки разбирает AI. Остальные сотрудники отдела есть во вкладках KPI и «Финансы».',
            'Чтобы добавить сотрудника в разбор, попросите разработчика.',
        ],
    },
    /** «…скрыто 3» — когда часть выбранных в фильтре не в разборе. */
    hidden: (count: number) => `скрыто ${count}`,
    emptyTitle: 'В выбранном фильтре нет сотрудников, чьи звонки разбирает AI.',
    emptyAction: (names: string) =>
        names
            ? `Что сделать: выберите в фильтре отчёта ${names} или попросите разработчика добавить нужных сотрудников в разбор.`
            : 'Что сделать: выберите в фильтре отчёта сотрудников из разбора или попросите разработчика добавить нужных сотрудников в разбор.',
    totalsCaption:
        'Итоги — только по сотрудникам из разбора звонков, включая продажи и планы в этих строках.',
    forecastNote:
        'Прогноз считается по всему отделу продаж, а не только по сотрудникам из разбора: продажи делают все.',
} as const;

/** Имена сотрудников из разбора через запятую — для пустого состояния. */
export const aiScopeEmptyText = (pilotNames: readonly string[]): string =>
    `${AI_SCOPE_TEXT.emptyTitle} ${AI_SCOPE_TEXT.emptyAction(pilotNames.join(', '))}`;
