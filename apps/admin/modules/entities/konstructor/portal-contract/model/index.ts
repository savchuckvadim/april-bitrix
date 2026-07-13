// Доменные алиасы портальных договоров (`portal_contracts`) и initial-данных формы.
// UI и хуки импортируют только отсюда — переименование на бэке трогает лишь этот файл.
import type {
    ContractTypeItemOptionDto,
    CreatePortalContractDto,
    PortalContractFormResponseDto,
    PortalContractResponseDto,
    SelectOptionDto,
    UpdatePortalContractDto,
} from '@workspace/nest-pbx-install-api';

/** Портальный договор (строка `portal_contracts`) с id-шниками связей. */
export type PortalContract = PortalContractResponseDto;
/** Initial-данные формы создания договора портала (select-опции связей). */
export type PortalContractForm = PortalContractFormResponseDto;
/** Базовая опция select-а (id + подписи). */
export type SelectOption = SelectOptionDto;
/** Опция select-а поля `contract_type` (item bitrix-поля). */
export type ContractTypeItemOption = ContractTypeItemOptionDto;
/** Тело создания договора портала (связи + поля; `portal_id` — из `domain`). */
export type PortalContractCreate = CreatePortalContractDto;
/** Тело частичного обновления договора портала. */
export type PortalContractUpdate = UpdatePortalContractDto;
