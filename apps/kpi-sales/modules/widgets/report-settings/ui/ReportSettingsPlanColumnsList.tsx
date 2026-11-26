'use client';

import { cn } from '@workspace/ui/lib/utils';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import type { PlanColumnRowView } from '../lib/report-settings-indicator-rows';
import { ReportSettingsPlanColumnRow } from './ReportSettingsPlanColumnRow';
import { ReportSettingsSubheading } from './ReportSettingsSubheading';

const T = REPORT_SETTINGS_TEXT.planColumns;

interface ReportSettingsPlanColumnsListProps {
    rows: readonly PlanColumnRowView[];
    /** Каталог показателей прочитан; нет — пояснение вместо списка. */
    hasCatalog: boolean;
    /** Колонки включены хотя бы на одной вкладке; нет — список приглушён, но доступен. */
    active: boolean;
    onShownChange: (code: string, shown: boolean) => void;
    onLabelChange: (key: string, value: string) => void;
    onLabelReset: (key: string) => void;
}

/**
 * «Какие планы выводить колонкой»: строка на каждый план, чей показатель
 * есть в таблицах событий или звонков. Колонки выключены на всех вкладках —
 * список приглушён, но править его можно: выбор сохранится.
 */
export const ReportSettingsPlanColumnsList = ({
    rows,
    hasCatalog,
    active,
    onShownChange,
    onLabelChange,
    onLabelReset,
}: ReportSettingsPlanColumnsListProps) => (
    <section aria-label={T.listTitle} className="space-y-1">
        <ReportSettingsSubheading>{T.listTitle}</ReportSettingsSubheading>
        {!active && <p className="text-xs text-muted-foreground">{T.allTabsOff}</p>}
        {hasCatalog ? (
            <div className={cn(!active && 'opacity-60')}>
                {rows.map(row => (
                    <ReportSettingsPlanColumnRow
                        key={row.key}
                        row={row}
                        onShownChange={shown => onShownChange(row.code, shown)}
                        onLabelChange={value => onLabelChange(row.key, value)}
                        onLabelReset={() => onLabelReset(row.key)}
                    />
                ))}
            </div>
        ) : (
            <p className="text-sm text-muted-foreground">
                {REPORT_SETTINGS_TEXT.labels.noCatalog}
            </p>
        )}
    </section>
);
