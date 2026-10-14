'use client';

import { FC, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { LEAD_REQUEST_TEXT } from '../consts/lead-request.const';
import { LeadForeignAcceptDialog } from './LeadForeignAcceptDialog';

/**
 * Непринятая заявка назначена другому сотруднику — справка без блокировки.
 *
 * Работу по делу она не запирает, а принять её может любой (решение
 * владельца 16.09): заявку закрывает сам факт принятия, а не то, кто нажал.
 * Но принявший забирает клиента целиком, поэтому сначала — окно
 * подтверждения (14.10.2026). «Передать» здесь нет — передаёт тот, на ком
 * заявка.
 */
export const LeadRequestForeignBar: FC = () => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
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
                onClick={() => setIsConfirmOpen(true)}
            >
                {LEAD_REQUEST_TEXT.acceptButton}
            </Button>

            <LeadForeignAcceptDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
            />
        </div>
    );
};
