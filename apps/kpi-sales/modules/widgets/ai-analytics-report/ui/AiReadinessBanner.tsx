'use client';

import { HintTooltip, SectionCard, ToneBadge } from '@workspace/april-ui';
import type { AiAnalyticsSettings } from '@/modules/entities/ai-analytics';
import { buildAiReadinessBanner } from '../lib/ai-readiness-banner.util';
import {
    AI_READINESS_FLAG_TEXT,
    AI_READINESS_LINE_HINT,
} from '../lib/ai-readiness-banner.texts';
import type { AiSettingsTab } from '../lib/ai-settings-form.util';
import { AI_CHECKLIST_VERDICT_VIEW } from '../lib/ai-setup-checklist.data';
import type { AiSetupChecklist as AiSetupChecklistModel } from '../lib/ai-setup-checklist.types';
import { AiSetupChecklist } from './AiSetupChecklist';
import { AiTheoryLink } from './components/AiTheoryLink';

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

const FLAG = AI_READINESS_FLAG_TEXT;
const HINT_TRIGGER = 'cursor-help border-b border-dashed border-muted-foreground/60';

/** Подпись и подсказка одной плашки рассылки (alerts | digest). */
interface AiReadinessFlagText {
    label: string;
    hint: { title: string; lines: readonly string[] };
}

/** Плашка рассылки с подсказкой: что это и что будет, если выключено. */
const AiReadinessFlag = ({
    enabled,
    text,
}: {
    enabled: boolean;
    text: AiReadinessFlagText;
}) => (
    <HintTooltip title={text.hint.title} lines={[...text.hint.lines]}>
        <span>
            <ToneBadge
                tone={enabled ? 'success' : 'muted'}
                variant="soft"
                size="sm"
            >
                {text.label} {enabled ? FLAG.on : FLAG.off}
            </ToneBadge>
        </span>
    </HintTooltip>
);

/** Состояние рассылок портала: сигналы руководителю и утренний разбор менеджерам. */
const AiReadinessFlags = ({ settings }: { settings: AiAnalyticsSettings }) => (
    <div className="flex flex-wrap gap-1">
        <AiReadinessFlag enabled={settings.alertsEnabled} text={FLAG.alerts} />
        <AiReadinessFlag enabled={settings.digestEnabled} text={FLAG.digest} />
    </div>
);

/**
 * «Готовность витрины: <режим>»: строка «что значит режим», флаги
 * сигналов руководителю и утреннего разбора, чек-лист «донастроить или
 * просто подождать?» (причины режима — его пункты), строка истории
 * разборов и строка про разброс оценок AI — с подсказками.
 */
export const AiReadinessBanner = ({
    settings,
    checklist,
    onOpenSettings,
}: AiReadinessBannerProps) => {
    const banner = buildAiReadinessBanner(settings.readiness);
    const hint = AI_READINESS_LINE_HINT;

    return (
        <SectionCard
            tone={AI_CHECKLIST_VERDICT_VIEW[checklist.verdict].tone}
            accent
            density="compact"
            title={banner.title}
            description={banner.hint}
            actions={
                <>
                    <AiTheoryLink topic="readinessModes" variant="icon" />
                    <AiReadinessFlags settings={settings} />
                </>
            }
        >
            <AiSetupChecklist
                checklist={checklist}
                onOpenSettings={onOpenSettings}
            />
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <HintTooltip title={hint.history.title} lines={[...hint.history.lines]}>
                    <span className={HINT_TRIGGER}>{banner.history}</span>
                </HintTooltip>
                {banner.sigmaSource && (
                    <HintTooltip title={hint.sigma.title} lines={[...hint.sigma.lines]}>
                        <span className={HINT_TRIGGER}>{banner.sigmaSource}</span>
                    </HintTooltip>
                )}
            </div>
        </SectionCard>
    );
};
