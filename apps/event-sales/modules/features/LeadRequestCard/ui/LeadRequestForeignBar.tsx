'use client';

import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { acceptLeadRequest } from '../model/LeadRequestThunk';
import { LEAD_REQUEST_TEXT } from '../consts/lead-request.const';

/**
 * Непринятая заявка назначена другому сотруднику — справка без блокировки.
 *
 * Работу по делу она не запирает, а принять её может любой (решение
 * владельца 16.09): заявку закрывает сам факт принятия, а не то, кто нажал.
 * «Передать» здесь нет — передаёт тот, на ком заявка.
 */
export const LeadRequestForeignBar: FC = () => {
    const dispatch = useAppDispatch();
    const saving = useAppSelector(state => state.leadRequest.saving);

    return (
        <div className="space-y-2 rounded-md border border-muted-foreground/40 bg-muted/40 p-3">
            <p className="text-sm font-medium">
                {LEAD_REQUEST_TEXT.foreignTitle}
            </p>
            <p className="text-xs text-muted-foreground">
                {LEAD_REQUEST_TEXT.foreignHint}
            </p>
            <Button
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={() => dispatch(acceptLeadRequest())}
            >
                {LEAD_REQUEST_TEXT.acceptButton}
            </Button>
        </div>
    );
};
