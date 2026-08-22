'use client';

import { FC, useState } from 'react';
import { MicroSegmented } from '@workspace/april-ui';
import { GlassDialog } from '@workspace/april-ui/surfaces';
import { DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    getReadinessBadge,
    LeadRequestPanel,
    leadRequestActions,
} from '@/modules/features/LeadRequestCard';
import { useRequestLeadIds } from '@/modules/features/LeadRequestCard/lib/hooks/use-request-lead-ids';

/**
 * Карточка заявки окном — одна на экран.
 *
 * Открыть её могут двое: иконка привязок в пульте и миниатюра заявки в
 * отчёте, поэтому состояние окна живёт в сторе, а не в кнопке. Пока окно
 * открыто, слот карточки заперт (setDialogOpen ставит замок): гейт очереди
 * не подменит лида под руками у менеджера.
 */
export const RequestDialog: FC = () => {
    const dispatch = useAppDispatch();
    const isOpen = useAppSelector(s => s.leadRequest.isDialogOpen);
    const card = useAppSelector(s => s.leadRequest.card);
    const loadedLeadId = useAppSelector(s => s.leadRequest.leadId);
    const hasCompany = useAppSelector(s => Boolean(s.app.bitrix.company));
    const leadIds = useRequestLeadIds();

    const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
    const activeLeadId = selectedLeadId ?? leadIds[0] ?? undefined;

    const isCardOurs =
        card !== null && loadedLeadId !== null && loadedLeadId === activeLeadId;
    const badge = isCardOurs ? getReadinessBadge(card, { hasCompany }) : null;

    const setOpen = (open: boolean) => {
        dispatch(leadRequestActions.setDialogOpen(open));
        if (!open) setSelectedLeadId(null);
    };

    return (
        <GlassDialog
            open={isOpen}
            onOpenChange={setOpen}
            size="md"
            intensity="soft"
            cardClassName="gap-3 max-h-[85vh] overflow-y-auto"
        >
            <DialogHeader>
                <DialogTitle>
                    {badge ? `Заявка — ${badge.label}` : 'Заявка'}
                </DialogTitle>
            </DialogHeader>

            {leadIds.length > 1 && (
                <MicroSegmented
                    ariaLabel="Какая заявка"
                    size="xs"
                    value={String(activeLeadId)}
                    options={leadIds.map(id => ({
                        value: String(id),
                        label: `№${id}`,
                    }))}
                    onChange={value => setSelectedLeadId(Number(value))}
                />
            )}

            <LeadRequestPanel leadId={activeLeadId} />
        </GlassDialog>
    );
};
