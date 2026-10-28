'use client';

import { FC } from 'react';
import { GlassDialog } from '@workspace/april-ui/surfaces';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectAllDepartmentUsers } from '@/modules/features/Departament/model/selectors';
import { acceptLeadRequest } from '../model/LeadRequestThunk';
import {
    findUserName,
    getForeignAcceptDescription,
} from '../lib/foreign-accept';
import { LEAD_REQUEST_TEXT } from '../consts/lead-request.const';

interface LeadForeignAcceptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Подтверждение перед тем, как взять ЧУЖУЮ заявку.
 *
 * Принявший забирает клиента целиком — сделку, заявку и задачи (решение
 * 22.09). Без вопроса одна кнопка уводила клиента к сотруднику другого
 * города (garant, сделка 83129, 14.10.2026).
 */
export const LeadForeignAcceptDialog: FC<LeadForeignAcceptDialogProps> = ({
    open,
    onOpenChange,
}) => {
    const dispatch = useAppDispatch();
    const users = useAppSelector(selectAllDepartmentUsers);
    const ownerId = useAppSelector(
        state => state.leadRequest.card?.assignedById ?? null,
    );
    const ownerName = findUserName(users, ownerId);

    const accept = () => {
        dispatch(acceptLeadRequest());
        onOpenChange(false);
    };

    return (
        <GlassDialog
            open={open}
            onOpenChange={onOpenChange}
            size="sm"
            intensity="soft"
            cardClassName="gap-4"
        >
            <DialogHeader>
                <DialogTitle>{LEAD_REQUEST_TEXT.foreignAcceptTitle}</DialogTitle>
                <DialogDescription>
                    {getForeignAcceptDescription(ownerName)}
                </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    {LEAD_REQUEST_TEXT.foreignAcceptCancel}
                </Button>
                <Button onClick={accept}>
                    {LEAD_REQUEST_TEXT.foreignAcceptConfirm}
                </Button>
            </div>
        </GlassDialog>
    );
};
