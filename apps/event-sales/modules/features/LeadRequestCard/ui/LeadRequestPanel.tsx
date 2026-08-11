'use client';

import { FC } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui';
import { SectionState } from '@/modules/shared/SectionState';
import {
    LEAD_REQUEST_ENUM_LABEL,
    LEAD_REQUEST_TEXT,
} from '../consts/lead-request.const';
import { useLeadRequest } from '../lib/hooks/use-lead-request';
import {
    getHistoryNewestFirst,
    getReadinessBadge,
    shouldShowNotCaSelect,
} from '../lib/lead-request-view';
import { LeadRequestAcceptBar } from './LeadRequestAcceptBar';
import { LeadRequestActionsBar } from './LeadRequestActionsBar';
import { LeadRequestEnumField } from './LeadRequestEnumField';
import { LeadRequestHistory } from './LeadRequestHistory';
import { LeadRequestMarks } from './LeadRequestMarks';
import { LeadRequestTitleRow } from './LeadRequestTitleRow';

interface LeadRequestPanelProps {
    /** Явный лид (со связей); без него — лид встройки/текущей задачи. */
    leadId?: number;
}

/**
 * Контейнер интерфейса заявки/лида: композиция чистых компонентов, вся
 * логика — в useLeadRequest / lead-request-view (правило фронта).
 */
export const LeadRequestPanel: FC<LeadRequestPanelProps> = ({ leadId }) => {
    const { card, status, saving, error, visible, retry, patchEnum, patchBool } =
        useLeadRequest(leadId);

    if (!visible) return null;

    const badge = card ? getReadinessBadge(card) : null;

    return (
        <SectionCard
            title={
                card?.isRequest
                    ? LEAD_REQUEST_TEXT.titleRequest
                    : LEAD_REQUEST_TEXT.titleLead
            }
            density="compact"
            actions={
                badge ? (
                    <ToneBadge tone={badge.tone}>{badge.label}</ToneBadge>
                ) : undefined
            }
        >
            <SectionState
                status={status}
                isEmpty={status === 'ready' && !card}
                onRetry={retry}
                emptyText={LEAD_REQUEST_TEXT.emptyText}
            >
                {card && (
                    <div className="space-y-3">
                        <LeadRequestAcceptBar />
                        <LeadRequestTitleRow
                            title={card.title}
                            questUrl={card.questUrl ?? null}
                            regNumber={card.regNumber ?? null}
                        />

                        <div className="grid gap-2">
                            <LeadRequestEnumField
                                label={LEAD_REQUEST_ENUM_LABEL.siteStatusCode}
                                installed={card.siteStatus.installed}
                                currentCode={card.siteStatus.currentCode}
                                items={card.siteStatus.items}
                                disabled={saving}
                                onChange={code =>
                                    patchEnum('siteStatusCode', code)
                                }
                            />
                            <LeadRequestEnumField
                                label={LEAD_REQUEST_ENUM_LABEL.siteStageCode}
                                installed={card.siteStage.installed}
                                currentCode={card.siteStage.currentCode}
                                items={card.siteStage.items}
                                disabled={saving}
                                onChange={code =>
                                    patchEnum('siteStageCode', code)
                                }
                            />
                            <LeadRequestEnumField
                                label={LEAD_REQUEST_ENUM_LABEL.leadStatusCode}
                                installed={card.leadStatus.installed}
                                currentCode={card.leadStatus.currentCode}
                                items={card.leadStatus.items}
                                disabled={saving}
                                onChange={code =>
                                    patchEnum('leadStatusCode', code)
                                }
                            />
                            {shouldShowNotCaSelect(card) && (
                                <LeadRequestEnumField
                                    label={LEAD_REQUEST_ENUM_LABEL.notCaTypeCode}
                                    installed={card.notCaType.installed}
                                    currentCode={card.notCaType.currentCode}
                                    items={card.notCaType.items}
                                    disabled={saving}
                                    onChange={code =>
                                        patchEnum('notCaTypeCode', code)
                                    }
                                />
                            )}
                        </div>

                        <LeadRequestMarks
                            card={card}
                            disabled={saving}
                            onChange={patchBool}
                        />

                        <LeadRequestActionsBar />

                        {!card.saleReadiness.ready && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                {LEAD_REQUEST_TEXT.readinessMissingPrefix}:{' '}
                                {card.saleReadiness.missing.join(', ')}
                            </p>
                        )}

                        <LeadRequestHistory
                            entries={getHistoryNewestFirst(card)}
                        />

                        {error && (
                            <p className="text-xs text-destructive">{error}</p>
                        )}
                    </div>
                )}
            </SectionState>
        </SectionCard>
    );
};

export default LeadRequestPanel;
