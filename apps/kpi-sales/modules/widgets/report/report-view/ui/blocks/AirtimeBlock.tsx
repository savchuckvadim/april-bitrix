'use client';
import {
    ReportBlockWrapper,
    exportTableToCSV,
} from '@/modules/entities/report';
import { getAirtimeCsvData } from '@/modules/entities/airtime';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { AirtimeWidget } from './lazy';
import { useAccess } from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';

/**
 * Блок «Эфирное время»: контент монтируется только при раскрытии
 * (ленивая загрузка), CSV собирается из уже загруженных данных команды.
 */
export const AirtimeBlock = () => {
    const airtimeTeamReport = useAppSelector(state => state.airtime.team.data);

    // Рядовой менеджер (не руководитель) видит только собственную карточку:
    // командная таблица/рейтинг гейтятся центральным правилом AIRTIME_TEAM
    // (периметр и так режет данные до self — это вторая линия для UI).
    const canTeamView = useAccess(EAccessFeature.AIRTIME_TEAM);

    return (
        <ReportBlockWrapper
            blockId="airtime"
            title="Эфирное время"
            onDownload={canTeamView ? () => {
                const rows = airtimeTeamReport?.users ?? [];
                if (rows.length) {
                    exportTableToCSV(getAirtimeCsvData(rows), 'airtime.csv');
                }
            } : undefined}
        >
            <AirtimeWidget />
        </ReportBlockWrapper>
    );
};
