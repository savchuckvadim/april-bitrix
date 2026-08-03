'use client';

import { FC } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Switch } from '@workspace/ui/components/switch';
import { Label } from '@workspace/ui/components/label';
import { Input } from '@workspace/ui/components/input';
import { DateTimePicker } from '@workspace/ui/components/date-time-picker';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    EV_PLAN_PROP,
    changeWorkStatusFromDeadline,
    eventPlanActions,
} from '@/modules/entities/EventPlan';
import { fetchPlanDaySchedule } from '@/modules/entities/EventPlan/model/PlanScheduleThunk';
import type { EventTaskEventType } from '@/modules/entities/EventTask/types/event-task-type';
import { ContactField, EV_CONTACT_TYPE } from '@/modules/entities/EventContact';
import { PlanTypeRadio } from './PlanTypeRadio';

interface PlanColumnProps {
    /** visibility.plan — false при финальных статусах (Продажа/Отказ). */
    withPlan: boolean;
    /** Тип планируемого события — перекрашивает колонку в его цвет. */
    planTypeAttr?: EventTaskEventType;
}

/**
 * Правая колонка — «Планируем».
 *
 * Живёт в цвете ПЛАНИРУЕМОГО события (свой data-event-type), а не отчётного:
 * менеджер видит, что отчитывается об одном, а назначает другое. Узкая и
 * плотная — планирование двигает сделку наравне с отчётом, поэтому стоит
 * рядом, а не внизу.
 */
export const PlanColumn: FC<PlanColumnProps> = ({ withPlan, planTypeAttr }) => {
    const dispatch = useAppDispatch();
    const plan = useAppSelector(s => s.eventPlan);
    const withNoPlan = useAppSelector(s => s.app.config.withNoPlan);
    const nameError = useAppSelector(s => s.event.errors.current.name);
    const daySchedule = useAppSelector(s => s.planSchedule.items);

    const isActive = plan[EV_PLAN_PROP.IS_ACTIVE];
    const isImportant = plan[EV_PLAN_PROP.IS_IMPORTANT];
    const type = plan[EV_PLAN_PROP.TYPE];

    const setProp = (name: EV_PLAN_PROP) => (value: string) => {
        dispatch(eventPlanActions.setPlanProp({ name, value }));
        if (name === EV_PLAN_PROP.DATE) {
            dispatch(changeWorkStatusFromDeadline());
        }
    };

    if (!withPlan) {
        return (
            <aside data-event-type={planTypeAttr}>
                <SectionCard title="Планируем" tone="event" accent density="compact">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        По финальному статусу следующее событие не планируется.
                    </p>
                </SectionCard>
            </aside>
        );
    }

    return (
        <aside data-event-type={planTypeAttr}>
            <SectionCard
                title="Планируем"
                tone="event"
                accent
                density="compact"
                state={nameError ? 'error' : 'default'}
                message={nameError}
                actions={
                    withNoPlan && (
                        <Switch
                            checked={isActive}
                            onCheckedChange={() =>
                                dispatch(eventPlanActions.setIsActive())
                            }
                            aria-label="Планировать следующее событие"
                            className="cursor-pointer"
                        />
                    )
                }
            >
                {!isActive ? (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Следующее событие не назначается — клиент останется без
                        следующего шага.
                    </p>
                ) : (
                    <>
                        {/*
                          * Название первым: менеджер сначала формулирует,
                          * о чём договорились, и только потом уточняет тип —
                          * так порядок совпадает с ходом разговора.
                          */}
                        <div className="space-y-1.5">
                            <Label htmlFor="plan-name" className="text-xs font-semibold">
                                Название
                            </Label>
                            <Input
                                id="plan-name"
                                value={plan[EV_PLAN_PROP.NAME]}
                                placeholder="О чём договорились"
                                aria-invalid={!!nameError}
                                onChange={e =>
                                    setProp(EV_PLAN_PROP.NAME)(e.target.value)
                                }
                            />
                        </div>

                        <label className="flex cursor-pointer items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-xs font-semibold">
                                <Star
                                    aria-hidden
                                    className={cn(
                                        'size-4 shrink-0',
                                        isImportant
                                            ? 'fill-warning text-warning'
                                            : 'text-muted-foreground',
                                    )}
                                />
                                Важное
                            </span>
                            <Switch
                                checked={isImportant}
                                onCheckedChange={status =>
                                    dispatch(
                                        eventPlanActions.setIsImportant({ status }),
                                    )
                                }
                                aria-label="Пометить событие важным"
                                className="cursor-pointer"
                            />
                        </label>

                        <PlanTypeRadio
                            items={type.items}
                            value={type.current ? String(type.current.id) : undefined}
                            onChange={setProp(EV_PLAN_PROP.TYPE)}
                        />

                        {/*
                          * Контейнерный запрос, а не брейкпоинт экрана: дата
                          * и время встают в две колонки только если колонка
                          * плана реально широкая. Иначе при крупном --app-scale
                          * кнопка даты вылезает за границу карточки.
                          */}
                        <div className="@container space-y-1.5">
                            <DateTimePicker
                                value={plan[EV_PLAN_PROP.DATE] ?? ''}
                                onChange={setProp(EV_PLAN_PROP.DATE)}
                                existingEvents={daySchedule}
                                onDateCommit={date =>
                                    dispatch(fetchPlanDaySchedule(date))
                                }
                                className="grid-cols-1 @[17rem]:grid-cols-2"
                            />
                            {plan[EV_PLAN_PROP.IS_EXPIRED] && (
                                <p className="text-xs text-warning">
                                    Дальше четырёх месяцев — событие уйдёт
                                    в «Отложено».
                                </p>
                            )}
                        </div>

                        <ContactField type={EV_CONTACT_TYPE.PLAN} />
                    </>
                )}
            </SectionCard>
        </aside>
    );
};
