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
import type { SalesFlowFields } from '@/modules/app/lib/sales-flow.util';

/**
 * Алиасы generated DTO (паттерн CLAUDE.md): слайс, thunk и UI знают только
 * их — переименование на бэке трогает этот файл и helper.
 */
export type SupplyFormItem = SupplyReportDto;
export type SupplyFormSelectItem = SupplyReportSelectItemDto;
export type SupplyFormRequest = SupplyReportFormRequestDto;
export type SupplyReportGenerateRequest = DocumentSupplyReportGenerateDto;
export type SupplyReportGenerateResult = SupplyReportGenerateResultDto;
/**
 * Запрос `init-supply`. Необязательное поле `salesFlow` (сообщить о запуске
 * поставки в поток продаж) сгенерированный клиент пока не знает; после
 * `pnpm run generate` расширение можно убрать.
 */
export type InitSupplyRequest = InitSupplyDto & SalesFlowFields;
export type InitSupplyFile = InitSupplyFileDto;
export type InitSupplyResult = InitSupplyResponseDto;
/** Поле сделки/компании в легаси-форме EntityFormFieldDto (bxDealItems / bxCompanyItems) */
export type PbxEntityItems = InitSupplyDto['bxDealItems'];
