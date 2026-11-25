'use client';

import { SectionCard } from '@workspace/april-ui';
import {
    splitBadgesByCallTypes,
    type ReportSettingsBadgeGroup,
} from '../lib/report-settings-badges';
import { isBadgeMain, type ReportSettingsForm } from '../lib/report-settings-form';
import { ReportSettingsBadgeRow } from './ReportSettingsBadgeRow';

interface ReportSettingsBadgeGroupCardProps {
    group: ReportSettingsBadgeGroup;
    form: ReportSettingsForm;
    canTurnOff: (id: string) => boolean;
    onChange: (id: string, on: boolean) => void;
}

/**
 * Карточка группы бейджей («Общие» или методика портала). Бейджи методики
 * разбиты по типам звонков: у каждого набора типов свой подзаголовок, и строка
 * бейджа типы уже не повторяет. У общих бейджей типов нет — они идут одним
 * списком без подзаголовков.
 */
export const ReportSettingsBadgeGroupCard = ({
    group,
    form,
    canTurnOff,
    onChange,
}: ReportSettingsBadgeGroupCardProps) => (
    <SectionCard title={group.title} density="compact">
        <div className="space-y-4">
            {splitBadgesByCallTypes(group.badges).map(subgroup => (
                <section key={subgroup.key} aria-label={subgroup.title ?? undefined}>
                    {subgroup.title && (
                        <h4 className="mb-1 flex items-baseline justify-between gap-2 border-b pb-1 text-xs font-semibold tracking-wide uppercase">
                            <span>{subgroup.title}</span>
                            <span className="font-normal text-muted-foreground tabular-nums">
                                {subgroup.badges.length}
                            </span>
                        </h4>
                    )}
                    {subgroup.badges.map(badge => (
                        <ReportSettingsBadgeRow
                            key={badge.id}
                            badge={badge}
                            checked={isBadgeMain(form, badge)}
                            locked={!canTurnOff(badge.id)}
                            showCallTypes={subgroup.title === null}
                            onChange={on => onChange(badge.id, on)}
                        />
                    ))}
                </section>
            ))}
        </div>
    </SectionCard>
);
