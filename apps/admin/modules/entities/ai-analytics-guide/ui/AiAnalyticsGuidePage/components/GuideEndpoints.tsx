'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { GUIDE_APP_LABEL, GUIDE_TEXT } from '../../../consts/ai-analytics-guide.const';
import { isGuideActionCode } from '../../../lib/guide-actions';
import { fillDomain } from '../../../lib/guide-view';
import type { GuideEndpoint } from '../../../model';
import { GuideCodeBlock } from '../../components/GuideCodeBlock';
import { GuideActionForm } from './GuideActionForm';

interface GuideEndpointsProps {
    endpoints: readonly GuideEndpoint[];
    domain: string | undefined;
    /** Коды действий, формы которых уже показаны в чек-листе «Запуск» — не дублируем. */
    hideActions?: ReadonlySet<string>;
}

/**
 * Ручки раздела: метод, путь, приложение, когда и зачем, пример тела или
 * query с подставленным доменом; у ручек с действием — форма «Запуск».
 */
export const GuideEndpoints = ({ endpoints, domain, hideActions }: GuideEndpointsProps) => (
    <SectionCard title={GUIDE_TEXT.endpointsTitle} description={GUIDE_TEXT.launchHint}>
        {endpoints.length === 0 ? (
            <p className="text-sm text-muted-foreground">{GUIDE_TEXT.endpointsEmpty}</p>
        ) : (
            <div className="space-y-4">
                {endpoints.map(endpoint => {
                    const action = isGuideActionCode(endpoint.action) ? endpoint.action : null;
                    const showForm = action !== null && !hideActions?.has(action);
                    return (
                        <div
                            key={`${endpoint.method}:${endpoint.path}`}
                            className="space-y-2 rounded-md border p-3"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <ToneBadge
                                    tone={endpoint.method === 'POST' ? 'warning' : 'info'}
                                    variant="soft"
                                    size="sm"
                                >
                                    {endpoint.method}
                                </ToneBadge>
                                <code className="font-mono text-xs">/api/{endpoint.path}</code>
                                <ToneBadge
                                    tone={endpoint.app === 'admin' ? 'success' : 'muted'}
                                    variant="soft"
                                    size="sm"
                                >
                                    {GUIDE_APP_LABEL[endpoint.app]}
                                </ToneBadge>
                            </div>
                            <p className="text-sm">
                                <b>{GUIDE_TEXT.endpointWhen}:</b> {endpoint.when}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                <b className="text-foreground">{GUIDE_TEXT.endpointPurpose}:</b>{' '}
                                {endpoint.purpose}
                            </p>
                            {endpoint.body && (
                                <GuideCodeBlock
                                    label={GUIDE_TEXT.endpointBody}
                                    value={fillDomain(endpoint.body, domain)}
                                />
                            )}
                            {endpoint.query && (
                                <GuideCodeBlock
                                    label={GUIDE_TEXT.endpointQuery}
                                    value={fillDomain(endpoint.query, domain)}
                                />
                            )}
                            {showForm && action && (
                                <GuideActionForm
                                    action={action}
                                    endpoint={endpoint}
                                    domain={domain}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        )}
    </SectionCard>
);
