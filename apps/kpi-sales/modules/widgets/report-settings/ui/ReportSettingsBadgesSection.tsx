'use client';

import { SectionCard } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import type { PortalViewOptions } from '@/modules/feature/portal-view';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import { groupBadges } from '../lib/report-settings-badges';
import { isBadgeMain, type ReportSettingsForm } from '../lib/report-settings-form';
import { ReportSettingsBadgeRow } from './ReportSettingsBadgeRow';

const T = REPORT_SETTINGS_TEXT.badges;

interface ReportSettingsBadgesSectionProps {
    options: PortalViewOptions;
    form: ReportSettingsForm;
    canTurnOff: (id: string) => boolean;
    onChange: (id: string, on: boolean) => void;
    onReset: () => void;
}

/**
 * «Бейджи в списке разборов»: общие и методики портала, у каждого переключатель
 * «виден сразу»; «Вернуть набор по умолчанию» сбрасывает выбор портала.
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
        <SectionCard
            title={T.title}
            density="compact"
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
            wrapActions
        >
            {groups.map(group => (
                <div key={group.key} className="space-y-1">
                    <h3 className="text-xs font-medium text-muted-foreground">{group.title}</h3>
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
            ))}
            <p className="text-xs text-muted-foreground">{T.keepOne}</p>
        </SectionCard>
    );
};
