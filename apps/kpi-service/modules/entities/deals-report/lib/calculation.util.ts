import { OrkReportDealItemDto } from "@workspace/nest-api";

export function getDealDynamics(deals: OrkReportDealItemDto[]): { growth: number | null }[] {
    const result = [];

    for (let i = 1; i < deals.length; i++) {
        const prev = parseFloat(deals[i - 1]?.sum as string);
        const current = parseFloat(deals[i]?.sum as string);
        const growth = ((current - prev) / prev) * 100;
        result.push({ growth });
    }

    return result;
}

function addMonths(date: Date, months: number): Date {
    const result = new Date(date.getTime());
    result.setMonth(result.getMonth() + months);
    return result;
}

function daysDiffInclusive(from: Date, to: Date): number {
    const msInDay = 1000 * 60 * 60 * 24;
    const fromUtc = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
    const toUtc = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
    return Math.floor((toUtc - fromUtc) / msInDay) + 1;
}

/**
 * Точная длительность сделки в календарных месяцах (остаток ≥15 дней → +1 мес).
 * Фолбэк, когда с бэкенда не пришёл deal.duration.
 * Алгоритм зеркалит канонический @lib/shared/lib/date countContractMonths (back).
 * Минимум 1 месяц — значение используется как делитель.
 */
export function getDealDuration(deal: OrkReportDealItemDto): number {
    if (!deal.from || !deal.to) {
        return 1;
    }
    const from = new Date(deal.from);
    const to = new Date(deal.to);
    if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) {
        return 1;
    }
    let fullMonths = 0;
    while (addMonths(from, fullMonths + 1) <= to) {
        fullMonths += 1;
    }
    const restDays = daysDiffInclusive(addMonths(from, fullMonths), to);
    return fullMonths + (restDays >= 15 ? 1 : 0) || 1; // месяцы
}
