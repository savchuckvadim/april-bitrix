'use client';

import { FC, useState } from 'react';
import { GlassDialog } from '@workspace/april-ui/surfaces';
import { Spinner } from '@workspace/april-ui';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { LEAD_REQUEST_ENUM_LABEL } from '../consts/lead-request.const';
import { leadRequestActions } from '../model/LeadRequestSlice';
import { saveLeadRequest } from '../model/LeadRequestThunk';
import type { LeadNotCaTypeCode } from '../model';

/**
 * «Не ЦА» — почему?
 *
 * Портал не принимает статус «Не ЦА» без типа, и раньше менеджер узнавал об
 * этом красной ошибкой уже ПОСЛЕ выбора: сам тип жил в селекте, который до
 * выбора статуса даже не показывался. Теперь окно спрашивает тип сразу, а
 * статус и тип уезжают одним запросом.
 *
 * Отмена ничего не сохраняет: статус остаётся прежним, а не повисает
 * наполовину применённым.
 */
export const NotCaTypePrompt: FC = () => {
    const dispatch = useAppDispatch();
    const pending = useAppSelector(s => s.leadRequest.notCaPrompt);
    const items = useAppSelector(s => s.leadRequest.card?.notCaType.items);
    const saving = useAppSelector(s => s.leadRequest.saving);
    const [code, setCode] = useState<LeadNotCaTypeCode | null>(null);

    const close = () => {
        dispatch(leadRequestActions.closeNotCaPrompt());
        setCode(null);
    };

    const submit = async () => {
        if (!pending || !code) return;
        await dispatch(saveLeadRequest({ ...pending, notCaTypeCode: code }));
        close();
    };

    return (
        <GlassDialog
            open={Boolean(pending)}
            onOpenChange={open => {
                if (!open) close();
            }}
            size="sm"
            intensity="soft"
            cardClassName="gap-4"
        >
            <DialogHeader>
                <DialogTitle>Почему «не ЦА»?</DialogTitle>
                <DialogDescription>
                    Без типа портал не примет статус. Отметьте причину — статус
                    и тип сохранятся вместе.
                </DialogDescription>
            </DialogHeader>

            <Select
                value={code ?? undefined}
                onValueChange={value => setCode(value as LeadNotCaTypeCode)}
            >
                <SelectTrigger
                    aria-label={LEAD_REQUEST_ENUM_LABEL.notCaTypeCode}
                    className="w-full"
                >
                    <SelectValue
                        placeholder={LEAD_REQUEST_ENUM_LABEL.notCaTypeCode}
                    />
                </SelectTrigger>
                <SelectContent>
                    {(items ?? []).map(item => (
                        <SelectItem key={item.code} value={item.code}>
                            {item.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={close} disabled={saving}>
                    Отмена
                </Button>
                <Button
                    className="min-w-32"
                    onClick={submit}
                    disabled={!code || saving}
                >
                    {saving ? (
                        <>
                            <Spinner size="sm" tone="neutral" />
                            Сохраняем…
                        </>
                    ) : (
                        'Сохранить'
                    )}
                </Button>
            </div>
        </GlassDialog>
    );
};
