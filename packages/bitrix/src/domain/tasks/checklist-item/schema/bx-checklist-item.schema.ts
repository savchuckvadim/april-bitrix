import { EBxMethod } from '../../../../core/domain/consts/bitrix-api.enum';
import {
    IBXChecklistItem,
    IBXChecklistItemAddRequest,
    IBXChecklistItemGetListRequest,
} from '../interface/bx-checklist-item.interface';

/**
 * Схема `task.checklistitem.*`. Во фронтовом пакете задекларированы только
 * фактически используемые методы (стиль BxUserSchema); остальные методы
 * семейства (get/update/delete/complete) дозаводятся по потребности —
 * образец полного набора: back-эталон ChecklistItemSchema.
 *
 * Ответы — payload БЕЗ обёртки `{ result }`: её оборачивает callType сам
 * (IBitrixResponse<T>), как во всех crm-схемах.
 */
export type ChecklistItemSchema = {
    [EBxMethod.ADD]: {
        request: IBXChecklistItemAddRequest;
        response: number;
    };
    /** `task.checklistitem.getlist` — все пункты чек-листов задачи. */
    [EBxMethod.GET_LIST]: {
        request: IBXChecklistItemGetListRequest;
        response: IBXChecklistItem[];
    };
};
