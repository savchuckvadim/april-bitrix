'use client';

import { FC, useState } from 'react';
import { GlassDialog } from '@workspace/april-ui/surfaces';
import { FieldCombobox } from '@workspace/april-ui/fields';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { useTransferCandidates } from '../lib/hooks/use-transfer-candidates';
import { transferLeadRequest } from '../model/LeadRequestThunk';

interface LeadTransferDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Кому передать заявку.
 *
 * Раньше передача уходила «следующему по кругу»: круг не знает, кто в отпуске
 * и кто сейчас говорит по этой отрасли, и заявка снова висела до SLA. Здесь
 * менеджер называет человека сам — коллеги по отделу и подчинённые уже
 * загружены структурой, отдельный запрос не нужен.
 *
 * Не выбрал никого — работает прежний круг: это честный запасной путь, а не
 * ошибка.
 */
export const LeadTransferDialog: FC<LeadTransferDialogProps> = ({
    open,
    onOpenChange,
}) => {
    const dispatch = useAppDispatch();
    const candidates = useTransferCandidates();
    const [userId, setUserId] = useState<string>();

    const transfer = () => {
        dispatch(transferLeadRequest(userId ? Number(userId) : null));
        onOpenChange(false);
    };

    return (
        <GlassDialog open={open} onOpenChange={onOpenChange} size="sm">
            <DialogHeader>
                <DialogTitle>Передать заявку</DialogTitle>
                <DialogDescription>
                    Заявка уйдёт выбранному сотруднику — принимать её будет он.
                    Не выбирать — уйдёт следующему по кругу отдела.
                </DialogDescription>
            </DialogHeader>

            <FieldCombobox
                id="lead-transfer-user"
                label="Кому передать"
                options={candidates}
                value={userId}
                placeholder="Следующему по кругу"
                searchPlaceholder="Фамилия или имя…"
                emptyText="Сотрудник не найден"
                onChange={setUserId}
            />

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Отмена
                </Button>
                <Button onClick={transfer}>Передать</Button>
            </div>
        </GlassDialog>
    );
};
