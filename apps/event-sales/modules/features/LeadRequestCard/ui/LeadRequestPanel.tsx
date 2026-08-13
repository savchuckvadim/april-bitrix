'use client';

import { FC } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui';
import { SectionState } from '@/modules/shared/SectionState';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
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
    const {
        card,
        status,
        saving,
        error,
        visible,
        retry,
        patchEnum,
        patchBool,
    } = useLeadRequest(leadId);
    // Компания — стоп-фактор продажи, а не одно из незаполненного.
    const hasCompany = useAppSelector(s => Boolean(s.app.bitrix.company));

    if (!visible) return null;

    const badge = card ? getReadinessBadge(card, { hasCompany }) : null;

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
                    <ToneBadge
                        tone={badge.tone}
                        variant="soft"
                        className={
                            badge.isCompanyMissing
                                ? 'relative before:pointer-events-none before:absolute before:-inset-px before:rounded-[inherit] before:animate-echo-ring motion-reduce:before:animate-none'
                                : undefined
                        }
                    >
                        {badge.label}
                    </ToneBadge>
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
                                    label={
                                        LEAD_REQUEST_ENUM_LABEL.notCaTypeCode
                                    }
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

                        {badge && badge.missing.length > 0 && (
                            <p className="text-xs text-warning">
                                {LEAD_REQUEST_TEXT.readinessMissingPrefix}:{' '}
                                {badge.missing.join(', ')}
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
