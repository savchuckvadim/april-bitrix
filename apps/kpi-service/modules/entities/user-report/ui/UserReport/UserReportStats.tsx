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

        const uniqueTypes = new Set(
            report
                .map(item => item.service_ork_history_ork_event_type?.value?.name)
                .filter(Boolean)
        );

        const uniqueActions = new Set(
            report
                .map(item => item.service_ork_history_ork_event_action?.value?.name)
                .filter(Boolean)
        );

        const withComments = report.filter(
            item => item.service_ork_history_manager_comment?.value?.name
        ).length;

        const recentWeek = report.filter(item => {
            // Простая логика: если есть дата, считать что за неделю
            // В реальности нужно парсить дату из item
            return true; // Пока считаем все
        }).length;

        return {
            uniqueTypes: uniqueTypes.size,
            uniqueActions: uniqueActions.size,
            withComments,
            recentWeek: Math.round(report.length * 0.3) // Заглушка
        };
    }, [report]);

    if (!stats) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
                title="Типов событий"
                value={stats.uniqueTypes}
                icon={<Activity className="w-5 h-5 text-blue-600" />}
                color="text-blue-600"
            />
            <StatCard
                title="Действий"
                value={stats.uniqueActions}
                icon={<TrendingUp className="w-5 h-5 text-green-600" />}
                color="text-green-600"
            />
            <StatCard
                title="С комментариями"
                value={stats.withComments}
                icon={<MessageSquare className="w-5 h-5 text-purple-600" />}
                color="text-purple-600"
            />
            <StatCard
                title="За неделю"
                value={stats.recentWeek}
                icon={<Calendar className="w-5 h-5 text-orange-600" />}
                color="text-orange-600"
            />
        </div>
    );
};
