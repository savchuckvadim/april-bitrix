import { MinimalUserDto } from './user.dto';
import { ContactDto } from './contact.dto';
import { EnumEventPlanCode } from '../../types/plan-types';

/** Текущий тип планируемого звонка (ветка plan-flow). */
export interface EventPlanCallDto {
    /** Идентификатор типа звонка в портале. */
    id: number;

    /** Код этапа планируемого звонка, определяющий ветку планирования. */
    code: EnumEventPlanCode;

    /** Отображаемое название этапа звонка. */
    name: string;
}

export interface PlanTypeDto {
    /**
     * Текущий выбранный тип планируемого звонка. `null`, когда менеджер
     * ничего не планировал: недозвон, возврат в ТМЦ, отчёт без плана.
     * Ветку `plan` фронт присылает всегда (legacy-контракт), поэтому
     * пустой тип — штатная ситуация, а не ошибка.
     */
    current: EventPlanCallDto | null;
}

export interface PlanDto {
    /** Ответственный за планируемый звонок (минимальная форма). */
    responsibility: MinimalUserDto;

    /** Автор плана (минимальная форма пользователя). */
    createdBy: MinimalUserDto;

    /** Тип планируемого звонка с текущим выбранным этапом. */
    type: PlanTypeDto;

    /** Название/заголовок планируемого звонка. */
    name: string;

    /** Срок (дедлайн) планируемого звонка (ISO 8601). */
    deadline: string;

    /** Признак того, что звонок запланирован. */
    isPlanned: boolean;

    /** Контакт, на который планируется звонок. `null`, если не задан. */
    contact: ContactDto | null;

    /** Признак активности плана (учитывать ли его в flow). */
    isActive: boolean;

    /**
     * Флаг «важная» из UI планирования: задача ставится с PRIORITY=HIGH
     * независимо от типа события. Без флага важность определяет тип
     * (presentation/hot/moneyAwait). Поле опциональное: старые сборки
     * фрейма его не шлют.
     */
    isImportant?: boolean;

    /**
     * Лиды/заявки, с которыми менеджер связал новую задачу
     * (чекбоксы при создании задачи из сделки/компании без текущей
     * задачи) — попадут в UF_CRM_TASK как L_{id}.
     */
    relatedLeadIds?: number[];
}
