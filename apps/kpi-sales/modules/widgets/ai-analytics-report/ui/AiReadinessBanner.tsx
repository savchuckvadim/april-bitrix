'use client';

import { SectionCard, ToneBadge } from '@workspace/april-ui';
import {
    AI_READINESS_HINTS,
    AI_READINESS_LABELS,
    AI_READINESS_TONES,
    formatAiDay,
    type AiAnalyticsSettings,
} from '@/modules/entities/ai-analytics';

interface AiReadinessBannerProps {
    settings: AiAnalyticsSettings;
}

/**
 * Баннер готовности витрины (ReadinessDto.mode) человеческим текстом:
 * режим, причины, объём истории, дата сопоставимости версий и состояние
 * push-контуров. В kpi-only — предупреждение: оценок нет.
 */
export const AiReadinessBanner = ({ settings }: AiReadinessBannerProps) => {
    const { readiness } = settings;
    const tone = AI_READINESS_TONES[readiness.mode];

    return (
        <SectionCard
            tone={tone}
            accent
            density="compact"
            title={AI_READINESS_LABELS[readiness.mode]}
            description={AI_READINESS_HINTS[readiness.mode]}
            actions={
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
            }
        >
            {readiness.reasons.length > 0 && (
                <ul className="list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
                    {readiness.reasons.map(reason => (
                        <li key={reason}>{reason}</li>
                    ))}
                </ul>
            )}
            <p className="text-xs text-muted-foreground">
                История разборов: {readiness.historyMonths} мес. · презентаций:{' '}
                {readiness.presentations}
                {readiness.comparableFrom &&
                    ` · разборы сопоставимы с ${formatAiDay(readiness.comparableFrom)}`}
            </p>
        </SectionCard>
    );
};
