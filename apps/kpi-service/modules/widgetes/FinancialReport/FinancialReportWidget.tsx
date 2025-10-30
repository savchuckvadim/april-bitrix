'use client'
import { Badge } from "@workspace/ui/components/badge";
import { useDealsReport } from "@/modules/entities/deals-report/hooks/deals-report.hook";
import { DealsReportTimelineCompact} from "@/modules/feature";




export const FinancialReportWidget = () => {
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
        <div className="space-y-6 ">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Отчет по сделкам компаний</h1>
                <Badge variant="outline">{companies.length} компаний</Badge>
            </div>
            <div className="grid gap-6 rounded-md ">
                <DealsReportTimelineCompact companies={companies} />

            </div>


        </div>
    );
}
