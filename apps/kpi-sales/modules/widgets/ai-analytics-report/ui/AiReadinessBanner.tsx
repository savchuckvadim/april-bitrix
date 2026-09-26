'use client';

import { SectionCard, ToneBadge } from '@workspace/april-ui';
import type { AiAnalyticsSettings } from '@/modules/entities/ai-analytics';
import { buildAiReadinessBanner } from '../lib/ai-readiness-banner.util';
import type { AiSettingsTab } from '../lib/ai-settings-form.util';
import { AI_CHECKLIST_VERDICT_VIEW } from '../lib/ai-setup-checklist.data';
import type { AiSetupChecklist as AiSetupChecklistModel } from '../lib/ai-setup-checklist.types';
import { AiSetupChecklist } from './AiSetupChecklist';

interface AiReadinessBannerProps {
    settings: AiAnalyticsSettings;
    /** Чек-лист готовности (use-ai-analytics-report). */
    checklist: AiSetupChecklistModel;
    /**
     * Открыть настройки витрины на вкладке (уровни, цели, отсутствия,
     * состав); без колбэка — только чтение, кнопок вкладок нет.
     */
    onOpenSettings?: (tab: AiSettingsTab) => void;
}

/** Состояние push-контуров портала: алерты и дайджест. */
const AiReadinessFlags = ({ settings }: { settings: AiAnalyticsSettings }) => (
    <div className="flex flex-wrap gap-1">
        <ToneBadge
            tone={settings.alertsEnabled ? 'success' : 'muted'}
            variant="soft"
            size="sm"
        >
            Алерты {settings.alertsEnabled ? 'вкл' : 'выкл'}
        </ToneBadge>
        <ToneBadge
            tone={settings.digestEnabled ? 'success' : 'muted'}
            variant="soft"
            size="sm"
        >
            Дайджест {settings.digestEnabled ? 'вкл' : 'выкл'}
        </ToneBadge>
    </div>
);

/**
 * «Готовность витрины: <режим>»: строка «что значит режим», флаги
 * алертов и дайджеста, чек-лист «донастроить или просто подождать?»
 * (причины режима — его пункты) и строка истории разборов.
 */
export const AiReadinessBanner = ({
    settings,
    checklist,
    onOpenSettings,
}: AiReadinessBannerProps) => {
    const banner = buildAiReadinessBanner(settings.readiness);

    return (
        <SectionCard
            tone={AI_CHECKLIST_VERDICT_VIEW[checklist.verdict].tone}
            accent
            density="compact"
            title={banner.title}
            description={banner.hint}
            actions={<AiReadinessFlags settings={settings} />}
        >
            <AiSetupChecklist
                checklist={checklist}
                onOpenSettings={onOpenSettings}
            />
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{banner.history}</span>
                {banner.sigmaSource && <span>{banner.sigmaSource}</span>}
            </div>
        </SectionCard>
    );
};
