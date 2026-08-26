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

export type ChecklistId = 'refine' | 'pay' | 'decision' | 'sale';

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

export type ChecklistFieldType = 'date' | 'datetime' | 'enumeration' | 'money';

export interface ChecklistFieldDef {
    /** Код pbx-поля из реестра (op_efield_fail_reason, op_invoice_date…). */
    code: string;
    type: ChecklistFieldType;
    title: string;
    /**
     * Обязательное поле блокирует отправку, пока пусто. Закрывается и
     * текущим значением из CRM: «показать и дать изменить», а не «заставить
     * перезаполнить».
     */
    required: boolean;
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
     * `inline` — блок в колонке плана (заполняется при планировании);
     * `modal` — шаг-модалка в цепочке send() (заполняется перед отправкой).
     */
    presentation: 'inline' | 'modal';
    fields: ChecklistFieldDef[];
}
