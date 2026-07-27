'use client';

import React from 'react';
import { Activity, FileText, Presentation, Trophy } from 'lucide-react';
import { IUserReportItem } from '@/modules/entities/user-report/type/user-report.type';
import { useUserReportStats } from './hooks/use-user-report-stats';
import { UserStatTile } from './components/UserStatTile';

interface UserReportStatsProps {
    report: IUserReportItem[];
    userId: number;
}

/**
 * Компактная сводка статистики менеджера: заглавный показатель (по типу
 * отчёта) + презентации, счета, продажи. Логика — в useUserReportStats;
 * высота плиток согласована с финанс-сводкой и карточкой эфира.
 */
export const UserReportStats: React.FC<UserReportStatsProps> = ({
    report,
    userId,
}) => {
    const { headline, presentations, invoices, sales } = useUserReportStats(
        report,
        userId,
    );

    if (!report.length) return null;

    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <UserStatTile
                label={headline.label}
                value={headline.value}
                icon={<Activity className="h-3.5 w-3.5" />}
                accent="text-finance-monthly"
            />
            <UserStatTile
                label="Проведено презентаций"
                value={presentations}
                icon={<Presentation className="h-3.5 w-3.5" />}
                accent="text-success"
            />
            <UserStatTile
                label="Выставлено счетов"
                value={invoices}
                icon={<FileText className="h-3.5 w-3.5" />}
                accent="text-finance-potential"
            />
            <UserStatTile
                label="Продаж"
                value={sales}
                icon={<Trophy className="h-3.5 w-3.5" />}
                accent="text-finance-advance"
            />
        </div>
    );
};
