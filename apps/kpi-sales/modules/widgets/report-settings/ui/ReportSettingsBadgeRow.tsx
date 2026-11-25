'use client';

import { HintTooltip } from '@workspace/april-ui';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import type { PortalViewBadgeOption } from '@/modules/feature/portal-view';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';
import { badgeCallTypesText } from '../lib/report-settings-badges';

interface ReportSettingsBadgeRowProps {
    badge: PortalViewBadgeOption;
    /** Бейдж виден сразу (с учётом набора по умолчанию). */
    checked: boolean;
    /** Выключить нельзя: после этого не останется ни одного видимого бейджа. */
    locked: boolean;
    /**
     * Показывать типы звонков под названием. В подгруппе с подзаголовком типов
     * они уже названы — строка остаётся в одну линию.
     */
    showCallTypes?: boolean;
    onChange: (checked: boolean) => void;
}

/**
 * Строка бейджа: название (пояснение — в подсказке), у бейджей методики мелким
 * текстом типы звонков (если они не вынесены в подзаголовок подгруппы), справа
 * переключатель «виден сразу».
 */
export const ReportSettingsBadgeRow = ({
    badge,
    checked,
    locked,
    showCallTypes = true,
    onChange,
}: ReportSettingsBadgeRowProps) => {
    const id = `report-settings-badge-${badge.id}`;
    const callTypes = showCallTypes ? badgeCallTypesText(badge) : null;
    return (
        <div className="flex items-start justify-between gap-3 py-1.5">
            <div className="min-w-0">
                {badge.hint ? (
                    <HintTooltip title={badge.title} lines={[badge.hint]}>
                        <span
                            tabIndex={0}
                            className="cursor-help text-sm underline decoration-dotted underline-offset-4"
                        >
                            {badge.title}
                        </span>
                    </HintTooltip>
                ) : (
                    <span className="text-sm">{badge.title}</span>
                )}
                {callTypes && <p className="text-xs text-muted-foreground">{callTypes}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <Switch
                    id={id}
                    checked={checked}
                    onCheckedChange={onChange}
                    disabled={checked && locked}
                />
                <Label
                    htmlFor={id}
                    className="cursor-pointer text-xs font-normal text-muted-foreground"
                >
                    {REPORT_SETTINGS_TEXT.badges.visibleNow}
                </Label>
            </div>
        </div>
    );
};
