import {
    getKonstructor,
    getKonstructorDocumentSupplyReport,
    type DocumentSupplyReportGenerateDto,
    type DocumentSupplyReportGenerateResponseDto,
    type InitSupplyDto,
    type InitSupplyResponseDto,
    type SupplyReportFormRequestDto,
    type SupplyReportFormResponseDto,
} from '@workspace/nest-konstructor-api';

/** Единственное место со сгенерированным клиентом отчёта о поставке и init-supply. */
export class SupplyReportHelper {
    private report = getKonstructorDocumentSupplyReport();
    private konstructor = getKonstructor();

    /** 15 полей формы с портальной настройкой обязательности */
    async form(request: SupplyReportFormRequestDto): Promise<SupplyReportFormResponseDto> {
        return this.report.documentSupplyReportForm(request);
    }

    /** DOCX отчёта + комментарий в таймлайн */
    async generate(request: DocumentSupplyReportGenerateDto): Promise<DocumentSupplyReportGenerateResponseDto> {
        return this.report.documentSupplyReportGenerateDocument(request);
    }

    /** Заявка RPA «Поставка»: создать или обновить, файлы в сделку, таймлайн по участникам */
    async initSupply(request: InitSupplyDto): Promise<InitSupplyResponseDto> {
        return this.konstructor.initSupplyInitSupply(request);
    }
}
