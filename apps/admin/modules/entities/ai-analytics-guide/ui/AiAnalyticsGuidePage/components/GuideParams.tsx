'use client';

import Link from 'next/link';
import { ToneBadge } from '@workspace/april-ui/badges';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import {
    GUIDE_SCOPE_LABEL,
    GUIDE_SOURCE_LABEL,
    GUIDE_TEXT,
} from '../../../consts/ai-analytics-guide.const';
import {
    formatParamDefault,
    formatParamRange,
    groupGuideParams,
} from '../../../lib/guide-view';
import type { GuideParam } from '../../../model';

const MODEL_PARAMS_ANCHOR = 'setting-ai_analytics_model_params';

interface GuideParamsProps {
    params: readonly GuideParam[];
    portalId: number | undefined;
}

const ParamRow = ({ param }: { param: GuideParam }) => (
    <li className="space-y-0.5 rounded-md border px-3 py-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">{param.userTitle ?? param.title}</span>
            {param.userTitle && (
                <span className="text-xs text-muted-foreground">({param.title})</span>
            )}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                {param.code}
            </code>
            <ToneBadge tone="neutral" variant="soft" size="sm">
                {GUIDE_SCOPE_LABEL[param.scope] ?? param.scope}
            </ToneBadge>
            <ToneBadge tone="muted" variant="soft" size="sm">
                {GUIDE_SOURCE_LABEL[param.source] ?? param.source}
            </ToneBadge>
            {param.breaksSeries && (
                <ToneBadge tone="warning" variant="soft" size="sm">
                    {GUIDE_TEXT.breaksSeries}
                </ToneBadge>
            )}
        </div>
        <p className="text-xs text-muted-foreground">
            {GUIDE_TEXT.defaultValue}: <b>{formatParamDefault(param.default)}</b>
            {param.unit ? ` ${param.unit}` : ''} · {GUIDE_TEXT.range}:{' '}
            {formatParamRange(param.range)} · {GUIDE_TEXT.phase} {param.phase}
        </p>
        <p className="text-xs text-muted-foreground">{param.note ?? param.description}</p>
    </li>
);

/**
 * Параметры реестра по тематическим группам (свёрнуты, кроме первой):
 * название для руководителя и техническое, код, слой, класс, дефолт,
 * диапазон, описание из реестра. Кнопка ведёт к ключу
 * `ai_analytics_model_params` выбранного портала, где они переопределяются.
 */
export const GuideParams = ({ params, portalId }: GuideParamsProps) => {
    const groups = groupGuideParams(params);
    const modelParamsHref = portalId
        ? `/portal/${portalId}/app-settings#${MODEL_PARAMS_ANCHOR}`
        : null;

    return (
        <SectionCard
            title={GUIDE_TEXT.paramsTitle}
            description={GUIDE_TEXT.paramsHint}
            density="compact"
            actions={
                modelParamsHref ? (
                    <Button asChild variant="outline" size="sm">
                        <Link href={modelParamsHref}>{GUIDE_TEXT.openModelParams}</Link>
                    </Button>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        {GUIDE_TEXT.openModelParams} ({GUIDE_TEXT.noPortalForLink})
                    </span>
                )
            }
        >
            {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground">{GUIDE_TEXT.paramsEmpty}</p>
            ) : (
                <div className="space-y-2">
                    {groups.map((group, index) => (
                        <details
                            key={group.group}
                            open={index === 0 || undefined}
                            className="rounded-md border"
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-sm">
                                <span className="font-medium">{group.groupTitle}</span>
                                <span className="text-xs text-muted-foreground">
                                    {group.params.length}
                                </span>
                            </summary>
                            <ul className="space-y-2 border-t px-3 py-3">
                                {group.params.map(param => (
                                    <ParamRow key={param.code} param={param} />
                                ))}
                            </ul>
                        </details>
                    ))}
                </div>
            )}
        </SectionCard>
    );
};
