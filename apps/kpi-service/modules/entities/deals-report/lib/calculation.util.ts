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

export function getDealDuration(deal: OrkReportDealItemDto): number {
    if (!deal.to) {
        return 1;
    }
    if (!deal.from) {
        return 1;
    }
    const from = new Date(deal.from).getTime();
    const to = new Date(deal.to).getTime();
    return Number(((to - from) / (1000 * 60 * 60 * 24) / 30).toFixed(0)) || 1; // месяцы
}
