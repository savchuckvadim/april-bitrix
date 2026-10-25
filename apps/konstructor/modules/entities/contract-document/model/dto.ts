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

/**
 * Алиасы generated DTO (паттерн CLAUDE.md): слайс, thunk и UI знают только
 * их — переименование на бэке трогает этот файл и helper.
 */
export type ContractFormField = FormFieldDto;
export type ContractSpecificationItem = ContractSpecificationItemDto;
export type ContractSpecificationFormRequest = ContractSpecificationFormRequestDto;
export type ContractSpecificationFormResponse = ContractSpecificationFormResponseDto;
export type ContractLt = ContractSpecificationFormRequestDto['lt'];
export type ContractGenerateRequest = ContractGenerateDto;
export type ContractGenerateResponse = ContractGenerateResponseDto;
export type ContractBxRq = BxRqDto;
export type DocRegion = RegionDto;
export type DocRegions = RegionsDto;
export type ContractLtype = ContractGenerateDto['contractType'];
export type ContractClientType = ContractGenerateDto['clientType'];
