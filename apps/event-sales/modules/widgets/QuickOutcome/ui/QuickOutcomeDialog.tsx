'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import { GlassDialog } from '@workspace/april-ui/surfaces';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useEnsureUsers } from '@/modules/entities/BitrixUser';
import {
    EV_REPORT_PROP,
    setAndSaveComment,
} from '@/modules/entities/EventReport';
import { useLeadRequestSendBlock } from '@/modules/features/LeadRequestCard/lib/hooks/use-lead-request-send-block';
import { COMMENT_MAX_LENGTH } from '@/modules/processes/event/lib/text-limits';
import { SendPreflightDialog } from '@/modules/widgets/EventItem/ui/plan/SendPreflightDialog';
import {
    QUICK_OUTCOME,
    QUICK_OUTCOME_TEXT,
    getOutcomeOwnerNote,
} from '../lib/quick-outcome';
import {
    selectIsOutcomeForOther,
    selectQuickOutcomeOwnerName,
} from '../model/selectors';
import {
    cancelQuickOutcome,
    submitQuickOutcome,
} from '../model/QuickOutcomeThunk';
import {
    QuickOutcomeFailFields,
    QuickOutcomeSaleFields,
} from './QuickOutcomeFields';

// Стадийный чек-лист («Продажа») — шаг отправки; открывается редко.
const CallChecklistDialog = dynamic(
    () =>
        import('@/modules/features/CallChecklist/ui/CallChecklistDialog').then(
            module => module.CallChecklistDialog,
        ),
    { ssr: false },
);

/**
 * Окно быстрого итога — «Продажа» или «Отказ» (у каждого свои поля).
 *
 * Пишет в те же слайсы, что форма дела, и отправляет тем же потоком:
 * недостающее обязательное (прогноз по компании, пометки заявок, анкеты)
 * соберёт окно «Осталось заполнить». Оно и чек-лист продажи монтируются
 * здесь же: на экране списка формы дела нет, и без них отправка молча
 * останавливалась бы на проверке.
 *
 * Гаснет само, когда отчёт уходит на экран финиша (листенер быстрого итога).
 */
export const QuickOutcomeDialog: FC = () => {
    const dispatch = useAppDispatch();
    const kind = useAppSelector(s => s.quickOutcome.kind);
    const isOpen = useAppSelector(s => s.quickOutcome.isOpen);
    const ownerId = useAppSelector(s => s.quickOutcome.ownerId);
    const isForOther = useAppSelector(selectIsOutcomeForOther);
    const ownerName = useAppSelector(selectQuickOutcomeOwnerName);
    const inProgress = useAppSelector(s => s.preloader.inProgress);
    const comment = useAppSelector(
        s => s.eventReport.report[EV_REPORT_PROP.COMMENT],
    );
    // Непринятая заявка блокирует отправку — как у кнопки «Отправить».
    const acceptBlock = useLeadRequestSendBlock();
    // Ответственный сделки может работать вне отдела продаж — имя доспросим.
    useEnsureUsers([isForOther ? ownerId : null]);

    if (!kind || !isOpen) return null;

    const text = QUICK_OUTCOME_TEXT[kind];
    const cancel = () => void dispatch(cancelQuickOutcome());

    return (
        <>
            <GlassDialog
                open
                onOpenChange={open => {
                    if (!open) cancel();
                }}
                size="sm"
                intensity="soft"
                cardClassName="gap-4"
            >
                <DialogHeader>
                    <DialogTitle>{text.title}</DialogTitle>
                    <DialogDescription>{text.description}</DialogDescription>
                </DialogHeader>

                {isForOther && (
                    <p className="rounded-md border border-border bg-muted px-2 py-1.5 text-xs text-foreground">
                        {getOutcomeOwnerNote(ownerName)}
                    </p>
                )}

                {kind === QUICK_OUTCOME.fail ? (
                    <QuickOutcomeFailFields />
                ) : (
                    <QuickOutcomeSaleFields />
                )}

                <div className="space-y-1.5">
                    <Label htmlFor="quick-outcome-comment">
                        Комментарий
                        <span aria-hidden className="ml-0.5 text-destructive">
                            •
                        </span>
                    </Label>
                    <Textarea
                        id="quick-outcome-comment"
                        value={comment}
                        rows={4}
                        placeholder={text.commentPlaceholder}
                        maxLength={COMMENT_MAX_LENGTH}
                        onChange={e =>
                            dispatch(setAndSaveComment(e.target.value))
                        }
                    />
                </div>

                <div className="mt-2 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        disabled={inProgress}
                        onClick={cancel}
                    >
                        Отмена
                    </Button>
                    <Button
                        className="bg-action text-action-foreground hover:bg-action/90"
                        disabled={inProgress || acceptBlock.blocked}
                        title={acceptBlock.reason ?? undefined}
                        onClick={() => void dispatch(submitQuickOutcome())}
                    >
                        {inProgress
                            ? 'Отправка…'
                            : (acceptBlock.reason ?? text.submit)}
                    </Button>
                </div>
            </GlassDialog>

            <SendPreflightDialog />
            <CallChecklistDialog />
        </>
    );
};
