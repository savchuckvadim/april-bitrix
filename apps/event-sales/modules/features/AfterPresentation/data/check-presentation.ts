import {
    buildSurveyTemplateText,
    FIVE_K_TEMPLATES,
    XVOST_TEMPLATES,
    type SurveyTemplate,
} from '@workspace/event-sales-flow';

import {
    CheckPresentationFieldType,
    CheckPresentationItem,
} from '../type/check-presentation-type';

/**
 * Состав опросника «Хвост / 5К» (переделка 01.09.2026).
 *
 * Было двадцать одна позиция — по вопросу в поле, три галочки и две даты.
 * Стало одиннадцать: пять блоков «Хвоста», сводный «Хвост» и пять блоков
 * «5К». Подвопросы живут ВНУТРИ значения текстом: поле открывается с
 * пронумерованными вопросами, менеджер пишет ответы между ними.
 *
 * ТЕКСТ ВОПРОСОВ СЮДА НЕ КОПИРУЕТСЯ. Он приходит из `SURVEY_TEMPLATES`
 * пакета флоу — того же файла, которым бэк отличает «в поле только шаблон»
 * от «менеджер ответил». Своя копия здесь означала бы, что правка
 * формулировки на бэке ломает проверку на фронте: шаблон перестал бы
 * совпадать, и нетронутое поле поехало бы в CRM как заполненное.
 *
 * id = code — стабильно между SSR и клиентом.
 *
 * TODO(бэк): состав по-прежнему захардкожен. Портальный каталог анкет
 * (`docs/answers-model.md`, шаг 9) должен описать эти блоки системной
 * анкетой: портал сможет выключить её и поправить заголовки, но не
 * добавить или убрать вопрос.
 */

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
    // Плейсхолдер остаётся для случая, когда менеджер стёр шаблон целиком:
    // подсказка должна быть даже в пустом поле.
    placeholder: template.questions[0] ?? template.title,
    required,
    order,
    template: buildSurveyTemplateText(template),
});

/**
 * Сводный «Хвост» — единственная позиция, которую менеджер пишет своими
 * словами без шаблона: это итог презентации, который читают руководитель и
 * следующий менеджер. Сводка «5К» (`op_presentation_5k`) собирается из
 * блоков автоматически и вопросом не является.
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

export const checkPresentationData: CheckPresentationItem[] = [
    // «Хвост» обязателен: без него отчёт по презентации не проводится.
    ...XVOST_TEMPLATES.map((template, index) =>
        itemFromTemplate(template, index, true),
    ),
    XVOST_SUMMARY_ITEM,
    // «5К» — не обязателен: часть вопросов на конкретном звонке не звучит.
    ...FIVE_K_TEMPLATES.map((template, index) =>
        itemFromTemplate(template, XVOST_TEMPLATES.length + 1 + index, false),
    ),
];
