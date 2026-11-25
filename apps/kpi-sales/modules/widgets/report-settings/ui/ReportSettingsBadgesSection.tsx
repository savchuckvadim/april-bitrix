'use client';

import { SectionCard } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import type { PortalViewOptions } from '@/modules/feature/portal-view';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import { groupBadges } from '../lib/report-settings-badges';
import { isBadgeMain, type ReportSettingsForm } from '../lib/report-settings-form';
import { ReportSettingsBadgeRow } from './ReportSettingsBadgeRow';
import { ReportSettingsSectionHead } from './ReportSettingsSectionHead';

const T = REPORT_SETTINGS_TEXT.badges;
const SECTION = REPORT_SETTINGS_TEXT.sections.calls;

interface ReportSettingsBadgesSectionProps {
    options: PortalViewOptions;
    form: ReportSettingsForm;
    canTurnOff: (id: string) => boolean;
    onChange: (id: string, on: boolean) => void;
    onReset: () => void;
}

/**
 * Раздел «Бейджи разборов»: общие бейджи и бейджи методики портала — двумя
 * карточками рядом на широком экране. У каждого бейджа переключатель «виден
 * сразу»; «Вернуть набор по умолчанию» сбрасывает выбор портала.
 */
export const ReportSettingsBadgesSection = ({
    options,
    form,
    canTurnOff,
    onChange,
    onReset,
}: ReportSettingsBadgesSectionProps) => {
    const groups = groupBadges(options.badges, options.methodology);
    return (
        <div className="space-y-4">
            <ReportSettingsSectionHead
                title={SECTION.title}
                description={SECTION.description}
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onReset}
                        disabled={form.badgesMain.length === 0}
                    >
                        {T.resetToDefault}
                    </Button>
                }
            />
            <div
                className={cn(
                    'grid items-start gap-4',
                    groups.length > 1 && 'lg:grid-cols-2',
                )}
            >
                {groups.map(group => (
                    <SectionCard key={group.key} title={group.title} density="compact">
                        <div>
                            {group.badges.map(badge => (
                                <ReportSettingsBadgeRow
                                    key={badge.id}
                                    badge={badge}
                                    checked={isBadgeMain(form, badge)}
                                    locked={!canTurnOff(badge.id)}
                                    onChange={on => onChange(badge.id, on)}
                                />
                            ))}
                        </div>
                    </SectionCard>
                ))}
            </div>
            <p className="text-xs text-muted-foreground">{T.keepOne}</p>
        </div>
    );
};
