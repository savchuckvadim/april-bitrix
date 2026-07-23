import { BXUser, BXDepartment } from '@workspace/bx';
import {
    ReportData,
    FilterInnerCode,
    ReportDateType,
} from './types/report/report-type';

// Раньше здесь жил RTK Query (reportAPI) поверх online API — удалён:
// все запросы идут через lib/api/*-helper.ts на @workspace/nest-kpi-report-sales-api.
// Файл оставлен как источник типов контракта отчёта.

export interface ReportResponse {
    allUsers: BXUser[] | null;
    childrenDepartments: BXDepartment[];
    generalDepartment: BXDepartment[];
}

export interface ReportRequest {
    domain: string;
    filters: {
        dateFrom: string;
        dateTo: string;
        userIds: Array<string | number>;
        departament: BXUser[];
        userFieldId: string;
        dateFieldId: string;
        actionFieldId: string;
        currentActions: any;
    };
    socketId?: string;
}

export interface FilterResponse {
    filter: Array<FilterInnerCode>;
    department: Array<number> | null;
    dates: {
        [ReportDateType.FROM]: string;
        [ReportDateType.TO]: string;
    } | null;
}

export type { ReportData };
