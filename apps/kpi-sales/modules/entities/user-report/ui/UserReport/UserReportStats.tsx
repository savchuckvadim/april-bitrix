import React, { useMemo } from 'react';
import { Card } from "@workspace/ui/components/card";
import { IUserReportItem } from "../../type/user-report.type";
import {
    Activity,
    Calendar,
    TrendingUp,
    MessageSquare
} from 'lucide-react';

interface UserReportStatsProps {
    report: IUserReportItem[];
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-gray-600 mb-1">{title}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
            <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
                {icon}
            </div>
        </div>
    </Card>
);

export const UserReportStats: React.FC<UserReportStatsProps> = ({ report }) => {
    const stats = useMemo(() => {
        if (!report.length) return null;


        //TODO: сделать статистические показатели по менеджерам
        // всего событий, проведено презентаций, выставлено счетов, продаж
        const totalEvents = report.length;
        const totalPresentations = report.filter(item =>
            item.sales_kpi_event_type?.value?.name === 'Презентация' &&
            item.sales_kpi_event_action?.value?.name === 'Состоялся'
        ).length;
        const totalInvoices = report.filter(item => item.sales_kpi_event_type?.value?.name === 'Счет'  &&
            item.sales_kpi_event_action?.value?.name === 'Отправлен').length;
        const totalCalls = report.filter(item => item.sales_kpi_event_type?.value?.name === 'Звонок').length;
        const totalSales = report.filter(item => item.sales_kpi_event_type?.value?.name === 'Продажа').length;
        // const uniqueTypes = new Set(
        //     report
        //         .map(item => item.sales_kpi_event_type?.value?.name)
        //         .filter(Boolean)
        // );

        // const uniqueActions = new Set(
        //     report
        //         .map(item => item.sales_kpi_event_action?.value?.name)
        //         .filter(Boolean)
        // );

        // const withComments = report.filter(
        //     item => item.sales_kpi_manager_comment?.value?.value
        // ).length;

        // const recentWeek = report.filter(item => {
        //     // Простая логика: если есть дата, считать что за неделю
        //     // В реальности нужно парсить дату из item
        //     return true; // Пока считаем все
        // }).length;

        return {
            // uniqueTypes: uniqueTypes.size,
            // uniqueActions: uniqueActions.size,
            // withComments,
            // recentWeek: Math.round(report.length * 0.3) // Заглушка
            totalEvents,
            totalPresentations,
            totalInvoices,
            totalCalls,
            totalSales
        };
    }, [report]);

    if (!stats) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
                title="Всего событий"
                value={stats.totalEvents}
                icon={<Activity className="w-5 h-5 text-blue-600" />}
                color="text-blue-600"
            />
            <StatCard
                title="Проведено презентаций"
                value={stats.totalPresentations}
                icon={<TrendingUp className="w-5 h-5 text-green-600" />}
                color="text-green-600"
            />
            <StatCard
                title="Выставлено счетов"
                value={stats.totalInvoices}
                icon={<MessageSquare className="w-5 h-5 text-purple-600" />}
                color="text-purple-600"
            />
            <StatCard
                title="Продаж"
                value={stats.totalSales}
                icon={<Calendar className="w-5 h-5 text-orange-600" />}
                color="text-orange-600"
            />
        </div>
    );
};
