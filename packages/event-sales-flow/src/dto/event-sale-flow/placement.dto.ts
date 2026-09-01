import {
    IBXPlacement,
    IBXPlacementOptions,
} from '../../shared/bitrix/bitrix.interface';

export interface PlacementOptionsDto extends IBXPlacementOptions {
    /** Идентификатор сущности, переданный встройкой Bitrix. */
    ID?: number;

    /** Идентификатор задачи, в контексте которой открыта встройка. */
    TASK_ID?: number;

    /** Идентификатор задачи (camelCase-вариант от встройки). */
    taskId?: number;
}

export interface PlacementDto extends IBXPlacement {
    /** Код места встройки Bitrix (placement), из которого пришло событие. */
    placement: string;

    /** Параметры контекста встройки (ID сущности, задачи). */
    options: PlacementOptionsDto;
}
