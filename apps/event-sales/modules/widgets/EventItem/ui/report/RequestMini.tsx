'use client';

import { FC } from 'react';
import { FileText } from 'lucide-react';
import { ToneBadge } from '@workspace/april-ui';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    getReadinessBadge,
    leadRequestActions,
} from '@/modules/features/LeadRequestCard';
import { useRequestLeadIds } from '@/modules/features/LeadRequestCard/lib/hooks/use-request-lead-ids';

/**
 * Заявка дела миниатюрой — рядом с пультом.
 *
 * Название и «отработана ли»: по экрану сразу видно, есть ли у дела заявка и
 * закрыта ли её судьба. Клик открывает ту же карточку окном, что и иконка
 * привязок (окно одно, состояние в сторе).
 */
export const RequestMini: FC = () => {
    const dispatch = useAppDispatch();
    const leadIds = useRequestLeadIds();
    const card = useAppSelector(s => s.leadRequest.card);
    const loadedLeadId = useAppSelector(s => s.leadRequest.leadId);
    const hasCompany = useAppSelector(s => Boolean(s.app.bitrix.company));

    if (!leadIds.length) return null;

    // Карточке можно верить, только если слот держит нашего лида: он один на
    // приложение, и в нём вполне может лежать лид из очереди подтверждений.
    const isCardOurs =
        card !== null && loadedLeadId !== null && loadedLeadId === leadIds[0];
    const badge = isCardOurs ? getReadinessBadge(card, { hasCompany }) : null;
    const title = isCardOurs ? card.title : `Заявка №${leadIds[0]}`;

    return (
        <button
            type="button"
            onClick={() => dispatch(leadRequestActions.setDialogOpen(true))}
            title="Открыть карточку заявки"
            className="flex h-full min-w-0 cursor-pointer flex-col items-start gap-1 rounded-lg border border-border bg-card p-2 text-left"
        >
            <span className="flex min-w-0 items-center gap-1.5">
                <FileText
                    aria-hidden
                    className="size-3.5 shrink-0 text-muted-foreground"
                />
                <span className="min-w-0 truncate text-xs font-semibold">
                    {title}
                </span>
            </span>

            {badge ? (
                <ToneBadge tone={badge.tone} variant="soft">
                    {badge.label}
                </ToneBadge>
            ) : (
                <span className="text-[0.625rem] text-muted-foreground">
                    Открыть карточку
                </span>
            )}
        </button>
    );
};
