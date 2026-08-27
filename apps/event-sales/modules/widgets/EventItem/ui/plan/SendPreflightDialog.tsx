'use client';

import { FC } from 'react';
import { Check } from 'lucide-react';
import { GlassDialog } from '@workspace/april-ui/surfaces';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    EV_REPORT_PROP,
    setAndSaveComment,
} from '@/modules/entities/EventReport';
import {
    EV_PLAN_PROP,
    changeWorkStatusFromDeadline,
    eventPlanActions,
} from '@/modules/entities/EventPlan';
import { fetchPlanDaySchedule } from '@/modules/entities/EventPlan/model/PlanScheduleThunk';
import { DateTimePicker } from '@workspace/ui/components/date-time-picker';
import { eventPostFailActions } from '@/modules/entities/EVPostFail';
import { ProspectScale } from '@/modules/entities/EventCompany';
import { send } from '@/modules/processes/event';
import {
    COMMENT_MAX_LENGTH,
    PLAN_NAME_MAX_LENGTH,
} from '@/modules/processes/event/lib/text-limits';
import type { PreflightItem } from '@/modules/processes/event/lib/send-preflight';
import { LeadMarksList } from '@/modules/features/LeadMarks';
import { LeadRequestNotCaSelect } from '@/modules/features/LeadRequestCard/ui/LeadRequestNotCaSelect';
import { ChecklistInlineCard } from '@/modules/features/CallChecklist/ui/ChecklistInlineCard';
import { useRequestLeadIds } from '@/modules/features/LeadRequestCard/lib/hooks/use-request-lead-ids';
import { useSendPreflight } from '../../lib/hooks/use-send-preflight';
import { eventItemActions } from '../../model/EventItemSlice';
import { PlanTypeRadio } from './PlanTypeRadio';

/**
 * «Осталось заполнить» — окно у кнопки отправки.
 *
 * Валидация и раньше находила пустое, но сообщала у самих полей: поля
 * разбросаны по экрану, статус компании далеко от «Отправить», и нажатие
 * выглядело как «ничего не произошло». Здесь всё незаполненное собрано в
 * одном окне с РОДНЫМИ контролами — теми же, что в форме, значения общие.
 * Заполнил → «Отправить» в окне шлёт отчёт сразу, без второго захода.
 *
 * Список пунктов — снимок на момент открытия (см. useSendPreflight):
 * заполненный помечается галочкой, но остаётся на месте. Пустой список окно
 * не закрывает само — закрывает отправка, чтобы не мигать.
 */
export const SendPreflightDialog: FC = () => {
    const dispatch = useAppDispatch();
    const isOpen = useAppSelector(s => s.eventItemMenu.isPreflightOpen);
    const preflight = useSendPreflight();

    const comment = useAppSelector(
        s => s.eventReport.report[EV_REPORT_PROP.COMMENT],
    );
    const planName = useAppSelector(s => s.eventPlan[EV_PLAN_PROP.NAME]);
    const planType = useAppSelector(s => s.eventPlan[EV_PLAN_PROP.TYPE]);
    const planDeadline = useAppSelector(s => s.eventPlan[EV_PLAN_PROP.DATE]);
    const daySchedule = useAppSelector(s => s.planSchedule.items);
    const postFailDate = useAppSelector(s => s.eventPostFail.postFailDate);
    const inProgress = useAppSelector(s => s.preloader.inProgress);
    const leadIds = useRequestLeadIds();
    // Продажа: атрибуция «участвовал в продаже» вешается на сделку дела.
    const saleDealId = useAppSelector(s =>
        s.eventReport.report[EV_REPORT_PROP.WORK_STATUS].current.code ===
        'success'
            ? Number(s.app.bitrix.deal?.ID ?? 0) || null
            : null,
    );

    const close = () =>
        dispatch(eventItemActions.setPreflightOpen({ isOpen: false }));

    const renderItem = (item: PreflightItem) => {
        switch (item.kind) {
            case 'planType':
                return (
                    <PlanTypeRadio
                        items={planType.items}
                        value={
                            planType.current
                                ? String(planType.current.id)
                                : undefined
                        }
                        onChange={value =>
                            dispatch(
                                eventPlanActions.setPlanProp({
                                    name: EV_PLAN_PROP.TYPE,
                                    value,
                                }),
                            )
                        }
                    />
                );
            case 'planName':
                return (
                    <Input
                        value={planName}
                        placeholder="О чём договорились"
                        maxLength={PLAN_NAME_MAX_LENGTH}
                        onChange={e =>
                            dispatch(
                                eventPlanActions.setPlanProp({
                                    name: EV_PLAN_PROP.NAME,
                                    value: e.target.value,
                                }),
                            )
                        }
                    />
                );
            case 'comment':
                return (
                    <Textarea
                        value={comment}
                        rows={4}
                        placeholder="Как прошёл разговор?"
                        maxLength={COMMENT_MAX_LENGTH}
                        onChange={e =>
                            dispatch(setAndSaveComment(e.target.value))
                        }
                    />
                );
            case 'planDeadline':
                // Тот же контрол, что в колонке плана: значение общее.
                return (
                    <DateTimePicker
                        value={planDeadline ?? ''}
                        onChange={value => {
                            dispatch(
                                eventPlanActions.setPlanProp({
                                    name: EV_PLAN_PROP.DATE,
                                    value,
                                }),
                            );
                            dispatch(changeWorkStatusFromDeadline());
                        }}
                        existingEvents={daySchedule}
                        onDateCommit={date =>
                            dispatch(fetchPlanDaySchedule(date))
                        }
                    />
                );
            case 'postFailDate':
                return (
                    <Input
                        type="date"
                        value={postFailDate}
                        onChange={e => {
                            dispatch(
                                eventPostFailActions.setPostFailDate({
                                    date: e.target.value,
                                }),
                            );
                            dispatch(
                                eventPostFailActions.setIsChanged({
                                    status: true,
                                }),
                            );
                        }}
                    />
                );
            case 'notCaType':
                return <LeadRequestNotCaSelect />;
            case 'planChecklist':
                // Родной контрол: та же карточка чек-листа, что в плане.
                return <ChecklistInlineCard />;
            case 'leadMarks':
                return (
                    <LeadMarksList leadIds={leadIds} saleDealId={saleDealId} />
                );
            case 'companyColor':
                // В окне места хватает: шкала во всю ширину и подпись
                // «Сейчас: X → Y» — видно и что стоит, и что даст клик.
                return <ProspectScale block />;
            case 'blocked':
                return null;
        }
    };

    return (
        <GlassDialog
            open={isOpen}
            onOpenChange={open => {
                if (!open) close();
            }}
            size="sm"
            intensity="soft"
            cardClassName="gap-4"
        >
            <DialogHeader>
                <DialogTitle>
                    {preflight.isReady
                        ? 'Всё заполнено'
                        : `Осталось заполнить: ${preflight.items.length}`}
                </DialogTitle>
                <DialogDescription>
                    {preflight.isReady
                        ? 'Можно отправлять.'
                        : 'Это те же поля, что в форме — заполните здесь, и отчёт уйдёт сразу.'}
                </DialogDescription>
            </DialogHeader>

            {preflight.items.map(item => {
                const isDone = preflight.doneKinds.has(item.kind);
                return (
                    <div key={item.kind} className="space-y-1.5">
                        <Label>
                            {item.label}
                            {isDone ? (
                                <Check
                                    aria-label="заполнено"
                                    className="ml-1 inline size-3.5 text-success"
                                />
                            ) : (
                                <span
                                    aria-hidden
                                    className="ml-0.5 text-destructive"
                                >
                                    •
                                </span>
                            )}
                        </Label>
                        {item.hint && !isDone && (
                            <p className="text-xs text-muted-foreground">
                                {item.hint}
                            </p>
                        )}
                        {renderItem(item)}
                    </div>
                );
            })}

            <div className="mt-2 flex justify-end gap-2">
                <Button variant="outline" onClick={close} disabled={inProgress}>
                    Вернуться к форме
                </Button>
                <Button
                    className="bg-action text-action-foreground hover:bg-action/90"
                    disabled={inProgress || !preflight.isReady}
                    onClick={() => dispatch(send())}
                >
                    {inProgress ? 'Отправка…' : 'Отправить'}
                </Button>
            </div>
        </GlassDialog>
    );
};
