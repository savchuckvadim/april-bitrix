import type { EV_PLAN_CODE } from '@/modules/entities/EventPlan/type/event-plan-type';
import type { EventTaskEventType } from '@/modules/entities/EventTask/types/event-task-type';
import type { DomainFeatureConfig } from '@/modules/app/consts/domain-config';

/**
 * Чек-лист pbx-полей — «информация, которую можно получить только от
 * менеджера»: список полей CRM, которые надо показать (с текущим значением)
 * и заполнить в конкретный момент работы.
 *
 * Каталог — ДАННЫЕ (data/checklist-catalog.ts): новый чек-лист или поле —
 * строка каталога + дескриптор настройки, без нового кода. Включение —
 * настройками портала (админка → Settings → event-sales).
 */

export type ChecklistId =
    | 'refine'
    | 'pay'
    | 'decision'
    | 'sale'
    // Вопросы ПРИ ОТЧЁТЕ по типу события (todo 25.08): тип отчётного
    // события до сих пор ни на что не влиял, хотя триггер `reportType`
    // в движке был написан и не использован ни разу.
    | 'reportRefine'
    | 'reportDecision'
    | 'reportPay';

/**
 * Когда чек-лист активен:
 * - `planType` — менеджер планирует звонок этого типа;
 * - `reportType` — менеджер отчитывается по звонку этого типа;
 * - `targetStage` — отправка двинет основную сделку на эту стадию
 *   (код стадии pbx, напр. `sales_in_progress`; работает через stage-predict).
 */
export type ChecklistTrigger =
    | { kind: 'planType'; planCode: EV_PLAN_CODE }
    | { kind: 'reportType'; eventType: EventTaskEventType }
    | { kind: 'targetStage'; stageCode: string };

export type ChecklistFieldType =
    | 'date'
    | 'datetime'
    | 'enumeration'
    | 'money'
    /** Однострочный текст: формулировка клиента своими словами. */
    | 'string';

export interface ChecklistFieldDef {
    /** Код pbx-поля из реестра (op_efield_fail_reason, op_invoice_date…). */
    code: string;
    type: ChecklistFieldType;
    title: string;
    /** Подсказка под контролом (пример ответа, уточнение формулировки). */
    placeholder?: string;
    /**
     * Обязательное поле блокирует отправку, пока пусто. Закрывается и
     * текущим значением из CRM: «показать и дать изменить», а не «заставить
     * перезаполнить».
     */
    required: boolean;
    /**
     * Срок годности значения из CRM (дни) — ТОЛЬКО для `date`/`datetime`,
     * где сама дата и есть отметка времени. Обязательное поле со старым
     * значением снова требует ответа: счёт годичной давности не должен
     * закрывать чек-лист оплаты. У остальных типов отметки времени нет —
     * свойство игнорируется (не объявляйте его там).
     */
    staleAfterDays?: number;
    /**
     * Куда уходит значение:
     * - `crm` (дефолт) — пессимистичная запись в сущность при изменении;
     * - `dto` — только в payload отправки (продажа: сделку может создавать
     *   сам flow, фронту некуда писать заранее; пишет бэк одной операцией
     *   со сменой стадии).
     */
    channel?: 'crm' | 'dto';
    /**
     * Штатное поле Bitrix (OPPORTUNITY): ключ строки — сам код, слепок
     * портала для резолва не нужен.
     */
    native?: boolean;
}

export interface ChecklistDef {
    id: ChecklistId;
    title: string;
    /** Короткое пояснение менеджеру, зачем заполнять. */
    hint?: string;
    trigger: ChecklistTrigger;
    /** Флаг конфига приложения, включающий чек-лист на портале. */
    configKey: keyof DomainFeatureConfig;
    /**
     * `inline` — блок в колонке (какой именно — говорит `place`);
     * `modal` — шаг-модалка в цепочке send() (заполняется перед отправкой).
     */
    presentation: 'inline' | 'modal';
    /**
     * В какой колонке живёт инлайн-блок: `plan` — «Планируем» (что нужно
     * знать ДО следующего звонка), `report` — «Отчёт» (что выяснили В
     * разговоре). Для `presentation: 'modal'` значения не имеет.
     * По умолчанию `plan` — прежнее поведение каталога.
     */
    place?: 'plan' | 'report';
    fields: ChecklistFieldDef[];
}
