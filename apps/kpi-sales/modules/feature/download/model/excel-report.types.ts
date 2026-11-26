/**
 * Тело выгрузки Excel. Сгенерированный DownLoadKpiReportDto ещё не знает
 * плановых колонок строки (бэк уже принимает `kind`, `note` и
 * `count: null`) — поэтому строка расширена здесь, без правки клиента.
 */
import type {
    DownLoadKpiReportDto,
    DownloadKpiReportItemDto,
    DownloadReportKpiItemDto,
} from '@workspace/nest-kpi-report-sales-api';

/** Виды колонки строки Excel: plan — колонка плана перед своим показателем. */
export const EXCEL_KPI_ITEM_KINDS = ['plan'] as const;

export type ExcelKpiItemKind = (typeof EXCEL_KPI_ITEM_KINDS)[number];

export const EXCEL_KPI_ITEM_KIND = {
    plan: 'plan',
} as const satisfies Record<ExcelKpiItemKind, ExcelKpiItemKind>;

/** Колонка строки основного листа. */
export interface ExcelReportColumn extends Omit<DownloadReportKpiItemDto, 'count'> {
    /** Значение; у колонки плана null — плана нет или он не виден («—»). */
    count: number | null;
    /** Вид колонки; не задан — показатель. */
    kind?: ExcelKpiItemKind;
    /** Заметка к шапке колонки (у колонки плана — к какому показателю план). */
    note?: string;
}

/** Строка основного листа: сотрудник и его колонки. */
export interface ExcelReportRow extends Omit<DownloadKpiReportItemDto, 'kpi'> {
    kpi: ExcelReportColumn[];
}

/** Тело запроса выгрузки Excel. */
export type ExcelReportRequest = Omit<DownLoadKpiReportDto, 'report'> & {
    report: ExcelReportRow[];
};
