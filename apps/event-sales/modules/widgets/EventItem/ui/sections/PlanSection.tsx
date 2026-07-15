'use client';

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    EV_PLAN_PROP,
    changeWorkStatusFromDeadline,
    eventPlanActions,
} from '@/modules/entities/EventPlan';
import { eventContactActions } from '@/modules/entities/EventContact';
import { fetchPlanDaySchedule } from '@/modules/entities/EventPlan/model/PlanScheduleThunk';
import { DateTimePicker } from '@workspace/ui/components/date-time-picker';

/**
 * План следующего события: тип, название, дата/время (общий DateTimePicker
 * с таймлайном занятости дня — расписание запрашивается при коммите даты),
 * контакт. Тумблер «планировать» — по конфигу withNoPlan.
 */
export const PlanSection: FC = () => {
    const dispatch = useAppDispatch();
    const plan = useAppSelector(s => s.eventPlan);
    const contacts = useAppSelector(s => s.contact.contacts);
    const planContact = useAppSelector(s => s.contact.current.plan);
    const withNoPlan = useAppSelector(s => s.app.config.withNoPlan);
    const nameError = useAppSelector(s => s.event.errors.current.name);
    const daySchedule = useAppSelector(s => s.planSchedule.items);

    const isActive = plan[EV_PLAN_PROP.IS_ACTIVE];
    const type = plan[EV_PLAN_PROP.TYPE];

    const setProp = (name: EV_PLAN_PROP) => (value: string) => {
        dispatch(eventPlanActions.setPlanProp({ name, value }));
        if (name === EV_PLAN_PROP.DATE) {
            dispatch(changeWorkStatusFromDeadline());
        }
    };

    return (
        <Card data-event-type={type.current?.code === 'presentation' ? 'presentation' : undefined}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Планируем</CardTitle>
                {withNoPlan && (
                    <div className="flex items-center gap-2">
                        <Label htmlFor="plan-active" className="text-xs text-muted-foreground">
                            планировать
                        </Label>
                        <Switch
                            id="plan-active"
                            checked={isActive}
                            onCheckedChange={() => dispatch(eventPlanActions.setIsActive())}
                        />
                    </div>
                )}
            </CardHeader>
            {isActive && (
                <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                        <Label>Тип события</Label>
                        <Select
                            value={type.current ? String(type.current.id) : undefined}
                            onValueChange={setProp(EV_PLAN_PROP.TYPE)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Выберите тип" />
                            </SelectTrigger>
                            <SelectContent>
                                {type.items.map(item => (
                                    <SelectItem key={item.id} value={String(item.id)}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Название</Label>
                        <Input
                            value={plan[EV_PLAN_PROP.NAME]}
                            placeholder="О чём договорились"
                            aria-invalid={!!nameError}
                            onChange={e => setProp(EV_PLAN_PROP.NAME)(e.target.value)}
                        />
                        {nameError && (
                            <p className="text-sm text-destructive">{nameError}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <DateTimePicker
                            value={plan[EV_PLAN_PROP.DATE] ?? ''}
                            onChange={setProp(EV_PLAN_PROP.DATE)}
                            existingEvents={daySchedule}
                            onDateCommit={date => dispatch(fetchPlanDaySchedule(date))}
                        />
                        {plan[EV_PLAN_PROP.IS_EXPIRED] && (
                            <p className="text-sm text-warning">
                                Дата дальше 4 месяцев — событие будет «Отложено»
                            </p>
                        )}
                    </div>

                    {contacts.length > 0 && (
                        <div className="space-y-1.5">
                            <Label>Контакт</Label>
                            <Select
                                value={planContact ? String(planContact.ID) : undefined}
                                onValueChange={value =>
                                    dispatch(
                                        eventContactActions.setCurrentContact({
                                            type: 'plan',
                                            contactId: Number(value),
                                        }),
                                    )
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Выберите контакт" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contacts.map(contact => (
                                        <SelectItem key={contact.ID} value={String(contact.ID)}>
                                            {contact.NAME} {contact.LAST_NAME ?? ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
};
