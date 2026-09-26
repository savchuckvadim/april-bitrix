'use client';

import { ToneBadge } from '@workspace/april-ui';
import {
    AI_READINESS_LABELS,
    AI_READINESS_TONES,
    formatAiMoment,
    formatAiReadinessReasons,
    type AiAboutModel,
} from '@/modules/entities/ai-analytics';
import {
    AI_ABOUT_ESTIMAND_KIND_LABELS,
    aiAboutEstimates,
    formatAiAboutChainShare,
    formatAiAboutComparableFrom,
    formatAiAboutWindow,
    shortAiAboutVersion,
} from '../../lib/ai-about.util';
import { AiHowWeCountEstimates } from './AiHowWeCountEstimates';
import { AiHowWeCountSanity } from './AiHowWeCountSanity';

interface AiHowWeCountModelProps {
    /** null — модели нет, причина в modelReason. */
    model: AiAboutModel | null;
    modelReason: string | null;
}

/**
 * Модель портала: месяц и окно, объём, готовность по модели с причинами,
 * κ / φ / λ, трактовка рёбер и санити-панель; без модели — причина.
 */
export const AiHowWeCountModel = ({
    model,
    modelReason,
}: AiHowWeCountModelProps) => {
    if (!model) {
        return (
            <section className="space-y-1">
                <h4 className="text-sm font-medium">Модель портала</h4>
                <p className="text-sm text-muted-foreground">
                    {modelReason ??
                        'Модели портала пока нет — нормы появятся после первого ночного расчёта.'}
                </p>
            </section>
        );
    }
    const reasons = formatAiReadinessReasons(model.readiness.reasons);

    return (
        <section className="space-y-3">
            <h4 className="text-sm font-medium">
                Модель портала
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {model.monthKey}
                </span>
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>окно {formatAiAboutWindow(model.window)}</span>
                <span>менеджер-месяцев {model.observations}</span>
                <span>менеджеров {model.managers}</span>
                <span>расчёт {formatAiMoment(model.generatedAt)}</span>
                <span title={model.paramsVersion}>
                    параметры {shortAiAboutVersion(model.paramsVersion)}
                </span>
                <span>{formatAiAboutComparableFrom(model.comparableFrom)}</span>
                {model.reused && (
                    <ToneBadge tone="muted" variant="soft" size="sm">
                        переиспользована с прошлого месяца
                    </ToneBadge>
                )}
            </div>
            <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                        Готовность по модели:
                    </span>
                    <ToneBadge
                        tone={AI_READINESS_TONES[model.readiness.mode]}
                        variant="soft"
                        size="sm"
                    >
                        {AI_READINESS_LABELS[model.readiness.mode]}
                    </ToneBadge>
                </div>
                {reasons.length > 0 && (
                    <ul className="list-disc pl-5 text-xs text-muted-foreground">
                        {reasons.map(reason => (
                            <li key={reason}>{reason}</li>
                        ))}
                    </ul>
                )}
            </div>
            <AiHowWeCountEstimates estimates={aiAboutEstimates(model)} />
            <p className="text-sm">
                <span className="text-muted-foreground">Трактовка рёбер: </span>
                {AI_ABOUT_ESTIMAND_KIND_LABELS[model.estimand.kind]}
                <span className="text-muted-foreground">
                    {' '}
                    · сцепка звонков со сделками{' '}
                    {formatAiAboutChainShare(model.estimand.chainSharePct)} ·
                    причина:{' '}
                </span>
                <code className="text-xs">{model.estimand.reason}</code>
            </p>
            <AiHowWeCountSanity sanity={model.sanity} />
        </section>
    );
};
