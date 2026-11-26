import type {
    BxRqDto,
    ContractGenerateDto,
    ContractGenerateResponseDto,
    ContractSpecificationFormRequestDto,
    ContractSpecificationFormResponseDto,
    ContractSpecificationItemDto,
    FormFieldDto,
    RegionDto,
    RegionsDto,
} from '@workspace/nest-konstructor-api';
import type { SalesFlowFields } from '@/modules/app/lib/sales-flow.util';

/**
 * Алиасы generated DTO (паттерн CLAUDE.md): слайс, thunk и UI знают только
 * их — переименование на бэке трогает этот файл и helper.
 */
export type ContractFormField = FormFieldDto;
export type ContractSpecificationItem = ContractSpecificationItemDto;
export type ContractSpecificationFormRequest = ContractSpecificationFormRequestDto;
export type ContractSpecificationFormResponse = ContractSpecificationFormResponseDto;
/** Legal Tech договора: бесплатная часть и платные пакеты (paidPackets — по пакету). */
export type ContractLt = ContractSpecificationFormRequestDto['lt'];
/**
 * Запрос `contract/generate`. Необязательное поле `salesFlow` (сообщить о
 * договоре в поток продаж) сгенерированный клиент пока не знает; после
 * `pnpm run generate` расширение можно убрать.
 */
export type ContractGenerateRequest = ContractGenerateDto & SalesFlowFields;
export type ContractGenerateResponse = ContractGenerateResponseDto;
export type ContractBxRq = BxRqDto;
export type DocRegion = RegionDto;
export type DocRegions = RegionsDto;
export type ContractLtype = ContractGenerateDto['contractType'];
export type ContractClientType = ContractGenerateDto['clientType'];
