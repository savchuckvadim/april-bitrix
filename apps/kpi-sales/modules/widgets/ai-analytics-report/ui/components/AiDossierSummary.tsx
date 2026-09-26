'use client';

import { ToneBadge } from '@workspace/april-ui';
import {
    AI_READINESS_LABELS,
    aiDossierFeedbackKindLabel,
    aiObjectionCategoryLabel,
    formatAiDossierReason,
    formatAiScore,
    type AiDossier,
} from '@/modules/entities/ai-analytics';

interface AiDossierSummaryProps {
    dossier: AiDossier;
}

const TITLE =
    'text-xs font-semibold uppercase tracking-wide text-muted-foreground';

/**
 * Короткие своды досье: обратная связь по видам, метки руководителя,
 * возражения по категориям, готовность витрины — и причины, по которым
 * разделы пришли пустыми (каждая с подписью бэка).
 */
export const AiDossierSummary = ({ dossier }: AiDossierSummaryProps) => (
    <div className="grid gap-4 text-sm md:grid-cols-2">
        {dossier.feedbackSummary && (
            <section>
                <h4 className={TITLE}>Обратная связь</h4>
                <p className="mt-1">
                    реакций {dossier.feedbackSummary.total}:{' '}
                    {Object.entries(dossier.feedbackSummary.byKind)
                        .map(
                            ([kind, count]) =>
                                `${aiDossierFeedbackKindLabel(kind)} ${String(count)}`,
                        )
                        .join(', ')}
                </p>
            </section>
        )}
        {dossier.ropMarks && (
            <section>
                <h4 className={TITLE}>Метки руководителя</h4>
                <p className="mt-1">
                    меток {dossier.ropMarks.total}, согласен с AI{' '}
                    {dossier.ropMarks.agree}
                    {dossier.ropMarks.ropScore.value !== null &&
                        ` · средняя оценка руководителя ${formatAiScore(dossier.ropMarks.ropScore.value)}`}
                </p>
                {dossier.ropMarks.sections.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        замечания: {dossier.ropMarks.sections.join(', ')}
                    </p>
                )}
            </section>
        )}
        {dossier.objections && dossier.objections.length > 0 && (
            <section>
                <h4 className={TITLE}>Возражения</h4>
                <ul className="mt-1 space-y-0.5">
                    {dossier.objections.map(category => (
                        <li key={category.category}>
                            {aiObjectionCategoryLabel(category.category)}:{' '}
                            {category.n} в {category.calls} звонках
                        </li>
                    ))}
                </ul>
            </section>
        )}
        {dossier.readiness && (
            <section>
                <h4 className={TITLE}>Готовность витрины</h4>
                <p className="mt-1">
                    {AI_READINESS_LABELS[dossier.readiness.mode]} · история{' '}
                    {dossier.readiness.historyMonths} мес.
                </p>
            </section>
        )}
        {dossier.reasons.length > 0 && (
            <section className="md:col-span-2">
                <h4 className={TITLE}>Пустые разделы</h4>
                <ul className="mt-1 space-y-1">
                    {dossier.reasons.map(reason => (
                        <li
                            key={reason.section}
                            className="flex flex-wrap items-center gap-2 text-xs"
                        >
                            <ToneBadge tone="muted" variant="soft" size="sm">
                                {reason.reason}
                            </ToneBadge>
                            <span className="text-muted-foreground">
                                {formatAiDossierReason(reason)}
                            </span>
                        </li>
                    ))}
                </ul>
            </section>
        )}
    </div>
);
