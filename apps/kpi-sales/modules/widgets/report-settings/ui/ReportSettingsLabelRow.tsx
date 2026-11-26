'use client';

import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import type { LabelRowView } from '../lib/report-settings-indicator-rows';
import { ReportSettingsLabelField } from './ReportSettingsLabelField';

interface ReportSettingsLabelRowProps {
    row: LabelRowView;
    onChange: (value: string) => void;
    onReset: () => void;
}

/**
 * Строка своего названия: слева исходное название (приглушённо, длинное —
 * целиком в подсказке), справа поле своего. На узком экране — друг под другом.
 */
export const ReportSettingsLabelRow = ({ row, onChange, onReset }: ReportSettingsLabelRowProps) => (
    <div className="grid items-center gap-x-3 gap-y-1 py-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <span className="truncate text-sm text-muted-foreground" title={row.name}>
            {row.name}
        </span>
        <ReportSettingsLabelField
            value={row.draft}
            placeholder={row.name}
            ariaLabel={REPORT_SETTINGS_TEXT.labels.fieldLabel(row.name)}
            onChange={onChange}
            onReset={onReset}
        />
    </div>
);
