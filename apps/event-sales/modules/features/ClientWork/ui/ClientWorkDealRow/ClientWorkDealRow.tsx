'use client';

import { FC } from 'react';
import { ExternalLink } from 'lucide-react';
import { ToneBadge } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { CLIENT_WORK_TEXT } from '../../lib/client-work-text';
import type { ClientWorkView } from '../../lib/hooks/use-client-work';
import type { ClientWorkDeal } from '../../model';

export interface ClientWorkDealRowProps {
    deal: ClientWorkDeal;
    view: ClientWorkView;
}

/**
 * Сделка клиента: отметка «присоединить» (руководителю), ссылка, стадия,
 * ответственный и пометки — основная, самая свежая, эта сделка, ведёт сам.
 */
export const ClientWorkDealRow: FC<ClientWorkDealRowProps> = ({
    deal,
    view,
}) => {
    const isMain = deal.id === view.mainDealId;
    const url = view.dealUrl(deal.id);

    return (
        <div className="flex items-start gap-2 rounded-md border border-border p-2">
            {view.canJoin && (
                <Checkbox
                    className="mt-0.5"
                    aria-label={`Присоединить сделку ${deal.id}`}
                    checked={view.isSelected(deal.id)}
                    disabled={isMain}
                    onCheckedChange={() => view.toggle(deal.id)}
                />
            )}
            <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                    {url ? (
                        <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            title={deal.title}
                            className="inline-flex min-w-0 items-center gap-1 truncate text-sm text-foreground underline-offset-2 hover:underline"
                        >
                            №{deal.id} {deal.title}
                            <ExternalLink aria-hidden className="size-3 shrink-0" />
                        </a>
                    ) : (
                        <span className="truncate text-sm text-foreground">
                            №{deal.id} {deal.title}
                        </span>
                    )}
                    <span className="shrink-0 text-[0.6875rem] text-muted-foreground">
                        {deal.stageName}
                    </span>
                </div>
                <p
                    className={
                        deal.responsibleWorking
                            ? 'text-xs text-muted-foreground'
                            : 'text-xs text-destructive'
                    }
                >
                    {deal.responsibleName}
                    {deal.responsibleWorking ? '' : ` (${CLIENT_WORK_TEXT.gone})`}
                    {' · '}
                    {deal.origin}
                </p>
                <div className="flex flex-wrap items-center gap-1">
                    {isMain && (
                        <ToneBadge tone="success" variant="soft" size="sm">
                            {CLIENT_WORK_TEXT.main}
                        </ToneBadge>
                    )}
                    {deal.isFreshest && (
                        <ToneBadge tone="primary" variant="soft" size="sm">
                            {CLIENT_WORK_TEXT.freshest}
                        </ToneBadge>
                    )}
                    {deal.isCurrent && (
                        <ToneBadge tone="muted" variant="soft" size="sm">
                            {CLIENT_WORK_TEXT.current}
                        </ToneBadge>
                    )}
                    {deal.ownWork && (
                        <ToneBadge tone="warning" variant="soft" size="sm">
                            {CLIENT_WORK_TEXT.ownWork}
                        </ToneBadge>
                    )}
                    {view.canJoin && !isMain && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={() => view.chooseMain(deal.id)}
                        >
                            {CLIENT_WORK_TEXT.makeMain}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
