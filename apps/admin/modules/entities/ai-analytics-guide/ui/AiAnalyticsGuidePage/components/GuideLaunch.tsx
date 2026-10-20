'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { MarkdownView } from '@/modules/shared/ui/markdown';
import { GUIDE_TEXT } from '../../../consts/ai-analytics-guide.const';
import { isGuideActionCode } from '../../../lib/guide-actions';
import type { GuideEndpoint, GuideLaunchStep } from '../../../model';
import { GuideActionForm } from './GuideActionForm';

interface GuideLaunchProps {
    steps: readonly GuideLaunchStep[];
    endpoints: readonly GuideEndpoint[];
    domain: string | undefined;
}

/**
 * Чек-лист «Запуск»: шаги по порядку, у шага с действием — форма с
 * выбранным порталом (ручка берётся из списка ручек раздела по коду).
 */
export const GuideLaunch = ({ steps, endpoints, domain }: GuideLaunchProps) => (
    <SectionCard title={GUIDE_TEXT.launchTitle} description={GUIDE_TEXT.launchHint}>
        <ol className="space-y-4">
            {steps.map(step => {
                const action = isGuideActionCode(step.action) ? step.action : null;
                const endpoint = action
                    ? endpoints.find(item => item.action === action)
                    : undefined;
                return (
                    <li key={step.code} id={`launch-${step.code}`} className="space-y-2">
                        <h3 className="text-sm font-semibold">{step.title}</h3>
                        <MarkdownView text={step.markdown} />
                        {action && endpoint && (
                            <GuideActionForm action={action} endpoint={endpoint} domain={domain} />
                        )}
                    </li>
                );
            })}
        </ol>
    </SectionCard>
);
