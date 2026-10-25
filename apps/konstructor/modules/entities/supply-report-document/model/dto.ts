import type {
    DocumentSupplyReportGenerateDto,
    InitSupplyDto,
    InitSupplyFileDto,
    InitSupplyResponseDto,
    SupplyReportDto,
    SupplyReportFormRequestDto,
    SupplyReportGenerateResultDto,
    SupplyReportSelectItemDto,
} from '@workspace/nest-konstructor-api';

/**
 * Алиасы generated DTO (паттерн CLAUDE.md): слайс, thunk и UI знают только
 * их — переименование на бэке трогает этот файл и helper.
 */
export type SupplyFormItem = SupplyReportDto;
export type SupplyFormSelectItem = SupplyReportSelectItemDto;
export type SupplyFormRequest = SupplyReportFormRequestDto;
export type SupplyReportGenerateRequest = DocumentSupplyReportGenerateDto;
export type SupplyReportGenerateResult = SupplyReportGenerateResultDto;
export type InitSupplyRequest = InitSupplyDto;
export type InitSupplyFile = InitSupplyFileDto;
export type InitSupplyResult = InitSupplyResponseDto;
/** Поле сделки/компании в легаси-форме EntityFormFieldDto (bxDealItems / bxCompanyItems) */
export type PbxEntityItems = InitSupplyDto['bxDealItems'];
