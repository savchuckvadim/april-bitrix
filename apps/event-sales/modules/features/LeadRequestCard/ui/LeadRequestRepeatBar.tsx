'use client';

import { FC } from 'react';
import { ExternalLink, History } from 'lucide-react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getCrmUrl } from '@/modules/app/lib/utills/url';
import type { LeadRequestRepeat } from '../model';
import { LEAD_REQUEST_REPEAT_TEXT } from '../consts/lead-request.const';
import { buildLeadRequestRepeatView } from '../lib/lead-request-repeat-view';

interface LeadRequestRepeatBarProps {
    repeat: LeadRequestRepeat;
}

/**
 * «Это уже существовало»: заявка присоединена к открытой работе клиента.
 * Сотрудник видит основную сделку, стадию, на которой шла работа, и на ком
 * она висела — в том числе если того сотрудника уже нет в карусели.
 */
export const LeadRequestRepeatBar: FC<LeadRequestRepeatBarProps> = ({
    repeat,
}) => {
    const domain = useAppSelector(state => state.app.domain);
    const userId = useAppSelector(state =>
        Number(state.app.bitrix.user?.ID ?? 0),
    );
    const view = buildLeadRequestRepeatView(repeat, userId);
    const url = getCrmUrl(domain, 'deal', repeat.mainDealId);

    return (
        <div className="space-y-1 rounded-md border border-info/40 bg-info/5 p-3">
            <p className="flex items-center gap-1.5 text-sm font-medium">
                <History aria-hidden className="size-4 text-info" />
                {LEAD_REQUEST_REPEAT_TEXT.title}
            </p>
            <p className="text-xs text-muted-foreground">
                {LEAD_REQUEST_REPEAT_TEXT.hint}
            </p>
            {url && (
                <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-2"
                >
                    {LEAD_REQUEST_REPEAT_TEXT.mainDeal}:{' '}
                    {repeat.mainDealTitle ?? `#${repeat.mainDealId}`}
                    <ExternalLink aria-hidden className="size-3" />
                </a>
            )}
            {view.stageLine && <p className="text-xs">{view.stageLine}</p>}
            {view.responsibleLine && (
                <p className="text-xs">
                    {view.responsibleLine}
                    {view.rotationWarning && (
                        <span className="text-warning">
                            {' '}
                            — {view.rotationWarning}
                        </span>
                    )}
                </p>
            )}
        </div>
    );
};
