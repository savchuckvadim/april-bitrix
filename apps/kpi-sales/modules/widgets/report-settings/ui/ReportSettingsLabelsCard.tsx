'use client';

import { SectionCard } from '@workspace/april-ui';
import { PORTAL_VIEW_LABEL_MAX_LENGTH } from '@/modules/feature/portal-view';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import type { LabelGroupView } from '../lib/report-settings-indicator-rows';
import { ReportSettingsLabelRow } from './ReportSettingsLabelRow';
import { ReportSettingsSubheading } from './ReportSettingsSubheading';

const T = REPORT_SETTINGS_TEXT.labels;

interface ReportSettingsLabelsCardProps {
    groups: readonly LabelGroupView[];
    /** Каталог показателей прочитан; нет — пояснение вместо списка. */
    hasCatalog: boolean;
    onChange: (key: string, value: string) => void;
    onReset: (key: string) => void;
}

/**
 * «Названия показателей»: группы «События» и «Звонки» в порядке отчёта, у
 * каждого показателя поле своего названия. Каталога нет (бэк не прочитал
 * портал) — короткое пояснение вместо списка.
 */
export const ReportSettingsLabelsCard = ({
    groups,
    hasCatalog,
    onChange,
    onReset,
}: ReportSettingsLabelsCardProps) => (
    <SectionCard title={T.title} density="compact">
        {hasCatalog ? (
            <div className="space-y-4">
                {groups.map(group => (
                    <section key={group.group} aria-label={group.title}>
                        <ReportSettingsSubheading>{group.title}</ReportSettingsSubheading>
                        {group.rows.map(row => (
                            <ReportSettingsLabelRow
                                key={row.key}
                                row={row}
                                onChange={value => onChange(row.key, value)}
                                onReset={() => onReset(row.key)}
                            />
                        ))}
                    </section>
                ))}
            </div>
        ) : (
            <p className="text-sm text-muted-foreground">{T.noCatalog}</p>
        )}
        <p className="text-xs text-muted-foreground">{T.note(PORTAL_VIEW_LABEL_MAX_LENGTH)}</p>
    </SectionCard>
);
