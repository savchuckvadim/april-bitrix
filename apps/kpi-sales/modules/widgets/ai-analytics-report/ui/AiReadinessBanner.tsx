'use client';

import { ClipboardCheck } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { SectionCard, ToneBadge } from '@workspace/april-ui';
import type { AiAnalyticsSettings } from '@/modules/entities/ai-analytics';
import {
    buildAiReadinessBanner,
    type AiReadinessReasonItem,
} from '../lib/ai-readiness-banner.util';

interface AiReadinessBannerProps {
    settings: AiAnalyticsSettings;
    /**
     * Подтвердить состав и уровни менеджеров (причина roster-not-confirmed);
     * без колбэка кнопки «Подтвердить состав» нет.
     */
    onConfirmRoster?: () => void;
}

interface AiReadinessReasonRowProps {
    reason: AiReadinessReasonItem;
    onConfirmRoster?: () => void;
}

/** Причина режима: подпись, подсказка «что делать», кнопка подтверждения состава. */
const AiReadinessReasonRow = ({
    reason,
    onConfirmRoster,
}: AiReadinessReasonRowProps) => (
    <li className="space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
            <span>{reason.label}</span>
            {reason.confirmRoster && onConfirmRoster && (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-6 gap-1 px-2 text-xs"
                    onClick={onConfirmRoster}
                >
                    <ClipboardCheck className="h-3 w-3" />
                    Подтвердить состав
                </Button>
            )}
        </div>
        {reason.hint && (
            <p className="text-xs text-muted-foreground">{reason.hint}</p>
        )}
    </li>
);

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
 * Баннер готовности витрины (ReadinessDto): режим, одна строка «что это
 * значит», причины режима русскими подписями с подсказками «что делать»
 * (нет модели портала, состав не подтверждён, гипотеза не задана,
 * календарь не импортирован), связь «качество → исход», счётчик
 * «до оценки β», источник шума оценщика σ_llm и объём истории. В kpi-only — предупреждение: оценок нет.
 */
export const AiReadinessBanner = ({
    settings,
    onConfirmRoster,
}: AiReadinessBannerProps) => {
    const banner = buildAiReadinessBanner(settings.readiness);

    return (
        <SectionCard
            tone={banner.tone}
            accent
            density="compact"
            title={banner.title}
            description={banner.hint}
            actions={<AiReadinessFlags settings={settings} />}
        >
            {banner.reasons.length > 0 && (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                    {banner.reasons.map(reason => (
                        <AiReadinessReasonRow
                            key={reason.code}
                            reason={reason}
                            onConfirmRoster={onConfirmRoster}
                        />
                    ))}
                </ul>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{banner.betaSource}</span>
                {banner.countdown && <span>{banner.countdown}</span>}
                {banner.sigmaSource && <span>{banner.sigmaSource}</span>}
                <span>{banner.history}</span>
            </div>
        </SectionCard>
    );
};
