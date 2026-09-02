import {
    FIVE_K_TEMPLATES,
    XVOST_TEMPLATES,
    type SurveyTemplate,
} from '@workspace/event-sales-flow';

import {
    CheckPresentationFieldType,
    CheckPresentationItem,
} from '../type/check-presentation-type';

/**
 * Состав опросника «Хвост / 5К» (переделка 01.09.2026, ревизия 02.09).
 *
 * Пять блоков «Хвоста», сводный «Хвост», пять блоков «5К» — плюс три
 * вопроса по итогам разговора: плановая дата покупки, возражения и прогноз
 * по компании (последний — виджет окна, не позиция списка).
 *
 * Блок = Вопрос с подвопросами и ОДНИМ полем CRM. Подвопросы живут в
 * `questions`: тултип на заголовке, плейсхолдер пустого поля, а «развернуть
 * подробно» делает каждый отдельным полем. В значение они больше не
 * сеются — иначе поле не бывало пустым, и «заполнено» переставало что-либо
 * значить.
 *
 * ТЕКСТ ВОПРОСОВ СЮДА НЕ КОПИРУЕТСЯ. Он приходит из `SURVEY_TEMPLATES`
 * пакета флоу — того же файла, по которому бэк строит AI-промпты и
 * подсказки полей: одна формулировка на всех.
 *
 * id = code — стабильно между SSR и клиентом.
 *
 * TODO(бэк): состав по-прежнему захардкожен. Портальный каталог анкет
 * (`docs/answers-model.md`, шаг 9) должен описать эти блоки системной
 * анкетой: портал сможет выключить её и поправить заголовки, но не
 * добавить или убрать вопрос.
 */

/** Подвопросы построчно с нумерацией — плейсхолдер пустого поля. */
const numberedPlaceholder = (questions: readonly string[]): string =>
    questions.map((question, index) => `${index + 1}. ${question}`).join('\n');

/** Блок каталога → позиция опросника. Порядок задаёт вызывающий. */
const itemFromTemplate = (
    template: SurveyTemplate,
    order: number,
    required: boolean,
): CheckPresentationItem => ({
    id: template.code,
    type: CheckPresentationFieldType.STRING,
    code: template.code,
    title: template.title,
    placeholder: numberedPlaceholder(template.questions),
    required,
    order,
    questions: [...template.questions],
});

/**
 * Сводный «Хвост» — единственная позиция, которую менеджер пишет своими
 * словами без подвопросов: это итог презентации, который читают
 * руководитель и следующий менеджер. Сводка «5К» (`op_presentation_5k`)
 * собирается из блоков автоматически и вопросом не является.
 */
const XVOST_SUMMARY_ITEM: CheckPresentationItem = {
    id: 'op_presentation_xvost',
    type: CheckPresentationFieldType.STRING,
    code: 'op_presentation_xvost',
    title: 'Хвост',
    placeholder: 'Что осталось «хвостом» после презентации',
    required: false,
    order: XVOST_TEMPLATES.length,
};

/**
 * Итоги разговора (просьба владельца 02.09): дата и возражения —
 * необязательны, но спрашиваются здесь же, чтобы после презентации не
 * искать их по другим окнам. Варианты возражений приезжают со слепка
 * портала при инициализации (`withPortalOptions`).
 */
const SALE_DATE_ITEM: CheckPresentationItem = {
    id: 'op_sale_date_prognoz',
    type: CheckPresentationFieldType.DATE,
    code: 'op_sale_date_prognoz',
    title: 'Плановая дата покупки',
    placeholder: '',
    required: false,
    order: XVOST_TEMPLATES.length + 1,
};

const OBJECTION_ITEM: CheckPresentationItem = {
    id: 'op_objection_reason',
    type: CheckPresentationFieldType.ENUMERATION,
    code: 'op_objection_reason',
    title: 'Возражения клиента',
    placeholder: 'Что мешает купить',
    required: false,
    isMultiple: true,
    options: [],
    order: XVOST_TEMPLATES.length + 2,
};

const TALK_TAIL_COUNT = 3;

export const checkPresentationData: CheckPresentationItem[] = [
    // «Хвост» обязателен: без него отчёт по презентации не проводится.
    ...XVOST_TEMPLATES.map((template, index) =>
        itemFromTemplate(template, index, true),
    ),
    XVOST_SUMMARY_ITEM,
    SALE_DATE_ITEM,
    OBJECTION_ITEM,
    // «5К» — не обязателен: часть вопросов на конкретном звонке не звучит.
    ...FIVE_K_TEMPLATES.map((template, index) =>
        itemFromTemplate(
            template,
            XVOST_TEMPLATES.length + TALK_TAIL_COUNT + index,
            false,
        ),
    ),
];
