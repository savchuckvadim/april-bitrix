import type { BXDepartment, BXUser } from '@workspace/bx';
import type { EReportType } from '../../report-widget-type/consts/report-type.consts';
import type { FilterInnerCode } from '@/modules/entities/report';
import type {
    CurrentUserInfo,
    SalesDepartment,
} from '@/modules/entities/department';
import type {
    ConversionScope,
    ConversionWidgetConfig,
} from '../../report-conversions/model/conversion.types';

/**
 * UI-блоб снимка публичной ссылки: всё состояние фронта, которое нужно,
 * чтобы read-only страница выглядела ровно как отчёт создателя.
 * Бэк хранит его как есть (share_link.filter_snapshot.ui) и не интерпретирует.
 */
export interface ShareUiBlob {
    /** Версия формата блоба. */
    v: 1;
    reportType: EReportType;
    /** Выбранные показатели (report.filter). */
    reportFilter: FilterInnerCode[];
    date: { from: string; to: string };
    mergedSelection: {
        selectedUsers: number[];
        selectedActions: string[];
    };
    /** @deprecated старые ссылки: цепочка бывшей вкладки «Конверсии». */
    conversionsTab?: ConversionWidgetConfig;
    /** Конфиги блоков конверсий по скоупам (новые ссылки). */
    conversionsWidget?: Partial<
        Record<ConversionScope, ConversionWidgetConfig>
    >;
    /** Пейлоад departmentActions.setStructure — сидинг структуры отделов. */
    department: {
        isMulti: boolean;
        multipleTag: string | null;
        departments: SalesDepartment[];
        currentUser: CurrentUserInfo | null;
        visibleUsers: BXUser[];
        visibleGroups: BXDepartment[];
        isHeadManager: boolean;
        defaultSelected: BXUser[];
    };
}
