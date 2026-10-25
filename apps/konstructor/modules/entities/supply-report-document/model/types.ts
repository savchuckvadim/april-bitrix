// Глубокие импорты файлов-констант: баррель pbx-data тянет class-энтити
import { PBX_SALES_EVENT_FIELD_CODES } from '@workspace/pbx-data/entities/field/type/sales/event/pbx-sales-event-field.type';

export type SupplyFormStatus = 'idle' | 'loading' | 'ready' | 'error';
export type SupplyGenerateStatus = 'idle' | 'generating' | 'done' | 'error';

/** Приложенный менеджером файл формы (договор / счёт): храним base64 — так уходит на бэк. */
export interface SupplyFormFile {
    filename: string;
    base64: string;
}

/** Контакт сделки для отчёта (crm.contact.get) */
export interface SupplyContact {
    ID: string;
    NAME: string;
    LAST_NAME: string;
    POST: string;
    COMMENTS: string;
    PHONE: string[];
}

export interface SupplyGenerateResult {
    status: SupplyGenerateStatus;
    error: string | null;
    /** Ссылка на DOCX отчёта */
    link: string | null;
    /** Заявка RPA «Поставка», если процесс запускали */
    rpaId: number | null;
}

/** Коды select-полей, за которыми прячутся зависимые поля группы (легаси SUPPLY_COMPONENTS) */
export const SUPPLY_TRIGGER_CODES = ['is_contract_done', 'is_invoice_done'] as const;
export const SUPPLY_FILE_CODES = ['current_contract', 'current_invoice'] as const;

/**
 * Поля компании в отчёте (легаси allowedFullReport для gsr): тип клиента,
 * категория, статус, источник, конкуренты, информация о поставке, менеджеры.
 * Поля, которых нет на портале, в payload не попадают.
 */
export const SUPPLY_REPORT_COMPANY_CODES: string[] = [
    PBX_SALES_EVENT_FIELD_CODES.op_client_type,
    PBX_SALES_EVENT_FIELD_CODES.op_category,
    PBX_SALES_EVENT_FIELD_CODES.op_client_status,
    PBX_SALES_EVENT_FIELD_CODES.op_source_select,
    PBX_SALES_EVENT_FIELD_CODES.op_concurents,
    PBX_SALES_EVENT_FIELD_CODES.supply_information,
    PBX_SALES_EVENT_FIELD_CODES.manager_op,
    PBX_SALES_EVENT_FIELD_CODES.manager_tmc,
];

/** Код поля сделки с id комплектов в АРМ (легаси getComplectArmIdsValue); в каноне нет */
export const RPA_ARM_COMPLECT_CODE = 'rpa_arm_complect_id';
