'use client';

import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { cn } from '@workspace/ui/lib/utils';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import type { PlanColumnRowView } from '../lib/report-settings-indicator-rows';
import { ReportSettingsLabelField } from './ReportSettingsLabelField';

const T = REPORT_SETTINGS_TEXT.planColumns;

interface ReportSettingsPlanColumnRowProps {
    row: PlanColumnRowView;
    onShownChange: (shown: boolean) => void;
    onLabelChange: (value: string) => void;
    onLabelReset: () => void;
}

/**
 * Строка плана: переключатель «выводить колонкой», подпись «План к «…»»
 * (с учётом своего названия факта) и поле названия колонки — в подсказке
 * поля подпись по умолчанию. Показатель выключен в настройках планов —
 * подпись приглушена и пояснение под ней; переключатель и поле доступны:
 * выбор сохранится и заработает, когда показатель включат.
 */
export const ReportSettingsPlanColumnRow = ({
    row,
    onShownChange,
    onLabelChange,
    onLabelReset,
}: ReportSettingsPlanColumnRowProps) => {
    const id = `report-settings-plan-column-${row.code}`;
    return (
        <div className="grid items-center gap-x-3 gap-y-1 py-1.5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="flex min-w-0 items-start gap-3">
                <Switch
                    id={id}
                    checked={row.shown}
                    onCheckedChange={onShownChange}
                    aria-label={T.shownLabel(row.factName)}
                    className="mt-0.5"
                />
                <div className="min-w-0">
                    <Label
                        htmlFor={id}
                        title={T.caption(row.factName)}
                        className={cn(
                            'block cursor-pointer truncate text-sm font-normal',
                            row.offInPlans && 'text-muted-foreground',
                        )}
                    >
                        {T.caption(row.factName)}
                    </Label>
                    {row.offInPlans && (
                        <p className="text-xs text-muted-foreground">{T.notEnabled}</p>
                    )}
                </div>
            </div>
            <ReportSettingsLabelField
                value={row.draft}
                placeholder={row.defaultLabel}
                ariaLabel={T.fieldLabel(row.factName)}
                onChange={onLabelChange}
                onReset={onLabelReset}
            />
        </div>
    );
};
