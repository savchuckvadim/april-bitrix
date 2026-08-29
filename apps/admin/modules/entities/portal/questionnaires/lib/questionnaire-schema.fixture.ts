import type { PortalQuestionnaireSchema } from '../model';

/**
 * Слепок реестра `GET /questionnaires/schema` — ТОЛЬКО для тестов.
 *
 * Повторяет `portal-questionnaires.schema.ts` бэка: те же коды, те же
 * названия, тот же порядок, та же матрица «тип поля → контролы».
 * Приложение его не импортирует — реестр в рантайме всегда приезжает с
 * бэка. Названия важны дословно: из них редактор собирает предпросмотр
 * условий, и разъехавшийся слепок сделал бы проверки бессмысленными.
 *
 * Значения условия «Целевая стадия отправки» бэк собирает из лестницы
 * `PBX_DEAL_SALES_BASE_STAGES`: коды стадий живут только на бэке, здесь
 * они повторены слепком ровно в том порядке, в каком приходят.
 */
export const questionnaireSchemaFixture: PortalQuestionnaireSchema = {
    contract: 1,
    purposes: [
        { code: 'plan', name: 'Для планирования' },
        { code: 'report', name: 'Для отчётности' },
    ],
    presentations: [
        { code: 'inline', name: 'Карточкой в колонке' },
        { code: 'modal', name: 'Модалкой перед отправкой' },
    ],
    places: [
        { code: 'plan', name: 'Колонка «Планируем»' },
        { code: 'report', name: 'Колонка «Отчёт»' },
    ],
    persists: [{ code: 'onChange', name: 'Сразу при изменении' }],
    controls: [
        { code: 'string', name: 'Строка' },
        { code: 'text', name: 'Текст (многострочный)' },
        { code: 'date', name: 'Дата' },
        { code: 'datetime', name: 'Дата и время' },
        { code: 'money', name: 'Сумма' },
        { code: 'enumeration', name: 'Список (один вариант)' },
        { code: 'boolean', name: 'Да / Нет' },
    ],
    channels: [
        { code: 'crm', name: 'Поле CRM' },
        { code: 'dto', name: 'Поле отчёта' },
        { code: 'text', name: 'Комментарий события' },
        { code: 'smart', name: 'Поле элемента смарта' },
    ],
    targetModes: [
        { code: 'auto', name: 'Автоматически' },
        { code: 'entity', name: 'Жёстко указанная сущность' },
    ],
    targetEntities: [
        { code: 'company', name: 'Компания' },
        { code: 'deal', name: 'Сделка' },
        { code: 'lead', name: 'Лид' },
        { code: 'contact', name: 'Контакт' },
        { code: 'smart', name: 'Элемент смарта события' },
    ],
    fieldStatuses: [
        { code: 'ok', name: 'Привязка в порядке' },
        { code: 'missing', name: 'Поле не найдено' },
        { code: 'type_changed', name: 'Тип поля изменился' },
    ],
    conditions: [
        {
            kind: 'planType',
            name: 'Тип планируемого события',
            description:
                'Анкета видна, когда менеджер планирует событие одного из ' +
                'выбранных типов.',
            values: [
                { code: 'warm', name: 'Звонок' },
                { code: 'presentation', name: 'Презентация' },
                { code: 'refine', name: 'Доработка' },
                { code: 'hot', name: 'Решение' },
                { code: 'moneyAwait', name: 'Оплата' },
                { code: 'supply', name: 'Поставка' },
            ],
        },
        {
            kind: 'reportType',
            name: 'Тип отчётного события',
            description:
                'Анкета видна, когда менеджер отчитывается по событию ' +
                'одного из выбранных типов.',
            values: [
                { code: 'xo', name: 'Холодный обзвон' },
                { code: 'xoRequest', name: 'Холодный обзвон: заявка' },
                { code: 'xoLead', name: 'Холодный обзвон: лид' },
                { code: 'warm', name: 'Звонок' },
                { code: 'presentation', name: 'Презентация' },
                { code: 'refine', name: 'Доработка' },
                { code: 'hot', name: 'Решение' },
                { code: 'moneyAwait', name: 'Оплата' },
                { code: 'supply', name: 'Поставка' },
                { code: 'ss', name: 'Сопровождение' },
            ],
        },
        {
            kind: 'targetStage',
            name: 'Целевая стадия отправки',
            description:
                'Анкета видна, когда отправка отчёта двинет основную ' +
                'сделку на одну из выбранных стадий. Стадию считает бэк ' +
                '(stage-predict): нет предикта — анкета молчит.',
            values: [
                { code: 'sales_new', name: 'Новая' },
                { code: 'sales_cold', name: 'Холодные' },
                { code: 'sales_warm', name: 'Переговоры' },
                { code: 'sales_pres', name: 'Презентация' },
                { code: 'sales_refine', name: 'Доработка' },
                { code: 'sales_offer_create', name: 'Документы' },
                { code: 'sales_document_send', name: 'Отправлены' },
                { code: 'sales_in_progress', name: 'В решении' },
                { code: 'sales_money_await', name: 'В оплате' },
                { code: 'sales_supply', name: 'Поставка' },
                { code: 'sales_success', name: 'Успех' },
                { code: 'sales_fail', name: 'Отказ' },
                { code: 'sales_double', name: 'Не состоялась' },
                { code: 'sales_not_ca', name: 'Не ЦА' },
            ],
        },
        {
            kind: 'workStatus',
            name: 'Статус работы',
            description:
                'Анкета видна, когда в отчёте выбран один из статусов ' +
                'работы по клиенту.',
            values: [
                { code: 'inJob', name: 'В работе' },
                { code: 'setAside', name: 'Отложено' },
                { code: 'success', name: 'Продажа' },
                { code: 'fail', name: 'Отказ' },
                { code: 'notCa', name: 'Не ЦА' },
            ],
        },
        {
            kind: 'presentationDone',
            name: 'Презентация проведена',
            description:
                'Анкета видна, когда в отчёте отмечено, что презентация ' +
                'состоялась. Значения не задаются: тип события при этом ' +
                'обычный звонок, а элемент создаётся презентационный.',
            values: [],
        },
        {
            kind: 'always',
            name: 'Всегда',
            description:
                'Без условий. Значения не задаются — анкета видна на ' +
                'каждом экране своего назначения.',
            values: [],
        },
    ],
    dtoPaths: [
        {
            path: 'sale.opportunity',
            name: 'Сумма продажи',
            description:
                'Уходит в штатное поле OPPORTUNITY основной сделки вместе ' +
                'с IS_MANUAL_OPPORTUNITY=Y. Применяется только при статусе ' +
                'работы «Продажа».',
            control: 'money',
        },
        {
            path: 'sale.firstPayDate',
            name: 'Дата первой оплаты',
            description:
                'Уходит в pbx-поле сделки first_pay_date. Поле не ' +
                'установлено на портале — значение молча пропускается бэком.',
            control: 'date',
        },
    ],
    fieldTypeControls: [
        { fieldType: 'string', controls: ['string', 'text'] },
        { fieldType: 'url', controls: ['string'] },
        { fieldType: 'integer', controls: ['money'] },
        { fieldType: 'double', controls: ['money'] },
        { fieldType: 'money', controls: ['money'] },
        { fieldType: 'date', controls: ['date'] },
        { fieldType: 'datetime', controls: ['datetime', 'date'] },
        { fieldType: 'boolean', controls: ['boolean'] },
        { fieldType: 'enumeration', controls: ['enumeration'] },
        { fieldType: 'crm', controls: [] },
        { fieldType: 'crm_status', controls: [] },
        { fieldType: 'employee', controls: [] },
        { fieldType: 'address', controls: [] },
        { fieldType: 'file', controls: [] },
        { fieldType: 'iblock_element', controls: [] },
        { fieldType: 'iblock_section', controls: [] },
    ],
};
