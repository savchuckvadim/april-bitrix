import { EV_PLAN_CODE } from '@/modules/entities/EventPlan/type/event-plan-type';
import type { ChecklistDef } from '../type/call-checklist.type';

/**
 * Каталог чек-листов — единственный источник состава.
 *
 * Требование заказчика (24.08): «чек-лист — pbx-поля для каждого типа
 * звонка», включаемые по настройкам портала, с показом текущих значений.
 *
 * Заметки по полям:
 * - `op_efield_fail_reason` («ОП Причина Отказа») — тот же справочник
 *   возражений, что в отказном flow («Дорого», «Нет денег», «ЛПР против»,
 *   «Конкуренты - …»): владелец подтвердил, что причины доработки — ЭТО ОНИ,
 *   нового поля не заводим. Финальный отказ перезапишет поле финальной
 *   причиной — это осознанно: чек-лист фиксирует возражение на момент
 *   планирования, отказ — итог.
 * - `op_invoice_date` — «Дата отправки Счета» из konstructor-реестра, уже
 *   стоит на порталах со сделками конструктора.
 * - decision/sale (`targetStage`) заполняются модалками перед отправкой —
 *   активируются, когда stage-predict сообщает целевую стадию (Фаза 3).
 */
export const CHECKLIST_CATALOG: ChecklistDef[] = [
    {
        id: 'refine',
        title: 'Чек-лист доработки',
        hint: 'Что мешает клиенту купить — возражение, с которым идём на доработку.',
        trigger: { kind: 'planType', planCode: EV_PLAN_CODE.REFINE },
        configKey: 'withChecklistRefine',
        presentation: 'inline',
        fields: [
            {
                code: 'op_efield_fail_reason',
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

export const getChecklistById = (id: string): ChecklistDef | undefined =>
    CHECKLIST_CATALOG.find(def => def.id === id);
