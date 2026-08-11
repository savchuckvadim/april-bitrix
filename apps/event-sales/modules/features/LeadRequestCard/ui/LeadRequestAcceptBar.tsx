'use client';

import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    acceptLeadRequest,
    transferLeadRequest,
} from '../model/LeadRequestThunk';
import { useLeadRequestAcceptState } from '../lib/hooks/use-lead-request-accept-state';
import { LEAD_REQUEST_TEXT } from '../consts/lead-request.const';

/**
 * Блок обязательного подтверждения: заявка назначена, но не принята —
 * работать нельзя, пока менеджер не нажмёт «Принять в работу» либо
 * «Передать другому» (следующему в его отделе; тот принимает так же).
 * Заявка назначена другому (передана повторно / после непринятия) —
 * информационный блок без кнопок: принимает новый ответственный.
 */
export const LeadRequestAcceptBar: FC = () => {
    const dispatch = useAppDispatch();
    const view = useLeadRequestAcceptState();
    const saving = useAppSelector(state => state.leadRequest.saving);

    if (view === 'hidden') return null;

    if (view === 'foreign') {
        return (
            <div className="space-y-1 rounded-md border border-muted-foreground/40 bg-muted/40 p-3">
                <p className="text-sm font-medium">
                    {LEAD_REQUEST_TEXT.foreignTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                    {LEAD_REQUEST_TEXT.foreignHint}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2 rounded-md border border-amber-500/60 bg-amber-500/10 p-3">
            <p className="text-sm font-medium">
                {LEAD_REQUEST_TEXT.notAcceptedTitle}
            </p>
            <p className="text-xs text-muted-foreground">
                {LEAD_REQUEST_TEXT.notAcceptedHint}
            </p>
            <div className="flex gap-2">
                <Button
                    size="sm"
                    disabled={saving}
                    onClick={() => dispatch(acceptLeadRequest())}
                >
                    {LEAD_REQUEST_TEXT.acceptButton}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={saving}
                    onClick={() => dispatch(transferLeadRequest())}
                >
                    {LEAD_REQUEST_TEXT.transferButton}
                </Button>
            </div>
        </div>
    );
};
