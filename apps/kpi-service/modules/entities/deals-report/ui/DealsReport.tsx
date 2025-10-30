'use client'

import { OrkReportDealItemDto, OrkReportDealsByCompaniesDto } from "@workspace/nest-api";
import { useDealsReport } from "../hooks/deals-report.hook";
import { getDealDuration } from "../lib/calculation.util";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@workspace/ui/components/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { DealsReportTable } from "./DealsReportTable";
import { DealsReportCompact } from "./DealsReportCompact";
import { DealsAnalytics } from "./DealsAnalytics";
import { ImplementationAnalytics } from "./ImplementationAnalytics";
import { DealsReportTimelineCompact } from "./DealsReportTimelineCompact";
import { DealsReportTimelineCompactRefactored } from ".";

// Компонент для отображения одной сделки в компактном виде
const DealCard = ({ deal, index, deals }: { deal: OrkReportDealItemDto, index: number, deals: OrkReportDealItemDto[] }) => {
    const prevDeal = deals[index - 1];
    const growth = prevDeal && prevDeal.sum
        ? (((+deal.sum - +prevDeal.sum) / +prevDeal.sum) * 100)
        : null;

    const duration = getDealDuration(deal);
    const fromDate = new Date(deal.from);
    const toDate = new Date(deal.to);

    return (
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
            {/* Номер сделки */}
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
            </div>

            {/* Информация о сделке */}
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{deal.title}</div>
                <div className="text-xs text-muted-foreground">
                    {fromDate.toLocaleDateString('ru-RU')} - {toDate.toLocaleDateString('ru-RU')}
                </div>
                <div className="text-xs text-muted-foreground">
                    {duration} мес.
                </div>
            </div>

            {/* Сумма и индексация */}
            <div className="text-right flex-shrink-0">
                <div className="font-semibold text-sm">
                    {(+deal.sum).toLocaleString('ru-RU')} ₽
                </div>
                {growth !== null && (
                    <Badge
                        variant={growth > 0 ? "default" : "destructive"}
                        className="text-xs"
                    >
                        {growth > 0 ? '↗' : '↘'} {Math.abs(growth).toFixed(1)}%
                    </Badge>
                )}
            </div>
        </div>
    );
};

// Компонент для отображения timeline сделок
const DealsTimeline = ({ deals }: { deals: OrkReportDealItemDto[] }) => {
    const sortedDeals = [...deals].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());

    return (
        <div className="space-y-2">
            {sortedDeals.map((deal, index) => (
                <DealCard
                    key={deal.id}
                    deal={deal}
                    index={index}
                    deals={sortedDeals}
                />
            ))}
        </div>
    );
};

// Компонент для отображения общей статистики компании
const CompanyStats = ({ deals }: { deals: OrkReportDealItemDto[] }) => {
    const sortedDeals = [...deals].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
    const totalSum = deals.reduce((sum, deal) => sum + +deal.sum, 0);
    const firstDeal = sortedDeals[0];
    const lastDeal = sortedDeals[sortedDeals.length - 1];
    const totalGrowth = firstDeal && lastDeal && firstDeal !== lastDeal
        ? (((+lastDeal.sum - +firstDeal.sum) / +firstDeal.sum) * 100)
        : null;

    return (
        <div className="grid grid-cols-3 gap-4 text-center">
            <div>
                <div className="text-2xl font-bold text-primary">{deals.length}</div>
                <div className="text-xs text-muted-foreground">сделок</div>
            </div>
            <div>
                <div className="text-2xl font-bold">
                    {totalSum.toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-xs text-muted-foreground">общая сумма</div>
            </div>
            <div>
                <div className={`text-2xl font-bold ${totalGrowth && totalGrowth > 0 ? 'text-green-600' : totalGrowth && totalGrowth < 0 ? 'text-red-600' : ''}`}>
                    {totalGrowth ? `${totalGrowth > 0 ? '+' : ''}${totalGrowth.toFixed(1)}%` : '—'}
                </div>
                <div className="text-xs text-muted-foreground">общий рост</div>
            </div>
        </div>
    );
};

export const DealsReport = () => {
    const { deals: companies, isLoading, error } = useDealsReport();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Загрузка...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-destructive">Ошибка: {error}</div>
            </div>
        );
    }

    if (!companies || companies.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Нет данных для отображения</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Отчет по сделкам компаний</h1>
                <Badge variant="outline">{companies.length} компаний</Badge>
            </div>
            {/* <DealsReportTimelineCompact /> */}
            <ImplementationAnalytics companies={companies} />
            {/* <DealsReportCompact /> */}

            <DealsReportTimelineCompactRefactored companies={companies} />
            <DealsAnalytics />
            <div className="grid gap-6">
                {companies.map((companyData: OrkReportDealsByCompaniesDto) => (
                    <Card key={companyData.company.id} className="overflow-hidden">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                    {companyData.company.title}
                                </CardTitle>
                                <Badge variant="secondary">
                                    {companyData.deals.length} сделок
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Статистика компании */}
                            <CompanyStats deals={companyData.deals} />

                            {/* Timeline сделок */}
                            <div>
                                <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                                    Хронология сделок
                                </h3>
                                <DealsTimeline deals={companyData.deals} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <DealsReportTable />
        </div>
    );
}
