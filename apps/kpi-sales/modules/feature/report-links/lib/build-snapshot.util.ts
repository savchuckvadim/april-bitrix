import type {
    GetCallingStatisticFiltersDto,
    ReportGetFiltersDto,
    ShareLinkFilterSnapshotDto,
} from '@workspace/nest-kpi-report-sales-api';
import type { RootState } from '@/modules/app/model/store';
import { modifyDateToReportRequest, ReportDateType } from '@/modules/entities/report';
import type { ShareUiBlob } from '../model/share-ui-blob';

/**
 * Снимок фильтра для публичной ссылки из текущего состояния стора.
 *
 * reportFilters/callingFilters — ровно те же тела, что шлют
 * getReportData/getCallingStatistics (бэк реплеит их при обновлении
 * снимка), ui — блоб для сидинга read-only страницы.
 */
export const buildShareFilterSnapshot = (
    state: RootState,
): ShareLinkFilterSnapshotDto => {
    const { department, report } = state;
    const users = department.current.length
        ? department.current
        : department.items;
    const { from, to } = modifyDateToReportRequest(
        report.date[ReportDateType.FROM],
        report.date[ReportDateType.TO],
    );

    const reportFilters = {
        dateFrom: from,
        dateTo: to,
        userIds: users.map(u => String(u.ID)),
        departament: users,
        userFieldId: '',
        dateFieldId: '',
        actionFieldId: '',
        currentActions: {},
    } as unknown as ReportGetFiltersDto;

    const callingFilters = {
        dateFrom: from,
        dateTo: to,
        departament: users,
    } as unknown as GetCallingStatisticFiltersDto;

    // Финансы/эфирное время живут на raw-датах фильтра (state.report.date),
    // а не на модифицированных ISO — как их собственные thunks.
    const rawFrom = report.date[ReportDateType.FROM];
    const rawTo = report.date[ReportDateType.TO];
    const assignedIds = users.map(u => Number(u.ID)).filter(Boolean);

    const financeFilters = {
        assignedIds,
        dateFrom: rawFrom,
        dateTo: rawTo,
    };

    const airtimeFilters = {
        dateFrom: rawFrom,
        dateTo: rawTo,
        departament: users,
    } as unknown as GetCallingStatisticFiltersDto;

    const ui: ShareUiBlob = {
        v: 1,
        reportType: state.reportType.current,
        reportFilter: report.filter,
        date: {
            from: report.date[ReportDateType.FROM],
            to: report.date[ReportDateType.TO],
        },
        mergedSelection: {
            selectedUsers: state.mergedReport.selectedUsers,
            selectedActions: state.mergedReport.selectedActions,
        },
        conversionsWidget: state.conversions.widget,
        department: {
            isMulti: department.isMulti,
            multipleTag: department.multipleTag,
            departments: department.departments,
            currentUser: department.currentUser,
            visibleUsers: department.items,
            visibleGroups: department.groups.items,
            isHeadManager: department.isHeadManager,
            defaultSelected: department.current,
        },
    };

    return {
        version: 1,
        reportFilters,
        callingFilters,
        financeFilters,
        airtimeFilters,
        ui: ui as unknown as ShareLinkFilterSnapshotDto['ui'],
    };
};
