'use client';

import type { FC } from 'react';
import { CalendarClock } from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Label } from '@workspace/ui/components/label';
import {
    RadioGroup,
    RadioGroupItem,
} from '@workspace/ui/components/radio-group';
import { Switch } from '@workspace/ui/components/switch';
import {
    isSetAsideDeadline,
    SIM_DEADLINES,
    SIM_PLANNABLE_EVENTS,
} from '../../constants/sim-events';
import type { SimEventType } from '../../constants/sim-events';
import { SimContactPicker } from './SimContactPicker';
import { SimEventBadge } from './SimEventBadge';

interface SimPlanZoneProps {
    planned: SimEventType | undefined;
    /** Подпись стадии, куда потянет план. Берём из определения, а не дублируем. */
    plannedStageLabel: string;
    isPlanning: boolean;
    onPlanningChange: (value: boolean) => void;
    isResult: boolean;
    nextEventCode: string;
    onEventChange: (code: string) => void;
    title: string;
    onTitleChange: (value: string) => void;
    deadline: string;
    onDeadlineChange: (value: string) => void;
    contactId: string | null;
    onContactChange: (id: string) => void;
    errors: Record<string, string>;
    showErrors: boolean;
}

/**
 * Правая зона формы — «Планируем».
 *
 * Живёт в цвете ПЛАНИРУЕМОГО события, а не отчётного: у неё свой
 * data-event-type. Это не украшение — так менеджер видит, что отчитывается об
 * одном, а назначает другое.
 *
 * Планирование — не «дополнительно»: запланированное событие двигает сделку по
 * лестнице наравне с отчётом. Поэтому зона крупная и стоит рядом, а не внизу.
 */
export const SimPlanZone: FC<SimPlanZoneProps> = ({
    planned,
    plannedStageLabel,
    isPlanning,
    onPlanningChange,
    isResult,
    nextEventCode,
    onEventChange,
    title,
    onTitleChange,
    deadline,
    onDeadlineChange,
    contactId,
    onContactChange,
    errors,
    showErrors,
}) => (
    <aside
        data-event-type={planned?.dataEventType ?? 'warm'}
        className="bg-card h-fit rounded-xl border-l-4 border-t border-r border-b p-4"
        style={{ borderLeftColor: 'var(--event-current)' }}
    >
        <div className="flex items-center justify-between gap-2">
            <p
                className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase"
                style={{ color: 'var(--event-current)' }}
            >
                <span
                    aria-hidden
                    className="size-2 rounded-full"
                    style={{ backgroundColor: 'var(--event-current)' }}
                />
                Планируем
            </p>
            <Switch
                checked={isPlanning}
                onCheckedChange={onPlanningChange}
                aria-label="Планировать следующее событие"
                className="cursor-pointer"
            />
        </div>

        {!isPlanning ? (
            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                Следующее событие не назначается. Задача закроется, и клиент
                останется без следующего шага — в списке дел его больше не
                будет.
            </p>
        ) : (
            <div className="mt-3 space-y-3">
                {!isResult && (
                    <p className="text-warning text-[11px] leading-relaxed">
                        Отчёт нерезультативный, но следующий шаг назначен — это
                        перенос: дедлайн текущей задачи сдвинется, новая задача
                        не появится.
                    </p>
                )}

                <div>
                    <Label className="text-xs font-semibold">Тип события</Label>
                    <p className="text-muted-foreground mt-0.5 mb-1 text-[11px] leading-relaxed">
                        Холодного звонка в списке нет: такую задачу ставит хук,
                        а не менеджер. Планировать можно от обычного звонка и
                        выше.
                    </p>
                    <RadioGroup
                        value={nextEventCode}
                        onValueChange={onEventChange}
                        className="mt-1.5 space-y-1"
                    >
                        {SIM_PLANNABLE_EVENTS.map(event => (
                            <div
                                key={event.code}
                                data-event-type={event.dataEventType}
                                className="flex items-center gap-2"
                            >
                                <RadioGroupItem
                                    id={`plan-${event.code}`}
                                    value={event.code}
                                    className="cursor-pointer"
                                />
                                <Label
                                    htmlFor={`plan-${event.code}`}
                                    title={event.hint}
                                    className="flex cursor-pointer items-center gap-1.5 text-xs font-normal"
                                >
                                    <span
                                        aria-hidden
                                        className="size-2 shrink-0 rounded-full"
                                        style={{
                                            backgroundColor:
                                                'var(--event-current)',
                                        }}
                                    />
                                    {event.emoji && `${event.emoji} `}
                                    {event.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <div>
                    <Label
                        htmlFor="plan-title"
                        className="text-xs font-semibold"
                    >
                        Название события
                    </Label>
                    <Input
                        id="plan-title"
                        value={title}
                        onChange={event => onTitleChange(event.target.value)}
                        placeholder="Обсудить условия с директором"
                        className="mt-1.5"
                    />
                    <p className="text-muted-foreground mt-1 text-[11px]">
                        Станет заголовком задачи. Тип из заголовка вырезается —
                        он хранится отдельным полем.
                    </p>
                    {showErrors && errors.planTitle && (
                        <p className="text-destructive mt-1 text-[11px]">
                            {errors.planTitle}
                        </p>
                    )}
                </div>

                <div>
                    <Label
                        htmlFor="plan-deadline"
                        className="flex items-center gap-1.5 text-xs font-semibold"
                    >
                        <CalendarClock className="size-3.5" aria-hidden />
                        Срок
                    </Label>
                    <Select value={deadline} onValueChange={onDeadlineChange}>
                        <SelectTrigger
                            id="plan-deadline"
                            className="mt-1.5 w-full cursor-pointer"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {SIM_DEADLINES.map(item => (
                                <SelectItem
                                    key={item.code}
                                    value={item.code}
                                    className="cursor-pointer"
                                >
                                    {item.label}
                                    {isSetAsideDeadline(item.code) && (
                                        <span className="text-warning">
                                            {' · отложит'}
                                        </span>
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                        Дальше четырёх месяцев — и приложение само переведёт
                        работу в «Отложено». Отдельной кнопки для этого нет.
                    </p>
                    {showErrors && errors.planDeadline && (
                        <p className="text-destructive mt-1 text-[11px]">
                            {errors.planDeadline}
                        </p>
                    )}
                </div>

                <SimContactPicker
                    id="plan-contact"
                    label="Контакт"
                    hint="С кем встречаемся или говорим в следующий раз."
                    value={contactId}
                    onChange={onContactChange}
                />

                {planned && (
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                        <SimEventBadge label={planned.label} /> поднимет сделку
                        на «{plannedStageLabel}» — планирование двигает лестницу
                        так же, как отчёт.
                    </p>
                )}
            </div>
        )}
    </aside>
);
