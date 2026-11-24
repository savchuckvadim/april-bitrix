'use client';

import {
    PROVIDER_IMAGE_LEGACY_TEXT,
    type ProviderImageLegacyImportReport,
} from '@/modules/entities/portal-provider/provider-image';
import { useLegacyImportReport } from '../hooks/use-legacy-import-report';
import { LegacyImportTable } from './LegacyImportTable';
import { LegacyImportTotals } from './LegacyImportTotals';

interface LegacyImportReportProps {
    report: ProviderImageLegacyImportReport;
}

/** Отчёт ответа бэка: итоги по статусам и таблица строк. Проверка и перенос выглядят одинаково. */
export function LegacyImportReport({ report }: LegacyImportReportProps) {
    const view = useLegacyImportReport(report);

    return (
        <div className="space-y-3">
            <p className={report.dryRun ? 'text-sm text-muted-foreground' : 'text-sm text-success'}>
                {report.dryRun
                    ? PROVIDER_IMAGE_LEGACY_TEXT.checkDone
                    : PROVIDER_IMAGE_LEGACY_TEXT.runDone}
            </p>
            <LegacyImportTotals
                items={view.items}
                totalRows={view.totalRows}
                activeStatus={view.activeStatus}
                onToggle={view.toggleStatus}
                onClear={view.clearStatus}
            />
            {view.totalRows === 0 && (
                <p className="text-sm text-muted-foreground">
                    {PROVIDER_IMAGE_LEGACY_TEXT.reportEmpty}
                </p>
            )}
            {view.totalRows > 0 && view.rows.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    {PROVIDER_IMAGE_LEGACY_TEXT.noRowsInFilter}
                </p>
            )}
            {view.rows.length > 0 && <LegacyImportTable rows={view.rows} />}
        </div>
    );
}
