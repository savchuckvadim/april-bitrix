import { EV_PLAN_CODE } from '@/modules/entities/EventPlan/type/event-plan-type';
import type { ChecklistDef } from '../type/call-checklist.type';

/**
 * Каталог чек-листов — единственный источник состава.
 *
 * Требование заказчика (24.08): «чек-лист — pbx-поля для каждого типа
 * звонка», включаемые по настройкам портала, с показом текущих значений.
 *
 * Заметки по полям:
 * - `op_objection_reason` («ОП Возражение клиента») — справочник возражений
 *   с тем же составом, что причины отказа. Раньше здесь стояло
 *   `op_efield_fail_reason`, и финальный отказ ПЕРЕЗАПИСЫВАЛ возражение
 *   своей причиной: два смысла в одном поле, свести историю нельзя.
 *   Теперь причина отказа принадлежит только финалу, возражение — своё
 *   поле и живёт по своей шкале времени (25.08).
 * - `op_invoice_date` — «Дата отправки Счета» из konstructor-реестра, уже
 *   стоит на порталах со сделками конструктора.
 * - decision/sale (`targetStage`) заполняются модалками перед отправкой —
 *   активируются, когда stage-predict сообщает целевую стадию (Фаза 3).
 */
const PLAN_CHECKLIST_CATALOG: ChecklistDef[] = [
    {
        id: 'refine',
        title: 'Чек-лист доработки',
        hint: 'Что мешает клиенту купить — возражение, с которым идём на доработку.',
        trigger: { kind: 'planType', planCode: EV_PLAN_CODE.REFINE },
        configKey: 'withChecklistRefine',
        presentation: 'inline',
        fields: [
            {
                code: 'op_objection_reason',
                type: 'enumeration',
                title: 'Причина возражения',
                required: true,
            },
        ],
    },
    {
        id: 'pay',
        title: 'Чек-лист оплаты',
        hint: 'Счёт должен быть выставлен до звонка по оплате.',
        trigger: { kind: 'planType', planCode: EV_PLAN_CODE.PAY },
        configKey: 'withChecklistPay',
        presentation: 'inline',
        fields: [
            {
                code: 'op_invoice_date',
                type: 'datetime',
                title: 'Дата последнего счёта',
                required: true,
                // Смысл требования — «счёт выставлен ПЕРЕД этим звонком».
                // Без срока годности счёт годичной давности закрывал пункт,
                // и звонок по оплате планировался без реального счёта.
                staleAfterDays: 30,
            },
        ],
    },
    {
        // Переход на «Клиент на решении»: направлены КП/договор/счёт
        // (даты-факты, konstructor-реестр) + дата звонка по решению
        // (новое поле, «выдернуто из Хвоста»). ВСЕ обязательны — по ТЗ.
        id: 'decision',
        title: 'Клиент на решении',
        hint: 'Сделка уходит на «Клиент на решении» — документы должны быть направлены, дата звонка по решению известна.',
        trigger: { kind: 'targetStage', stageCode: 'sales_in_progress' },
        configKey: 'withChecklistDecision',
        presentation: 'modal',
        fields: [
            {
                code: 'op_offer_date',
                type: 'datetime',
                title: 'Направлено КП',
                required: true,
            },
            {
                code: 'op_contract_date',
                type: 'datetime',
                title: 'Направлен проект договора',
                required: true,
            },
            {
                code: 'op_invoice_date',
                type: 'datetime',
                title: 'Направлен счёт',
                required: true,
            },
            {
                code: 'op_xvost_decision_call_date',
                type: 'date',
                title: 'Дата звонка по решению',
                required: true,
            },
        ],
    },
    {
        // Продажа: сумма → штатный OPPORTUNITY, дата оплаты → first_pay_date.
        // Оба поля уезжают DTO (sale-блок) — сделку может создавать сам flow,
        // фронту некуда писать заранее; сервер-гард дублирует обязательность.
        id: 'sale',
        title: 'Продажа',
        hint: 'Сумма сделки и дата первой оплаты обязательны при продаже.',
        trigger: { kind: 'targetStage', stageCode: 'sales_success' },
        configKey: 'withChecklistSale',
        presentation: 'modal',
        fields: [
            {
                code: 'OPPORTUNITY',
                type: 'money',
                title: 'Сумма сделки',
                required: true,
                channel: 'dto',
                native: true,
            },
            {
                code: 'first_pay_date',
                type: 'date',
                title: 'Дата первой оплаты',
                required: true,
                channel: 'dto',
            },
        ],
    },
];

/**
 * Вопросы ПРИ ОТЧЁТЕ — по типу события закрываемой задачи (25.08).
 *
 * Тип отчётного события до сих пор не влиял ни на что, кроме презентации:
 * отчёт по «Доработке», «Решению» и «Оплате» не спрашивал ничего, и самое
 * содержательное — что ответил клиент — оставалось в свободном тексте
 * комментария. Здесь спрашиваются те же вещи, но в поля: по ним строится
 * аналитика возражений и решений.
 *
 * Все три набора включаются ОДНИМ флагом портала `withReportQuestions`:
 * включают их всегда вместе, а пять похожих галок в админке уже есть.
 *
 * Обязательных полей здесь нет намеренно: отчёт нельзя запирать за
 * вопросом, на который у менеджера может не быть ответа («клиент не
 * сказал»). Свежесть (`staleAfterDays`) — на случай, когда поле всё же
 * сделают обязательным: прошлое возражение не должно закрывать вопрос
 * сегодняшнего разговора.
 */
const REPORT_QUESTION_CATALOG: ChecklistDef[] = [
    {
        id: 'reportRefine',
        title: 'Итог доработки',
        hint: 'Что мешает клиенту купить прямо сейчас.',
        trigger: { kind: 'reportType', eventType: 'refine' },
        configKey: 'withReportQuestions',
        presentation: 'inline',
        place: 'report',
        fields: [
            {
                code: 'op_objection_reason',
                type: 'enumeration',
                title: 'Возражение клиента',
                required: false,
            },
            {
                code: 'op_objection_comment',
                type: 'string',
                title: 'Формулировка клиента',
                placeholder: 'Как клиент сказал это своими словами',
                required: false,
            },
        ],
    },
    {
        id: 'reportDecision',
        title: 'Итог звонка по решению',
        hint: 'К чему пришли: решение принято, отложено или отказ.',
        trigger: { kind: 'reportType', eventType: 'hot' },
        configKey: 'withReportQuestions',
        presentation: 'inline',
        place: 'report',
        fields: [
            {
                code: 'op_decision_outcome',
                type: 'enumeration',
                title: 'Исход решения',
                required: false,
            },
            {
                code: 'op_decision_date',
                type: 'date',
                title: 'Дата решения',
                required: false,
                staleAfterDays: 14,
            },
            {
                code: 'op_objection_reason',
                type: 'enumeration',
                title: 'Что мешает',
                required: false,
            },
        ],
    },
    {
        id: 'reportPay',
        title: 'Итог звонка по оплате',
        hint: 'Когда клиент обещает оплатить.',
        trigger: { kind: 'reportType', eventType: 'moneyAwait' },
        configKey: 'withReportQuestions',
        presentation: 'inline',
        place: 'report',
        fields: [
            {
                // Существующее поле «ОП Плановая дата покупки» — ровно то,
                // что менеджер выясняет звонком по оплате; заводить второе
                // «дата обещанной оплаты» значило бы раздвоить смысл.
                code: 'op_sale_date_prognoz',
                type: 'date',
                title: 'Обещанная дата оплаты',
                required: false,
                staleAfterDays: 14,
            },
            {
                code: 'op_objection_comment',
                type: 'string',
                title: 'Что сказал клиент',
                placeholder: 'Причина задержки, условия оплаты',
                required: false,
            },
        ],
    },
];

export const CHECKLIST_CATALOG: ChecklistDef[] = [
    ...PLAN_CHECKLIST_CATALOG,
    ...REPORT_QUESTION_CATALOG,
];

export const getChecklistById = (id: string): ChecklistDef | undefined =>
    CHECKLIST_CATALOG.find(def => def.id === id);
