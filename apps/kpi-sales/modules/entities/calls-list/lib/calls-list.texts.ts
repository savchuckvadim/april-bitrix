/**
 * Тексты раздела «Разборы звонков»: по-русски, без кодов и технических слов.
 */
import type {
    CallsListPeriodProblem,
    CallsListReviewFilter,
    CallsListSort,
} from '../model/types';
import { CALLS_LIST_MAX_DAYS } from './calls-list.const';

export const CALLS_LIST_TEXT = {
    title: 'Разборы звонков',
    filters: {
        ariaLabel: 'Фильтры разборов',
        period: 'Период',
        periodFrom: 'Начало периода',
        periodTo: 'Конец периода',
        periodHint: `не больше ${CALLS_LIST_MAX_DAYS} дней`,
        managers: 'Сотрудники',
        managersAll: 'Все сотрудники',
        managersMany: (count: number) => `Сотрудников: ${count}`,
        types: 'Тип звонка',
        typesAll: 'Все типы',
        typesMany: (count: number) => `Типов: ${count}`,
        score: 'Оценка AI',
        scoreFrom: 'Оценка AI от',
        scoreTo: 'Оценка AI до',
        scoreAny: 'любая',
        reviews: 'Отзывы',
        sort: 'Порядок',
        reset: 'Сбросить фильтры',
        search: 'Найти…',
        nothingFound: 'Ничего не найдено',
        noManagerName: 'Сотрудник без имени',
        noTypeTitle: 'Тип без названия',
    },
    table: {
        startedAt: 'Дата и время',
        manager: 'Сотрудник',
        client: 'Клиент',
        type: 'Тип',
        duration: 'Длительность',
        aiScore: 'Оценка AI',
        reviews: 'Отзывы руководителей',
        open: 'Открыть',
        openLink: 'Открыть →',
        openTitle: 'Открыть разбор звонка. Правой кнопкой — в соседнем окне.',
        noLink: 'нет ссылки',
        noLinkTitle: 'Ссылка на разбор не выдана — разбор можно найти в карточке звонка в Битрикс24',
        noManager: 'без сотрудника',
        noValue: '—',
    },
    states: {
        loading: 'Загружаем разборы…',
        emptyTitle: 'За период разборов нет',
        emptyText: 'Выберите другой период.',
        emptyFilteredText: 'Выберите другой период или сбросьте фильтры.',
        forbiddenTitle: 'Раздел доступен руководителям',
        forbiddenText: 'Оценивать звонки и смотреть отзывы могут руководители отделов.',
        errorFallback: 'Не удалось загрузить разборы — попробуйте ещё раз',
        retry: 'Повторить',
    },
    reviews: {
        none: 'не оценён',
        mineNone: 'моего нет',
        agree: 'согласен',
        disagree: 'не согласен',
        disagreeMark: (count: number) =>
            count === 1 ? 'есть несогласие' : `несогласны: ${count}`,
        disagreeTitle: 'Руководители, не согласные с оценкой AI',
        average: 'средняя оценка руководителей',
    },
} as const;

export const CALLS_LIST_PERIOD_PROBLEM_TEXT: Record<CallsListPeriodProblem, string> = {
    invalid: 'Укажите обе даты периода',
    order: 'Начало периода позже конца — поменяйте даты местами',
    too_long: `Период — не больше ${CALLS_LIST_MAX_DAYS} дней. Сократите период`,
};

export const CALLS_LIST_REVIEW_FILTER_TEXT: Record<CallsListReviewFilter, string> = {
    any: 'Все',
    reviewed: 'С отзывом',
    not_reviewed: 'Без отзыва',
    disagreed: 'Есть несогласие',
};

export const CALLS_LIST_SORT_TEXT: Record<CallsListSort, string> = {
    date_desc: 'Сначала новые',
    date_asc: 'Сначала старые',
    score_asc: 'Сначала низкая оценка',
    score_desc: 'Сначала высокая оценка',
};
