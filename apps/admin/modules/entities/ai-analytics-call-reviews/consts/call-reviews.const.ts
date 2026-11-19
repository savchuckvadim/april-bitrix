import type { SelectFieldOption } from '@workspace/april-ui/fields';
import {
    ANY_ITEM_KIND,
    type CallReviewsAgree,
    type CallReviewsItemKindFilter,
} from '../model';

/** Значения страницы по умолчанию. */
export const CALL_REVIEWS_DEFAULTS = {
    /** Период — последние 30 дней, сегодня включительно. */
    periodDays: 30,
    pageSize: 50,
    /** Сколько знаков комментария видно до «Показать полностью». */
    commentPreview: 300,
} as const;

/** Тексты страницы. */
export const CALL_REVIEWS_TEXT = {
    pageTitle: 'Отзывы о разборах',
    pageDescription:
        'Что руководители думают о разборах звонков: согласны ли с оценкой AI, свои оценки и что в разборе «не так».',
    formTitle: 'Портал и период',
    portal: 'Портал',
    portalPlaceholder: 'Выберите портал',
    portalSearch: 'Найти портал',
    portalEmpty: 'Порталы не найдены',
    periodFrom: 'С',
    periodTo: 'По',
    periodInvalid: 'Проверьте даты: начало не позже конца.',
    agree: 'Согласие с оценкой AI',
    itemKind: 'Что «не так»',
    pickPortal: 'Выберите портал, чтобы увидеть отзывы.',
    loadError: 'Отзывы не загрузились',
    summaryTitle: 'Сводка за период',
    summaryHint: 'Сводка — по всем отзывам периода, без учёта фильтров.',
    total: 'Отзывов',
    disagree: 'Не согласны',
    avgAi: 'Оценка AI в среднем',
    avgLeader: 'Оценка руководителей',
    avgDiff: 'Разница',
    avgDiffHint: 'Минус — руководители оценивают строже AI.',
    kindsTitle: 'Замечания «не так» по видам',
    topTitle: 'Чаще всего «не так»',
    topEmpty: 'Замечаний «не так» за период нет.',
    tableTitle: 'Отзывы',
    empty: 'Отзывов под фильтрами нет.',
    showFull: 'Показать полностью',
    showLess: 'Свернуть',
    openCall: 'Открыть звонок',
    noLink: 'ссылки нет',
    agreeYes: 'Согласен',
    agreeNo: 'Не согласен',
} as const;

/** Варианты фильтра согласия. */
export const AGREE_OPTIONS: readonly SelectFieldOption<CallReviewsAgree>[] = [
    { value: 'all', label: 'Все' },
    { value: 'yes', label: 'Согласен' },
    { value: 'no', label: 'Не согласен' },
];

/** Варианты фильтра вида «не так». */
export const ITEM_KIND_OPTIONS: readonly SelectFieldOption<CallReviewsItemKindFilter>[] = [
    { value: ANY_ITEM_KIND, label: 'Любое' },
    { value: 'section', label: 'Раздел' },
    { value: 'objection', label: 'Возражение' },
    { value: 'methodology', label: 'Пункт методики' },
    { value: 'fact', label: 'Факт' },
    { value: 'call_type', label: 'Тип звонка' },
];
