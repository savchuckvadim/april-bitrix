'use client';

import { FC } from 'react';
import { ExternalLink } from 'lucide-react';
import { GlassDialog } from '@workspace/april-ui/surfaces';
import { Spinner, ToneBadge } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { useDuplicateDetails } from '../../lib/hooks';
import {
    ENTITY_TYPE_LABEL,
    buildCrmUrl,
    candidateConfidence,
    candidateTitle,
    candidateTone,
    reasonLabel,
    reasonTone,
} from '../../lib/candidate-view';
import { DetailsDealList } from './components/DetailsDealList';
import { DetailsLeadList } from './components/DetailsLeadList';
import { DetailsResponsible } from './components/DetailsResponsible';

/**
 * Подробности по кандидату: с кем клиент уже работает и что по нему
 * происходит. Открывается по клику на карточку в ленте.
 */
export const DuplicateDetailsDialog: FC = () => {
    const view = useDuplicateDetails();
    const candidate = view.candidate;

    if (!candidate) return null;

    return (
        <GlassDialog
            open={view.isOpen}
            onOpenChange={isOpen => !isOpen && view.close()}
            size="md"
            cardClassName="max-h-[85vh] overflow-y-auto"
        >
            <div className="space-y-3">
                <header className="space-y-1.5">
                    <div className="flex flex-wrap items-baseline gap-2">
                        <h2 className="text-base font-semibold text-foreground">
                            {candidateTitle(candidate)}
                        </h2>
                        <span className="text-xs text-muted-foreground">
                            {ENTITY_TYPE_LABEL[candidate.entityType]} ·{' '}
                            {candidate.id}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                        <ToneBadge
                            tone={candidateTone(candidate)}
                            variant="soft"
                            size="sm"
                        >
                            {candidateConfidence(candidate)}
                        </ToneBadge>
                        {candidate.reasons.map(reason => (
                            <ToneBadge
                                key={`${reason.kind}-${reason.value}-${reason.via}`}
                                tone={reasonTone(reason)}
                                variant="outline"
                                size="sm"
                            >
                                {reasonLabel(reason)}
                            </ToneBadge>
                        ))}
                    </div>
                </header>

                {view.isLoading && (
                    <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                        <Spinner /> Загружаем подробности…
                    </div>
                )}

                {view.isError && (
                    <div className="space-y-2 rounded-md border border-destructive/40 p-2">
                        <p className="text-xs text-destructive">{view.error}</p>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={view.retry}
                        >
                            Повторить
                        </Button>
                    </div>
                )}

                {view.isReady && view.details && (
                    <div className="space-y-3">
                        <DetailsResponsible
                            responsible={view.details.responsible}
                        />
                        <DetailsDealList deals={view.details.deals} />
                        <DetailsLeadList leads={view.details.leads} />
                    </div>
                )}

                <footer className="flex items-center justify-between gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={view.close}>
                        Закрыть
                    </Button>
                    {view.domain && (
                        <a
                            href={buildCrmUrl(
                                view.domain,
                                candidate.entityType,
                                candidate.id,
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline underline-offset-2"
                        >
                            Открыть в CRM
                            <ExternalLink aria-hidden className="size-3.5" />
                        </a>
                    )}
                </footer>
            </div>
        </GlassDialog>
    );
};
