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
import { useModalChecklist } from '../lib/hooks/use-modal-checklist';
import {
    cancelCallChecklist,
    confirmCallChecklist,
} from '../model/CallChecklistThunk';
import { ChecklistField } from './components/ChecklistField';
import { OpenDealSliderButton } from './components/OpenDealSliderButton';

/**
 * Модальный чек-лист — шаг цепочки send() (паттерн AfterPresentation):
 * отправка двигает основную сделку на стадию с обязательными полями
 * («Клиент на решении», «Продажа») — менеджер закрывает их здесь, отчёт
 * уходит сам после подтверждения. Несколько чек-листов идут ОДИН ЗА
 * ДРУГИМ: confirm перезапускает send(), тот открывает следующий.
 *
 * Отмена прерывает отправку (менеджер вернулся на форму); уже записанные
 * crm-значения остаются — они истинны сами по себе.
 */
export const CallChecklistDialog: FC = () => {
    const dispatch = useAppDispatch();
    const view = useModalChecklist();
    const baseDealId = useAppSelector(
        s => s.stagePredict.result?.baseDealId ?? null,
    );

    if (!view.def) return null;

    return (
        <GlassDialog
            open
            onOpenChange={open => {
                if (!open) dispatch(cancelCallChecklist());
            }}
            size="sm"
            intensity="soft"
            cardClassName="gap-4"
        >
            <DialogHeader>
                <DialogTitle>{view.def.title}</DialogTitle>
                <DialogDescription>
                    {view.def.hint ??
                        'Заполните обязательные поля — отчёт уйдёт сразу после подтверждения.'}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-2.5">
                {view.fields.map(field => (
                    <ChecklistField key={field.def.code} field={field} />
                ))}
                {view.isBaseDealLoading && (
                    <p className="text-xs text-muted-foreground">
                        читаем текущие значения сделки…
                    </p>
                )}
                {view.error && (
                    <p className="text-xs text-destructive">{view.error}</p>
                )}
            </div>

            <div className="flex items-center justify-between gap-2">
                <OpenDealSliderButton dealId={baseDealId} />
                <div className="ml-auto flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => dispatch(cancelCallChecklist())}
                    >
                        Вернуться к форме
                    </Button>
                    <Button
                        className="bg-action text-action-foreground hover:bg-action/90"
                        disabled={!view.isReady}
                        onClick={() =>
                            view.def &&
                            dispatch(confirmCallChecklist(view.def.id))
                        }
                    >
                        Готово — отправить
                    </Button>
                </div>
            </div>
        </GlassDialog>
    );
};
