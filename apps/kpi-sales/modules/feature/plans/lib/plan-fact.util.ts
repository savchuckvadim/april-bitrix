/**
 * Извлечение ФАКТОВ плановых показателей из уже загруженных данных стора
 * (отдельных запросов не делаем):
 *  - kpi      → state.report.report (count по innerCode);
 *  - calling  → state.callingStatistics.items (count бакета длительности);
 *  - airtime  → state.airtime.team.data (airtimeSeconds → минуты);
 *  - finance  → state.finance.closed.report.employees (поле итогов).
 * Отсутствие сотрудника в источнике → факт 0 (сотрудники без сделок
 * не попадают в finance.employees). Identity: numeric Bitrix id
 * (kpi/callings user.ID — строка, finance assignedId — число).
 */
import type { ReportData } from '@/modules/entities/report';
import type { ReportCallingData } from '@/modules/entities/calling-statistics';
import type { AirtimeReport } from '@/modules/entities/airtime/model';
import type { FinanceClosedEmployee } from '@/modules/entities/finance';
import type { PlanIndicatorMeta } from '../model';

export interface PlanFactSources {
    report: ReportData[];
    callings: ReportCallingData[];
    airtime: AirtimeReport | null;
    financeEmployees: FinanceClosedEmployee[];
}

/** Секунды → минуты (округление до целых). */
const secondsToMinutes = (seconds: number): number => Math.round(seconds / 60);

/** Факт одного показателя одного сотрудника. */
export const planFact = (
    sources: PlanFactSources,
    indicator: PlanIndicatorMeta,
    userId: number,
): number => {
    switch (indicator.factSource) {
        case 'kpi': {
            const row = sources.report.find(
                item => Number(item.user.ID) === userId,
            );
            return (
                row?.kpi.find(
                    kpi => kpi.action.innerCode === indicator.factKey,
                )?.count ?? 0
            );
        }
        case 'calling': {
            const row = sources.callings.find(
                item => Number(item.user?.ID ?? item.userId) === userId,
            );
            return (
                row?.callings.find(
                    call => String(call.id) === indicator.factKey,
                )?.count ?? 0
            );
        }
        case 'airtime': {
            const row = sources.airtime?.users.find(
                item => Number(item.user.ID) === userId,
            );
            return row ? secondsToMinutes(row.airtimeSeconds) : 0;
        }
        case 'finance': {
            const employee = sources.financeEmployees.find(
                item => item.assignedId === userId,
            );
            if (!employee) return 0;
            const value = (employee as unknown as Record<string, unknown>)[
                indicator.factKey
            ];
            return typeof value === 'number' ? value : 0;
        }
    }
};
