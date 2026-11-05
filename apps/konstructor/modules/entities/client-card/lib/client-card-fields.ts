// Глубокие импорты файлов-констант: баррель pbx-data тянет class-энтити
// (так же делает event-sales).
import { PBX_SALES_EVENT_FIELD_CODES } from '@workspace/pbx-data/entities/field/type/sales/event/pbx-sales-event-field.type';
import { PBX_SALES_KONSTRUCTOR_FIELD_CODES } from '@workspace/pbx-data/entities/field/type/sales/konstructor/pbx-sales-konstructor-field.type';

/** Поля компании, которые шапка показывает и правит. */
export type ClientChoiceField = 'prospect' | 'status' | 'clientType';

/**
 * pbx-коды полей карточки клиента — те же, что у шапки «Звонков». Тип клиента
 * живёт в компании (как в легаси-конструкторе): по нему выбираются реквизиты
 * и собираются документы.
 */
export const CLIENT_CHOICE_CODE: Record<ClientChoiceField, string> = {
    prospect: PBX_SALES_EVENT_FIELD_CODES.op_prospects,
    status: PBX_SALES_EVENT_FIELD_CODES.op_client_status,
    clientType: PBX_SALES_EVENT_FIELD_CODES.op_client_type,
};

export const CLIENT_INN_CODE: string = PBX_SALES_KONSTRUCTOR_FIELD_CODES.op_inn;
